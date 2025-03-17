
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { captureAuthError } from "@/integrations/sentry/config";
import { Loader2, Wallet, ArrowDown, ArrowUp, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import {
  getWalletDetails,
  addMoney,
  withdrawMoney,
} from "@/utils/wallet-service";
import { Transaction } from "@/types/transaction";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const isCredit = transaction.amount > 0;
  
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <Plus className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <Minus className="h-5 w-5 text-red-500" />;
      case 'contest_join':
        return <ArrowDown className="h-5 w-5 text-amber-500" />;
      case 'contest_win':
        return <ArrowUp className="h-5 w-5 text-green-500" />;
      default:
        return isCredit ? 
          <ArrowDown className="h-5 w-5 text-green-500" /> : 
          <ArrowUp className="h-5 w-5 text-red-500" />;
    }
  };
  
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-gray-800 rounded-full p-2 mr-4">
            {getTransactionIcon()}
          </div>
          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-gray-400">{formatDate(transaction.created_at)}</p>
          </div>
        </div>
        <div className={`font-bold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
          {isCredit ? '+' : ''}{transaction.amount.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const WalletPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Please sign in to access wallet");
        navigate("/auth");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setIsLoading(true);
        const walletDetails = await getWalletDetails();
        setBalance(walletDetails.balance);
        setTransactions(walletDetails.transactions);
      } catch (error) {
        console.error("Error loading wallet:", error);
        captureAuthError(
          error instanceof Error ? error : new Error("Failed to load wallet"),
          { source: "Wallet Page" }
        );
        toast.error("Could not load wallet information");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWalletData();
  }, []);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setIsProcessing(true);
      const amount = parseFloat(depositAmount);
      
      // In a real app, this would open a payment gateway
      // For demo purposes, we'll directly add money
      const success = await addMoney(amount);
      
      if (success) {
        toast.success(`₹${amount.toFixed(2)} added to your wallet`);
        setBalance(prev => prev + amount);
        
        // Refresh transactions
        const walletDetails = await getWalletDetails();
        setTransactions(walletDetails.transactions);
        
        setDepositAmount("");
      } else {
        toast.error("Failed to add money. Please try again.");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      captureAuthError(
        error instanceof Error ? error : new Error("Failed to deposit"),
        { source: "Wallet Page - Deposit" }
      );
      toast.error("Transaction failed. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // In a real app, this would collect withdrawal info
      // For demo purposes, we'll directly withdraw money
      const success = await withdrawMoney(amount);
      
      if (success) {
        toast.success(`₹${amount.toFixed(2)} withdrawn from your wallet`);
        setBalance(prev => prev - amount);
        
        // Refresh transactions
        const walletDetails = await getWalletDetails();
        setTransactions(walletDetails.transactions);
        
        setWithdrawAmount("");
      } else {
        toast.error("Failed to withdraw money. Please try again.");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      captureAuthError(
        error instanceof Error ? error : new Error("Failed to withdraw"),
        { source: "Wallet Page - Withdraw" }
      );
      toast.error("Transaction failed. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#1A1F2C] text-white py-8 px-4"
    >
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Wallet className="mr-3 h-8 w-8" />
          My Wallet
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-[#2A2F3C] text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Balance</CardTitle>
                <CardDescription className="text-gray-400">
                  Current wallet balance and transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-lg p-6 mb-6">
                  <p className="text-gray-300 mb-2">Available Balance</p>
                  <h2 className="text-4xl font-bold">₹{balance.toFixed(2)}</h2>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Transactions</h3>
                  
                  <div className="bg-[#1A1F2C] rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    {transactions.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        No transactions yet
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <TransactionItem 
                          key={transaction.id} 
                          transaction={transaction} 
                        />
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="bg-[#2A2F3C] text-white border-none shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Money Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Add or withdraw money from your wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs className="mt-2">
                  <TabList className="flex mb-4 border-b border-gray-700">
                    <Tab 
                      className="px-4 py-2 font-medium focus:outline-none cursor-pointer"
                      selectedClassName="text-purple-400 border-b-2 border-purple-400"
                    >
                      Add Money
                    </Tab>
                    <Tab 
                      className="px-4 py-2 font-medium focus:outline-none cursor-pointer"
                      selectedClassName="text-purple-400 border-b-2 border-purple-400"
                    >
                      Withdraw
                    </Tab>
                  </TabList>
                  
                  <TabPanel>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Amount (₹)</Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="bg-[#3A3F4C] border-[#4A4F5C] text-white"
                        />
                      </div>
                      
                      <Button
                        onClick={handleDeposit}
                        disabled={isProcessing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Add Money"
                        )}
                      </Button>
                      
                      <p className="text-xs text-gray-400 mt-2">
                        * In a real app, this would redirect to a payment gateway
                      </p>
                    </div>
                  </TabPanel>
                  
                  <TabPanel>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          min="1"
                          max={balance}
                          placeholder="Enter amount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="bg-[#3A3F4C] border-[#4A4F5C] text-white"
                        />
                        <p className="text-xs text-gray-400">
                          Maximum: ₹{balance.toFixed(2)}
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleWithdraw}
                        disabled={isProcessing || balance <= 0}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Withdraw"
                        )}
                      </Button>
                      
                      <p className="text-xs text-gray-400 mt-2">
                        * In a real app, this would collect your bank details
                      </p>
                    </div>
                  </TabPanel>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center pt-2 pb-4">
                <p className="text-sm text-gray-400 text-center">
                  Need help with a transaction?{" "}
                  <a href="#" className="text-purple-400 hover:underline">
                    Contact Support
                  </a>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletPage;
