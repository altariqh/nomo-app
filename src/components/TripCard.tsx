/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trip } from '../types';
import { EMOTIONAL_EMOJIS } from '../mockData';
import { Calendar, Wallet, Users, Compass, ChevronRight } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onSelect: (tripId: string) => void;
  isSelected: boolean;
}

export default function TripCard({ trip, onSelect, isSelected }: TripCardProps) {
  const totalSpent = trip.expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const percentSpent = Math.round((totalSpent / trip.budget) * 100);
  
  // Get counts of emotional responses to create a mini mood-ring distribution
  const emotionsMap: Record<string, number> = {};
  trip.expenseEntries.forEach((entry) => {
    emotionsMap[entry.emotionalTag] = (emotionsMap[entry.emotionalTag] || 0) + 1;
  });
  
  const topEmotions = Object.entries(emotionsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div
      onClick={() => onSelect(trip.id)}
      id={`trip-card-${trip.id}`}
      className={`relative cursor-pointer transition-all duration-300 p-6 rounded-3xl bg-white border-2 hover:shadow-xl ${
        isSelected
          ? 'border-terracotta-500 shadow-md ring-4 ring-terracotta-500/10'
          : 'border-sand-200 shadow-sm hover:border-sand-300'
      }`}
    >
      {/* Decorative Scrapbook "Tape" header overlay */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 scrapbook-tape flex items-center justify-center font-mono text-[10px] text-sand-700 font-bold uppercase tracking-wider">
        ✈️ Travel Plan
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-2">
        {/* Polaroid Style Thumbnail */}
        <div className="w-full md:w-44 h-40 bg-sand-100 p-2.5 pb-8 rounded-lg border border-sand-200 shadow-inner flex flex-col shrink-0">
          <img
            src={trip.coverImage}
            alt={trip.name}
            referrerPolicy="no-referrer"
            className="w-full h-28 object-cover rounded"
          />
          <div className="text-[10px] text-center font-serif italic text-sand-700 mt-2 truncate">
            ✨ {trip.destination.split(',')[0]}
          </div>
        </div>

        {/* Info detail */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-sand-100 border border-sand-200 text-xs font-mono text-sand-700 mb-1.5 font-medium">
                  {trip.destination}
                </span>
                <h3 className="font-display text-xl font-bold text-charcoal-900 tracking-tight leading-snug">
                  {trip.name}
                </h3>
              </div>
              <div className="rounded-full bg-sand-50 p-2 border border-sand-200 text-terracotta-500 shrink-0">
                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isSelected ? 'rotate-90' : ''}`} />
              </div>
            </div>

            <p className="font-sans text-xs text-sand-700 leading-relaxed mt-2 line-clamp-2">
              {trip.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-sand-100/80">
            {/* Budget status */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-sand-700 font-medium">
                <Wallet className="w-3.5 h-3.5 text-terracotta-500" />
                <span>SPENT VS BUDGET</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xs font-bold text-charcoal-900">
                  {totalSpent.toLocaleString()}
                </span>
                <span className="text-[10px] text-sand-700">
                  / {trip.budget.toLocaleString()} {trip.currency}
                </span>
              </div>
              <div className="w-full h-1.5 bg-sand-100 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percentSpent > 90 ? 'bg-red-400' : percentSpent > 70 ? 'bg-mustard-500' : 'bg-sage-500'
                  }`}
                  style={{ width: `${Math.min(percentSpent, 100)}%` }}
                />
              </div>
            </div>

            {/* Emotional Map indicator */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-sand-700 font-medium">
                <Compass className="w-3.5 h-3.5 text-sage-500" />
                <span>SPENDING PROFILE</span>
              </div>
              
              {topEmotions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {topEmotions.map(([emotion, count]) => (
                    <span
                      key={emotion}
                      title={`${emotion}: ${count} logged`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sand-50 border border-sand-200 text-[10px]"
                    >
                      <span>{EMOTIONAL_EMOJIS[emotion] || '🎈'}</span>
                      <span className="font-sans font-medium text-sand-700">{emotion}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] font-sans text-sand-700 italic">No tags logged yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4/8 text-[11px] font-mono text-sand-700/80 pt-3/2 border-t border-sand-100/50">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{trip.startDate} to {trip.endDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-terracotta-500" />
          <span>{trip.members.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}
