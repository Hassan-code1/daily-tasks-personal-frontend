import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CalendarProvider } from './context/CalendarContext';
import Calendar from './components/Calendar';
import AuthPage from './pages/AuthPage';
import './index.css';

function AppContent() {
  const { token, user, logout } = useAuth();

  return (
    <AnimatePresence mode="wait">
      {!token ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AuthPage />
        </motion.div>
      ) : (
        <CalendarProvider>
          <motion.div
            key="app"
            className="relative z-10 min-h-screen flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <header className="glass sticky top-0 z-50 flex items-center gap-4 px-8 py-4 rounded-none border-x-0 border-t-0">
              <span className="text-4xl">📅</span>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-gradient">Daily Tasks</h1>
                <p className="text-xs text-white/60 mt-0.5 font-light">Your productivity, beautifully organized</p>
              </div>
              {/* User info + Logout */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white/90">{user?.name}</p>
                  <p className="text-xs text-white/40">{user?.email}</p>
                </div>
                <motion.button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white transition-all cursor-pointer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Sign out"
                >
                  Sign out
                </motion.button>
              </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-7">
              <Calendar />
            </main>
          </motion.div>
        </CalendarProvider>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
