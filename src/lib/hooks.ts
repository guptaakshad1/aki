import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { getWallet } from './wallet';
import type { Wallet, Transaction, Contact } from './types';

export function useWallet(userId: string | null | undefined) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setWallet(null);
      setLoading(false);
      return;
    }
    const data = await getWallet(userId);
    setWallet(data as Wallet | null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { wallet, loading, refresh };
}

export function useTransactions(userId: string | null | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, type, direction, amount, counterparty, description, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      setLoading(false);
      return;
    }
    setTransactions((data ?? []) as Transaction[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transactions, loading, refresh };
}

export function useContacts(userId: string | null | undefined) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setContacts([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('contacts')
      .select('id, user_id, name, upi_id, phone, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      setLoading(false);
      return;
    }
    setContacts((data ?? []) as Contact[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contacts, loading, refresh };
}
