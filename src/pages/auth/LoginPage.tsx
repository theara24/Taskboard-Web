import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Kanban, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, users } = useAuthStore();
  const { showToast } = useUIStore();

  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email);
    if (success) {
      showToast('success', 'Logged in successfully!');
      navigate('/dashboard');
    } else {
      showToast('error', 'User not found. Try one of the demo accounts below.');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    const success = login(demoEmail);
    if (success) {
      showToast('success', `Signed in as ${demoEmail}`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Kanban className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to TaskBoard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise project & issue tracking system
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-slate-400">Any password in demo</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Quick Sign-In with Demo Accounts
            </p>
            <div className="space-y-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.email)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200/80 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600" />
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({u.role})
                    </span>
                  </div>
                  <span className="text-[11px] text-brand-600 group-hover:underline">
                    Login
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Register new user
          </Link>
        </p>
      </div>
    </div>
  );
};
