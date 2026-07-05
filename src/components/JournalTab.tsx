import React, { useState } from 'react';
import { Camera, MapPin, Star, Sparkles, Heart, ChevronLeft, ChevronRight, History, Calendar, Award, Play, BookOpen, Volume2, Music, Flame } from 'lucide-react';
import { Trip } from '../types';

interface JournalTabProps {
  activeTrip: Trip | null;
  trips?: Trip[];
  onNavigateToTab: (tab: 'journal' | 'ledger' | 'insights' | 'profile') => void;
  onAskAIAboutSpot: (query: string) => void;
}

// Get date strings list between startDate and endDate
function getDatesInRange(startDateStr?: string, endDateStr?: string): string[] {
  if (!startDateStr || !endDateStr) return [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }
  const dates: string[] = [];
  const curr = new Date(start);
  let safetyCount = 0;
  while (curr <= end && safetyCount < 60) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
    safetyCount++;
  }
  return dates;
}

function formatDuration(mins?: number): string {
  if (!mins) return '60m';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs}h`;
}

export default function JournalTab({
  activeTrip,
  trips,
  onNavigateToTab,
  onAskAIAboutSpot,
}: JournalTabProps) {
  // Local active story playback states
  const [activeStoryDayIdx, setActiveStoryDayIdx] = useState<number | null>(null);
  const [storySlideIdx, setStorySlideIdx] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const allTrips = trips && trips.length > 0 ? trips : (activeTrip ? [activeTrip] : []);

  if (allTrips.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center py-20 px-6 bg-[#FAF9F7] h-full select-none">
        <History className="w-10 h-10 text-stone-400 mb-3 stroke-[1.5]" />
        <h3 className="font-serif italic text-lg text-[#5A5A40] font-black">No Trips Found</h3>
        <p className="text-xs text-[#8C857E] mt-2 max-w-xs leading-normal">
          Create a travel plan in the planner to activate your visual day recap memories.
        </p>
      </div>
    );
  }

  // Parse completed days list with detailed statistics from all trips
  const allCompletedDays = allTrips.flatMap((trip) => {
    const datesList = getDatesInRange(trip.startDate, trip.endDate);
    return datesList.map((dateStr, idx) => {
      const dayItems = (trip.itinerary || []).filter(item => item.visitDate === dateStr);
      const dayTotalSpent = dayItems
        .filter(item => item.visited)
        .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
      const visitedCount = dayItems.filter(item => item.visited).length;
      const totalCount = dayItems.length;

      const ratedItems = dayItems.filter(item => item.visited && item.rating);
      const averageRating = ratedItems.length > 0 
        ? (ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length).toFixed(1)
        : null;

      const highestRatedSpot = [...ratedItems].sort((a,b) => (b.rating || 0) - (a.rating || 0))[0] || null;
      const biggestExpenseSpot = [...dayItems].sort((a,b) => (b.estimatedCost || 0) - (a.estimatedCost || 0))[0] || null;

      const dayRef = trip.dayReflections?.[dateStr] || {};
      const completed = dayRef.completed || false;
      const note = dayRef.note || '';

      // Assign a beautiful retro aura mood based on average rating/spending
      let auraMood = 'Chill & Mindful';
      let auraEmoji = '🍃';
      if (dayTotalSpent > 3000) {
        auraMood = 'Decadent Indulgence';
        auraEmoji = '💸';
      } else if (averageRating && parseFloat(averageRating) >= 4.8) {
        auraMood = 'High Euphoric Joy';
        auraEmoji = '⚡';
      } else if (visitedCount >= 3) {
        auraMood = 'Vigorous Trekking';
        auraEmoji = '🏃🏽';
      }

      return {
        tripId: trip.id,
        tripName: trip.name,
        currency: trip.currency,
        index: idx,
        dateStr,
        completed,
        dayItems,
        dayTotalSpent,
        visitedCount,
        totalCount,
        averageRating,
        highestRatedSpot,
        biggestExpenseSpot,
        note,
        auraMood,
        auraEmoji
      };
    });
  }).filter(day => day.completed);

  // Play a brief synthesized audio tick/pop for tapping slides
  const playSlideTick = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const activeDayStory = activeStoryDayIdx !== null ? allCompletedDays[activeStoryDayIdx] : null;

  return (
    <div className="space-y-5 p-4 pb-20 overflow-y-auto h-full select-none text-left bg-[#FAF9F7]">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-5 rounded-3xl border border-[#F1EFE9] shadow-2xs relative overflow-hidden text-left animate-fade-in">
        <p className="text-[8.5px] font-mono uppercase tracking-widest text-[#A8A29E] font-extrabold leading-none">Personal History</p>
        <h2 className="font-serif italic text-xl font-bold text-[#5A5A40] mt-1 leading-tight">Day Recap Archive</h2>
        <p className="text-xs text-[#8C857E] mt-1.5 leading-normal max-w-sm">
          Relive your custom travel experiences, local budgets, daily moods, and soundtrack notes just like an Instagram Story vault.
        </p>
      </div>

      {/* INSTAGRAM STYLE STORY AVATARS BAR */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-[#F1EFE9] shadow-3xs space-y-2 text-left">
        <h4 className="text-[8.5px] font-mono uppercase tracking-widest text-stone-400 font-extrabold">Completed Storyline</h4>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none items-center">
          {allCompletedDays.length === 0 ? (
            <div className="py-2 text-[#8C857E] font-mono text-[9px] uppercase tracking-widest text-center w-full">
              No completed day memories yet
            </div>
          ) : (
            allCompletedDays.map((day, globalIdx) => {
              const isSelected = activeStoryDayIdx === globalIdx;
              return (
                <button
                  key={`${day.tripId}-day-${day.index}`}
                  onClick={() => {
                    playSlideTick();
                    setActiveStoryDayIdx(globalIdx);
                    setStorySlideIdx(0);
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none transition-all active:scale-95 cursor-pointer"
                >
                  {/* Visual Avatar Ring */}
                  <div className={`w-13 h-13 rounded-full p-[2.5px] flex items-center justify-center transition-all bg-gradient-to-tr from-amber-500 via-rose-500 to-[#5A5A40] animate-pulse-slow shadow-xs ${
                    isSelected ? 'ring-2 ring-[#5A5A40] ring-offset-2 scale-105' : ''
                  }`}>
                    <div className="w-full h-full rounded-full bg-white flex flex-col justify-center items-center font-serif text-[13px] italic font-black text-stone-800">
                      D{day.index + 1}
                      <span className="text-[9px] leading-none -mt-0.5">{day.auraEmoji}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[8.5px] font-mono font-bold uppercase text-stone-600 leading-none">
                      Day {day.index + 1}
                    </span>
                    <span className="text-[7.2px] font-mono text-[#8C857E] mt-0.5 max-w-[64px] truncate" title={day.tripName}>
                      {day.tripName}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* SAVED STORIES POLAROID GALLERY */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-serif italic text-[14px] font-bold text-[#3C3836]">Archived Memories ({allCompletedDays.length})</h3>
          <span className="text-[8px] font-mono uppercase tracking-wider text-stone-400 font-bold">Grid Layout</span>
        </div>

        {allCompletedDays.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {allCompletedDays.map((day, globalIdx) => {
              return (
                <div 
                  key={`${day.tripId}-day-${day.index}`}
                  className="bg-white rounded-2xl border border-[#F1EFE9] p-3 text-left shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden group pb-4 flex flex-col justify-between min-h-[190px]"
                >
                  {/* Card Top Information */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-mono font-black text-[#5A5A40] uppercase bg-[#5A5A40]/10 px-1.5 py-0.5 rounded">
                        Day {day.index + 1}
                      </span>
                      <span className="text-[12px]" title={day.auraMood}>{day.auraEmoji}</span>
                    </div>

                    <h4 className="font-serif italic text-xs font-extrabold text-[#3C3836] leading-snug line-clamp-1 mt-1.5" title={day.tripName}>
                      {day.tripName}
                    </h4>

                    {day.note ? (
                      <p className="font-serif text-[9px] italic text-[#8C857E] leading-relaxed line-clamp-3 bg-stone-50 p-1.5 rounded-lg border border-stone-100/60">
                        "{day.note}"
                      </p>
                    ) : (
                      <p className="text-[8px] font-mono uppercase tracking-wider text-stone-400 italic py-1 bg-stone-50/50 rounded-lg text-center">
                        No written reflections
                      </p>
                    )}
                  </div>

                  {/* Summary Footer */}
                  <div className="space-y-2.5 pt-2 border-t border-dashed border-stone-100 mt-2">
                    <div className="flex justify-between text-[8px] font-mono font-bold text-stone-500">
                      <span>Spent: <strong className="text-stone-800">{day.dayTotalSpent.toLocaleString()} {day.currency}</strong></span>
                      <span>{day.visitedCount}/{day.totalCount} Spots</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playSlideTick();
                        setActiveStoryDayIdx(globalIdx);
                        setStorySlideIdx(0);
                      }}
                      className="w-full py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[8px] font-mono font-bold uppercase rounded-lg tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Play className="w-2.5 h-2.5 fill-white text-white" />
                      <span>Replay Story</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center py-12 px-6 bg-white rounded-3xl border border-[#F1EFE9] animate-fade-in shadow-2xs">
            <Camera className="w-8 h-8 text-[#A8A29E] mb-2 stroke-[1.5]" />
            <h3 className="font-serif italic text-sm text-[#5A5A40] font-bold">Story archive is empty</h3>
            <p className="text-[11px] text-[#8C857E] mt-1 max-w-xs leading-normal">
              You haven't wrapped any travel days yet. Go to the planner page, check off some places, and tap **"Complete & Wrap Day"** to publish a story!
            </p>
            <button
              onClick={() => onNavigateToTab('ledger')}
              className="mt-4 px-4 py-2 bg-[#5A5A40] text-white font-bold text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] transition-all cursor-pointer"
            >
              Go to Travel Planner ➜
            </button>
          </div>
        )}
      </div>

      {/* ----------------- FULL-SCREEN INSTAGRAM RECAPPING VIEWER MODAL ----------------- */}
      {activeDayStory && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in select-none">
          {(() => {
            const slideGradients = [
              'from-[#1f1c2c] to-[#928dab] text-purple-100', // Midnight neon
              'from-[#134e5e] to-[#71b280] text-emerald-50', // Lush Forest
              'from-[#3a6073] to-[#3a7bd5] text-cyan-50',   // Cyber Ocean
              'from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-orange-50', // Sunset Wrapped
              'from-[#11998e] to-[#38ef7d] text-green-50'    // Acid Lime Aura
            ];
            const gradientBg = slideGradients[storySlideIdx % slideGradients.length];

            return (
              <div className={`w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-br ${gradientBg} border-2 border-white/20 shadow-2xl p-6 relative flex flex-col justify-between aspect-[3/4] h-[550px] transition-all duration-300 text-left`}>
                
                {/* Progress Indicators */}
                <div className="flex gap-1.5 w-full">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-white transition-all duration-300 ${
                          idx < storySlideIdx ? 'w-full' : idx === storySlideIdx ? 'w-full animate-pulse' : 'w-0'
                        }`} 
                      />
                    </div>
                  ))}
                </div>

                {/* Top Header Row */}
                <div className="flex justify-between items-center mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest bg-black/35 text-amber-200 px-2.5 py-1 rounded-full font-bold">
                      🎵 Day {activeDayStory.index + 1} Story
                    </span>
                    <button 
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-6 h-6 rounded-full bg-black/20 text-white flex items-center justify-center text-[10px]"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${soundEnabled ? 'text-white' : 'text-stone-400'}`} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playSlideTick();
                      setActiveStoryDayIdx(null);
                    }}
                    className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Core Slides Content */}
                <div className="flex-1 flex flex-col justify-center py-6">
                  
                  {/* Slide 0: Welcoming Entry */}
                  {storySlideIdx === 0 && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div className="inline-flex text-4xl leading-none mb-1">🎬</div>
                      <h1 className="font-serif italic text-4xl font-extrabold tracking-tight leading-none text-white">
                        Relive Day {activeDayStory.index + 1} <br/>Memories.
                      </h1>
                      <p className="font-sans text-xs opacity-90 leading-relaxed font-semibold">
                        Here is your travel flashback. Tap forward to review your budgets, check-in highlights, and day notes!
                      </p>
                      <div className="inline-flex items-center gap-1 text-[8.5px] font-mono bg-white/10 px-3 py-1 rounded-full border border-white/10 text-stone-200">
                        <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>VIBE: {activeDayStory.auraMood.toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  {/* Slide 1: Financial Tracker wrapped */}
                  {storySlideIdx === 1 && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <h2 className="font-serif italic text-2xl font-black text-amber-200 leading-tight">
                        Daily Budget Numbers 🪙
                      </h2>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-wider opacity-80 block">Total Capital Logged</span>
                          <span className="text-4xl font-mono font-black tracking-tight text-white">
                            {activeDayStory.dayTotalSpent.toLocaleString()} <span className="text-lg font-normal">{activeDayStory.currency}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                          <div className="bg-black/25 p-3 rounded-xl border border-white/10">
                            <span className="text-[8px] font-mono uppercase tracking-wide text-stone-300 block">Accomplishments</span>
                            <span className="text-sm font-sans font-black text-white">{activeDayStory.visitedCount} of {activeDayStory.totalCount}</span>
                            <p className="text-[7.5px] opacity-70 leading-none mt-0.5">Locations checked in</p>
                          </div>
                          
                          <div className="bg-black/25 p-3 rounded-xl border border-white/10">
                            <span className="text-[8px] font-mono uppercase tracking-wide text-stone-300 block">Day Vibe Score</span>
                            <span className="text-sm font-sans font-black text-white">
                              {activeDayStory.averageRating ? `${activeDayStory.averageRating} ★ avg` : 'Not rated'}
                            </span>
                            <p className="text-[7.5px] opacity-70 leading-none mt-0.5">Average overall score</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slide 2: High Favorite Memory */}
                  {storySlideIdx === 2 && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <h2 className="font-serif italic text-2xl font-black text-rose-300 leading-tight">
                        Absolute Highlight ✨
                      </h2>
                      
                      {activeDayStory.highestRatedSpot ? (
                        <div className="bg-white/10 border border-white/15 p-4 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono text-stone-300 uppercase tracking-widest">🏆 HIGHEST RATING</span>
                            <span className="text-[10px] font-mono text-amber-200 font-extrabold">★ {activeDayStory.highestRatedSpot.rating}.0</span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-white">"{activeDayStory.highestRatedSpot.title}"</h3>
                          {activeDayStory.highestRatedSpot.review && (
                            <p className="font-serif italic text-[11px] text-stone-200 leading-relaxed pt-1.5 border-t border-white/10">
                              "{activeDayStory.highestRatedSpot.review}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-black/20 border border-white/10 rounded-2xl">
                          <p className="text-xs italic opacity-85">No completed reviews written for Day {activeDayStory.index + 1} yet!</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Slide 3: Hand Written reflection note */}
                  {storySlideIdx === 3 && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <h2 className="font-serif italic text-2xl font-black text-[#71b280] leading-tight">
                        Journal Reflections 📝
                      </h2>
                      
                      {activeDayStory.note ? (
                        <div className="bg-[#FAF8F5] text-[#3C3836] p-4 rounded-2xl shadow-lg border border-stone-200/40 relative">
                          <p className="font-serif italic text-xs leading-relaxed">
                            "{activeDayStory.note}"
                          </p>
                          <div className="text-right text-[8px] font-mono text-stone-400 uppercase mt-2.5 font-bold">
                            — Logged {activeDayStory.dateStr}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-black/20 border border-white/10 rounded-2xl">
                          <p className="text-xs italic opacity-80">You didn't write any general journal reflection notes for this day. Open the planner and save a memo anytime!</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Slide 4: Aesthetic Soundtrack summary & aura */}
                  {storySlideIdx === 4 && (
                    <div className="space-y-4 animate-fade-in text-center flex flex-col justify-center items-center">
                      <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/20 mb-1 animate-spin-slow">
                        <Music className="w-8 h-8 text-amber-200" />
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#71b280] bg-white/15 px-3 py-1 rounded-full font-bold">
                          Daily Trip Mood
                        </span>
                        <h2 className="font-serif italic text-3xl font-black text-white leading-tight">
                          {activeDayStory.auraEmoji} {activeDayStory.auraMood}
                        </h2>
                        <p className="font-sans text-[11px] opacity-90 max-w-xs leading-relaxed font-medium">
                          You spent {activeDayStory.dayTotalSpent.toLocaleString()} {activeDayStory.currency} to visit {activeDayStory.visitedCount} places on {activeDayStory.dateStr}. This memory is now preserved in your digital travel journal.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playSlideTick();
                          setActiveStoryDayIdx(null);
                        }}
                        className="mt-4 px-5 py-2 bg-white text-stone-900 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        Close & Back to Archive
                      </button>
                    </div>
                  )}

                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <button
                    type="button"
                    disabled={storySlideIdx === 0}
                    onClick={() => {
                      playSlideTick();
                      setStorySlideIdx(p => Math.max(0, p - 1));
                    }}
                    className={`px-3 py-1 bg-black/20 hover:bg-black/40 rounded-lg text-[10px] font-mono font-bold text-white transition-all flex items-center gap-1 ${
                      storySlideIdx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <span className="text-[10px] font-mono text-white/60 font-bold">
                    Slide {storySlideIdx + 1} / 5
                  </span>

                  {storySlideIdx < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        playSlideTick();
                        setStorySlideIdx(p => Math.min(4, p + 1));
                      }}
                      className="px-3 py-1 bg-white text-stone-900 font-mono font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playSlideTick();
                        setActiveStoryDayIdx(null);
                      }}
                      className="px-3 py-1 bg-amber-400 text-black font-mono font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                    >
                      Done ✓
                    </button>
                  )}
                </div>

              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
