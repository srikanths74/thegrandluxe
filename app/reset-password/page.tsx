'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'No reset token provided. Please check your email link.' });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to update password. Link may be expired.' });
        return;
      }

      setMessage({ type: 'success', text: 'Password successfully updated! You can now close this tab and sign in.' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Network error occurred. Please try again.' });
    }
  };

  if (!token && !message) return null;

  return (
    <div className="w-full max-w-md glass-panel rounded-3xl border border-blue-500/50 p-8 shadow-2xl relative z-10 mx-auto mt-20 bg-slate-950/90 backdrop-blur-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold gold-gradient-text tracking-wide mb-2">Reset Password</h2>
        <p className="text-zinc-400 text-sm">Create a new, strong password for your account.</p>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-xl flex items-start gap-2 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'} border text-sm font-medium`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {(!message || message.type !== 'success') && token && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300 block text-xs">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300 block text-xs">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 gold-button py-3 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] transition-transform"
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Updating...</span>
            ) : (
              <><span>Save New Password</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      )}
      
      {message?.type === 'success' && (
        <div className="mt-8 text-center">
          <a href="/" className="inline-block py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
            Return to Homepage
          </a>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Suspense fallback={<div className="text-white text-center mt-20">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
