
export type TransactionType = 'deposit' | 'withdrawal' | 'contest_join' | 'contest_win';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'other';

export interface Transaction {
  id?: string;
  user_id?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  payment_method?: PaymentMethod;
  payment_details?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  details?: Record<string, any>;
}
