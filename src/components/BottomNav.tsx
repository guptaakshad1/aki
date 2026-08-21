import { Home, Send, Plus, Receipt, History } from 'lucide-react';
import type { Screen } from '@/App';

interface BottomNavProps {
  current: Screen;
  navigate: (screen: Screen) => void;
}

const ITEMS: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'send', label: 'Send', icon: Send },
  { id: 'topup', label: 'Add', icon: Plus },
  { id: 'bills', label: 'Bills', icon: Receipt },
  { id: 'history', label: 'History', icon: History },
];

export function BottomNav({ current, navigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1.5 z-40 sm:max-w-md sm:left-1/2 sm:-translate-x-1/2">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          const isTopup = item.id === 'topup';
          if (isTopup) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="flex flex-col items-center -mt-6"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  active ? 'bg-teal-700' : 'bg-teal-600'
                } text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 mt-1">{item.label}</span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                active ? 'text-teal-600' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-teal-50' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
