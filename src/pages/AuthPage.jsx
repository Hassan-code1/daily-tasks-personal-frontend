import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const inputCls = `
  w-full px-4 py-3 rounded-xl text-sm text-white/90 placeholder-white/30
  bg-white/[0.08] border border-white/20 outline-none
  focus:border-[#a78bfa] focus:shadow-[0_0_12px_rgba(167,139,250,0.35)]
  transition-all duration-200
`;

const btnCls = `
  w-full py-3 rounded-xl font-semibold text-sm text-white cursor-pointer
  bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50
  disabled:cursor-not-allowed transition-opacity
`;

export default function AuthPage() {
    const { login, register, loading, error, setError } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const set = (field) => (e) => {
        setError('');
        setForm((f) => ({ ...f, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'login') {
            await login(form.email, form.password);
        } else {
            await register(form.name, form.email, form.password);
        }
    };

    const switchMode = (m) => {
        setError('');
        setForm({ name: '', email: '', password: '' });
        setMode(m);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">📅</div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient">Daily Tasks</h1>
                    <p className="text-white/50 text-sm mt-2">Your productivity, beautifully organized</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8">
                    {/* Tabs */}
                    <div className="flex rounded-xl overflow-hidden border border-white/10 mb-7">
                        {['login', 'register'].map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-all cursor-pointer ${mode === m
                                        ? 'bg-violet-600/70 text-white'
                                        : 'text-white/50 hover:text-white/80 bg-transparent'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <AnimatePresence>
                            {mode === 'register' && (
                                <motion.div
                                    key="name"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <input
                                        className={inputCls}
                                        type="text"
                                        placeholder="Full name"
                                        value={form.name}
                                        onChange={set('name')}
                                        required
                                        maxLength={60}
                                        aria-label="Full name"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input
                            className={inputCls}
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={set('email')}
                            required
                            aria-label="Email address"
                        />

                        <input
                            className={inputCls}
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={set('password')}
                            required
                            minLength={6}
                            aria-label="Password"
                        />

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    key="err"
                                    className="text-[#f87171] text-xs text-center -mt-1"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <motion.button
                            className={btnCls}
                            type="submit"
                            disabled={loading}
                            style={{ boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
