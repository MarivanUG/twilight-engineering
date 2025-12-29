import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSignIn, adminSignOut, onAdminAuthStateChanged } from '../lib/firestoreService'; // Adjusted path
import type { User as FirebaseAuthUser } from 'firebase/auth'; // Changed to type import

interface AdminContextType {
  isAdminMode: boolean;
  setIsAdminMode: (isAdmin: boolean) => void;
  showLoginModal: () => void;
  hideLoginModal: () => void;
  handleLogout: () => Promise<void>;
  adminUser: FirebaseAuthUser | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<FirebaseAuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((user) => {
      if (user) {
        setAdminUser(user);
        setIsAdminMode(true);
        // Optionally navigate to admin if not already there, but do not force here
        // navigate('/admin'); 
      } else {
        setAdminUser(null);
        setIsAdminMode(false);
        // Redirect from admin if logged out
        if (navigate && window.location.pathname.startsWith('/admin')) {
          navigate('/');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const showLoginModal = () => setIsLoginModalOpen(true);
  const hideLoginModal = () => setIsLoginModalOpen(false);

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      const user = await adminSignIn(email, password);
      if (user) {
        hideLoginModal();
        alert('Admin mode activated!');
        navigate('/admin'); // Navigate to admin dashboard on successful login
      }
      return true; // Indicate success for the modal
    } catch (error: any) {
      console.error("Login failed:", error.message);
      alert(`Login failed: ${error.message}`);
      return false; // Indicate failure for the modal
    }
  };

  const handleLogout = async () => {
    try {
      await adminSignOut();
      alert('Logged out successfully.');
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <AdminContext.Provider value={{ isAdminMode, setIsAdminMode, showLoginModal, hideLoginModal, handleLogout, adminUser }}>
      {children}
      {isLoginModalOpen && (
        <AdminLoginModal onLoginSubmit={handleLoginSubmit} onClose={hideLoginModal} />
      )}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// AdminLoginModal Component
interface AdminLoginModalProps {
  onLoginSubmit: (email: string, password: string) => Promise<boolean>;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onLoginSubmit, onClose }) => {
  const [mode, setMode] = useState<'pin' | 'email'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (pin === '1234') {
      setLoading(true);
      try {
        // Force sign out first to ensure we get a fresh token with claims
        await adminSignOut();
      } catch (err) {
        console.warn('Sign out before login failed', err);
      }
      
      // Use hardcoded credentials for the PIN bypass
      const success = await onLoginSubmit('cypheruganda@gmail.com', 'devpass@25');
      setLoading(false);
      if (!success) {
        setError('System login failed despite correct PIN. Check network.');
      } else {
        setPin('');
      }
    } else {
      setError('Invalid PIN');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await onLoginSubmit(email, password);
    setLoading(false);
    if (!success) {
      setError('Login failed. Check credentials.');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white p-8 rounded-lg shadow-xl relative max-w-sm w-full animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          {mode === 'pin' ? 'Enter Admin PIN' : 'Admin Login'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        {mode === 'pin' ? (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest"
                placeholder="••••"
                maxLength={4}
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => { setMode('email'); setError(''); }}
                className="text-sm text-slate-500 hover:text-orange-600 underline"
              >
                Login with Email instead
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Password"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Login'}
              </button>
            </div>
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => { setMode('pin'); setError(''); }}
                className="text-sm text-slate-500 hover:text-orange-600 underline"
              >
                Use PIN Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
