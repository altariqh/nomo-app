import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  CheckCircle2,
  BookmarkCheck,
  Award
} from 'lucide-react';

interface OnboardingScreenProps {
  userName: string;
  userSpecialty: string;
  onOnboardingComplete: () => void;
}

export default function OnboardingScreen({ 
  userName, 
  userSpecialty, 
  onOnboardingComplete 
}: OnboardingScreenProps) {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onOnboardingComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-[#3C3836] p-4 md:p-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-xl border border-[#F1EFE9] overflow-hidden flex flex-col justify-between min-h-[500px] relative">
        
        {/* Scrap tape decoration */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-6 bg-[#DDD0C5]/40 border-b border-[#C8B8AB]/50 flex items-center justify-center font-mono text-[9px] text-[#5A5A40] font-bold uppercase tracking-widest pointer-events-none">
          📔 Travel Planner Guide • Step {step}/3
        </div>

        {/* TOP STATUS BAR */}
        <div className="px-6 md:px-10 pt-12 pb-4 flex justify-between items-center border-b border-[#F1EFE9] shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-serif font-bold text-[#5A5A40]">nomo.</span>
            <span className="text-[9px] font-mono bg-[#E7E5E4] px-1.5 py-0.5 rounded text-[#5A5A40] uppercase font-bold">itinerary planner</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[#5A5A40]' : 'w-2 bg-[#E7E5E4]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CONTAINER WITH SLIDES */}
        <div className="p-6 md:p-10 flex-1 flex flex-col justify-center text-left">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex p-3 rounded-full bg-[#EAE0D8] text-[#5A5A40] mb-1">
                <Compass className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif italic text-[#3C3836] leading-tight">
                Welcome to Nomo, <span className="text-[#5A5A40] font-bold">{userName}</span>
              </h2>
              <p className="text-xs text-[#8C857E] leading-relaxed">
                Your journeys are shaped by architectural lanes, quiet coffee corners, and local stays. Nomo brings structure to your routes, serving as a dedicated companion to outline your budgets and day-by-day itinerary schedules.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FBF9F7] border border-[#F1EFE9]">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#5A5A40] font-bold mb-1 flex items-center gap-1">
                    🏷️ Precise Expense Logs
                  </h4>
                  <p className="text-[11px] text-[#8C857E] leading-relaxed">
                    Log local transits, dining tabs, and accommodation fees split over custom currencies with optional category trackers.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FBF9F7] border border-[#F1EFE9]">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#5A5A40] font-bold mb-1 flex items-center gap-1">
                    🗺️ Itinerary Scheduling
                  </h4>
                  <p className="text-[11px] text-[#8C857E] leading-relaxed">
                    Plan custom checkpoints and map out exactly where you go alongside estimated costs to maintain your budget targets easily.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex p-3 rounded-full bg-[#EAE0D8] text-[#5A5A40] mb-1">
                <Award className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif italic text-[#3C3836] leading-tight">
                Unique Rating & Review System
              </h2>
              <p className="text-xs text-[#8C857E] leading-relaxed">
                Our main focus is giving you a space to build beautiful memoirs of places you've visited. Rate and review every checkpoint on your trip itinerary!
              </p>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E4] space-y-3">
                <div className="p-3 bg-white rounded-xl border border-[#F1EFE9] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-serif italic font-bold text-xs text-[#3C3836]">☕ Cafe Kitsune Espresso</span>
                    <span className="text-yellow-500 font-mono text-xs">★★★★★</span>
                  </div>
                  <p className="text-[11px] text-[#8C857E] italic">
                    "Fabulous layout and robust espresso. Tucked inside the green courtyard. A masterpiece stop on our Shibuya afternoon run."
                  </p>
                  <div className="text-[9px] font-mono text-[#5A5A40] uppercase tracking-wide">
                    ✓ Verified Visited • Tokyo Itinerary
                  </div>
                </div>

                <p className="text-[11px] text-[#8C857E] leading-relaxed">
                  Every marked place converts into a personal traveler guide entry. Share ratings and curated reviews to publish to our community feed!
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex p-3 rounded-full bg-[#EAE0D8] text-[#5A5A40] mb-1">
                <Sparkles className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif italic text-[#3C3836] leading-tight">
                Powerful Group Utilities & AI Recap
              </h2>
              <p className="text-xs text-[#8C857E] leading-relaxed">
                Connect and coordinate. Divide expenses across your travel circle and look up automated, beautiful itineraries with a single click.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-[#5A5A40] shrink-0" /></div>
                  <div>
                    <span className="font-bold text-[#3C3836]">Settlements & Ledger:</span> Let friends join travel logs. Nomo automatically computes who paid what and displays net-debt clearances.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-[#5A5A40] shrink-0" /></div>
                  <div>
                    <span className="font-bold text-[#3C3836]">Personal Review Feed:</span> View your entire database of written tourist reviews, categorized cleanly in your profile directory.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-[#5A5A40] shrink-0" /></div>
                  <div>
                    <span className="font-bold text-[#3C3836]">Review Recap Generator:</span> Let AI craft narrative summaries of all your review metrics to help you remember the highlights.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV BAR */}
        <div className="px-6 md:px-10 py-5 bg-[#FAF8F5] border-t border-[#F1EFE9] flex justify-between items-center shrink-0 rounded-b-[32px]">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#8C857E] hover:text-[#3C3836] disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-[#5A5A40] text-white hover:bg-[#4a4a34] active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <span>{step === 3 ? "Let's Begin" : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
