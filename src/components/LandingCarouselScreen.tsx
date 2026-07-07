import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Clock,
  Wallet,
  CheckCircle2
} from 'lucide-react';

interface LandingCarouselScreenProps {
  onGetStarted: (isSignIn: boolean) => void;
  onSkipToDemo: () => void;
}

export default function LandingCarouselScreen({ onGetStarted, onSkipToDemo }: LandingCarouselScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      emoji: '🗺️',
      tag: 'Plan Itinerary',
      color: 'from-amber-500/10 to-orange-500/5',
      title: '1. Plan the Perfect Itinerary',
      description: 'Instantly pre-populate your daily travel schedule with cozy local kissa cafes, quiet botanical gardens, and curated neighborhood guides.',
      icon: <Compass className="w-4 h-4 text-amber-600" />
    },
    {
      emoji: '⏱️',
      tag: 'Keep on Schedule',
      color: 'from-emerald-500/10 to-teal-500/5',
      title: '2. Keep Your Schedule on Time',
      description: 'Track scheduled arrivals, real-time checklist indicators, and beautiful upcoming destination countdowns so your trip flows seamlessly.',
      icon: <Clock className="w-4 h-4 text-emerald-600" />
    },
    {
      emoji: '💸',
      tag: 'Track Spendings',
      color: 'from-indigo-500/10 to-blue-500/5',
      title: '3. Track Spendings & Group Budgets',
      description: 'Log expenses in any local currency on the go, track dynamic budgets, and resolve complex shared bills with zero hassle.',
      icon: <Wallet className="w-4 h-4 text-indigo-600" />
    }
  ];

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#3C3836] flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none relative overflow-hidden">
      
      {/* Decorative subtle ambient backing glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#5A5A40]/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* 1. Header Area - Slim and elegant */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-black text-sm shadow-sm">
            n
          </div>
          <div>
            <h1 className="text-lg font-serif italic text-[#5A5A40] font-black leading-none">nomo.</h1>
            <p className="text-[7.5px] font-mono uppercase tracking-widest text-stone-400 font-bold leading-none mt-0.5">Intentional Travel Space</p>
          </div>
        </div>

        <button 
          onClick={onSkipToDemo}
          className="text-[9.5px] font-mono uppercase font-black text-stone-500 hover:text-[#5A5A40] tracking-wider transition-all hover:bg-stone-100 border border-stone-200/50 px-3.5 py-1.5 rounded-xl cursor-pointer shadow-3xs"
        >
          Skip to Demo →
        </button>
      </header>

      {/* 2. Main Stage - Optimized to guarantee zero scrolling layout */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-2 gap-6 z-10">
        
        {/* Simple & Bold Brand Headline highlighting the core purpose */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 text-[8px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider border border-amber-200/30">
            <Sparkles className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
            Your Ultimate Trip Companion
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-extrabold text-[#3C3836] leading-tight tracking-tight">
            Plan your itinerary, stay on schedule, and track spendings.
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-500 font-sans max-w-xl mx-auto">
            Everything you need for a stress-free journey. Zero bloat, beautiful local tools.
          </p>
        </div>

        {/* Dynamic Carousel Slide & Login Box Combined in a Single Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT: Core Features Showcase (Carousel with High Visibility highlight pillars) */}
          <div className="md:col-span-7 bg-white border border-stone-200/60 rounded-3xl p-5 flex flex-col justify-between gap-5 shadow-xs relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${slides[activeSlide].color} opacity-40 pointer-events-none transition-all duration-500`} />
            
            {/* Top row showing 3 passive indicators to represent our 3 main goals */}
            <div className="relative z-10 grid grid-cols-3 gap-2 border-b border-stone-100 pb-3">
              {[
                { label: '1. Plan Itinerary', active: activeSlide === 0 },
                { label: '2. Keep Time', active: activeSlide === 1 },
                { label: '3. Track Spend', active: activeSlide === 2 },
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`text-[9px] font-mono uppercase font-black text-center py-1 rounded transition-all ${
                    pill.active 
                      ? 'bg-[#5A5A40] text-white shadow-3xs' 
                      : 'bg-stone-50 text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Slide Body */}
            <div className="relative z-10 space-y-3.5 my-auto">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-white rounded-xl border border-stone-100 shadow-3xs flex items-center justify-center">
                  {slides[activeSlide].icon}
                </span>
                <span className="text-[8.5px] font-mono uppercase font-black bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-md tracking-wider">
                  {slides[activeSlide].tag} Goal
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-serif italic font-extrabold text-stone-900 leading-snug">
                  {slides[activeSlide].title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {slides[activeSlide].description}
                </p>
              </div>
            </div>

            {/* Pagination Controls Row */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-stone-100 mt-2 shrink-0">
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === i ? 'w-6 bg-[#5A5A40]' : 'w-1.5 bg-stone-200'
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg border border-stone-200/80 bg-white hover:bg-stone-50 text-stone-600 transition-all cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-1.5 rounded-lg border border-stone-200/80 bg-white hover:bg-stone-50 text-stone-600 transition-all cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: High Visibility Register & Login Box (Fully visible without scrolling!) */}
          <div className="md:col-span-5 bg-[#F5F2EB]/60 border border-[#DDD0C5]/40 rounded-3xl p-5 flex flex-col justify-center gap-5 text-center relative overflow-hidden shadow-2xs">
            <div className="space-y-1.5">
              <h4 className="text-base font-sans font-black text-stone-900 leading-none">Get Started Instantly</h4>
              <p className="text-[11px] text-stone-500 font-medium">No installation or subscription required</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onGetStarted(false)} // Sign Up
                className="w-full py-3.5 bg-[#5A5A40] text-white hover:bg-[#4a4a34] text-xs uppercase font-mono font-black tracking-widest rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onGetStarted(true)} // Sign In
                className="w-full py-3.5 bg-white text-[#5A5A40] hover:bg-stone-50 border border-stone-200 text-xs uppercase font-mono font-black tracking-widest rounded-xl transition-all text-center cursor-pointer active:scale-98 shadow-3xs"
              >
                Sign In
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="space-y-1.5 pt-1 text-left border-t border-stone-200/40">
              <div className="flex items-center gap-1.5 text-[9.5px] text-stone-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                <span>Custom offline storage enabled</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9.5px] text-stone-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                <span>Includes 15+ curated city guides</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* 3. Footer Area */}
      <footer className="w-full max-w-4xl mx-auto text-center py-2 shrink-0 border-t border-stone-200/30 z-10">
        <p className="text-[8.5px] text-stone-400 font-mono uppercase tracking-widest">
          nomo v3 © 2026 • Designed for slow, intentional living
        </p>
      </footer>

    </div>
  );
}
