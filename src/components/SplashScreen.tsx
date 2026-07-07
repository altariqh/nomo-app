import React, { useEffect, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#FDFCFB] via-[#FAF8F5] to-[#F3EFEB] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden transition-all duration-700">
      {/* Decorative ambient blurred backing glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#5A5A40]/5 rounded-full filter blur-3xl opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl opacity-40 pointer-events-none" />

      {/* Main Logo & Symbol Container */}
      <div className="relative flex flex-col items-center gap-6 z-10 max-w-sm">
        {/* Animated Icon Ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-2 border-dashed border-[#5A5A40]/15 rounded-full animate-[spin_40s_linear_infinite]" />
          <div className="absolute w-20 h-20 border border-stone-200 rounded-full" />
          <div className="w-16 h-16 bg-white border border-[#DDD0C5]/40 rounded-full shadow-md flex items-center justify-center relative">
            <Compass className="w-7 h-7 text-[#5A5A40] animate-[spin_20s_linear_infinite]" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-500 animate-bounce" />
          </div>
        </div>

        {/* Brand Name with dynamic typography and fade-in */}
        <div className="space-y-2 mt-4">
          <h1 className="text-5xl font-serif italic text-[#5A5A40] tracking-tighter font-extrabold flex items-center justify-center gap-1">
            nomo<span className="text-amber-500 font-sans font-black text-3xl">.</span>
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8C857E] font-black">
            Intentional Travel Journal & Ledger
          </p>
        </div>

        {/* Ambient Loading bar */}
        <div className="w-36 h-[3px] bg-stone-200 rounded-full overflow-hidden mt-6 relative">
          <div className="absolute left-0 top-0 bottom-0 bg-[#5A5A40] rounded-full animate-[loading_2.2s_ease-in-out_infinite] w-[40%]" />
        </div>

        {/* Warm philosophical traveler tag */}
        <p className="text-[10px] text-stone-500 italic mt-8 max-w-[250px] leading-relaxed font-sans font-medium">
          "Slow down, savor the cafes, and live travel with presence."
        </p>
      </div>

      {/* Tailwind keyframes styles block */}
      <style>{`
        @keyframes loading {
          0% { left: -40%; }
          50% { left: 100%; }
          100% { left: -40%; }
        }
      `}</style>
    </div>
  );
}
