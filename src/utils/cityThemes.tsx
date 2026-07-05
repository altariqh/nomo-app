import React from 'react';

export interface CityTheme {
  id: string;
  name: string;
  country: string;
  bgColor: string;         // Outer page/tab wrapper background
  cardBg: string;           // Inner card background
  textColor: string;        // Primary text
  accentBg: string;         // Button/badge background
  accentText: string;       // Button/badge text
  borderColor: string;      // Card borders
  gradientFrom: string;     // For gradient banners
  gradientTo: string;       // For gradient banners
  landmarkName: string;
  illustration: React.ReactNode;
  stickerName: string;      // Gamification sticker name
  stickerEmoji: string;
}

// 1. Seoul theme
const SeoulIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft sky gradient or background */}
    <rect width="200" height="120" rx="16" fill="#F5F3FF" />
    <circle cx="160" cy="35" r="18" fill="#FFFBEB" opacity="0.8" />
    
    {/* Mountain outline */}
    <path d="M10 120 L50 60 L90 120 Z" fill="#DDD6FE" opacity="0.7" />
    <path d="M60 120 L110 40 L160 120 Z" fill="#C4B5FD" opacity="0.5" />
    
    {/* Namsan Tower */}
    <rect x="106" y="10" width="4" height="40" fill="#7C3AED" rx="1" />
    <circle cx="108" cy="22" r="6" fill="#8B5CF6" />
    <circle cx="108" cy="22" r="3" fill="#FFF" />
    <path d="M100 50 L116 50 L112 120 L104 120 Z" fill="#6D28D9" />
    
    {/* Lotte Tower (modern sleek spire) */}
    <path d="M155 120 L165 20 L171 20 L181 120 Z" fill="#A78BFA" />
    <path d="M165 20 L168 120" stroke="#FFF" strokeWidth="0.5" strokeDasharray="2 2" />
    
    {/* Gyeongbokgung-style Gate */}
    <rect x="20" y="85" width="60" height="35" fill="#4C1D95" rx="2" />
    <rect x="26" y="95" width="12" height="25" fill="#1E1B4B" rx="6" />
    <rect x="62" y="95" width="12" height="25" fill="#1E1B4B" rx="6" />
    {/* Roof */}
    <path d="M15 88 L25 78 L75 78 L85 88 Z" fill="#1E1B4B" />
    <path d="M12 90 Q40 82 88 90 L85 88 Q40 80 15 88" fill="#8B5CF6" />
    
    {/* Cherry blossoms */}
    <circle cx="30" cy="50" r="4" fill="#F472B6" />
    <circle cx="27" cy="55" r="3" fill="#F472B6" />
    <circle cx="34" cy="54" r="2.5" fill="#F472B6" />
    <circle cx="175" cy="65" r="4.5" fill="#F472B6" opacity="0.6" />
    <circle cx="180" cy="71" r="3" fill="#F472B6" opacity="0.6" />
  </svg>
);

// 2. Beijing theme
const BeijingIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="120" rx="16" fill="#FEF2F2" />
    {/* Big warm sun */}
    <circle cx="40" cy="35" r="22" fill="#FDE047" opacity="0.4" />
    
    {/* Great Wall mountains */}
    <path d="M0 120 Q30 70 80 120" fill="#FECACA" opacity="0.7" />
    <path d="M60 120 Q110 55 160 120" fill="#FCA5A5" opacity="0.5" />
    {/* Great Wall battlement outline */}
    <path d="M0 98 L10 93 L10 96 L20 91 L20 94 L30 89 L30 92 L40 87 L40 95 Q60 90 80 115" stroke="#DC2626" strokeWidth="1.5" fill="none" />
    
    {/* Temple of Heaven (pagoda) */}
    {/* Base */}
    <rect x="110" y="105" width="60" height="15" fill="#EF4444" rx="1" />
    <rect x="115" y="93" width="50" height="12" fill="#DC2626" />
    {/* Pillar structure */}
    <rect x="122" y="70" width="36" height="23" fill="#B91C1C" />
    {/* First circular roof */}
    <path d="M110 73 Q140 60 170 73 L164 68 Q140 56 116 68 Z" fill="#1E3A8A" />
    {/* Middle tier */}
    <rect x="128" y="52" width="24" height="18" fill="#B91C1C" />
    {/* Second circular roof */}
    <path d="M120 54 Q140 44 160 54 L155 50 Q140 40 125 50 Z" fill="#1D4ED8" />
    {/* Top spire */}
    <path d="M135 34 L140 20 L145 34 Z" fill="#F59E0B" />
    
    {/* Traditional Red Lanterns */}
    <g transform="translate(15, 15)">
      <line x1="10" y1="0" x2="10" y2="10" stroke="#B91C1C" strokeWidth="1" />
      <ellipse cx="10" cy="16" rx="6" ry="7" fill="#EF4444" />
      <rect x="8" y="23" width="4" height="3" fill="#F59E0B" />
      <line x1="10" y1="26" x2="10" y2="30" stroke="#F59E0B" />
    </g>
    <g transform="translate(180, 25)">
      <line x1="10" y1="0" x2="10" y2="8" stroke="#B91C1C" strokeWidth="1" />
      <ellipse cx="10" cy="13" rx="5" ry="6" fill="#EF4444" />
      <rect x="8" y="19" width="4" height="2" fill="#F59E0B" />
    </g>
  </svg>
);

