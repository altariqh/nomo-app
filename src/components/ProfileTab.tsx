import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Eye, 
  EyeOff, 
  LogOut, 
  Trash2, 
  Save, 
  Upload, 
  ShieldAlert,
  CheckCircle,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import { Trip } from '../types';
import { CITY_THEMES, getCityTheme, CityTheme } from '../utils/cityThemes';

interface ProfileTabProps {
  trips: Trip[];
  user: {
    name: string;
    email: string;
    specialty: string;
    seedingMood: string;
    password?: string;
    profilePicture?: string;
  };
  onSave: (updatedUser: {
    name: string;
    email: string;
    specialty: string;
    seedingMood: string;
    password?: string;
    profilePicture?: string;
  }) => void;
  onLogout: () => void;
  onDeleteProfile: () => void;
}

// Apple Fitness-style circular text sticker medal helper component
const StickerMedal = ({
  theme,
  isUnlocked,
  reviewsCount,
  onClick
}: {
  theme: CityTheme;
  isUnlocked: boolean;
  reviewsCount: number;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all relative group select-none text-center cursor-pointer ${
        isUnlocked 
          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-3xs' 
          : 'bg-stone-50/50 border-stone-100 hover:border-stone-200'
      }`}
    >
      {/* Medal body */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        {isUnlocked && (
          <div className="absolute inset-0 rounded-full bg-amber-400 opacity-20 blur-sm group-hover:opacity-40 transition-opacity animate-pulse" />
        )}
        
        <svg className={`w-12 h-12 transform transition-all duration-500 ${isUnlocked ? 'scale-100 group-hover:rotate-12' : 'scale-95 grayscale opacity-40'}`} viewBox="0 0 100 100">
          <defs>
            <path id={`circlePath-${theme.id}`} d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
            <linearGradient id={`grad-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isUnlocked ? '#FCD34D' : '#CBD5E1'} />
              <stop offset="50%" stopColor={isUnlocked ? '#F59E0B' : '#94A3B8'} />
              <stop offset="100%" stopColor={isUnlocked ? '#B45309' : '#475569'} />
            </linearGradient>
            <linearGradient id={`innerGrad-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          
          {/* Outer Gold/Silver Ridge */}
          <circle cx="50" cy="50" r="45" fill={`url(#grad-${theme.id})`} stroke={isUnlocked ? '#92400E' : '#475569'} strokeWidth="1" />
          <circle cx="50" cy="50" r="41" fill="#FFF" opacity="0.1" />
          
          {/* Inner dark core */}
          <circle cx="50" cy="50" r="37" fill={`url(#innerGrad-${theme.id})`} />
          
          {/* Medal Decorative Curved Text */}
          <text fill={isUnlocked ? '#FBBF24' : '#94A3B8'} fontSize="6.5" fontWeight="extrabold" letterSpacing="0.8">
            <textPath href={`#circlePath-${theme.id}`} startOffset="50%" textAnchor="middle">
              {theme.name.toUpperCase()} • STICKER
            </textPath>
          </text>
          
          {/* Central Emoji Accent */}
          <text x="50" y="55" fontSize="20" textAnchor="middle" dominantBaseline="middle">
            {theme.stickerEmoji}
          </text>
          
          {/* Shiny overlay reflection */}
          <path d="M 22 22 Q 50 12 78 22 Q 50 32 22 22 Z" fill="#FFF" opacity="0.15" />
        </svg>

        {/* Lock/Unlock Badge */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow-sm border ${
          isUnlocked ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-stone-200 border-stone-300 text-stone-500'
        }`}>
          {isUnlocked ? '👑' : '🔒'}
        </div>
      </div>

      <span className={`text-[9.5px] font-black mt-1.5 leading-none ${isUnlocked ? 'text-amber-900 font-extrabold' : 'text-stone-500'}`}>
        {theme.name}
      </span>
      
      <span className="text-[7.5px] font-mono text-stone-400 mt-1 uppercase leading-none font-bold">
        {reviewsCount}/15
      </span>
    </button>
  );
};

export default function ProfileTab({
  trips,
  user,
  onSave,
  onLogout,
  onDeleteProfile
}: ProfileTabProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password || 'coffee2026');
  const [specialty] = useState(user.specialty);
  const [seedingMood] = useState(user.seedingMood);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Controls if email, password, and profile photo editors are expanded
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);

  // Custom interactive permission states
  const [photoPermissionGranted, setPhotoPermissionGranted] = useState(() => {
    return localStorage.getItem('nomo_photo_perm_v1') === 'granted';
  });
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(() => {
    return localStorage.getItem('nomo_camera_perm_v1') === 'granted';
  });
  
  // Dialog prompt overlays for in-app permission safety guidance
  const [activePermissionPrompt, setActivePermissionPrompt] = useState<'none' | 'photos' | 'camera'>('none');
  
  // Real camera capture states
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Interactive simulated review count state (merged with database)
  const [simulatedReviews, setSimulatedReviews] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('nomo_simulated_reviews_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      tokyo: 0,
      seoul: 0,
      beijing: 0,
      jakarta: 0,
      london: 0,
      paris: 0
    };
  });

  // Keep state saved to storage
  useEffect(() => {
    localStorage.setItem('nomo_simulated_reviews_v1', JSON.stringify(simulatedReviews));
  }, [simulatedReviews]);

  // Selected sticker detail preview state
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Helper to count actual database reviewed spots for a city
  const getActualReviewsCount = (cityName: string): number => {
    if (!trips) return 0;
    let count = 0;
    trips.forEach(trip => {
      const isMatch = trip.destination?.toLowerCase().includes(cityName.toLowerCase()) || 
                      trip.name?.toLowerCase().includes(cityName.toLowerCase());
      if (isMatch && trip.itinerary) {
        trip.itinerary.forEach(item => {
          if (item.visited) count++;
        });
      }
    });
    return count;
  };

  // Helper to get combined total reviewed spots for a city
  const getCombinedReviewsCount = (cityId: string, cityName: string): number => {
    const actual = getActualReviewsCount(cityName);
    const simulated = simulatedReviews[cityId] || 0;
    return Math.min(100, actual + simulated);
  };
  
  // Danger zone confirms
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Guarantee proper camera track closing when standard actions happen
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Your traveler name cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please supply a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('To protect your memoirs, password must be 6+ characters.');
      return;
    }

    setError('');
    setSuccess('✨ Profile successfully updated!');
    
    onSave({
      name: name.trim(),
      email: email.trim(),
      specialty,
      seedingMood,
      password: password,
      profilePicture: profilePicture
    });

    setTimeout(() => {
      setSuccess('');
      setIsEditingCredentials(false);
    }, 1500);
  };

  // Trigger library file selection after permission verification
  const handlePhotoUploadClick = () => {
    if (!photoPermissionGranted) {
      setActivePermissionPrompt('photos');
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleGrantPhotosPermission = () => {
    localStorage.setItem('nomo_photo_perm_v1', 'granted');
    setPhotoPermissionGranted(true);
    setActivePermissionPrompt('none');
    
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  // Read upload image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image type.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfilePicture(event.target.result as string);
        setSuccess('⚡ Picture selected successfully!');
        setTimeout(() => setSuccess(''), 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Device camera trigger
  const handleCameraCaptureClick = () => {
    if (!cameraPermissionGranted) {
      setActivePermissionPrompt('camera');
    } else {
      startCameraStream();
    }
  };

  const startCameraStream = async () => {
    setIsCapturing(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log('Video play error:', err));
      }
    } catch (err) {
      console.warn('Camera stream connection failed:', err);
      setError('Failed to load camera stream. Please check permissions or device configuration.');
      setIsCapturing(false);
    }
  };

  const handleGrantCameraPermission = () => {
    localStorage.setItem('nomo_camera_perm_v1', 'granted');
    setCameraPermissionGranted(true);
    setActivePermissionPrompt('none');
    startCameraStream();
  };

  // Freeze high-contrast viewport snapshots on canvas
  const handleCaptureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 300, 300);
        const base64Str = canvas.toDataURL('image/jpeg');
        setProfilePicture(base64Str);
        setSuccess('⚡ Live snapshot captured successfully!');
        stopCamera();
        setTimeout(() => setSuccess(''), 2500);
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCapturing(false);
  };

  return (
    <div className="space-y-5 p-4 pb-20 overflow-y-auto h-full select-none bg-[#FAF9F7] text-left">
      
      {/* Tape decoration banner */}
      <div className="bg-gradient-to-r from-[#C8B8AB]/20 to-transparent p-4 rounded-3xl border border-[#F1EFE9] flex items-center justify-between relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <span className="text-[7.5px] font-mono uppercase bg-[#5A5A40]/15 text-[#5A5A40] px-1.5 py-0.5 rounded font-black tracking-widest">
            📂 traveler profile
          </span>
          <h2 className="font-serif italic text-base font-black text-[#3C3836]">
            Traveler Passport
          </h2>
          <p className="text-[9px] text-[#8C857E] font-mono uppercase">
            EST. JULY 2026 • GUILT-FREE NOMAD JOURNEYS
          </p>
        </div>
        <Settings className="w-5 h-5 text-stone-400 opacity-60 animate-spin-slow" />
      </div>

      {/* 💳 PASSPORT ID CARD VIEW */}
      <div className="bg-white rounded-3xl p-5 border border-[#F1EFE9] shadow-xs relative overflow-hidden space-y-4">

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {/* Avatar preview frame */}
          <div className="relative shrink-0 w-24 h-24 rounded-full border-4 border-[#FAF9F7] shadow-sm overflow-hidden bg-[#EAE0D8] flex items-center justify-center">
            <img 
              src={profilePicture} 
              alt="Avatar preview" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-3xl font-black font-serif opacity-35 absolute pointer-events-none uppercase">
              {name[0] || 'N'}
            </span>
          </div>

          <div className="space-y-2 flex-1 w-full">
            <div>
              <span className="text-[7px] font-mono text-stone-400 uppercase tracking-widest font-black block">
                Full Name
              </span>
              <h3 className="font-serif italic text-lg font-black text-[#3C3836]">
                {name}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#FAF9F7] p-2 rounded-xl border border-[#F1EFE9]">
                <span className="text-[6.5px] font-mono text-stone-400 uppercase tracking-wider block font-black">
                  🎒 Persona Specialty
                </span>
                <span className="text-[10px] text-[#5A5A40] font-sans font-extrabold truncate block">
                  {specialty}
                </span>
              </div>
              
              <div className="bg-[#FAF9F7] p-2 rounded-xl border border-[#F1EFE9]">
                <span className="text-[6.5px] font-mono text-stone-400 uppercase tracking-wider block font-black">
                  🌱 Seeding Mood
                </span>
                <span className="text-[10px] text-[#5A5A40] font-sans font-extrabold truncate block">
                  {seedingMood}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎖️ GAMIFIED STICKER ACHIEVEMENTS (Always prominent on profile page!) */}
      <div className="space-y-3 bg-[#FAF9F7] p-4.5 rounded-3xl border border-[#F1EFE9] shadow-2xs">
        <div className="flex justify-between items-center text-left">
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] font-black">
              🎖️ Sticker Medal Achievements
            </h4>
            <p className="text-[8.5px] font-mono text-[#A8A29E] uppercase leading-none mt-1">
              Check in or rate 15 places in a city to unlock gold shields!
            </p>
          </div>
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
        </div>

        {/* Medal Grid */}
        <div className="grid grid-cols-3 gap-2">
          {CITY_THEMES.map(theme => {
            const totalCount = getCombinedReviewsCount(theme.id, theme.name);
            const isUnlocked = totalCount >= 15;
            return (
              <StickerMedal 
                key={theme.id}
                theme={theme}
                isUnlocked={isUnlocked}
                reviewsCount={totalCount}
                onClick={() => {
                  setSelectedStickerId(selectedStickerId === theme.id ? null : theme.id);
                }}
              />
            );
          })}
        </div>

        {/* Selected Sticker Detail & Simulation Interactive Card */}
        {selectedStickerId && (() => {
          const theme = CITY_THEMES.find(t => t.id === selectedStickerId)!;
          const actualCount = getActualReviewsCount(theme.name);
          const simulatedCount = simulatedReviews[theme.id] || 0;
          const totalCount = getCombinedReviewsCount(theme.id, theme.name);
          const isUnlocked = totalCount >= 15;
          
          return (
            <div className="p-3 bg-white rounded-2xl border border-stone-200/75 text-left space-y-3 animate-fade-in relative overflow-hidden shadow-xs">
              {/* Landmark background design representation */}
              <div className="absolute right-2 bottom-1 w-1/4 h-12 opacity-15 pointer-events-none">
                {theme.illustration}
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[7.5px] font-mono uppercase bg-[#5A5A40]/10 text-[#5A5A40] px-1.5 py-0.5 rounded font-black">
                    {theme.stickerName}
                  </span>
                  <h5 className="font-serif italic font-bold text-xs text-[#3C3836] mt-1 flex items-center gap-1">
                    <span>{theme.name} Sticker</span>
                    <span>{isUnlocked ? '👑 Unlocked' : '🔒 Locked'}</span>
                  </h5>
                </div>
                <span className="text-[8px] font-mono font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                  {totalCount >= 15 ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono text-stone-500 font-bold uppercase leading-none">
                  <span>Progress toward sticker</span>
                  <span>{totalCount} / 15 spots</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200/40">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${isUnlocked ? 'bg-amber-500' : 'bg-[#5A5A40]'}`}
                    style={{ width: `${Math.min(100, (totalCount / 15) * 100)}%` }}
                  />
                </div>
                <p className="text-[7.5px] font-mono text-[#8C857E] leading-normal uppercase font-bold">
                  🧬 {actualCount} actual database spots • {simulatedCount} simulated check-ins
                </p>
              </div>

              {/* Simulator interactive tools */}
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedReviews(prev => {
                      const val = prev[theme.id] || 0;
                      return { ...prev, [theme.id]: val + 1 };
                    });
                    try {
                      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = audioCtx.createOscillator();
                      const gain = audioCtx.createGain();
                      osc.connect(gain);
                      gain.connect(audioCtx.destination);
                      osc.frequency.setValueAtTime(isUnlocked ? 880 : 440, audioCtx.currentTime);
                      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                      osc.start();
                      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                      osc.stop(audioCtx.currentTime + 0.3);
                    } catch (e) {}
                  }}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-[#3C3836] text-[8px] font-mono uppercase font-black rounded-lg transition-all cursor-pointer"
                >
                  +1 Review Check-In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSimulatedReviews(prev => {
                      const currentVal = prev[theme.id] || 0;
                      const newVal = currentVal >= 15 ? 0 : 15;
                      return { ...prev, [theme.id]: newVal };
                    });
                    try {
                      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = audioCtx.createOscillator();
                      const gain = audioCtx.createGain();
                      osc.connect(gain);
                      gain.connect(audioCtx.destination);
                      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
                      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
                      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                      osc.start();
                      osc.stop(audioCtx.currentTime + 0.4);
                    } catch (e) {}
                  }}
                  className={`px-2.5 py-1 text-[8px] font-mono uppercase font-black rounded-lg transition-all cursor-pointer ${
                    isUnlocked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {isUnlocked ? 'Lock Sticker' : 'Instantly Unlock!'}
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ⚙️ COLLAPSIBLE MANAGE ACCOUNT CREDENTIALS & PICTURES */}
      <div className="bg-white rounded-3xl border border-[#F1EFE9] overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setIsEditingCredentials(!isEditingCredentials)}
          className="w-full p-4.5 flex justify-between items-center hover:bg-stone-50 transition-all text-left cursor-pointer font-sans"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40]">
              <Settings className="w-3.5 h-3.5" />
            </span>
            <div>
              <h4 className="font-serif italic font-bold text-xs text-[#3C3836]">
                Manage Credentials & Profile Picture
              </h4>
              <p className="text-[8px] font-mono text-[#8C857E] uppercase mt-0.5">
                {isEditingCredentials ? 'Hide credentials panel' : 'Modify email, password, and avatar identity'}
              </p>
            </div>
          </div>
          {isEditingCredentials ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {isEditingCredentials && (
          <div className="p-4.5 border-t border-[#F1EFE9] space-y-4 animate-slide-down bg-[#FAF9F7]/40">
            {/* Status indicators */}
            {error && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-100">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-green-50 text-green-700 text-xs rounded-xl flex items-center gap-2 border border-green-100">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            {/* Visual/Audio Permission prompts */}
            {activePermissionPrompt !== 'none' && (
              <div className="p-3 bg-white border border-[#E7E5E4] rounded-2xl text-left space-y-2.5">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[10px] font-serif italic font-bold text-[#3C3836]">
                      {activePermissionPrompt === 'photos' ? 'Enable Photo Library Access' : 'Enable Device Camera Access'}
                    </h5>
                    <p className="text-[8px] font-mono text-stone-500 leading-normal uppercase">
                      Enable camera access to take a profile picture for your traveler passport.
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setActivePermissionPrompt('none')}
                    className="px-2 py-0.5 bg-white border border-stone-200 text-stone-600 text-[8px] uppercase font-mono font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={activePermissionPrompt === 'photos' ? handleGrantPhotosPermission : handleGrantCameraPermission}
                    className="px-2 py-0.5 bg-[#5A5A40] text-white text-[8px] uppercase font-mono font-bold rounded shadow-3xs"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            )}

            {/* Hidden inputs */}
            <input 
              type="file"
              ref={fileInputRef}
              id="profile-upload-file-input"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile image uploading/snapshotting */}
              <div className="space-y-1.5 text-left">
                <label className="text-[8px] font-mono uppercase tracking-wider text-[#8C857E] font-black block">
                  Update Avatar Identity
                </label>
                
                <div className="flex flex-col gap-2.5 bg-white p-3 rounded-xl border border-[#F1EFE9]">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handlePhotoUploadClick}
                      className="flex-1 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-[#3C3836] text-[8px] font-mono uppercase font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-stone-500" />
                      <span>Upload Library Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCameraCaptureClick}
                      className="flex-1 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-[#3C3836] text-[8px] font-mono uppercase font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-stone-500" />
                      <span>Take snapshot</span>
                    </button>
                  </div>

                  {/* Camera stage */}
                  {isCapturing && (
                    <div className="text-center p-2 bg-stone-900 rounded-xl overflow-hidden relative border border-stone-800 flex flex-col items-center">
                      <div className="absolute top-1.5 left-2 rounded bg-red-600 px-1.5 py-0.5 text-[6px] font-mono font-bold text-white uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                        <span>Live Lens</span>
                      </div>
                      <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-40 h-40 rounded-lg object-cover bg-stone-950 border border-stone-800"
                      />
                      <div className="flex gap-1 mt-2">
                        <button
                          type="button"
                          onClick={handleCaptureSnapshot}
                          className="px-2 py-1 bg-white text-stone-900 hover:bg-stone-100 text-[8px] uppercase font-mono font-bold rounded flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3 text-stone-900" />
                          <span>Snap</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-2 py-1 bg-red-600 text-white hover:bg-red-700 text-[8px] uppercase font-mono font-bold rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1 text-left">
                <label className="text-[8px] font-mono uppercase tracking-wider text-[#8C857E] font-black block">
                  Traveler Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter traveler name"
                    className="w-full p-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836] font-sans font-bold"
                  />
                  <User className="absolute right-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1 text-left">
                <label className="text-[8px] font-mono uppercase tracking-wider text-[#8C857E] font-black block">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nomad@wanderer.com"
                    className="w-full p-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836] font-sans font-bold"
                  />
                  <Mail className="absolute right-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1 text-left">
                <label className="text-[8px] font-mono uppercase tracking-wider text-[#8C857E] font-black block">
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836] font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Save credentials trigger */}
              <button
                type="submit"
                className="w-full py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[9px] uppercase font-mono font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save credentials</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ⚠️ SYSTEM DESTRUCTION & SIGN OUT */}
      <div className="bg-[#FEF2F2] p-4.5 rounded-3xl border border-red-100 flex flex-col gap-3">
        <div className="text-left">
          <h4 className="font-serif italic font-bold text-xs text-red-950 flex items-center gap-1">
            <span>Danger Zone Area</span>
            <span>⚠️</span>
          </h4>
          <p className="text-[8.5px] font-mono text-red-700 leading-normal uppercase">
            Sign out of your active terminal sessions or wipe your memory logs completely.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Sign Out Trigger */}
          <div className="flex-1">
            {confirmLogout ? (
              <div className="flex gap-1 animate-fade-in">
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 py-1.5 bg-red-600 text-white text-[8px] uppercase font-mono font-bold rounded-lg hover:bg-red-700"
                >
                  Yes, Sign Out
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLogout(false)}
                  className="px-2.5 py-1.5 bg-stone-100 text-stone-600 text-[8px] uppercase font-mono font-bold rounded-lg border border-stone-200"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                className="w-full py-1.5 bg-white border border-red-200 text-red-700 text-[8px] uppercase font-mono font-black rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3 text-red-600" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Delete Memoirs Trigger */}
          <div className="flex-1">
            {confirmDelete ? (
              <div className="flex gap-1 animate-fade-in">
                <button
                  type="button"
                  onClick={onDeleteProfile}
                  className="flex-1 py-1.5 bg-red-700 text-white text-[8px] uppercase font-mono font-bold rounded-lg hover:bg-red-800"
                >
                  Delete Everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1.5 bg-stone-100 text-stone-600 text-[8px] uppercase font-mono font-bold rounded-lg border border-stone-200"
                >
                  Abort
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-1.5 bg-red-50 text-red-700 text-[8px] uppercase font-mono font-black rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-red-700" />
                <span>Delete Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
