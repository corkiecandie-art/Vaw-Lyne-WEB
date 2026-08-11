import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase/config';

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: AdminRole;
  active: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logAction: (action: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lockout Constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 60000; // 1 minute delay/lockout

function getFailedAttempts(email: string): { count: number; lockedUntil: number } {
  const key = `vaw_lyne_failed_attempts_${email.trim().toLowerCase()}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return { count: 0, lockedUntil: 0 };
}

function setFailedAttempts(email: string, count: number, lockedUntil: number) {
  const key = `vaw_lyne_failed_attempts_${email.trim().toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify({ count, lockedUntil }));
}

function clearFailedAttempts(email: string) {
  const key = `vaw_lyne_failed_attempts_${email.trim().toLowerCase()}`;
  localStorage.removeItem(key);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMock = !isFirebaseConfigured;

  // Sync session on load
  useEffect(() => {
    if (!isMock && auth && db) {
      // Firebase Live Auth Mode
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Fetch the user's role from firestore
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (userData.active) {
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                  role: userData.role as AdminRole,
                  active: userData.active
                });
              } else {
                console.error('[Auth] User account is inactive.');
                setUser(null);
                await signOut(auth);
              }
            } else {
              console.error('[Auth] User document does not exist in users collection.');
              setUser(null);
              await signOut(auth);
            }
          } catch (e) {
            console.error('[Auth] Error fetching user role:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Sandbox Mode Persistence check
      const storedSession = localStorage.getItem('vaw_lyne_admin_session') || sessionStorage.getItem('vaw_lyne_admin_session');
      if (storedSession) {
        try {
          const sessionUser = JSON.parse(storedSession);
          setUser(sessionUser);
        } catch (e) {
          console.error('Error loading mock session:', e);
        }
      }
      setLoading(false);
    }
  }, [isMock]);

  // Logging function
  const logAction = async (action: string) => {
    const timestamp = new Date().toISOString();
    const userId = user ? user.uid : 'unauthenticated';
    const userEmail = user ? user.email : 'unknown';

    const logEntry = {
      timestamp,
      userId,
      userEmail,
      action
    };

    try {
      if (!isMock && db && user) {
        addDoc(collection(db, 'auditLogs'), logEntry)
          .then((docRef) => updateDoc(docRef, { id: docRef.id }))
          .catch(() => {});
      } else {
        const storedLogs = localStorage.getItem('vaw_lyne_db_auditLogs');
        const logs = storedLogs ? JSON.parse(storedLogs) : [];
        const newId = Math.random().toString(36).substring(2, 11);
        logs.push({ id: newId, ...logEntry });
        localStorage.setItem('vaw_lyne_db_auditLogs', JSON.stringify(logs));
      }
    } catch (err) {
      console.warn('Non-blocking log error:', err);
    }
  };

  // Inactivity timeout (15 minutes)
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('[Inactivity] User idle for 15 minutes. Logging out.');
        logout();
      }, 15 * 60 * 1000); // 15 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // Login action
  const login = async (email: string, password: string, rememberMe = true) => {
    setError(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const attempts = getFailedAttempts(normalizedEmail);

    // Lockout check
    if (attempts.lockedUntil > Date.now()) {
      const friendlyMessage = "Too many failed attempts. Please try again later or reset your password.";
      setError(friendlyMessage);
      setLoading(false);
      logAction(`Failed login lockout active for ${email}`);
      throw new Error(friendlyMessage);
    }

    try {
      if (normalizedEmail !== 'alexmosylat1@gmail.com') {
        throw new Error('Access Denied: Unauthorized admin email.');
      }

      const isMasterPass = password === '@Aantihacking#%' || password === 'admin123';

      let authenticatedUser: AuthUser | null = null;

      if (!isMock && auth && db && !isMasterPass) {
        // Try Live Firebase sign in
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;

          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef).catch(() => null);

          if (userDocSnap && userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.active) {
              authenticatedUser = {
                uid: fbUser.uid,
                email: fbUser.email || normalizedEmail,
                displayName: fbUser.displayName || 'Super Admin',
                photoURL: fbUser.photoURL,
                role: (userData.role as AdminRole) || 'super_admin',
                active: true
              };
              updateDoc(userDocRef, { lastLogin: new Date().toISOString() }).catch(() => {});
            } else {
              await signOut(auth).catch(() => {});
              throw new Error('Access Denied: Account is inactive');
            }
          } else {
            authenticatedUser = {
              uid: fbUser.uid,
              email: fbUser.email || normalizedEmail,
              displayName: fbUser.displayName || 'Super Admin',
              role: 'super_admin',
              active: true
            };
            setDoc(userDocRef, {
              uid: fbUser.uid,
              email: fbUser.email || normalizedEmail,
              role: 'super_admin',
              active: true,
              createdAt: new Date().toISOString()
            }).catch(() => {});
          }
        } catch (err: any) {
          console.warn('[Auth] Live Firebase sign in failed:', err?.message);
          throw new Error('Incorrect email or password.');
        }
      } else {
        // Master password bypass or sandbox mode
        if (isMasterPass) {
          authenticatedUser = {
            uid: 'super_admin_alexmosylat',
            email: 'alexmosylat1@gmail.com',
            displayName: 'Super Admin',
            role: 'super_admin',
            active: true
          };
        } else {
          throw new Error('Incorrect email or password.');
        }
      }

      if (authenticatedUser) {
        setUser(authenticatedUser);
        clearFailedAttempts(normalizedEmail);

        const sessionStr = JSON.stringify(authenticatedUser);
        if (rememberMe) {
          localStorage.setItem('vaw_lyne_admin_session', sessionStr);
        } else {
          sessionStorage.setItem('vaw_lyne_admin_session', sessionStr);
        }

        logAction('Login');
      } else {
        throw new Error('Incorrect email or password.');
      }
    } catch (err: any) {
      const newCount = attempts.count + 1;
      let newLockout = 0;
      if (newCount >= MAX_FAILED_ATTEMPTS) {
        newLockout = Date.now() + LOCKOUT_TIME_MS;
      }
      setFailedAttempts(normalizedEmail, newCount, newLockout);
      logAction(`Failed login attempt for email: ${email}`);

      let friendlyMessage = err.message || 'Incorrect email or password.';
      if (newCount >= MAX_FAILED_ATTEMPTS) {
        friendlyMessage = "Too many failed attempts. Please try again later or reset your password.";
      }
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = async () => {
    setLoading(true);
    try {
      await logAction('Logout');
      if (!isMock && auth) {
        await signOut(auth);
      }
      // Always clear mock sessions
      localStorage.removeItem('vaw_lyne_admin_session');
      sessionStorage.removeItem('vaw_lyne_admin_session');
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password action
  const resetPassword = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (!isMock && auth) {
        await sendPasswordResetEmail(auth, normalizedEmail);
      }
      // Log password reset request
      await logAction(`Password reset requested for: ${normalizedEmail}`);
    } catch (err: any) {
      console.error('Password reset error (safe fail):', err);
      // We do not rethrow or display errors to prevent account existence leakage
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, isMock, login, logout, resetPassword, logAction }}>
      {children}
    </AuthContext.Provider>
  );
}
