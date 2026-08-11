import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, Mail, Lock, Shield, ShieldCheck, ArrowLeft, Loader2, Info } from 'lucide-react';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { user, login, resetPassword, isMock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Forgot password flow states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // If already logged in, redirect to /admin
  useEffect(() => {
    if (user) {
      console.log('[LoginPage] User already authenticated. Redirecting to /admin');
      onNavigate('/admin');
    }
  }, [user, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      console.log('[LoginPage] Successful admin login.');
      onNavigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotSuccess('Please enter your email.');
      return;
    }

    setForgotLoading(true);
    setForgotSuccess(null);

    try {
      await resetPassword(forgotEmail);
      // As mandated: never reveal whether account exists and show exact success message:
      setForgotSuccess("If an account exists, a password reset email has been sent.");
    } catch (err) {
      // Safe fail as mandated: never leak info
      setForgotSuccess("If an account exists, a password reset email has been sent.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-black flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Immersive background elements matching Vaw Lyne's aesthetic */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#D92F7A]/20 via-[#C084FC]/8 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#FF4FA3]/15 blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#C084FC]/10 blur-3xl pointer-events-none animate-pulse duration-[12000ms]" />

      {/* Floating Apple-Style Back To Home Button */}
      <button 
        onClick={() => onNavigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-xs font-mono font-bold uppercase tracking-wider cursor-pointer backdrop-blur-md"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Home
      </button>

      {/* Main Glass Login Card (Apple Liquid Glass UI) */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Apple liquid border highlight glowing effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-vaw-pink via-lavender-aura to-vaw-pink rounded-[32px] opacity-25 blur-[1px] pointer-events-none" />
        
        <div className="relative glass-panel rounded-[32px] border border-white/12 bg-zinc-950/45 p-8 md:p-10 backdrop-blur-3xl shadow-2xl flex flex-col gap-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <img
                src="https://res.cloudinary.com/ax8kt8pw/image/upload/v1784615279/ChatGPT_Image_Jul_21_2026_08_09_54_AM_e1bhjn.png"
                alt="Vaw Lyne"
                className="h-12 w-auto object-contain filter drop-shadow-sm cursor-pointer"
                onClick={() => onNavigate('/')}
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/15 text-rose-mist text-[10px] font-mono font-bold tracking-widest uppercase">
              <Shield className="w-3 h-3 text-vaw-pink" />
              Secure Administration
            </div>
            
            <h2 className="text-2xl font-display font-black tracking-tight text-white mt-1">
              {isForgotPassword ? 'Reset Password' : 'Admin Portal'}
            </h2>
            <p className="text-zinc-400 text-xs font-medium">
              {isForgotPassword 
                ? 'Enter your email address to receive a secure password reset link.' 
                : "Log in to coordinate Vaw Lyne's releases and tour calendar."}
            </p>
          </div>

          {/* Render Forgot Password View */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              
              {/* Success / Info Message Display */}
              {forgotSuccess && (
                <div className="p-3.5 rounded-2xl bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs text-left font-medium">
                  {forgotSuccess}
                </div>
              )}

              {/* Forgot Email Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-vaw-pink focus:ring-1 focus:ring-vaw-pink/30 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-button-gradient hover:opacity-90 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-vaw-pink/15 flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Sending Request...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotSuccess(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white font-mono tracking-wider transition-colors cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>

            </form>
          ) : (
            /* Render Standard Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Message Display */}
              {error && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs text-left animate-shake font-medium">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-vaw-pink focus:ring-1 focus:ring-vaw-pink/30 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Password</label>
                  <button 
                    type="button" 
                    className="text-[10px] text-vaw-pink hover:underline font-mono cursor-pointer" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(true);
                      setForgotEmail(email);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-vaw-pink focus:ring-1 focus:ring-vaw-pink/30 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-vaw-pink focus:ring-vaw-pink/20 accent-vaw-pink focus:outline-none cursor-pointer"
                  />
                  Remember Me
                </label>
              </div>

              {/* Submit Button (Apple Liquid Glass UI) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-button-gradient hover:opacity-90 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-vaw-pink/15 flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Authenticating...
                  </>
                ) : (
                  'Log In to Dashboard'
                )}
              </button>
            </form>
          )}

          {/* Secure branding footer */}
          <div className="text-[10px] font-mono text-zinc-500 space-y-2 text-center pt-2 border-t border-white/5">
            <div className="flex items-center justify-center gap-2">
              <p className="text-zinc-600">BILION VIBEZ ADMINISTRATIVE CONTROL v2.0</p>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="inline-flex items-center gap-1 text-vaw-pink hover:text-white underline transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                Privacy &amp; Data Policy
              </button>
            </div>
            <p>Shielded by Firebase Authentication Suite</p>
          </div>

        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
