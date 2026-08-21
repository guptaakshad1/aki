import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useWallet, useContacts } from '@/lib/hooks';
import { adjustBalance, recordTransaction } from '@/lib/wallet';
import { formatCurrency } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { Modal, AmountInput, TextInput, Avatar, Toast } from '@/components/ui';
import type { Contact } from '@/lib/types';
import type { Screen } from '@/App';
import { ArrowLeft, Plus, Search, CheckCircle2, UserPlus, Trash2 } from 'lucide-react';

interface SendScreenProps {
  navigate: (screen: Screen) => void;
}

export function SendScreen({ navigate }: SendScreenProps) {
  const { user } = useAuth();
  const { wallet, refresh: refreshWallet } = useWallet(user?.id);
  const { contacts, refresh: refreshContacts } = useContacts(user?.id);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState('');
  const [lastTxn, setLastTxn] = useState<{ name: string; amount: number } | null>(null);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.upi_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  );

  async function handleSend() {
    if (!selected || !wallet || !user) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setToast('Enter a valid amount'); return; }
    if (amt > Number(wallet.balance)) { setToast('Insufficient balance'); return; }
    setBusy(true);
    try {
      await adjustBalance(wallet.id, -amt);
      await recordTransaction({
        userId: user.id,
        type: 'send',
        direction: 'debit',
        amount: amt,
        counterparty: selected.name,
        description: note || `Sent to ${selected.name}`,
      });
      setLastTxn({ name: selected.name, amount: amt });
      setShowSuccess(true);
      setSelected(null);
      setAmount('');
      setNote('');
      refreshWallet();
      refreshContacts();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddContact(name: string, upiId: string, phone: string) {
    if (!user) return;
    const { error } = await supabase
      .from('contacts')
      .insert({ user_id: user.id, name, upi_id: upiId || null, phone: phone || null });
    if (error) { setToast(error.message); return; }
    setShowAdd(false);
    refreshContacts();
    setToast('Contact added');
  }

  async function handleDeleteContact(id: string) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) { setToast(error.message); return; }
    refreshContacts();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header title="Send Money" onBack={() => navigate('home')} />

      <div className="px-5">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Your Contacts</h2>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-sm text-teal-600 font-medium hover:text-teal-700">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, UPI ID, or phone"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 text-sm text-gray-900"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                <UserPlus className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No contacts yet</p>
              <button onClick={() => setShowAdd(true)} className="text-sm text-teal-600 font-medium mt-1">Add your first contact</button>
            </div>
          ) : (
            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              {filtered.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 group">
                  <button onClick={() => setSelected(c)} className="flex items-center gap-3 flex-1 text-left">
                    <Avatar name={c.name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.upi_id || c.phone || 'No UPI ID'}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1.5 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-teal-50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-teal-800">Available balance</span>
          <span className="font-bold text-teal-900">{formatCurrency(Number(wallet?.balance ?? 0))}</span>
        </div>
      </div>

      {/* Send modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setAmount(''); setNote(''); }} title="Enter Amount">
        {selected && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Avatar name={selected.name} size="md" />
              <div>
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.upi_id || selected.phone}</p>
              </div>
            </div>
            <AmountInput value={amount} onChange={setAmount} />
            <div className="flex gap-2 justify-center mb-4">
              {[100, 500, 1000, 2000].map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-full hover:bg-teal-100 transition-colors"
                >
                  ₹{q}
                </button>
              ))}
            </div>
            <TextInput label="Note (optional)" value={note} onChange={setNote} placeholder="What's this for?" />
            <button
              onClick={handleSend}
              disabled={busy}
              className="w-full mt-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60"
            >
              {busy ? 'Sending...' : `Send ${amount ? formatCurrency(parseFloat(amount) || 0) : ''}`}
            </button>
          </div>
        )}
      </Modal>

      {/* Add contact modal */}
      <AddContactModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddContact} />

      {/* Success modal */}
      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} title="Payment Successful">
        {lastTxn && (
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4 animate-scaleIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(lastTxn.amount)}</p>
            <p className="text-sm text-gray-500 mb-1">Sent to</p>
            <p className="font-semibold text-gray-900 mb-6">{lastTxn.name}</p>
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

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white px-5 pt-12 pb-6 rounded-b-3xl mb-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/15 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
    </div>
  );
}

function AddContactModal({
  open, onClose, onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, upiId: string, phone: string) => void;
}) {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');

  function submit() {
    if (name.trim().length < 2) return;
    onAdd(name.trim(), upiId.trim(), phone.trim());
    setName(''); setUpiId(''); setPhone('');
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Contact">
      <div className="space-y-4">
        <TextInput label="Name" value={name} onChange={setName} placeholder="John Doe" />
        <TextInput label="UPI ID (optional)" value={upiId} onChange={setUpiId} placeholder="john@payeasy" />
        <TextInput label="Phone (optional)" value={phone} onChange={setPhone} placeholder="9876543210" maxLength={10} />
        <button
          onClick={submit}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all"
        >
          Add Contact
        </button>
      </div>
    </Modal>
  );
}

export { Header };
