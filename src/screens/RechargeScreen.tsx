import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useWallet } from '@/lib/hooks';
import { adjustBalance, recordTransaction } from '@/lib/wallet';
import { formatCurrency } from '@/lib/format';
import { Modal, AmountInput, TextInput, Toast } from '@/components/ui';
import { Header } from './SendScreen';
import type { Screen } from '@/App';
import { CheckCircle2 } from 'lucide-react';

interface RechargeScreenProps {
  navigate: (screen: Screen) => void;
}

const OPERATORS = [
  { id: 'jio', name: 'Jio', color: 'bg-blue-600' },
  { id: 'airtel', name: 'Airtel', color: 'bg-red-600' },
  { id: 'vi', name: 'Vi', color: 'bg-rose-600' },
  { id: 'bsnl', name: 'BSNL', color: 'bg-orange-600' },
];

const PLANS = [
  { amount: 149, desc: '1 GB/day, 20 days' },
  { amount: 299, desc: '1.5 GB/day, 28 days' },
  { amount: 399, desc: '2.5 GB/day, 28 days' },
  { amount: 599, desc: '3 GB/day, 84 days' },
  { amount: 799, desc: '2 GB/day, 90 days' },
  { amount: 999, desc: 'Unlimited, 365 days' },
];

export function RechargeScreen({ navigate }: RechargeScreenProps) {
  const { user } = useAuth();
  const { wallet, refresh } = useWallet(user?.id);
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState('jio');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState('');
  const [lastTxn, setLastTxn] = useState<{ phone: string; amount: number } | null>(null);

  async function handleRecharge() {
    if (!wallet || !user) return;
    const amt = parseFloat(amount);
    if (!phone || phone.length < 10) { setToast('Enter a valid 10-digit mobile number'); return; }
    if (!amt || amt <= 0) { setToast('Select or enter a plan amount'); return; }
    if (amt > Number(wallet.balance)) { setToast('Insufficient balance'); return; }
    setBusy(true);
    try {
      await adjustBalance(wallet.id, -amt);
      await recordTransaction({
        userId: user.id,
        type: 'recharge',
        direction: 'debit',
        amount: amt,
        counterparty: `${OPERATORS.find((o) => o.id === operator)?.name} - ${phone}`,
        description: 'Mobile recharge',
      });
      setLastTxn({ phone, amount: amt });
      setShowSuccess(true);
      setAmount('');
      refresh();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Recharge failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Mobile Recharge" onBack={() => navigate('home')} />

      <div className="px-5">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <TextInput label="Mobile Number" value={phone} onChange={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="9876543210" maxLength={10} />
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-600">Operator</span>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {OPERATORS.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setOperator(op.id)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    operator === op.id ? `${op.color} text-white border-transparent` : 'border-gray-100 text-gray-700 hover:border-gray-200'
                  }`}
                >
                  {op.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-1">Choose a Plan</h2>
          <div className="space-y-2 mt-3">
            {PLANS.map((plan) => (
              <button
                key={plan.amount}
                onClick={() => setAmount(String(plan.amount))}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                  amount === String(plan.amount) ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div>
                  <p className="font-bold text-gray-900">₹{plan.amount}</p>
                  <p className="text-xs text-gray-400">{plan.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  amount === String(plan.amount) ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                } flex items-center justify-center`}>
                  {amount === String(plan.amount) && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <span className="text-sm font-medium text-gray-600">Or enter custom amount</span>
          <AmountInput value={amount} onChange={setAmount} />
        </div>

        <button
          onClick={handleRecharge}
          disabled={busy}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60"
        >
          {busy ? 'Processing...' : `Recharge ${amount ? formatCurrency(parseFloat(amount) || 0) : ''}`}
        </button>
      </div>

      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} title="Recharge Successful">
        {lastTxn && (
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4 animate-scaleIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(lastTxn.amount)}</p>
            <p className="text-sm text-gray-500 mb-1">Recharged on</p>
            <p className="font-semibold text-gray-900 mb-6">+91 {lastTxn.phone}</p>
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
