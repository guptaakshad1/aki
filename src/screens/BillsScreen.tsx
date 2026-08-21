import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useWallet } from '@/lib/hooks';
import { adjustBalance, recordTransaction } from '@/lib/wallet';
import { formatCurrency } from '@/lib/format';
import { Modal, AmountInput, TextInput, Toast } from '@/components/ui';
import { Header } from './SendScreen';
import type { Screen } from '@/App';
import { CheckCircle2, Droplets, Flame, Zap, Tv, Wifi } from 'lucide-react';

interface BillsScreenProps {
  navigate: (screen: Screen) => void;
}

const CATEGORIES = [
  { id: 'electricity', name: 'Electricity', icon: Zap, color: 'bg-amber-50 text-amber-600', prefix: 'Electricity Board' },
  { id: 'water', name: 'Water', icon: Droplets, color: 'bg-cyan-50 text-cyan-600', prefix: 'Water Dept' },
  { id: 'gas', name: 'Gas', icon: Flame, color: 'bg-orange-50 text-orange-600', prefix: 'Gas Agency' },
  { id: 'dth', name: 'DTH', icon: Tv, color: 'bg-blue-50 text-blue-600', prefix: 'DTH Provider' },
  { id: 'broadband', name: 'Broadband', icon: Wifi, color: 'bg-emerald-50 text-emerald-600', prefix: 'ISP' },
];

export function BillsScreen({ navigate }: BillsScreenProps) {
  const { user } = useAuth();
  const { wallet, refresh } = useWallet(user?.id);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState('');
  const [lastTxn, setLastTxn] = useState<{ biller: string; amount: number } | null>(null);

  async function handlePay() {
    if (!wallet || !user) return;
    const amt = parseFloat(amount);
    if (!accountNo || accountNo.length < 4) { setToast('Enter a valid consumer/account number'); return; }
    if (!amt || amt <= 0) { setToast('Enter a valid amount'); return; }
    if (amt > Number(wallet.balance)) { setToast('Insufficient balance'); return; }
    setBusy(true);
    try {
      await adjustBalance(wallet.id, -amt);
      const biller = `${category.prefix} - ${accountNo}`;
      await recordTransaction({
        userId: user.id,
        type: 'bill',
        direction: 'debit',
        amount: amt,
        counterparty: biller,
        description: `${category.name} bill payment`,
      });
      setLastTxn({ biller, amount: amt });
      setShowSuccess(true);
      setAmount('');
      setAccountNo('');
      refresh();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Pay Bills" onBack={() => navigate('home')} />

      <div className="px-5">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Select Bill Type</h2>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-active:scale-95 ${
                    category.id === c.id ? `${c.color} ring-2 ring-offset-2 ring-teal-400` : 'bg-gray-50 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-medium ${category.id === c.id ? 'text-gray-900' : 'text-gray-400'}`}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <TextInput
            label={`${category.name} Account / Consumer Number`}
            value={accountNo}
            onChange={setAccountNo}
            placeholder="e.g. 1234567890"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-1">Bill Amount</h2>
          <AmountInput value={amount} onChange={setAmount} />
        </div>

        <div className="bg-teal-50 rounded-xl p-4 flex items-center justify-between mb-4">
          <span className="text-sm text-teal-800">Wallet Balance</span>
          <span className="font-bold text-teal-900">{formatCurrency(Number(wallet?.balance ?? 0))}</span>
        </div>

        <button
          onClick={handlePay}
          disabled={busy}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60"
        >
          {busy ? 'Processing...' : `Pay ${amount ? formatCurrency(parseFloat(amount) || 0) : 'Bill'}`}
        </button>
      </div>

      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} title="Bill Paid">
        {lastTxn && (
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4 animate-scaleIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(lastTxn.amount)}</p>
            <p className="text-sm text-gray-500 mb-1">Paid to</p>
            <p className="font-semibold text-gray-900 mb-6 break-all px-4">{lastTxn.biller}</p>
            <button
              onClick={() => { setShowSuccess(false); navigate('home'); }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