// 3. Jakarta theme
const JakartaIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="120" rx="16" fill="#ECFDF5" />
    
    {/* Distant Skyscrapers */}
    <rect x="15" y="40" width="16" height="80" fill="#A7F3D0" />
    <rect x="35" y="25" width="22" height="95" fill="#6EE7B7" opacity="0.6" />
    <rect x="42" y="55" width="14" height="65" fill="#34D399" opacity="0.5" />
    <rect x="145" y="35" width="20" height="85" fill="#6EE7B7" />
    <rect x="170" y="50" width="18" height="70" fill="#A7F3D0" />
    
    {/* Monas (National Monument) */}
    {/* Base cup block */}
    <path d="M85 120 L90 98 L110 98 L115 120 Z" fill="#D1FAE5" stroke="#047857" strokeWidth="1" />
    <rect x="94" y="98" width="12" height="4" fill="#047857" rx="0.5" />
    {/* Obelisk Spire */}
    <path d="M98 98 L99 30 L101 30 L102 98 Z" fill="#FFF" />
    <line x1="100" y1="98" x2="100" y2="30" stroke="#10B981" strokeWidth="0.5" />
    {/* Gold Flame cup */}
    <path d="M96 30 Q100 15 104 30 Q101 27 100 30 Z" fill="#F59E0B" />
    <path d="M98 29 Q100 20 102 29 Z" fill="#EF4444" />
    
    {/* Cute Blue Bajaj (3-wheeler auto rickshaw) */}
    <g transform="translate(115, 80)">
      {/* Body */}
      <rect x="5" y="10" width="28" height="18" fill="#0284C7" rx="3" />
      <rect x="2" y="14" width="6" height="12" fill="#0F172A" rx="1" />
      {/* Roof */}
      <path d="M4 10 Q18 6 32 10 L33 15 L5 15 Z" fill="#1E293B" />
      {/* Front glass */}
      <rect x="24" y="12" width="7" height="6" fill="#BAE6FD" />
      {/* Wheels */}
      <circle cx="10" cy="28" r="4.5" fill="#1E293B" />
      <circle cx="10" cy="28" r="1.5" fill="#94A3B8" />
      <circle cx="26" cy="28" r="4.5" fill="#1E293B" />
      <circle cx="26" cy="28" r="1.5" fill="#94A3B8" />
      {/* Headlight */}
      <circle cx="31" cy="20" r="2.5" fill="#FEF08A" />
    </g>
    
    {/* Tropical Palm leaves on borders */}
    <path d="M0 0 Q20 30 50 10 Q25 45 0 35" fill="#059669" opacity="0.3" />
    <path d="M200 0 Q180 30 150 10 Q175 45 200 35" fill="#059669" opacity="0.3" />
  </svg>
);

