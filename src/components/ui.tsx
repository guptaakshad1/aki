import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface AmountInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function AmountInput({ value, onChange, placeholder = '0' }: AmountInputProps) {
  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <span className="text-4xl font-bold text-gray-900">₹</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-4xl font-bold text-gray-900 bg-transparent border-none outline-none w-40 text-center focus:ring-0"
        autoFocus
      />
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}

export function TextInput({ label, value, onChange, type = 'text', placeholder, maxLength }: TextInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-gray-900"
      />
    </label>
  );
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const AVATAR_COLORS = [
  'bg-teal-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500',
  'bg-emerald-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
];

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name.trim().slice(0, 2).toUpperCase();
  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const sizes = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-16 h-16 text-xl' };
  return (
    <div className={`${sizes[size]} ${AVATAR_COLORS[colorIdx]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  const colors = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] ${colors} text-white px-5 py-3 rounded-xl shadow-lg animate-slideUp max-w-[90vw]`}
      onClick={onClose}
    >
      {message}
    </div>
  );
}
