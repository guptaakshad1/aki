import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTransactions } from '@/lib/hooks';
import { formatCurrency, formatDate } from '@/lib/format';
import { Header } from './SendScreen';
import type { Screen } from '@/App';
import type { TransactionType } from '@/lib/types';
import { ArrowDownLeft, ArrowUpRight, Receipt, Search } from 'lucide-react';

interface HistoryScreenProps {
  navigate: (screen: Screen) => void;
}

const FILTERS: { id: 'all' | TransactionType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'send', label: 'Sent' },
  { id: 'receive', label: 'Received' },
  { id: 'topup', label: 'Top Up' },
  { id: 'recharge', label: 'Recharge' },
  { id: 'bill', label: 'Bills' },
];

const TYPE_LABELS: Record<string, string> = {
  send: 'Money Sent',
  receive: 'Money Received',
  recharge: 'Mobile Recharge',
  bill: 'Bill Payment',
  topup: 'Wallet Top Up',
  cashback: 'Cashback',
};

export function HistoryScreen({ navigate }: HistoryScreenProps) {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions(user?.id);
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (t.counterparty ?? '').toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        TYPE_LABELS[t.type]?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Transaction History" onBack={() => navigate('home')} />

      <div className="px-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 text-sm text-gray-900"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-5 px-5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.id ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 shadow-sm'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm py-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Receipt className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filtered.map((txn, i) => (
              <div
                key={txn.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i !== filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  txn.direction === 'credit' ? 'bg-emerald-50' : 'bg-rose-50'
                }`}>
                  {txn.direction === 'credit'
                    ? <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    : <ArrowUpRight className="w-5 h-5 text-rose-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {txn.counterparty || txn.description || TYPE_LABELS[txn.type] || txn.type}
                  </p>
                  <p className="text-xs text-gray-400">
                    {TYPE_LABELS[txn.type] || txn.type} · {formatDate(txn.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${txn.direction === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {txn.direction === 'credit' ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    txn.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
