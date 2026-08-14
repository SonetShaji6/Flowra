import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('pm.sarah@flowra.app');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-bold text-2xl shadow-lg shadow-teal-700/20 mb-4">
          F
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to Flowra</h2>
        <p className="mt-1 text-xs text-slate-500">
          Where Projects Flow. AI-Powered Project Management.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="md">
              Sign In to Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo Quick Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('pm.sarah@flowra.app', 'Password123!')}
                className="p-2 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1 text-[#0F766E] font-semibold mb-0.5">
                  <Briefcase className="w-3 h-3" />
                  <span>PM</span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">Sarah (Lead)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alex.dev@flowra.app', 'Password123!')}
                className="p-2 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1 text-[#0F766E] font-semibold mb-0.5">
                  <UserCheck className="w-3 h-3" />
                  <span>Dev</span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">Alex (Engineer)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin.root@flowra.app', 'Password123!')}
                className="p-2 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/50 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1 text-[#0F766E] font-semibold mb-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">Root Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#0F766E] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
