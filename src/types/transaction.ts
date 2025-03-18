
export type TransactionType = 'deposit' | 'withdrawal' | 'contest_join' | 'contest_win';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id?: string;
  user_id?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