// 4. Tokyo theme
const TokyoIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="120" rx="16" fill="#FFF5F5" />
    
    {/* Red Rising Sun */}
    <circle cx="100" cy="60" r="35" fill="#FCA5A5" opacity="0.35" />
    
    {/* Mt Fuji */}
    <path d="M40 120 L85 45 L115 45 L160 120 Z" fill="#93C5FD" />
    {/* Mt Fuji Snow Cap */}
    <path d="M76 60 L85 45 L115 45 L124 60 Q112 55 108 62 Q100 53 92 61 Q84 54 76 60" fill="#FFF" />
    
    {/* Tokyo Tower (red steel lattice) */}
    <path d="M25 120 L31 25 L34 25 L40 120 Z" fill="#EF4444" />
    <rect x="29" y="55" width="7" height="4" fill="#FFF" />
    <rect x="30" y="85" width="5" height="4" fill="#FFF" />
    <line x1="32.5" y1="25" x2="32.5" y2="12" stroke="#EF4444" strokeWidth="1" />
    <circle cx="32.5" cy="12" r="1.5" fill="#EF4444" />
    
    {/* Tokyo Skytree (sleek silver tower far right) */}
    <path d="M165 120 L170 15 L172 15 L177 120 Z" fill="#94A3B8" opacity="0.8" />
    <circle cx="171" cy="42" r="4.5" fill="#64748B" opacity="0.9" />
    <circle cx="171" cy="42" r="2" fill="#FFF" />
    <line x1="171" y1="15" x2="171" y2="5" stroke="#64748B" strokeWidth="0.5" />
    
    {/* Traditional Torii Gate */}
    <g transform="translate(115, 85)">
      {/* Pillars */}
      <rect x="5" y="5" width="3" height="30" fill="#EF4444" />
      <rect x="22" y="5" width="3" height="30" fill="#EF4444" />
      {/* Top lintel */}
      <rect x="0" y="0" width="30" height="4" fill="#EF4444" rx="1" />
      <rect x="-2" y="-3" width="34" height="3" fill="#1E293B" rx="1" />
      {/* Middle tie-beam */}
      <rect x="3" y="8" width="24" height="2.5" fill="#EF4455" />
    </g>
    
    {/* Cherry blossom branch */}
    <path d="M0 15 Q25 25 50 12" stroke="#78350F" strokeWidth="1.5" fill="none" opacity="0.6" />
    <circle cx="20" cy="21" r="3.5" fill="#F472B6" />
    <circle cx="32" cy="22" r="4" fill="#F472B6" />
    <circle cx="42" cy="15" r="3" fill="#F472B6" />
  </svg>
);

// 5. London theme
const LondonIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="120" rx="16" fill="#F0FDF4" opacity="0.9" />
    
    {/* Rainy/misty clouds */}
    <circle cx="30" cy="20" r="15" fill="#E2E8F0" />
    <circle cx="50" cy="18" r="12" fill="#CBD5E1" opacity="0.6" />
    <circle cx="170" cy="25" r="16" fill="#E2E8F0" />
    
    {/* Thames river at bottom */}
    <rect x="0" y="110" width="200" height="10" fill="#93C5FD" opacity="0.6" />
    
    {/* Tower Bridge (outline in center-right) */}
    <g transform="translate(100, 65)" opacity="0.7">
      <rect x="10" y="10" width="12" height="35" fill="#475569" />
      <rect x="45" y="10" width="12" height="35" fill="#475569" />
      {/* Spans */}
      <path d="M0 32 Q25 15 50 32" stroke="#64748B" strokeWidth="2" fill="none" />
      <path d="M22 32 L45 32" stroke="#3B82F6" strokeWidth="3" />
      {/* Suspension chains */}
      <path d="M10 10 L0 32" stroke="#475569" strokeWidth="1" />
      <path d="M57 10 L67 32" stroke="#475569" strokeWidth="1" />
    </g>
    
    {/* Big Ben (Elizabeth Tower) */}
    <rect x="25" y="25" width="15" height="85" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
    {/* Clock face */}
    <circle cx="32.5" cy="40" r="4.5" fill="#FEF08A" stroke="#1E293B" strokeWidth="0.75" />
    <line x1="32.5" y1="40" x2="32.5" y2="37" stroke="#1E293B" strokeWidth="0.75" />
    {/* Roof and spire */}
    <path d="M23 26 L32.5" y1="5" x2="42" y2="26" stroke="#475569" strokeWidth="1" />
    <path d="M23 26 L32.5" y1="12" x2="42" y2="26" fill="#1E293B" />
    <line x1="32.5" y1="15" x2="32.5" y2="5" stroke="#1E293B" strokeWidth="1.2" />
    
    {/* London Eye (Ferris Wheel outline) */}
    <circle cx="155" cy="65" r="28" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="155" cy="65" r="3" fill="#64748B" />
    {/* Wheel Spokes */}
    <line x1="155" y1="65" x2="155" y2="37" stroke="#94A3B8" strokeWidth="0.5" />
    <line x1="155" y1="65" x2="183" y2="65" stroke="#94A3B8" strokeWidth="0.5" />
    <line x1="155" y1="65" x2="127" y2="65" stroke="#94A3B8" strokeWidth="0.5" />
    <line x1="155" y1="65" x2="155" y2="93" stroke="#94A3B8" strokeWidth="0.5" />
    <line x1="155" y1="65" x2="175" y2="45" stroke="#94A3B8" strokeWidth="0.5" />
    <line x1="155" y1="65" x2="135" y2="85" stroke="#94A3B8" strokeWidth="0.5" />
    <line x1="155" y1="65" x2="135" y2="45" stroke="#94A3B8" strokeWidth="0.5" />
    <line x1="155" y1="65" x2="175" y2="85" stroke="#94A3B8" strokeWidth="0.5" />
    
    {/* Cute Red Telephone Booth */}
    <g transform="translate(65, 75)">
      <rect x="0" y="0" width="12" height="35" fill="#EF4444" rx="1.5" />
      <rect x="2" y="3" width="8" height="5" fill="#FFF" opacity="0.9" />
      <rect x="2" y="10" width="2.5" height="6" fill="#FFF" opacity="0.9" />
      <rect x="6.5" y="10" width="2.5" height="6" fill="#FFF" opacity="0.9" />
      <rect x="2" y="18" width="2.5" height="6" fill="#FFF" opacity="0.9" />
      <rect x="6.5" y="18" width="2.5" height="6" fill="#FFF" opacity="0.9" />
      {/* Crown logo / header text placeholder */}
      <rect x="3" y="1.5" width="6" height="1" fill="#FFF" />
    </g>
  </svg>
);

