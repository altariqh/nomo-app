/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation, MapPin } from 'lucide-react';

interface MapSpot {
  id: string;
  title: string;
  arrivalTime?: string;
  description?: string;
}

interface MiniOSMMapProps {
  destination: string;
  spots: MapSpot[];
}

export default function MiniOSMMap({ destination, spots }: MiniOSMMapProps) {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Keep active index in bounds when spots list changes
  useEffect(() => {
    if (activeIdx >= spots.length) {
      setActiveIdx(Math.max(0, spots.length - 1));
    }
  }, [spots, activeIdx]);

  if (!spots || spots.length === 0) {
    return null;
  }

  // Draw an ultra-compact minimalist horizontal ride route line (Uber/Grab style)
  // Highly compact (only ~70px of vertical space occupied)
  return (
    <div id="itinerary-minimalist-route-visualizer" className="bg-[#FAF9F5] border border-[#DDD0C5]/60 rounded-xl p-2.5 space-y-1.5 text-left animate-fade-in relative overflow-hidden my-2 select-none shadow-3xs">
      
      {/* Tiny Header */}
      <div className="flex justify-between items-center px-0.5">
        <div className="flex items-center gap-1">
          <Navigation className="w-2.5 h-2.5 text-[#5A5A40] rotate-45 animate-pulse" />
          <span className="text-[7.5px] font-mono font-black text-[#5A5A40] uppercase tracking-wider">
            Nomad Sequence Route
          </span>
        </div>
        <span className="text-[7.5px] font-mono text-stone-400 font-bold bg-white px-1.5 py-0.2 rounded border border-stone-200/50 uppercase leading-none">
          {spots.length} {spots.length === 1 ? 'Station' : 'Stations'} {destination ? `• ${destination.split(',')[0]}` : ''}
        </span>
      </div>

      {/* Elegant minimalist path line */}
      <div className="relative pt-4 pb-2.5 px-3">
        {/* Connection highway wire */}
        <div className="absolute left-6 right-6 top-[21px] h-0.5 bg-dashed bg-stone-200" style={{ backgroundImage: 'linear-gradient(to right, #DDD0C5 50%, rgba(255,255,255,0) 0%)', backgroundSize: '6px 1px', backgroundRepeat: 'repeat-x' }} />
        
        {/* Animated route segment coloring (progresses towards current selection) */}
        {spots.length > 1 && (
          <div 
            className="absolute left-6 top-[21px] h-0.5 bg-[#5A5A40] transition-all duration-500 ease-in-out" 
            style={{ 
              width: `${(activeIdx / (spots.length - 1)) * 100}%`,
              maxWidth: 'calc(100% - 48px)'
            }} 
          />
        )}

        {/* Floating scooter rider indicator */}
        {spots.length > 1 && (
          <div 
            className="absolute top-1 text-[11px] transition-all duration-500 ease-in-out leading-none z-20 pointer-events-none"
            style={{ 
              left: `calc(1.5rem + ${(activeIdx / (spots.length - 1)) * 100}% - 1.5rem * ${(activeIdx / (spots.length - 1))})`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="relative group">
              <span className="animate-bounce inline-block">🛵</span>
              {/* Micro shadow under scooter */}
              <div className="w-1.5 h-0.5 bg-black/15 rounded-full mx-auto" />
            </div>
          </div>
        )}

        {/* Stations/Nodes Row */}
        <div className="flex justify-between items-center relative z-10">
          {spots.map((spot, idx) => {
            const isActive = idx === activeIdx;
            const isCompleted = idx < activeIdx;
            
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className="group/node focus:outline-none flex flex-col items-center relative"
                style={{ width: `${100 / spots.length}%` }}
              >
                {/* Node pin bubble */}
                <div 
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border font-mono font-bold text-[7px] transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#5A5A40] border-[#FAF8F5] text-white ring-2 ring-[#5A5A40]/20 scale-110 shadow-3xs' 
                      : isCompleted 
                        ? 'bg-[#5A5A40]/80 border-transparent text-white' 
                        : 'bg-white border-stone-300 text-stone-500 group-hover/node:border-stone-400'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Highly compact spot title */}
                <span 
                  className={`text-[8px] font-sans font-bold max-w-[55px] truncate mt-1 text-center transition-all ${
                    isActive 
                      ? 'text-[#5A5A40] scale-103 font-black' 
                      : 'text-stone-400 group-hover/node:text-stone-700'
                  }`}
                >
                  {spot.title}
                </span>

                {/* Mini duration tag */}
                {spot.arrivalTime && isActive && (
                  <span className="absolute -top-4 font-mono font-extrabold text-[7px] bg-[#5A5A40] text-white px-1 rounded-sm leading-none py-0.5 shadow-2xs pointer-events-none whitespace-nowrap z-30">
                    {spot.arrivalTime}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tiny active spot status detail pill (Ultra compact inline text) */}
      <div className="bg-white px-2 py-1 rounded-lg border border-stone-150 text-[8px] flex justify-between items-center text-stone-600 gap-1 mt-1 leading-tight">
        <span className="truncate flex items-center gap-1 flex-1 font-sans">
          <strong className="text-[#5A5A40] shrink-0 font-bold">🎯 Destination {activeIdx + 1}:</strong> 
          <span className="font-extrabold text-[#3C3836] truncate">{spots[activeIdx].title}</span>
          {spots[activeIdx].description && (
            <span className="text-stone-400 text-[7px] truncate ml-0.5 border-l border-stone-200 pl-1">
              {spots[activeIdx].description}
            </span>
          )}
        </span>
        {spots[activeIdx].arrivalTime && (
          <span className="font-mono text-[7px] bg-stone-50 border px-1 rounded text-stone-505 shrink-0 font-bold">
            ⏰ {spots[activeIdx].arrivalTime}
          </span>
        )}
      </div>

    </div>
  );
}
