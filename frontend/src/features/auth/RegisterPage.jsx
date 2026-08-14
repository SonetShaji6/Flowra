import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Select } from '../../components/ui';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PROJECT_MANAGER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password, role });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the provided information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-bold text-2xl shadow-lg shadow-teal-700/20 mb-4">
          F
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your Flowra account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Start streamlining workflows with AI-driven agility.
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
              label="Full Name"
              type="text"
              placeholder="Sarah Jenkins"
              icon={UserIcon}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="sarah@flowra.app"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Select
              label="Workspace Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'PROJECT_MANAGER', label: 'Project Manager (Creates & leads projects)' },
                { value: 'TEAM_MEMBER', label: 'Team Member (Executes tasks & collaborates)' },
              ]}
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="md">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0F766E] hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
