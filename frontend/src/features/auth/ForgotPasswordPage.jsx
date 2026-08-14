import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Check } from 'lucide-react';
import { Button, Input } from '../../components/ui';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate recovery email dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-bold text-2xl shadow-lg shadow-teal-700/20 mb-4">
          F
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reset your password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered work email to receive password recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {submitted ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Recovery Email Sent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <strong className="text-slate-900">{email}</strong>, we have sent instructions to reset your password.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="outline" className="w-full" size="md">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Work Email"
                type="email"
                placeholder="name@company.com"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" loading={loading} className="w-full mt-2" size="md" icon={Send}>
                Send Recovery Instructions
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
