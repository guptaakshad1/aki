export type TransactionType =
  | 'send'
  | 'receive'
  | 'recharge'
  | 'bill'
  | 'topup'
  | 'cashback';

export type TransactionDirection = 'debit' | 'credit';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  upi_id: string | null;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  counterparty: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  upi_id: string | null;
  phone: string | null;
  created_at: string;
}
