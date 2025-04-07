
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  CircleDollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Loader2, 
  Trophy,
  Calendar,
  ExternalLink,
  Filter,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getWalletDetails, addMoney, withdrawMoney } from "@/utils/wallet-service";
import { Transaction, PaymentMethod } from "@/types/transaction";
import { format } from "date-fns";
import PageNavigation from "@/components/PageNavigation";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

// Format currency to Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get transaction icon based on type
const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownLeft className="text-green-500" />;
    case 'withdrawal':
      return <ArrowUpRight className="text-red-500" />;
    case 'contest_join':
      return <Trophy className="text-amber-500" />;
    case 'contest_win':
      return <Trophy className="text-green-500" />;
    default:
      return <CircleDollarSign className="text-gray-500" />;
  }
};

// Get transaction status class
const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const Wallet = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [addAmount, setAddAmount] = useState<number>(100);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [addPaymentMethod, setAddPaymentMethod] = useState<PaymentMethod>('upi');
  const [addPaymentDetails, setAddPaymentDetails] = useState<Record<string, any>>({});
  const [withdrawPaymentMethod, setWithdrawPaymentMethod] = useState<PaymentMethod>('upi');
  const [withdrawPaymentDetails, setWithdrawPaymentDetails] = useState<Record<string, any>>({});
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletData = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        setIsLoading(true);
        const walletDetails = await getWalletDetails();
        setBalance(walletDetails.balance);
        setTransactions(walletDetails.transactions);
      } catch (error) {
        console.error("Error fetching wallet details:", error);
        toast.error("Failed to load wallet details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWalletData();
  }, [user, authLoading, navigate]);

  const handleAddMoney = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (addAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsAdding(true);
      const success = await addMoney(addAmount, {
        method: addPaymentMethod,
        details: addPaymentDetails
      });
      
      if (success) {
        setShowPaymentSuccess(true);
        setTimeout(() => {
          setShowPaymentSuccess(false);
          
          // Refresh wallet data
          getWalletDetails().then(walletDetails => {
            setBalance(walletDetails.balance);
            setTransactions(walletDetails.transactions);
            setAddAmount(100); // Reset amount
            setAddPaymentDetails({}); // Reset payment details
          });
        }, 3000);
      } else {
        toast.error("Failed to add money");
      }
    } catch (error) {
      console.error("Error adding money:", error);
      toast.error("Failed to add money");
    } finally {
      setIsAdding(false);
    }
  };

  const handleWithdrawMoney = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setIsWithdrawing(true);
      const success = await withdrawMoney(withdrawAmount, {
        method: withdrawPaymentMethod,
        details: withdrawPaymentDetails
      });
      
      if (success) {
        toast.success(`Withdrawn ${formatCurrency(withdrawAmount)} from your wallet`);
        // Refresh wallet data
        const walletDetails = await getWalletDetails();
        setBalance(walletDetails.balance);
        setTransactions(walletDetails.transactions);
        setWithdrawAmount(0); // Reset amount
        setWithdrawPaymentDetails({}); // Reset payment details
      } else {
        toast.error("Failed to withdraw money");
      }
    } catch (error) {
      console.error("Error withdrawing money:", error);
      toast.error("Failed to withdraw money");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 bg-gradient-to-b from-indigo-50 to-purple-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4">
          <PageNavigation />
        </div>
        
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600">Manage your funds and track transactions</p>
        </header>

        {showPaymentSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl p-6 flex items-center justify-center max-w-md w-full"
          >
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">Your wallet has been credited with {formatCurrency(addAmount)}</p>
              <div className="text-green-600 font-semibold text-lg">New Balance: {formatCurrency(balance + addAmount)}</div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Available Balance</CardTitle>
                <CardDescription>Your current wallet balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CircleDollarSign className="h-12 w-12 text-purple-500" />
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{formatCurrency(balance)}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  onClick={() => document.getElementById('add-money-tab')?.click()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> 
                  Add Money
                </Button>
                <Button 
                  onClick={() => document.getElementById('withdraw-money-tab')?.click()}
                  variant="outline" 
                  className="w-full"
                  disabled={balance <= 0}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" /> 
                  Withdraw
                </Button>
              </CardFooter>
            </Card>

            {/* Money Actions */}
            <Card className="mt-6 shadow-md">
              <CardHeader>
                <CardTitle>Manage Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="add-money">
                  <TabsList className="w-full">
                    <TabsTrigger value="add-money" id="add-money-tab" className="w-1/2">Add Money</TabsTrigger>
                    <TabsTrigger value="withdraw" id="withdraw-money-tab" className="w-1/2">Withdraw</TabsTrigger>
                  </TabsList>
                  <TabsContent value="add-money" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-amount">Amount to Add (₹)</Label>
                      <Input
                        id="add-amount"
                        type="number"
                        min="100"
                        step="100"
                        value={addAmount}
                        onChange={(e) => setAddAmount(Number(e.target.value))}
                        className="text-lg"
                      />
                    </div>
                    <div className="flex space-x-2">
                      {[100, 500, 1000, 2000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setAddAmount(amount)}
                          className={`flex-1 ${addAmount === amount ? 'bg-purple-100 border-purple-300' : ''}`}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <Label className="text-sm font-medium mb-2 block">Select Payment Method</Label>
                      <PaymentMethodSelector
                        selectedMethod={addPaymentMethod}
                        onMethodChange={setAddPaymentMethod}
                        details={addPaymentDetails}
                        onDetailsChange={setAddPaymentDetails}
                      />
                    </div>
                    
                    <Button
                      onClick={handleAddMoney}
                      disabled={isAdding || addAmount <= 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Add ₹{addAmount}</>
                      )}
                    </Button>
                  </TabsContent>
                  <TabsContent value="withdraw" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Withdrawal Amount (₹)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        min="100"
                        max={balance}
                        step="100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="text-lg"
                      />
                      <p className="text-xs text-gray-500">Available balance: {formatCurrency(balance)}</p>
                    </div>
                    
                    <div className="mt-4">
                      <Label className="text-sm font-medium mb-2 block">Select Withdrawal Method</Label>
                      <PaymentMethodSelector
                        selectedMethod={withdrawPaymentMethod}
                        onMethodChange={setWithdrawPaymentMethod}
                        details={withdrawPaymentDetails}
                        onDetailsChange={setWithdrawPaymentDetails}
                      />
                    </div>
                    
                    <Button
                      onClick={handleWithdrawMoney}
                      disabled={isWithdrawing || withdrawAmount <= 0 || withdrawAmount > balance}
                      className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                    >
                      {isWithdrawing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Withdraw ₹{withdrawAmount}</>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your recent wallet activities</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions found</p>
                    <Button 
                      onClick={() => document.getElementById('add-money-tab')?.click()}
                      variant="link" 
                      className="mt-2 text-purple-600"
                    >
                      Add money to get started
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                      <div 
                        key={transaction.id || index} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {transaction.type === 'deposit' && 'Added Money'}
                              {transaction.type === 'withdrawal' && 'Withdrawal'}
                              {transaction.type === 'contest_join' && 'Contest Entry'}
                              {transaction.type === 'contest_win' && 'Contest Winnings'}
                            </h4>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {transaction.created_at 
                                ? format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')
                                : 'Date unavailable'
                              }
                            </div>
                            {transaction.description && (
                              <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                            )}
                            {transaction.payment_method && (
                              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full mt-1 inline-block">
                                {transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full border ${getStatusClass(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {transactions.length > 0 && (
                <CardFooter className="flex justify-center">
                  <Button variant="link" className="text-purple-600">
                    View All Transactions <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Wallet;
