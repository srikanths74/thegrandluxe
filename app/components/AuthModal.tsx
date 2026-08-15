'use client';

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Key, 
  Sparkles, 
  ShieldCheck,
  RefreshCw,
  LogOut,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isGoogle?: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset_confirm' | 'existing_accounts';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  
  // Sign In / Up Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Error / Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Demo Saved Existing Accounts
  const existingAccounts: UserProfile[] = [
    {
      name: 'Srikanth Stephen',
      email: 'srikanthstephen2007@gmail.com',
      phone: '+91 98765 43210',
      avatarUrl: 'https://ui-avatars.com/api/?name=Srikanth+Stephen&background=2F7BFF&color=fff',
      isGoogle: true
    },
    {
      name: 'srikanth',
      email: 'srikanthsuresh2007@gmail.com',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isGoogle: true
    }
  ];

  if (!isOpen) return null;

  // Handle Standard Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to sign in. Please check your credentials.');
        return;
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Network error occurred. Please try again.');
    }
  };

  // Handle Google OAuth Sign In & Redirection
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage('');
    // Direct browser redirect to Google OAuth verification endpoint
    window.location.href = '/api/auth/google/redirect';
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and try again.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to register account.');
        return;
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Network error during sign up.');
    }
  };

  // Handle Request Password / Email Verification Link
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const targetEmail = resetEmail || email || 'srikanthstephen2007@gmail.com';

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to send reset link.');
        return;
      }

      setResetSent(true);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Network error while sending reset link.');
    }
  };

  // Handle Password Reset Confirmation
  const handleConfirmNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to update password.');
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        setMode('signin');
        setResetSent(false);
        setResetSuccess(false);
      }, 1800);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Failed to reset password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-blue-500/50 p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{currentUser ? 'Logged In' : 'Guest Portal Access'}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header Logo */}
        <div className="text-center mb-3 space-y-1">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl bg-slate-950 mx-auto">
            <img
              src="/hotel_logo.png"
              alt="Grand Luxe Emblem"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-serif font-bold gold-gradient-text tracking-wide">
            GRAND LUXE HOTEL
          </h3>
          <p className="text-[11px] text-zinc-400">
            {mode === 'signin' && 'Sign in to access your guest portal & bookings'}
            {mode === 'signup' && 'Create your Grand Luxe Guest Account'}
            {mode === 'forgot' && 'Reset your password via Email'}
            {mode === 'existing_accounts' && 'Select an existing account to continue'}
          </p>
        </div>

        {/* Display Current User Info if already signed in */}
        {currentUser ? (
          <div className="space-y-3 py-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-2">
              <img
                src={currentUser.avatarUrl || 'https://ui-avatars.com/api/?name=Guest&background=2F7BFF&color=fff'}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full mx-auto border-2 border-blue-400 object-cover shadow-md"
              />
              <div>
                <h4 className="font-bold text-base text-white">{currentUser.name}</h4>
                <p className="text-xs text-blue-300 font-mono">{currentUser.email}</p>
                {currentUser.isGoogle && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full mt-1 font-semibold">
                    Google Verified Account
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {(currentUser.email === 'srikanthstephen2007@gmail.com' || currentUser.email === 'srikanthstephen@gmail.com' || currentUser.email?.includes('admin')) && (
                <a
                  href="/admin"
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Open Executive Admin Console</span>
                </a>
              )}
              <button onClick={onClose} className="w-full gold-button py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" /><span>Continue to Hotel</span>
              </button>
              <button onClick={onLogout} className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /><span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="mb-2 p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
                {errorMessage}
              </div>
            )}

            {/* ── MODE 1: SIGN IN ── */}
            {mode === 'signin' && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-zinc-800 w-full" />
                  <span className="bg-slate-950 px-3 text-[10px] uppercase font-bold text-zinc-500 shrink-0">Or Username & Password</span>
                </div>

                <form onSubmit={handleSignIn} className="space-y-2 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300 block text-[11px]">Email or Username</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul.sharma@gmail.com"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-zinc-300 text-[11px]">Password</label>
                      <button type="button" onClick={() => { setMode('forgot'); setResetSent(false); }} className="text-[11px] text-blue-400 hover:underline font-semibold">Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-zinc-500 hover:text-blue-500 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full gold-button py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Sign In to Account</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <button onClick={() => setMode('signup')} className="text-zinc-400 hover:text-blue-300 text-[11px] font-semibold">
                    New Guest? <span className="text-blue-400 underline">Create Account</span>
                  </button>
                  <button onClick={() => setMode('existing_accounts')} className="text-amber-400 hover:underline text-[11px] font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />Existing Accounts
                  </button>
                </div>
              </div>
            )}

            {/* ── MODE 2: SIGN UP ── */}
            {mode === 'signup' && (
              <div className="space-y-2 text-xs">
                <button type="button" onClick={handleGoogleSignIn}
                  className="w-full py-2 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-colors shadow-md">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign Up with Google</span>
                </button>
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-zinc-800 w-full" />
                  <span className="bg-slate-950 px-3 text-[10px] uppercase font-bold text-zinc-500 shrink-0">Or Enter Details</span>
                </div>
                <form onSubmit={handleSignUp} className="space-y-2">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300 block text-[11px]">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-300 block text-[11px]">Email *</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-300 block text-[11px]">Phone</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-300 block text-[11px]">Password *</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                          className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-blue-500 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-300 block text-[11px]">Confirm *</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                          className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-blue-500 transition-colors">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full gold-button py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Register & Explore Hotel</span>}
                  </button>
                </form>
                <div className="text-center">
                  <button onClick={() => setMode('signin')} className="text-blue-400 hover:underline text-[11px] font-semibold">Already have an account? Sign In</button>
                </div>
              </div>
            )}

            {/* ── MODE 3: FORGOT PASSWORD ── */}
            {mode === 'forgot' && (
              <div className="space-y-3 text-xs">
                {resetSent ? (
                  <div className="space-y-3 text-center bg-slate-900/90 p-4 rounded-2xl border border-blue-500/30">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Reset Link Sent!</h4>
                      <p className="text-xs text-zinc-300 mt-1">If an account exists, a link was sent to <br/><span className="text-blue-300 font-mono mt-1 block">{resetEmail || email || 'your inbox'}</span></p>
                    </div>

                    <p className="text-xs text-zinc-400 mt-2 mb-2">Please check your email and click the link to securely reset your password.</p>

                    <button type="button" onClick={() => setMode('signin')} className="text-zinc-400 hover:text-white text-[11px] font-semibold uppercase tracking-wider mt-4">
                      ← Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendResetEmail} className="space-y-3">
                    <p className="text-zinc-400 text-xs leading-relaxed">Enter your registered Gmail. We'll send a password reset link.</p>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-300 block text-[11px]">Registered Gmail Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                        <input type="email" required value={resetEmail || email} onChange={(e) => setResetEmail(e.target.value)} placeholder="rahul.sharma@gmail.com"
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60" />
                      </div>
                    </div>
                    <button type="submit" disabled={isLoading}
                      className="w-full gold-button py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /><span>Send Gmail Reset Link</span></>}
                    </button>
                    <div className="text-center">
                      <button type="button" onClick={() => setMode('signin')} className="text-zinc-400 hover:text-white text-[11px]">← Back to Sign In</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ── MODE 4: EXISTING ACCOUNTS ── */}
            {mode === 'existing_accounts' && (
              <div className="space-y-2 text-xs">
                <p className="text-zinc-400 text-xs">Saved accounts on this device — click to log in instantly:</p>
                <div className="space-y-2">
                  {existingAccounts.map((acc, idx) => (
                    <button key={idx} onClick={() => { onLoginSuccess(acc); onClose(); }}
                      className="w-full p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-zinc-800 hover:border-blue-500/50 flex items-center gap-3 text-left transition-all group">
                      <img src={acc.avatarUrl} alt={acc.name} className="w-9 h-9 rounded-full object-cover border border-blue-400/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white group-hover:text-blue-300 truncate">{acc.name}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{acc.email}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <button onClick={() => setMode('signin')} className="text-zinc-400 hover:text-white text-[11px]">← Another account</button>
                  <button onClick={() => setMode('signup')} className="text-blue-400 font-bold hover:underline text-[11px]">+ Create New</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Trust Badge */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>256-Bit SSL Encrypted Access</span>
          </div>
          <span>Grand Luxe Hotel © 2026</span>
        </div>

      </div>
    </div>
  );
};
