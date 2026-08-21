import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AuthScreen } from '@/screens/AuthScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { SendScreen } from '@/screens/SendScreen';
import { TopUpScreen } from '@/screens/TopUpScreen';
import { RechargeScreen } from '@/screens/RechargeScreen';
import { BillsScreen } from '@/screens/BillsScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { BottomNav } from '@/components/BottomNav';
import { LogOut } from 'lucide-react';

export type Screen = 'home' | 'send' | 'topup' | 'recharge' | 'bills' | 'history';

function AppShell() {
  const { user, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center">
        <div className="text-white text-lg font-medium animate-pulse">Loading PayEasy...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  function navigate(s: Screen) {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const showNav = screen === 'home' || screen === 'history';

  return (
    <div className="min-h-screen bg-gray-50 sm:max-w-md sm:mx-auto sm:shadow-xl relative">
      {screen === 'home' && (
        <div className="absolute top-3 right-4 z-50">
          <button
            onClick={signOut}
            className="p-2 bg-white/15 backdrop-blur rounded-full text-white hover:bg-white/25 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {screen === 'home' && <HomeScreen navigate={navigate} />}
      {screen === 'send' && <SendScreen navigate={navigate} />}
      {screen === 'topup' && <TopUpScreen navigate={navigate} />}
      {screen === 'recharge' && <RechargeScreen navigate={navigate} />}
      {screen === 'bills' && <BillsScreen navigate={navigate} />}
      {screen === 'history' && <HistoryScreen navigate={navigate} />}

      {showNav && <BottomNav current={screen} navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
