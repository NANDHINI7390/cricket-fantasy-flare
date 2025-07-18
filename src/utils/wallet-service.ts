import { supabase } from "@/integrations/supabase/client";
import * as Sentry from '@sentry/react';
import { Transaction, TransactionStatus, TransactionType, PaymentMethod, PaymentDetails } from "@/types/transaction";

export interface WalletDetails {
  balance: number;
  transactions: Transaction[];
}

export const getWalletBalance = async (): Promise<number> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // First, check if the wallet exists
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.user.id)
      .single();
      
    if (walletError && walletError.code !== 'PGRST116') {
      throw walletError;
    }
    
    return wallet?.balance || 0;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    Sentry.captureException(error, {
      tags: {
        source: 'wallet_service',
        operation: 'get_balance'
      }
    });
    return 0;
  }
};

export const getWalletTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Validate and transform the transaction types and status to ensure they match our interface
    return (data || []).map(tx => {
      // Validate that the type is one of our expected values
      let txType = tx.type;
      if (!['deposit', 'withdrawal', 'contest_join', 'contest_win'].includes(txType)) {
        console.warn(`Unknown transaction type: ${txType}, defaulting to 'deposit'`);
        txType = 'deposit';
      }
      
      // Validate that the status is one of our expected values
      let txStatus = tx.status;
      if (!['pending', 'completed', 'failed'].includes(txStatus)) {
        console.warn(`Unknown transaction status: ${txStatus}, defaulting to 'completed'`);
        txStatus = 'completed';
      }
      
      // Return a properly typed Transaction object
      // Note: payment_method is not stored in the database schema, so we omit it
      return {
        ...tx,
        type: txType as TransactionType,
        status: txStatus as TransactionStatus
      };
    });
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    Sentry.captureException(error, {
      tags: {
        source: 'wallet_service',
        operation: 'get_transactions'
      }
    });
    return [];
  }
};

export const getWalletDetails = async (): Promise<WalletDetails> => {
  const balance = await getWalletBalance();
  const transactions = await getWalletTransactions();
  
  return {
    balance,
    transactions
  };
};

export const addMoney = async (amount: number, paymentDetails: PaymentDetails): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // First, check if wallet exists
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.user.id)
      .single();
      
    if (walletError && walletError.code !== 'PGRST116') {
      throw walletError;
    }
    
    // Generate payment description based on method
    let description = `Added ₹${amount} to wallet`;
    if (paymentDetails.method) {
      const methodName = paymentDetails.method.charAt(0).toUpperCase() + paymentDetails.method.slice(1);
      description += ` via ${methodName}`;
    }
    
    // Create a transaction record
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.user.id,
        amount,
        type: 'deposit',
        status: 'completed', // In real app, this would start as 'pending'
        description,
        payment_method: paymentDetails.method,
        payment_details: paymentDetails.details
      })
      .select('id')
      .single();
      
    if (txError) {
      throw txError;
    }
    
    // Update wallet balance
    if (wallet) {
      // Update existing wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);
        
      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new wallet
      const { error: insertError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.user.id,
          balance: amount
        });
        
      if (insertError) {
        throw insertError;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    Sentry.captureException(error, {
      tags: {
        source: 'wallet_service',
        operation: 'add_money'
      }
    });
    return false;
  }
};

export const withdrawMoney = async (amount: number, paymentDetails: PaymentDetails): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.user.id)
      .single();
      
    if (walletError) {
      throw walletError;
    }
    
    if (!wallet || wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }
    
    // Generate withdrawal description based on method
    let description = `Withdrew ₹${amount} from wallet`;
    if (paymentDetails.method) {
      const methodName = paymentDetails.method.charAt(0).toUpperCase() + paymentDetails.method.slice(1);
      description += ` to ${methodName}`;
    }
    
    // Create transaction record
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.user.id,
        amount: -amount, // Negative amount for withdrawal
        type: 'withdrawal',
        status: 'completed', // In real app, this would start as 'pending'
        description,
        payment_method: paymentDetails.method,
        payment_details: paymentDetails.details
      });
      
    if (txError) {
      throw txError;
    }
    
    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);
      
    if (updateError) {
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error("Error withdrawing money from wallet:", error);
    Sentry.captureException(error, {
      tags: {
        source: 'wallet_service',
        operation: 'withdraw_money'
      }
    });
    return false;
  }
};

export const joinContest = async (contestId: string, teamId: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }
    
    // This will call our secure database function to handle the join contest logic
    const { data, error } = await supabase
      .rpc('join_contest', { 
        contest_id: contestId,
        team_id: teamId
      });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error joining contest:", error);
    Sentry.captureException(error, {
      tags: {
        source: 'wallet_service',
        operation: 'join_contest'
      }
    });
    
    // Provide more specific error message to the user
    if (error instanceof Error) {
      if (error.message.includes('Insufficient wallet balance')) {
        throw new Error('You don\'t have enough balance to join this contest');
      } else if (error.message.includes('Contest is already full')) {
        throw new Error('This contest is already full');
      } else if (error.message.includes('Team not found')) {
        throw new Error('You need to select a valid team to join');
      }
    }
    
    return false;
  }
};

export const awardContestWinnings = async (
  userId: string, 
  contestId: string, 
  amount: number, 
  rank: number
): Promise<boolean> => {
  try {
    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      throw new Error("User not found");
    }
    
    // First, check if wallet exists
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .single();
      
    if (walletError && walletError.code !== 'PGRST116') {
      throw walletError;
    }
    
    // Create a transaction record
    const description = `Won ₹${amount} in contest #${contestId} (Rank: ${rank})`;
    
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount, // Positive amount for winnings
        type: 'contest_win',
        status: 'completed',
        description
      });
      
    if (txError) {
      throw txError;
    }
    
    // Update wallet balance
    if (wallet) {
      // Update existing wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);
        
      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new wallet
      const { error: insertError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          balance: amount
        });
        
      if (insertError) {
        throw insertError;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error awarding contest winnings:", error);
    Sentry.captureException(error, {
      tags: {
        source: 'wallet_service',
        operation: 'award_winnings'
      }
    });
    return false;
  }
};
