import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useWallet } from '@/lib/hooks';
import { adjustBalance, recordTransaction } from '@/lib/wallet';
import { formatCurrency } from '@/lib/format';
import { Modal, AmountInput, Toast } from '@/components/ui';
import { Header } from './SendScreen';
import type { Screen } from '@/App';
import { CheckCircle2, CreditCard, Landmark, Wallet } from 'lucide-react';

interface TopUpScreenProps {
  navigate: (screen: Screen) => void;
}

const METHODS = [
  { id: 'card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'bank', label: 'Bank Account', icon: Landmark, desc: 'Net banking / UPI' },
  { id: 'wallet', label: 'Other Wallet', icon: Wallet, desc: 'Transfer from another wallet' },
];

export function TopUpScreen({ navigate }: TopUpScreenProps) {
  const { user } = useAuth();
  const { wallet, refresh } = useWallet(user?.id);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState('');
  const [lastAmt, setLastAmt] = useState(0);

  async function handleTopUp() {
    if (!wallet || !user) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setToast('Enter a valid amount'); return; }
    setBusy(true);
    try {
      await adjustBalance(wallet.id, amt);
      await recordTransaction({
        userId: user.id,
        type: 'topup',
        direction: 'credit',
        amount: amt,
        counterparty: METHODS.find((m) => m.id === method)?.label ?? 'Top up',
        description: 'Wallet top-up',
      });
      setLastAmt(amt);
      setShowSuccess(true);
      setAmount('');
      refresh();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to add money');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Add Money" onBack={() => navigate('home')} />

      <div className="px-5">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <p className="text-sm text-gray-500 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(wallet?.balance ?? 0))}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-2">Enter Amount</h2>
          <AmountInput value={amount} onChange={setAmount} />
          <div className="flex gap-2 justify-center flex-wrap mb-2">
            {[500, 1000, 2000, 5000].map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="px-4 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 rounded-full hover:bg-teal-100 transition-colors"
              >
                ₹{q}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Payment Method</h2>
          <div className="space-y-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    method === m.id ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    method === m.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    method === m.id ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                  } flex items-center justify-center`}>
                    {method === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleTopUp}
          disabled={busy}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60"
        >
          {busy ? 'Processing...' : `Add ${amount ? formatCurrency(parseFloat(amount) || 0) : 'Money'}`}
        </button>
      </div>

      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} title="Money Added">
        <div className="text-center py-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4 animate-scaleIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(lastAmt)}</p>
          <p className="text-sm text-gray-500 mb-6">Added to your wallet</p>
          <button
            onClick={() => { setShowSuccess(false); navigate('home'); }}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </div>
  );
}