// 6. Paris theme
const ParisIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="120" rx="16" fill="#FAF8F5" />
    
    {/* Pastel yellow sunset sun */}
    <circle cx="150" cy="50" r="30" fill="#FEF08A" opacity="0.4" />
    
    {/* Romantic clouds */}
    <circle cx="40" cy="30" r="12" fill="#E2E8F0" opacity="0.7" />
    <circle cx="160" cy="25" r="14" fill="#FCE7F3" opacity="0.6" />
    
    {/* Seine river bank tree */}
    <path d="M185 120 Q175 90 170 70" stroke="#78350F" strokeWidth="2.5" fill="none" />
    <circle cx="165" cy="60" r="16" fill="#FBCFE8" opacity="0.75" />
    <circle cx="178" cy="55" r="14" fill="#F9A8D4" opacity="0.6" />
    
    {/* Eiffel Tower */}
    {/* Base arch legs */}
    <path d="M70 120 Q90 90 110 120" stroke="#4A5568" strokeWidth="4.5" fill="none" />
    {/* Lower Platform */}
    <rect x="76" y="94" width="28" height="3.5" fill="#4A5568" rx="0.5" />
    {/* Middle tapered tower */}
    <path d="M81 94 L87 55 L93 55 L99 94 Z" fill="#4A5568" />
    {/* Middle Platform */}
    <rect x="85" y="52" width="10" height="3" fill="#2D3748" rx="0.5" />
    {/* Top Spire */}
    <path d="M88.5 52 L89 15 L91 15 L91.5 52 Z" fill="#2D3748" />
    <line x1="90" y1="15" x2="90" y2="6" stroke="#2D3748" strokeWidth="1" />
    {/* Light beam at top */}
    <polygon points="90,6 30,0 35,0" fill="#FEF08A" opacity="0.25" />
    <polygon points="90,6 150,0 155,0" fill="#FEF08A" opacity="0.25" />
    
    {/* Parisian Cafe Awning */}
    <g transform="translate(15, 80)">
      <rect x="0" y="10" width="30" height="20" fill="#E2E8F0" rx="1" />
      {/* Awning stripes */}
      <path d="M0 10 L5 20 L10 20 L5 10 Z" fill="#EC4899" />
      <path d="M10 10 L15 20 L20 20 L15 10 Z" fill="#EC4899" />
      <path d="M20 10 L25 20 L30 20 L25 10 Z" fill="#EC4899" />
      {/* Little table and chairs outline */}
      <circle cx="15" cy="36" r="3.5" fill="#2D3748" />
      <line x1="15" y1="36" x2="15" y2="40" stroke="#2D3748" strokeWidth="1" />
    </g>
  </svg>
);

// Fallback illustration for general cities
const GeneralIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="120" rx="16" fill="#FAF9F6" />
    <circle cx="100" cy="60" r="45" fill="#EAE0D8" opacity="0.25" />
    <path d="M20 120 Q55 50 90 120" fill="#DDD6FE" opacity="0.4" />
    <path d="M70 120 Q115 35 160 120" fill="#FDE047" opacity="0.3" />
    <path d="M130 120 Q160 70 190 120" fill="#C4B5FD" opacity="0.3" />
    {/* Compass decoration */}
    <circle cx="100" cy="50" r="16" stroke="#5A5A40" strokeWidth="1" strokeDasharray="2 2" />
    <polygon points="100,28 104,46 100,50" fill="#5A5A40" />
    <polygon points="100,72 96,54 100,50" fill="#8C857E" />
    <polygon points="78,50 96,46 100,50" fill="#5A5A40" />
    <polygon points="122,50 104,54 100,50" fill="#8C857E" />
  </svg>
);

