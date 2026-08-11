import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ShieldAlert, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}

export default function ProtectedRoute({ children, onNavigate }: ProtectedRouteProps) {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      console.log('[ProtectedRoute] Not authenticated. Redirecting to /login');
      onNavigate('/login');
    }
  }, [user, loading, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Dynamic ambient glass backdrop */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#D92F7A]/15 via-[#C084FC]/5 to-transparent pointer-events-none" />
        <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-[#FF4FA3]/10 blur-3xl pointer-events-none" />
        
        {/* Apple liquid glass loading container */}
        <div className="relative glass-panel rounded-3xl border border-white/10 bg-zinc-950/40 p-8 flex flex-col items-center justify-center backdrop-blur-2xl max-w-sm w-full mx-4 shadow-2xl animate-pulse">
          <div className="relative w-16 h-16 mb-4">
            {/* Spinning liquid glass gradient ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-vaw-pink border-r-lavender-aura animate-spin" />
            <div className="absolute inset-2 bg-zinc-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-vaw-pink animate-pulse" />
            </div>
          </div>
          <h3 className="text-white text-sm font-mono font-bold tracking-widest uppercase">Securing Session</h3>
          <p className="text-zinc-500 text-[10px] font-mono mt-2 uppercase tracking-wide">Bilion Vibez Shield Active</p>
        </div>
      </div>
    );
  }

  // If loading is done and there's no user, we return null since useEffect handles redirection.
  if (!user) {
    return null;
  }

  // Verify Role Permission
  const ALLOWED_ROLES = ['super_admin', 'admin', 'manager', 'editor', 'viewer'];
  const hasPermission = ALLOWED_ROLES.includes(user.role) && user.active;

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-midnight-black flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Dynamic ambient glass backdrop */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-red-900/10 via-zinc-950 to-transparent pointer-events-none" />
        
        {/* Access Denied Container */}
        <div className="relative glass-panel rounded-3xl border border-red-500/20 bg-zinc-950/45 p-8 flex flex-col items-center justify-center backdrop-blur-3xl max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-display font-black text-white">Access Denied</h2>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">
            Your account (<strong className="text-zinc-200">{user.email}</strong>) is not authorized or has been deactivated. Please contact the administrator.
          </p>
          
          <button 
            onClick={logout} 
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/15 text-zinc-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out from Portal
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
