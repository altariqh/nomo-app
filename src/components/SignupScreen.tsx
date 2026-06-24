import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Compass, ArrowRight, CheckSquare, Square } from 'lucide-react';
import { EMOTIONAL_EMOJIS } from '../mockData';

interface SignupScreenProps {
  onSignupComplete: (userData: {
    name: string;
    email: string;
    specialty: string;
    seedingMood: string;
    password?: string;
    profilePicture?: string;
  }, isNewUser: boolean) => void;
  onSkipToDemo: () => void;
}

interface StoredUser {
  name: string;
  email: string;
  specialty: string;
  seedingMood: string;
  password?: string;
  profilePicture?: string;
}

export default function SignupScreen({ onSignupComplete, onSkipToDemo }: SignupScreenProps) {
  const [isSignIn, setIsSignIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('Remote Creative');
  const [seedingMood, setSeedingMood] = useState('Joyful');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Local Database of users initialized with Sophie
  useEffect(() => {
    const existingDb = localStorage.getItem('nomo_users_db_v3');
    if (!existingDb) {
      const defaultUsers: StoredUser[] = [
        {
          name: 'Sophie',
          email: 'sophie@nomad.com',
          specialty: 'Remote Creative',
          seedingMood: 'Joyful',
          password: 'coffee2026',
          profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
        }
      ];
      localStorage.setItem('nomo_users_db_v3', JSON.stringify(defaultUsers));
    }

    // Load remembered email
    const remembered = localStorage.getItem('nomo_remembered_email');
    if (remembered) {
      setEmail(remembered);
      setIsSignIn(true); // Switch to sign in if we remembered someone
    }
  }, []);

  const specialties = [
    'Remote Creative',
    'Solo Backpack Wanderer',
    'Slow-Brew Coffee Enthusiast',
    'Aesthetic Gallery Curator',
    'Tech Nomad Philosopher',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid traveler email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters to safe-keep your journal.');
      return;
    }

    // Fetch local user list
    const usersDbStr = localStorage.getItem('nomo_users_db_v3');
    const usersDb: StoredUser[] = usersDbStr ? JSON.parse(usersDbStr) : [];

    if (isSignIn) {
      // HANDLE SIGN IN
      const foundUser = usersDb.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!foundUser) {
        setError('Incorrect email address or password. Try sophie@nomad.com / coffee2026!');
        return;
      }

      // Handle remember me state
      if (rememberMe) {
        localStorage.setItem('nomo_remembered_email', foundUser.email);
      } else {
        localStorage.removeItem('nomo_remembered_email');
      }

      // Save as currently signed in user
      localStorage.setItem('nomo_user_v3', JSON.stringify(foundUser));
      
      // Let app know user of active session (isNewUser = false)
      onSignupComplete(foundUser, false);
    } else {
      // HANDLE SIGN UP
      if (!name.trim()) {
        setError('Please share your name with Nomo.');
        return;
      }

      // Validate email uniqueness
      const alreadyExists = usersDb.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (alreadyExists) {
        setError('A traveler is already registered under this email. Try logging in!');
        return;
      }

      const newUser: StoredUser = {
        name: name.trim(),
        email: email.trim(),
        specialty,
        seedingMood,
        password: password,
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
      };

      // Push to local db list
      const updatedDb = [...usersDb, newUser];
      localStorage.setItem('nomo_users_db_v3', JSON.stringify(updatedDb));

      // Handle remember me state
      if (rememberMe) {
        localStorage.setItem('nomo_remembered_email', newUser.email);
      } else {
        localStorage.removeItem('nomo_remembered_email');
      }

      // Save as currently signed in user
      localStorage.setItem('nomo_user_v3', JSON.stringify(newUser));

      // Trigger Onboarding (isNewUser = true)
      onSignupComplete(newUser, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-[#3C3836] p-4 md:p-8 flex flex-col justify-center items-center">
      {/* Decorative scrap tape */}
      <div className="w-full max-w-lg bg-white rounded-[32px] p-6 md:p-10 shadow-xl border border-[#F1EFE9] relative overflow-hidden transition-all duration-300">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#DDD0C5]/40 border-b border-[#C8B8AB]/50 flex items-center justify-center font-mono text-[9px] text-[#5A5A40] font-bold uppercase tracking-widest pointer-events-none">
          {isSignIn ? '🔑 Sign In' : '✨ Register'}
        </div>

        <div className="text-center mt-6 mb-6">
          <div className="inline-flex items-center gap-2 justify-center mb-1">
            <h1 className="text-4xl font-serif italic text-[#5A5A40] tracking-tight font-bold">nomo.</h1>
            <span className="font-mono text-[9px] bg-[#E7E5E4] px-2 py-0.5 rounded text-[#5A5A40] font-bold uppercase">
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
          <p className="text-xs tracking-wide text-[#8C857E] max-w-sm mx-auto font-sans leading-relaxed">
            {isSignIn 
              ? "Sign in to access your travel journals, view cafe logs, and sync budgets."
              : "Your simple companion for organizing itineraries, saving cafe spots, and tracking group travel budgets."
            }
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        {isSignIn && (
          <div className="mb-4 bg-[#FAF9F7] border border-[#DDD0C5] p-3 rounded-2xl text-[10.5px] text-[#5A5A40] leading-relaxed relative">
            <span className="font-mono font-bold uppercase block text-[#8C857E] text-[8.5px] tracking-wider mb-1">🔑 Demo credentials:</span>
            Email: <strong className="font-mono">sophie@nomad.com</strong> • Password: <strong className="font-mono">coffee2026</strong>
          </div>
        )}

        {error && (
          <div className="p-3 mb-5 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-100 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Traveler Name Field - Only shown on Sign Up screen */}
          {!isSignIn && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] block font-bold">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sophie"
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] block font-bold">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sophie@nomad.com"
                className="w-full bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] block font-bold">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl pl-10 pr-10 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-[#5A5A40]"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-[#A8A29E]" /> : <Eye className="w-4 h-4 text-[#A8A29E]" />}
              </button>
            </div>
          </div>



          {/* Remember Me Option */}
          <div className="pt-1 select-none">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-all font-mono text-[9px] uppercase tracking-wider text-left"
            >
              {rememberMe ? (
                <CheckSquare className="w-4 h-4 text-[#5A5A40] shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-stone-300 shrink-0" />
              )}
              <span>Remember email address</span>
            </button>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#5A5A40] text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-[#4a4a34] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSignIn ? 'Sign In' : 'Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Dynamic toggles between Sign In and Sign Up */}
            <div className="my-1 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wide text-stone-400">
                {isSignIn ? "New to Nomo? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setError('');
                }}
                className="text-xs font-bold text-[#5A5A40] font-serif hover:underline select-all cursor-pointer inline"
              >
                {isSignIn ? "Create an account →" : "Sign in to existing account →"}
              </button>
            </div>
            
            <button
              type="button"
              onClick={onSkipToDemo}
              className="w-full py-2.5 text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider rounded-2xl border border-[#DDD0C5] hover:bg-[#F3F2EE] transition-all cursor-pointer"
            >
              Skip and explore with demo account (Sophie)
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center text-[10px] font-mono text-[#A8A29E] uppercase tracking-widest">
        Nomo • Intentional travel layouts for your journeys
      </div>
    </div>
  );
}