// ----------------------------------------------------
// CITY STICKER COMPONENT RENDERING
// Render exact rounded stickers in CSS that resemble Apple Fitness badges!
// ----------------------------------------------------

export const CITY_THEMES: CityTheme[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    bgColor: 'bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E6]',
    cardBg: 'bg-white/90',
    textColor: 'text-rose-950',
    accentBg: 'bg-rose-600 hover:bg-rose-700',
    accentText: 'text-white',
    borderColor: 'border-rose-100',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-red-600',
    landmarkName: 'Mount Fuji & Tokyo Tower',
    illustration: <TokyoIllustration />,
    stickerName: 'Tokyo Wanderer Medal',
    stickerEmoji: '🌸'
  },
  {
    id: 'seoul',
    name: 'Seoul',
    country: 'South Korea',
    bgColor: 'bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF]',
    cardBg: 'bg-white/90',
    textColor: 'text-indigo-950',
    accentBg: 'bg-indigo-600 hover:bg-indigo-700',
    accentText: 'text-white',
    borderColor: 'border-indigo-100',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-violet-600',
    landmarkName: 'Namsan Tower & Gyeongbokgung',
    illustration: <SeoulIllustration />,
    stickerName: 'Seoul K-Explorer Shield',
    stickerEmoji: '✨'
  },
  {
    id: 'beijing',
    name: 'Beijing',
    country: 'China',
    bgColor: 'bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2]',
    cardBg: 'bg-white/90',
    textColor: 'text-red-950',
    accentBg: 'bg-red-600 hover:bg-red-700',
    accentText: 'text-white',
    borderColor: 'border-red-100',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-orange-600',
    landmarkName: 'Temple of Heaven Pagoda',
    illustration: <BeijingIllustration />,
    stickerName: 'Beijing Dynasties Badge',
    stickerEmoji: '🏮'
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    bgColor: 'bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5]',
    cardBg: 'bg-white/90',
    textColor: 'text-emerald-950',
    accentBg: 'bg-emerald-600 hover:bg-emerald-700',
    accentText: 'text-white',
    borderColor: 'border-emerald-100',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    landmarkName: 'Monas National Monument',
    illustration: <JakartaIllustration />,
    stickerName: 'Jakarta Batavia Medal',
    stickerEmoji: '🥥'
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    bgColor: 'bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]',
    cardBg: 'bg-white/90',
    textColor: 'text-emerald-950',
    accentBg: 'bg-[#5A5A40] hover:bg-[#4a4a34]',
    accentText: 'text-white',
    borderColor: 'border-stone-200',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-700',
    landmarkName: 'Big Ben & London Eye',
    illustration: <LondonIllustration />,
    stickerName: 'London Royal Sovereign',
    stickerEmoji: '☕'
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    bgColor: 'bg-gradient-to-br from-[#FAF8F5] to-[#F1EFE9]',
    cardBg: 'bg-white/90',
    textColor: 'text-stone-900',
    accentBg: 'bg-[#5A5A40] hover:bg-[#4a4a34]',
    accentText: 'text-white',
    borderColor: 'border-[#EAE0D8]',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-rose-500',
    landmarkName: 'Eiffel Tower Romantic Spire',
    illustration: <ParisIllustration />,
    stickerName: 'Paris Cafe Artist Pin',
    stickerEmoji: '🥐'
  }
];

// Resolves a destination string to its respective CityTheme or returns a fallback
export function getCityTheme(destinationName: string = ''): CityTheme {
  const normalized = destinationName.toLowerCase();
  
  const found = CITY_THEMES.find(theme => 
    normalized.includes(theme.name.toLowerCase()) || 
    normalized.includes(theme.country.toLowerCase())
  );
  
  if (found) return found;
  
  // Default general theme fallback
  return {
    id: 'general',
    name: 'Nomad',
    country: 'Global',
    bgColor: 'bg-[#FAF9F7]',
    cardBg: 'bg-white',
    textColor: 'text-stone-800',
    accentBg: 'bg-[#5A5A40] hover:bg-[#4a4a34]',
    accentText: 'text-white',
    borderColor: 'border-[#F1EFE9]',
    gradientFrom: 'from-stone-500',
    gradientTo: 'to-stone-700',
    landmarkName: 'Scrapbook Compass',
    illustration: <GeneralIllustration />,
    stickerName: 'Global Explorer Badge',
    stickerEmoji: '🗺️'
  };
}
