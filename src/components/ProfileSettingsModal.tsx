import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
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
  Video, 
  ShieldAlert,
  CheckCircle,
  FolderOpen
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  onSave,
  onLogout,
  onDeleteProfile
}: ProfileSettingsModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password || 'coffee2026');
  const [specialty] = useState(user.specialty); // Internal state to preserve prop format
  const [seedingMood] = useState(user.seedingMood);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

  if (!isOpen) return null;

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
    setSuccess('✨ Profile saved successfully!');
    
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
      onClose();
    }, 1000);
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
    
    // Auto-trigger selection after letting permission pass
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
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfilePicture(reader.result);
        setSuccess('📸 Photo uploaded and synced successfully!');
        setTimeout(() => setSuccess(''), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger camera view and request device camera permissions live 
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
    
    // Open stream sequence
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
        // Draw centered square frame from camera
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center animate-fade-in" id="profile-modal-overlay">
      <div className="bg-white rounded-t-[32px] w-full max-w-[420px] p-6 border-t-2 border-[#5A5A40]/10 shadow-2xl relative max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        
        {/* Modal Tape Decor */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#DDD0C5]/40 border-b border-[#C8B8AB]/50 flex items-center justify-center font-mono text-[8px] text-[#5A5A40] font-bold uppercase tracking-widest pointer-events-none">
          🏷️ Account Settings
        </div>

        {/* Modal Header */}
        <div className="flex justify-between items-center mt-4 pb-3 border-b border-[#F1EFE9] shrink-0">
          <div>
            <h3 className="font-serif italic text-lg font-bold text-[#3C3836]">Profile Settings</h3>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] mt-0.5">Customize your travel identity</p>
          </div>
          <button 
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 hover:bg-stone-100 rounded-full transition-all text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status messages */}
        {error && (
          <div className="my-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-100 shrink-0">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="my-3 p-2.5 bg-green-50 text-green-700 text-xs rounded-xl flex items-center gap-2 border border-green-100 shrink-0">
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 animate-bounce" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* DYNAMIC PERMISSION PROMPTS (Aesthetic overlays) */}
        {activePermissionPrompt !== 'none' && (
          <div className="my-3 p-4 bg-[#FAF9F6] border border-[#E7E5E4] rounded-2xl animate-fade-in text-left space-y-3 shrink-0">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-serif italic font-bold text-[#3C3836]">
                  {activePermissionPrompt === 'photos' ? 'Enable photo library access' : 'Enable device camera access'}
                </h5>
                <p className="text-[9.5px] font-mono text-stone-500 leading-normal uppercase mt-0.5">
                  {activePermissionPrompt === 'photos' 
                    ? 'Nomo needs you to permit access to your photos and videos library in order to extract custom pictures for your traveler trace card.'
                    : 'Nomo needs you to permit access to your user Web API camera feed to capture live snapshots for your traveler trace card.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setActivePermissionPrompt('none')}
                className="px-3 py-1 bg-white border border-stone-200 text-stone-600 text-[9px] uppercase font-mono font-bold rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={activePermissionPrompt === 'photos' ? handleGrantPhotosPermission : handleGrantCameraPermission}
                className="px-3 py-1 bg-[#5A5A40] text-white text-[9px] uppercase font-mono font-bold rounded-lg hover:bg-[#4a4a34] flex items-center gap-1 shadow-3xs"
              >
                <span>Authorize & Proceed</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input Picker */}
        <input 
          type="file"
          ref={fileInputRef}
          id="profile-upload-file-input"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Main interactive form */}
        <form onSubmit={handleSubmit} className="space-y-4 py-3 flex-1">
          
          {/* Revamped Avatar module */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] block font-bold">
              Profile Picture Identity
            </label>
            
            <div className="flex flex-col gap-3 bg-[#FAF9F7] p-4.5 rounded-2xl border border-[#F1EFE9]">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0 w-20 h-20 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#EAE0D8] flex items-center justify-center">
                  <img 
                    src={profilePicture} 
                    alt="Avatar preview" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[24px] font-black font-serif opacity-40 absolute pointer-events-none uppercase">
                    {name[0] || 'N'}
                  </span>
                </div>
                <div className="text-left space-y-1">
                  <h4 className="font-serif italic font-bold text-xs text-[#3C3836]">Personal Identity</h4>
                  <p className="text-[8px] font-mono text-stone-400 uppercase leading-relaxed">
                    Upload your profile picture or capture a photo instantly.
                  </p>
                </div>
              </div>

              {/* CAMERA WORKPLACE STAGE PORT */}
              {isCapturing ? (
                <div className="mt-2 text-center p-2 bg-stone-900 rounded-xl overflow-hidden relative border border-stone-800 animate-fade-in flex flex-col items-center">
                  <div className="absolute top-1.5 left-2 rounded bg-red-600 px-1 py-0.5 text-[7px] font-mono font-bold text-white uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    <span>Live Lens</span>
                  </div>
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-48 h-48 rounded-lg object-cover bg-stone-950 border border-stone-800"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="px-3 py-1 bg-white text-stone-900 hover:bg-stone-100 text-[9px] uppercase font-mono font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-stone-900" />
                      <span>Take Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[9px] uppercase font-mono font-bold rounded-lg active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handlePhotoUploadClick}
                    className="py-2 px-3 bg-white hover:bg-stone-50 border border-[#E7E5E4] rounded-xl text-stone-700 text-[10px] uppercase font-mono font-bold transition-all flex items-center justify-center gap-1.5 hover:border-[#5A5A40]/40 active:scale-95"
                    title="Upload picture from library folders"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-stone-500" />
                    <span>Upload Picture</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraCaptureClick}
                    className="py-2 px-3 bg-white hover:bg-stone-50 border border-[#E7E5E4] rounded-xl text-stone-700 text-[10px] uppercase font-mono font-bold transition-all flex items-center justify-center gap-1.5 hover:border-[#5A5A40]/40 active:scale-95"
                    title="Access device camera for custom avatar snapshot"
                  >
                    <Camera className="w-3.5 h-3.5 text-stone-500" />
                    <span>Take Picture</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Fields */}
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] block font-bold">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A29E]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-[#3C3836]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] block font-bold">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A29E]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-[#3C3836]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8C857E] block font-bold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A29E]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl pl-9 pr-9 py-2 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-[#3C3836]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-[#5A5A40] text-stone-400 font-bold"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Save className="w-3 h-3" />
              <span>Apply Changes</span>
            </button>
          </div>
        </form>

        {/* DANGER DESTRUCTIVE ZONE */}
        <div className="mt-4 pt-4 border-t border-[#F1EFE9] bg-[#FAF8F5] p-3 rounded-2xl border border-dashed text-left space-y-2.5 shrink-0 select-none">
          <h4 className="text-[10px] uppercase font-mono font-bold text-stone-500 tracking-wider">🔒 Safeguard & Session Options</h4>
          
          {/* Logout sequence */}
          <div className="space-y-1">
            {!confirmLogout ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmLogout(true);
                  setConfirmDelete(false);
                }}
                className="w-full py-2 bg-stone-200/60 hover:bg-stone-200 text-stone-700 text-[10.5px] uppercase font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Nomo</span>
              </button>
            ) : (
              <div className="p-2 bg-stone-200/40 rounded-xl space-y-2 text-center animate-fade-in">
                <p className="text-[10px] font-mono text-stone-600 font-bold">Are you ready to sign off this session?</p>
                <div className="flex gap-1.5 justify-center">
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(false)}
                    className="px-2 py-1 bg-stone-100 text-[#3C3836] text-[9px] font-bold rounded"
                  >
                    Keep Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmLogout(false);
                      stopCamera();
                      onLogout();
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold uppercase rounded flex items-center gap-0.5"
                  >
                    <span>Yes, Sign off</span>
                    <LogOut className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete profile sequence */}
          <div className="space-y-1">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setConfirmLogout(false);
                }}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[10.5px] uppercase font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete traveler account</span>
              </button>
            ) : (
              <div className="p-2 bg-red-100/50 rounded-xl space-y-2 text-center animate-fade-in border border-red-200">
                <p className="text-[10px] font-mono text-red-700 font-bold leading-tight">⚠️ CRITICAL: Instantly wipes all your customized traveler traces, diary journals, and saved trips. Irreversible!</p>
                <div className="flex gap-1.5 justify-center">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 bg-white text-stone-600 text-[9px] font-bold rounded border border-stone-200"
                  >
                    Keep Journal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      stopCamera();
                      onDeleteProfile();
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase rounded flex items-center gap-0.5"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Nuke completely</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
