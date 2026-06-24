import React, { useState } from 'react';
import { Camera, MapPin, Star, Search, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { Trip, CommunityReview } from '../types';

interface JournalTabProps {
  activeTrip: Trip | null;
  communityReviews: CommunityReview[];
  onAddCommunityReview: (review: CommunityReview) => void;
  onNavigateToTab: (tab: 'journal' | 'ledger' | 'insights' | 'chat') => void;
  onAskAIAboutSpot: (query: string) => void;
}

export default function JournalTab({
  activeTrip,
  communityReviews,
  onAddCommunityReview,
  onNavigateToTab,
  onAskAIAboutSpot,
}: JournalTabProps) {
  const [filterType, setFilterType] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Likes local state
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const handleLikeToggle = (id: string) => {
    setLikedReviews(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter reviews
  const filteredReviews = communityReviews.filter(rev => {
    // Tab filter
    if (filterType === 'my' && rev.author !== 'You') return false;
    
    // Search query filter
    const matchesSearch = 
      rev.placeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.review.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });

  return (
    <div className="space-y-4 p-4 pb-20 overflow-y-auto max-h-[calc(100vh-140px)] select-none">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-4 rounded-3xl border border-[#F1EFE9] shadow-xs relative overflow-hidden text-left animate-fade-in">
        {/* Decorative Tape */}
        <div className="absolute top-2 right-4 w-28 h-5 bg-[#C8B8AB]/20 flex items-center justify-center font-mono text-[7px] text-[#5A5A40] font-bold uppercase rotate-3 pointer-events-none">
          📌 Traveler Reviews
        </div>
        
        <p className="text-[9px] font-mono uppercase tracking-widest text-[#A8A29E] font-extrabold">Community Hub</p>
        <h2 className="font-serif italic text-xl font-bold text-[#5A5A40] mt-0.5">Checked-In Reviews</h2>
        <p className="text-xs text-[#8C857E] mt-1 leading-normal max-w-sm">
          Discover verified ratings and reviews written by other travelers. Find your next café, destination, or itinerary stop below!
        </p>
      </div>

      {/* SEARCH AND CONTROLS BAR */}
      <div className="bg-[#FAF8F5] border border-[#F1EFE9] p-3 rounded-2xl text-left space-y-2">
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase font-extrabold tracking-wider transition-all ${
              filterType === 'all' 
                ? 'bg-[#5A5A40] text-white shadow-xs' 
                : 'text-[#8C857E] hover:text-[#5A5A40]'
            }`}
          >
            All Traveler Reviews
          </button>
          <button
            onClick={() => setFilterType('my')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase font-extrabold tracking-wider transition-all ${
              filterType === 'my' 
                ? 'bg-[#5A5A40] text-white shadow-xs' 
                : 'text-[#8C857E] hover:text-[#5A5A40]'
            }`}
          >
            My Checked-In Reviews
          </button>
        </div>

        {/* Filter / Search layout */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spots, coffee shops or locations..."
            className="w-full bg-white border border-stone-200 pl-8 pr-3 py-1.5 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] text-[#3C3836]"
          />
        </div>
      </div>

      {/* FEED SCRAPBOOK LIST */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => {
            const hasLiked = likedReviews[rev.id] || false;
            
            return (
              <div 
                key={rev.id}
                className="bg-white rounded-3xl border border-[#F1EFE9] p-4 text-left shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Decorative Scotch Tape Style */}
                <div className="absolute top-1 right-8 w-16 h-4 bg-stone-300/30 backdrop-blur-3xs rotate-[-3deg] border-b border-stone-400/20 select-none pointer-events-none" />
                 
                {/* Card Top: Author Profile & Rating badge */}
                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EAE0D8] border border-[#DDD0C5] flex items-center justify-center text-xs font-serif italic text-[#5A5A40] font-bold shadow-2xs">
                      {rev.author[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-[#3C3836] flex items-center gap-1.5 leading-tight">
                        {rev.author}
                        <span className="text-[8px] font-mono bg-[#FAF8F5] border border-[#F1EFE9] text-[#8C857E] px-1 rounded uppercase font-bold">
                          {rev.authorVibe || 'Traveler'}
                        </span>
                      </h4>
                      <p className="text-[9px] font-mono text-[#A8A29E] leading-none mt-0.5">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full select-none">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-mono font-extrabold text-amber-700 leading-none">{rev.rating}.0</span>
                  </div>
                </div>

                {/* Spot Details */}
                <div className="space-y-1 bg-[#FAF8F5] border border-[#F1EFE9] p-3 rounded-2xl mb-3 relative">
                  <div>
                    <h3 className="text-sm font-serif italic font-bold text-[#3C3836]">"{rev.placeName}"</h3>
                    <p className="text-[9px] font-mono text-[#8C857E] uppercase flex items-center gap-0.5 font-bold mt-0.5">
                      📍 {rev.location}
                    </p>
                  </div>

                  {/* Handwritten styled review lines */}
                  <p className="font-serif text-[11px] leading-relaxed text-[#3C3836] italic pt-1 border-t border-[#F1EFE9] mt-2">
                    {rev.review}
                  </p>

                  <div className="flex justify-between items-center text-[9px] font-mono text-[#8C857E] border-t border-dashed border-[#EAE0D8] pt-1.5 mt-2">
                    <span>Approx Spend: <span className="font-bold text-[#3C3836]">{rev.spentAmount.toLocaleString()} {rev.currency}</span></span>
                    <span className="text-[8px] bg-white border border-[#DDD0C5] text-stone-500 rounded px-1.5 py-0.5 select-none font-bold">
                      ✓ Verified Visit
                    </span>
                  </div>
                </div>

                {/* Interactive Card Action Footer */}
                <div className="flex justify-between items-center text-[10px] border-t border-[#FAF8F5] pt-2">
                  <button
                    onClick={() => onAskAIAboutSpot(`Who can tell me more about ${rev.placeName} in ${rev.location}, and write some local budget alternatives for travelers?`)}
                    className="text-[#5A5A40] hover:text-[#4a4a34] font-mono uppercase font-bold flex items-center gap-1 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/15 transition-all px-2.5 py-1 rounded-lg"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask AI About Spot</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLikeToggle(rev.id)}
                      className={`flex items-center gap-1 transition-all active:scale-90 ${
                        hasLiked ? 'text-red-500 font-bold' : 'text-[#8C857E] hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-500' : ''}`} />
                      <span className="font-mono text-[9px]">{hasLiked ? 'Liked' : 'Like'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="flex flex-col justify-center items-center text-center py-16 px-6 bg-white rounded-3xl border border-[#F1EFE9] animate-fade-in">
            <Camera className="w-8 h-8 text-[#A8A29E] mb-2 stroke-[1.5]" />
            <h3 className="font-serif italic text-base text-[#5A5A40] font-bold">No posts checked in here</h3>
            <p className="text-xs text-[#8C857E] mt-1 max-w-xs leading-normal">
              No spot ratings match your active filter criteria yet. Hop onto the **Planner** tab and check-in your visited spots to post reviews here!
            </p>
            <button
              onClick={() => onNavigateToTab('ledger')}
              className="mt-4 px-4 py-2 bg-[#5A5A40] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] transition-all cursor-pointer"
            >
              Go to Travel Planner ➜
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
