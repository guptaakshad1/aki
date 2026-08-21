import { supabase } from './supabase';
import type { TransactionType, TransactionDirection } from './types';

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('id, user_id, balance, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function ensureWallet(userId: string, openingBalance = 10000) {
  const existing = await getWallet(userId);
  if (existing) return existing;
  const { data, error } = await supabase
    .from('wallets')
    .insert({ user_id: userId, balance: openingBalance })
    .select('id, user_id, balance, updated_at')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function recordTransaction(params: {
  userId: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  counterparty?: string | null;
  description?: string | null;
}) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: params.userId,
      type: params.type,
      direction: params.direction,
      amount: params.amount,
      counterparty: params.counterparty ?? null,
      description: params.description ?? null,
      status: 'success',
    })
    .select('id, user_id, type, direction, amount, counterparty, description, status, created_at')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adjustBalance(walletId: string, delta: number) {
  const { data: wallet, error: fetchErr } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', walletId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!wallet) throw new Error('Wallet not found');

  const newBalance = Number(wallet.balance) + delta;
  if (newBalance < 0) throw new Error('Insufficient balance');

  const { error: updateErr } = await supabase
    .from('wallets')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', walletId);
  if (updateErr) throw updateErr;
  return newBalance;
}
