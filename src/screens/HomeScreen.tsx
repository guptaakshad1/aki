import { useAuth } from '@/lib/auth';
import { useWallet, useTransactions } from '@/lib/hooks';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Screen } from '@/App';
import { Avatar } from '@/components/ui';
import {
  Send, Smartphone, Receipt, Plus, ArrowDownLeft, ArrowUpRight,
  Droplet, Flame, Zap, ChevronRight, Bell, ScanLine,
} from 'lucide-react';

interface HomeScreenProps {
  navigate: (screen: Screen) => void;
}

export function HomeScreen({ navigate }: HomeScreenProps) {
  const { user, profile } = useAuth();
  const { wallet } = useWallet(user?.id);
  const { transactions } = useTransactions(user?.id);

  const balance = wallet ? Number(wallet.balance) : 0;
  const recentTxns = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white px-5 pt-12 pb-20 rounded-b-[2rem] relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar name={profile?.full_name ?? 'U'} size="md" />
            <div>
              <p className="text-teal-100 text-xs">Welcome back</p>
              <p className="font-semibold text-lg leading-tight">{profile?.full_name ?? 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white/15 backdrop-blur rounded-full hover:bg-white/25 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white/15 backdrop-blur rounded-full hover:bg-white/25 transition-colors">
              <ScanLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
          <p className="text-teal-100 text-sm mb-1">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-sm text-teal-50">
            <span className="px-2 py-0.5 bg-white/15 rounded-md font-medium">{profile?.upi_id ?? 'user@payeasy'}</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5 grid grid-cols-4 gap-3">
          <QuickAction icon={<Send className="w-5 h-5" />} label="Send" onClick={() => navigate('send')} />
          <QuickAction icon={<Plus className="w-5 h-5" />} label="Add Money" onClick={() => navigate('topup')} />
          <QuickAction icon={<Smartphone className="w-5 h-5" />} label="Recharge" onClick={() => navigate('recharge')} />
          <QuickAction icon={<Receipt className="w-5 h-5" />} label="Pay Bills" onClick={() => navigate('bills')} />
        </div>
      </div>

      {/* Bill categories */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bill Payments</h2>
        <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-4 gap-3">
          <BillCategory icon={<Smartphone className="w-5 h-5" />} label="Mobile" color="bg-blue-50 text-blue-600" onClick={() => navigate('recharge')} />
          <BillCategory icon={<Droplet className="w-5 h-5" />} label="Water" color="bg-cyan-50 text-cyan-600" onClick={() => navigate('bills')} />
          <BillCategory icon={<Flame className="w-5 h-5" />} label="Gas" color="bg-orange-50 text-orange-600" onClick={() => navigate('bills')} />
          <BillCategory icon={<Zap className="w-5 h-5" />} label="Electric" color="bg-amber-50 text-amber-600" onClick={() => navigate('bills')} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="px-5 mt-6 pb-28">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Activity</h2>
          <button onClick={() => navigate('history')} className="text-sm text-teal-600 font-medium flex items-center gap-0.5 hover:text-teal-700">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {recentTxns.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
                <Receipt className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No transactions yet</p>
              <p className="text-gray-400 text-xs mt-1">Send money or pay a bill to get started</p>
            </div>
          ) : (
            recentTxns.map((txn, i) => (
              <div
                key={txn.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i !== recentTxns.length - 1 ? 'border-b border-gray-50' : ''}`}
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
                    {txn.counterparty || txn.description || txn.type}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(txn.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${txn.direction === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {txn.direction === 'credit' ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center group-hover:bg-teal-100 group-active:scale-95 transition-all">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

function BillCategory({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-active:scale-95 transition-all ${color}`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </button>
  );
}
