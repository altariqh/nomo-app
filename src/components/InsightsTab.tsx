import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Star, AlertCircle, Compass, Heart, X, MapPin, Plus, Trash2, RotateCcw, Check, Navigation, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Trip, CommunityReview, ItineraryItem } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

interface ScoutCardComment {
  author: string;
  rating: number;
  text: string;
  helpfulCount?: number;
}

interface ScoutCard {
  id: string;
  name: string;
  distance: number;
  category: string;
  description: string;
  rating: number;
  recommendedBy: string;
  lat?: number;
  lon?: number;
  estimatedCost?: number;
  coverPhotoUrl?: string;
  gallery?: string[];
  comments?: ScoutCardComment[];
}

interface InsightsTabProps {
  activeTrip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  communityReviews: CommunityReview[];
  onNavigateToTab: (tab: 'journal' | 'ledger' | 'insights' | 'chat') => void;
}

interface SwipableCardProps {
  card: ScoutCard;
  currency: string;
  onLike: (card: ScoutCard) => void;
  onNope: () => void;
  onSelectDetail: (card: ScoutCard) => void;
  swipeLeft: boolean;
}

function SwipableCard({ card, currency, onLike, onNope, onSelectDetail, swipeLeft }: SwipableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0.5, 1, 1, 1, 0.5]);

  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    const swipedThreshold = 120;
    if (info.offset.x > swipedThreshold) {
      onLike(card);
    } else if (info.offset.x < -swipedThreshold) {
      onNope();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      style={{ x, y, rotate, opacity }}
      onDragEnd={handleDragEnd}
      className="absolute w-[280px] sm:w-[300px] h-full bg-white border border-[#F1EFE9] rounded-3xl overflow-hidden shadow-md flex flex-col justify-between cursor-grab active:cursor-grabbing text-left select-none z-10"
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ 
        x: swipeLeft ? -500 : 500, 
        opacity: 0, 
        rotate: swipeLeft ? -15 : 15,
        scale: 0.9
      }}
      transition={{ type: 'spring', damping: 22, stiffness: 150 }}
    >
      <motion.div 
        style={{ opacity: nopeOpacity }} 
        className="absolute top-4 right-4 border-2 border-rose-500 text-rose-500 font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded rotate-12 z-25 pointer-events-none select-none tracking-widest bg-white/90 backdrop-blur-xs"
      >
        PASS
      </motion.div>

      <motion.div 
        style={{ opacity: likeOpacity }} 
        className="absolute top-4 left-4 border-2 border-emerald-500 text-emerald-500 font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded -rotate-12 z-25 pointer-events-none select-none tracking-widest bg-white/90 backdrop-blur-xs"
      >
        SAVE
      </motion.div>

      <div 
        className="relative h-28 w-full bg-stone-100 shrink-0 cursor-pointer overflow-hidden group" 
        onClick={() => onSelectDetail(card)}
      >
        <img
          src={card.coverPhotoUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"}
          alt={card.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-xs border border-stone-200/50 flex items-center gap-1">
          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
          <span className="font-mono text-[8px] font-bold text-stone-800">{card.rating.toFixed(1)}</span>
        </div>

        <div className="absolute bottom-2 right-2 bg-[#5A5A40] text-white px-1.5 py-0.5 rounded text-[7.5px] font-mono tracking-wider font-extrabold shadow-sm flex items-center gap-1 border border-[#DDD0C5]/40">
          <Sparkles className="w-2 h-2 text-amber-300" />
          <span>{card.recommendedBy}</span>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5 min-h-0">
        <div className="space-y-1.5">
          <div className="flex justify-between items-start cursor-pointer gap-1" onClick={() => onSelectDetail(card)}>
            <h4 className="text-xs font-sans font-black text-stone-800 tracking-tight leading-tight hover:text-[#5A5A40] transition-colors truncate">
              {card.name}
            </h4>
            <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded shrink-0">
              {card.distance} km
            </span>
          </div>
          
          <p className="text-[10px] text-[#8C857E] font-serif italic leading-normal line-clamp-2">
            "{card.description}"
          </p>

          <button
            type="button"
            onClick={() => onSelectDetail(card)}
            className="w-full mt-1.5 py-1 hover:bg-[#5A5A40]/10 border border-dashed border-[#5A5A40]/30 hover:border-[#5A5A40]/50 rounded-lg text-[8px] font-mono text-[#5A5A40] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1 cursor-pointer bg-[#5A5A40]/5"
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>View Details</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[8px] font-mono border-t border-stone-100 pt-1.5 shrink-0">
          <span className="text-[#A8A29E] uppercase">Approx Cost</span>
          <span className="font-black text-stone-800 text-[9px]">
            {card.estimatedCost === 0 ? 'Free Entry' : `~ ${card.estimatedCost} ${currency}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

const INTERESTS = [
  { id: 'cafes', label: 'Cozy Cafés', emoji: '☕', description: 'Premium roasters, scenic coffee yards & vinyl hubs' },
  { id: 'eat', label: 'Places to Eat', emoji: '🍔', description: 'Tiktok viral hubs, local kitchens & Michelin street eats' },
  { id: 'drink', label: 'Places to Drink', emoji: '🍹', description: 'Secret speakeasies, high-fidelity bars & botanical mixology' },
  { id: 'sightseeing', label: 'Sightseeing & Outlooks', emoji: '🌅', description: 'Golden vistas, sunset trails & classic city skylines' },
  { id: 'museum', label: 'Art & Museums', emoji: '🏛️', description: 'Cutting-edge exhibitions, historical shrines & craft archives' },
  { id: 'nature', label: 'Parks & Nature', emoji: '🌳', description: 'Tranquil valleys, organic gardens & hidden lagoons' },
];

export default function InsightsTab({
  activeTrip,
  onUpdateTrip,
  communityReviews,
  onNavigateToTab,
}: InsightsTabProps) {
  // AI Scout States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scoutCards, setScoutCards] = useState<ScoutCard[]>([]);
  const [scoutIndex, setScoutIndex] = useState(0);
  const [loadingScout, setLoadingScout] = useState(false);
  const [showActionOverlay, setShowActionOverlay] = useState<ScoutCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDetailCard, setSelectedDetailCard] = useState<ScoutCard | null>(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [swipeLeft, setSwipeLeft] = useState<boolean>(false);

  // Statistics
  const averageRating = (communityReviews.reduce((acc, r) => acc + r.rating, 0) / communityReviews.length) || 4.8;
  const totalSpots = communityReviews.length;

  // Handle temporary toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Recommended Scout Cards
  const handleFetchScoutCards = async (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setLoadingScout(true);
    setScoutIndex(0);
    setScoutCards([]);

    try {
      const response = await fetch('/api/gemini/scout-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: activeTrip.destination,
          category: categoryKey,
          lat: activeTrip.latitude,
          lon: activeTrip.longitude,
        }),
      });

      if (!response.ok) throw new Error('Failed to scout places');
      const data = await response.json();
      setScoutCards(data.recommendations || []);
    } catch (err) {
      console.error(err);
      triggerToast('⚠️ Server high demand fallback loaded.');
    } finally {
      setLoadingScout(false);
    }
  };

  // Tinder Action: Nope (Swipe Left)
  const handleNope = () => {
    setSwipeLeft(true);
    setTimeout(() => {
      setScoutIndex((prev) => prev + 1);
    }, 50);
  };

  // Tinder Action: Like (Swipe Right)
  const handleLike = (card: ScoutCard) => {
    setSwipeLeft(false);
    setShowActionOverlay(card);
  };

  // Saved Actions: Add directly to Trip Itinerary
  const handleAddToItinerary = (card: ScoutCard) => {
    const newItem: ItineraryItem = {
      id: `itinerary-${Date.now()}`,
      title: card.name,
      description: card.description,
      estimatedCost: card.estimatedCost || 15,
      visited: false,
      arrivalTime: '11:00 AM',
      rating: card.rating,
      review: `Discovered on AI Scout (Curation Source: ${card.recommendedBy})`,
      lat: card.lat,
      lon: card.lon,
    };

    const updatedItinerary = [...(activeTrip.itinerary || []), newItem];
    onUpdateTrip({
      ...activeTrip,
      itinerary: updatedItinerary,
    });

    triggerToast(`📅 Added "${card.name}" to trip itinerary!`);
    setShowActionOverlay(null);
    setScoutIndex((prev) => prev + 1);
  };

  // Saved Actions: Push to Saved Places
  const handleSaveForLater = (card: ScoutCard) => {
    const newItem: ItineraryItem = {
      id: `saved-${Date.now()}`,
      title: card.name,
      description: card.description,
      estimatedCost: card.estimatedCost || 15,
      visited: false,
      rating: card.rating,
      review: `Bookmarked on AI Scout (Curation Source: ${card.recommendedBy})`,
      lat: card.lat,
      lon: card.lon,
    };

    const updatedSaved = [...(activeTrip.savedSpots || []), newItem];
    onUpdateTrip({
      ...activeTrip,
      savedSpots: updatedSaved,
    });

    triggerToast(`📌 Bookmarked "${card.name}" to Saved Places!`);
    setShowActionOverlay(null);
    setScoutIndex((prev) => prev + 1);
  };

  // Transfer from Saved Library to Active Route
  const handleMigrateSavedToRoute = (item: ItineraryItem) => {
    const freshItineraryItem: ItineraryItem = {
      ...item,
      id: `itinerary-converted-${Date.now()}`,
      arrivalTime: '02:00 PM',
    };

    const updatedItinerary = [...(activeTrip.itinerary || []), freshItineraryItem];
    const updatedSaved = (activeTrip.savedSpots || []).filter((s) => s.id !== item.id);

    onUpdateTrip({
      ...activeTrip,
      itinerary: updatedItinerary,
      savedSpots: updatedSaved,
    });

    triggerToast(`✨ Migrated "${item.title}" to active route!`);
  };

  // Delete from Saved Library
  const handleDeleteSavedSpot = (itemId: string) => {
    const updatedSaved = (activeTrip.savedSpots || []).filter((s) => s.id !== itemId);
    onUpdateTrip({
      ...activeTrip,
      savedSpots: updatedSaved,
    });
    triggerToast('🗑️ Bookmark removed.');
  };

  const activeCard = scoutCards[scoutIndex];
  const allSwiped = scoutCards.length > 0 && scoutIndex >= scoutCards.length;

  return (
    <div className="space-y-4 p-4 pb-24 overflow-y-auto max-h-[calc(100vh-140px)] select-none relative">
      
      {/* 1. TOP COMMUNITY META TRACKS */}
      <div className="bg-[#5A5A40] p-3.5 rounded-2xl text-white shadow-sm text-left relative overflow-hidden flex items-center justify-between gap-3">
        <div className="space-y-1 max-w-[85%]">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono uppercase tracking-widest font-extrabold bg-white/15 px-1.5 py-0.5 rounded border border-white/10 text-amber-200">
              Nomo Scout
            </span>
            <span className="text-[8px] font-mono uppercase font-bold text-white/70">
              Within 20 km
            </span>
          </div>
          <h3 className="font-serif italic text-sm text-[#FAF8F5] font-extrabold leading-tight">
            Curated Local Discoveries in {activeTrip.destination}
          </h3>
          <p className="text-[10px] text-white/85 leading-relaxed font-sans">
            Swipe to match local recommendations and explore curated coffee houses, viewpoints, and neighborhood joints.
          </p>
        </div>
        <div className="shrink-0 bg-white/10 p-2 rounded-xl border border-white/10">
          <Compass className="w-5 h-5 text-amber-200" />
        </div>
      </div>

      {/* FLOAT TOAST MESSAGE */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-mono font-bold shadow-xl border border-stone-800 flex items-center gap-2 pointer-events-none"
          >
            <Sparkles className="w-4.5 h-4.5 text-amber-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE TINDER SCOUT EXPERIENCE */}
      <div className="bg-white p-5 rounded-3xl border border-[#F1EFE9] space-y-4 text-left shadow-xs flex flex-col items-stretch">
        
        {/* Step A: Selection list (Category question) */}
        {!selectedCategory && (
          <div className="space-y-4 py-4">
            <div className="text-center space-y-1">
              <span className="text-[8.5px] font-mono uppercase bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-full font-black">
                Phase 1: Your Vibe Check
              </span>
              <h3 className="text-base font-serif italic font-black text-[#5A5A40] pt-1">
                What are you looking to do next?
              </h3>
              <p className="text-[11px] text-[#8C857E] max-w-sm mx-auto leading-normal">
                Choose a vibe to generate card decks within <span className="font-mono font-bold">20km</span> sorted from nearest to farthest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleFetchScoutCards(interest.id)}
                  className="p-4 bg-[#FAF8F5]/80 hover:bg-[#5A5A40]/5 border border-stone-200/50 hover:border-[#5A5A40]/30 rounded-2xl transition-all cursor-pointer text-left hover:scale-[1.01] flex items-start gap-3"
                >
                  <span className="text-2xl mt-0.5" role="img" aria-label={interest.label}>
                    {interest.emoji}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-sans font-black text-stone-800 tracking-tight">
                      {interest.label}
                    </h4>
                    <p className="text-[9.5px] text-[#8C857E] leading-tight">
                      {interest.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step B: Deck Loading state */}
        {selectedCategory && loadingScout && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#5A5A40] animate-spin" />
            <p className="text-xs font-mono text-[#8C857E] uppercase tracking-wide">
              Curating recommended local spots...
            </p>
          </div>
        )}

        {/* Step C: Loaded Deck */}
        {selectedCategory && !loadingScout && (
          <div className="space-y-4">
            
            {/* Header controls to back out or refresh */}
            <div className="flex justify-between items-center bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F1EFE9]">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">
                  {INTERESTS.find(i => i.id === selectedCategory)?.emoji}
                </span>
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#5A5A40] uppercase">
                  {INTERESTS.find(i => i.id === selectedCategory)?.label} Deck
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-[9px] font-mono uppercase bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded-lg font-black transition-colors cursor-pointer"
              >
                ← Back to Categories
              </button>
            </div>

            {/* Active Card Pile Container */}
            <div className="relative w-full h-[340px] flex items-center justify-center overflow-visible">
              
              {/* Physical Stack Depth (Bumble / Tinder aesthetic) */}
              {activeCard && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  {scoutIndex + 1 < scoutCards.length && (
                    <div className="absolute w-[280px] sm:w-[300px] h-full bg-[#FAF8F5] border border-[#F1EFE9]/90 rounded-3xl opacity-60 scale-[0.97] translate-y-2 rotate-1 shadow-xs transition-all duration-300" />
                  )}
                  {scoutIndex + 2 < scoutCards.length && (
                    <div className="absolute w-[280px] sm:w-[300px] h-full bg-[#FAF8F5] border border-[#F1EFE9]/60 rounded-3xl opacity-30 scale-[0.94] translate-y-4 -rotate-1 shadow-3xs transition-all duration-300" />
                  )}
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {activeCard ? (
                  <SwipableCard
                    key={activeCard.id}
                    card={activeCard}
                    currency={activeTrip.currency}
                    onLike={handleLike}
                    onNope={handleNope}
                    onSelectDetail={setSelectedDetailCard}
                    swipeLeft={swipeLeft}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-[280px] sm:w-[300px] bg-[#FAF8F5]/80 border border-stone-200/50 p-6 rounded-3xl text-center space-y-3.5 z-0 flex flex-col justify-center items-center h-[300px]"
                  >
                    <span className="text-4xl text-stone-400">🍂</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-sans font-black text-stone-800">You've swiped all curated matches!</h4>
                      <p className="text-[10px] text-[#A8A29E] leading-normal max-w-[200px] mx-auto">
                        We're out of suggestions for this vibe. Back up to explore other directories or visit your bookmarked cards library below!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFetchScoutCards(selectedCategory || '')}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-[9px] font-mono tracking-wider font-extrabold uppercase transition-colors cursor-pointer"
                    >
                      🔄 Rescout Vibe
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons (Nope / Like) */}
            {activeCard && (
              <div className="flex justify-center items-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={handleNope}
                  className="w-12 h-12 rounded-full border border-stone-200 bg-white hover:bg-red-50 text-stone-400 hover:text-red-500 shadow-sm active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                  title="Swipe Left: Dislike"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
                
                <button
                  type="button"
                  onClick={() => handleLike(activeCard)}
                  className="w-12 h-12 rounded-full border border-[#5A5A40]/20 bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white shadow-sm active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                  title="Swipe Right: Save"
                >
                  <Heart className="w-5 h-5 stroke-[2.5] fill-current" />
                </button>
              </div>
            )}

            {/* Micro swipe tutoring text */}
            {activeCard && (
              <p className="text-center text-[8.5px] font-mono text-[#A8A29E] uppercase leading-none">
                Hint: Drag Left to Skip • Drag Right to Save
              </p>
            )}

          </div>
        )}

      </div>

      {/* DETAILED MODAL BOTTOM DRAWER */}
      <AnimatePresence>
        {selectedDetailCard && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 text-left">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-stone-100 flex flex-col justify-start max-h-[85vh] overflow-hidden"
            >
              {/* Image banner */}
              <div 
                className="relative h-48 w-full bg-stone-100 shrink-0 cursor-zoom-in group overflow-hidden"
                onClick={() => setActiveLightboxImg(selectedDetailCard.coverPhotoUrl || null)}
                title="View image gallery"
              >
                <img
                  src={selectedDetailCard.coverPhotoUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80"}
                  alt={selectedDetailCard.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white/0 group-hover:text-white/85 transition-all drop-shadow" />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDetailCard(null);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-colors shadow cursor-pointer z-15"
                >
                  <X className="w-4.5 h-4.5" />
                </button>

                {/* Star rating tag */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow border border-stone-200/50 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-mono text-xs font-bold text-stone-800">{selectedDetailCard.rating.toFixed(1)}</span>
                </div>

                {/* Recommended Tag */}
                <div className="absolute bottom-4 right-4 bg-[#5A5A40] text-white px-2.5 py-1 rounded-xl text-[9px] font-mono tracking-wider font-extrabold shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{selectedDetailCard.recommendedBy}</span>
                </div>
              </div>

              {/* Scrollable details view */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
                <div>
                  <span className="text-[9px] font-mono uppercase bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-full font-black">
                    {INTERESTS.find(i => i.id === selectedCategory)?.label || selectedDetailCard.category}
                  </span>
                  <h3 className="text-lg font-sans font-black text-stone-800 tracking-tight pt-1 leading-snug">
                    {selectedDetailCard.name}
                  </h3>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-[#A8A29E] font-bold">Curated Overview</span>
                  <p className="text-xs text-stone-600 font-serif italic leading-relaxed">
                    "{selectedDetailCard.description}"
                  </p>
                </div>

                {/* Distance Analytics Section */}
                <div className="bg-[#5A5A40]/5 p-3.5 rounded-2xl border border-[#5A5A40]/10 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono text-stone-500 uppercase leading-none block">Precise Location Info</span>
                    <span className="text-xs font-sans font-black text-[#5A5A40] pt-1 block">
                      📍 {selectedDetailCard.distance} km away from you
                    </span>
                    <p className="text-[9.5px] text-[#8C857E] leading-normal font-sans">
                      Located within safe boundaries in {activeTrip.destination}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const dest = selectedDetailCard.lat && selectedDetailCard.lon 
                        ? `${selectedDetailCard.lat},${selectedDetailCard.lon}` 
                        : `${selectedDetailCard.name}, ${activeTrip.destination}`;
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
                      window.open(url, '_blank');
                    }}
                    className="p-2 bg-white hover:bg-[#FAF8F5] text-blue-600 rounded-xl font-mono text-[9px] uppercase tracking-wider font-extrabold transition-all flex items-center gap-1 cursor-pointer shrink-0 border border-blue-100 shadow-3xs"
                    title="Get directions in Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                    <span>Navigate</span>
                  </button>
                </div>

                {/* Gallery of photos */}
                {selectedDetailCard.gallery && selectedDetailCard.gallery.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C857E] font-black block">Vibe Curation Gallery</span>
                      <span className="text-[8px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold animate-pulse">Click photo to expand</span>
                    </div>
                    <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-thin">
                      {selectedDetailCard.gallery.map((imgUrl, i) => (
                        <div 
                          key={i} 
                          onClick={() => setActiveLightboxImg(imgUrl)}
                          className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-stone-200/50 shadow-3xs hover:scale-105 transition-transform duration-150 cursor-pointer group"
                        >
                          <img
                            src={imgUrl}
                            alt={`${selectedDetailCard.name} view ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white/0 group-hover:text-white/85 transition-all drop-shadow" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5 Top Curated reviews / comments */}
                {selectedDetailCard.comments && selectedDetailCard.comments.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C857E] font-black">Top 5 Helpful Reviews</span>
                      <span className="text-[8px] font-mono text-stone-400">Social Voices</span>
                    </div>
                    <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                      {selectedDetailCard.comments.map((comm, idx) => (
                        <div key={idx} className="bg-stone-50/50 p-2.5 rounded-xl border border-stone-200/30 text-left space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-stone-200 text-[#5A5A40] flex items-center justify-center font-mono text-[8px] font-bold">
                                {comm.author.charAt(0)}
                              </span>
                              <span className="font-sans font-black text-stone-700">{comm.author}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[...Array(comm.rating)].map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-600 font-serif italic leading-relaxed pl-6">
                            "{comm.text}"
                          </p>
                          {comm.helpfulCount !== undefined && (
                            <div className="pl-6 text-[8px] font-mono text-stone-400">
                              <span>👍 {comm.helpfulCount} helpful votes</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action bar and close */}
              <div className="p-4 bg-[#FAF8F5] border-t border-stone-100 font-mono space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToItinerary(selectedDetailCard);
                      setSelectedDetailCard(null);
                    }}
                    className="py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-[9px] uppercase tracking-wider font-extrabold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    📅 Add to Route
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveForLater(selectedDetailCard);
                      setSelectedDetailCard(null);
                    }}
                    className="py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 rounded-xl text-[9px] uppercase tracking-wider font-extrabold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    📌 Bookmark
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailCard(null)}
                  className="w-full text-[8.5px] text-stone-400 hover:text-stone-600 font-black uppercase text-center cursor-pointer py-1 block"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY: WHERE TO SAVE MATCH DIALOG */}
      <AnimatePresence>
        {showActionOverlay && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 border border-stone-100 shadow-2xl space-y-4"
            >
              <div className="text-center space-y-1 bg-[#5A5A40]/5 p-3 rounded-2xl border border-[#5A5A40]/10">
                <span className="text-[20px]">📌</span>
                <h3 className="font-serif italic font-extrabold text-sm text-[#5A5A40] pt-1">
                  Keep This Discovery?
                </h3>
                <p className="text-[10px] text-[#8C857E] font-mono leading-tight uppercase font-black">
                  "{showActionOverlay.name}"
                </p>
              </div>

              <p className="text-[11px] text-[#8C857E] text-center leading-normal">
                Would you like to lock this spot directly onto your traveling route, or save it into your local bookmarked spots collection?
              </p>

              <div className="space-y-2 pt-1 font-mono">
                <button
                  type="button"
                  onClick={() => handleAddToItinerary(showActionOverlay)}
                  className="w-full py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl text-[9px] uppercase tracking-wider font-extrabold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  📅 Add to Itinerary Route
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveForLater(showActionOverlay)}
                  className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 rounded-xl text-[9px] uppercase tracking-wider font-extrabold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  📌 Save to Bookmarks
                </button>

                <button
                  type="button"
                  onClick={() => setShowActionOverlay(null)}
                  className="w-full py-2 text-stone-400 hover:text-stone-600 rounded-xl text-[8.5px] uppercase tracking-wider transition-colors text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. BOOKMARKED SAVED PLACES LIBRARY SECTION */}
      <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#F1EFE9] space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-2">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C857E] font-black">Bookmarks Library</span>
            <h4 className="font-serif italic text-sm font-bold text-[#3C3836]">Saved Places Log</h4>
          </div>
          <span className="font-mono text-[9px] text-[#A8A29E] bg-white px-2 py-0.5 rounded border border-[#F1EFE9]">
            {(activeTrip.savedSpots || []).length} Bookmarks
          </span>
        </div>

        {(activeTrip.savedSpots || []).length === 0 ? (
          <div className="text-center py-6 space-y-1 text-stone-400">
            <BookmarkPlaceholder />
            <h5 className="text-[10px] font-mono uppercase font-black text-[#A8A29E]">No Saved Places Bookmarked Yet</h5>
            <p className="text-[9.5px] text-[#A8A29E] max-w-[200px] mx-auto leading-normal">
              Swipe Right ❤️ on some cards in the AI Scout deck to register destinations in this library!
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {(activeTrip.savedSpots || []).map((spot) => (
              <div
                key={spot.id}
                className="bg-white p-3 rounded-2xl border border-stone-200/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-3xs"
              >
                <div className="space-y-0.5">
                  <h5 className="font-sans font-black text-stone-800 leading-tight pr-2">
                    {spot.title}
                  </h5>
                  <p className="text-[9.5px] text-[#8C857E] line-clamp-1 italic font-serif leading-none pt-0.5">
                    "{spot.description}"
                  </p>
                  <div className="flex flex-wrap gap-1 items-center pt-1.5">
                    <span className="text-[7.5px] font-mono bg-stone-100 text-stone-500 px-1 py-0.5 rounded leading-none uppercase font-bold">
                      {spot.review?.includes('Curation Source:') ? spot.review.split('Curation Source:')[1].trim().replace(')', '') : 'Nomo Curated'}
                    </span>
                    {spot.estimatedCost !== undefined && (
                      <span className="text-[7.5px] font-mono text-[#8C857E] leading-none uppercase font-bold ml-1">
                        Est: {spot.estimatedCost} {activeTrip.currency}
                      </span>
                    )}
                  </div>
                </div>

                {/* Left/Right actions aligned */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center font-mono">
                  {/* Open Directions directly in maps! */}
                  <button
                    type="button"
                    onClick={() => {
                      const dest = spot.lat && spot.lon 
                        ? `${spot.lat},${spot.lon}` 
                        : `${spot.title}, ${activeTrip.destination}`;
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
                      window.open(url, '_blank');
                    }}
                    className="p-1 px-1.5 bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-lg border border-blue-100/50 transition-all flex items-center gap-0.5 text-[8.5px] cursor-pointer"
                    title="Get directions in Google Maps"
                  >
                    <Navigation className="w-2.5 h-2.5" />
                    <span>Navigate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMigrateSavedToRoute(spot)}
                    className="p-1 px-1.5 bg-[#5A5A40]/10 hover:bg-[#5A5A40] text-[#5A5A40] hover:text-white rounded-lg border border-[#5A5A40]/15 transition-all flex items-center gap-0.5 text-[8.5px] cursor-pointer font-extrabold"
                    title="Add to current route"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Add Itinerary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSavedSpot(spot.id)}
                    className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. CLASSIC COMMUNITY POPULAR HISTORIC TIMELINE REVIEWS */}
      <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-[#F1EFE9] space-y-2.5 text-left">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C857E] font-extrabold block">Community Favorites</span>
          <h4 className="font-serif italic text-xs font-bold text-[#3C3836] mt-0.5 font-black">Top-Rated Active Community Tracks</h4>
        </div>

        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {communityReviews.slice(0, 3).map((spot, idx) => (
            <div 
              key={idx} 
              className="bg-white p-2.5 rounded-xl border border-stone-200/50 flex justify-between items-center text-xs hover:border-[#DDD0C5] transition-all"
            >
              <div>
                <h5 className="font-sans font-extrabold text-[#3C3836]">{spot.placeName}</h5>
                <p className="text-[9px] text-[#8C857E]">📍 {spot.location} • Spent: {spot.spentAmount} {spot.currency} • Active</p>
              </div>
              <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="font-mono text-[9px] font-bold text-amber-700">{spot.rating}.0</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PHOTO LIGHTBOX GALLERY VIEWER */}
      <AnimatePresence>
        {activeLightboxImg && selectedDetailCard && (() => {
          const allImages = [
            selectedDetailCard.coverPhotoUrl, 
            ...(selectedDetailCard.gallery || [])
          ].filter((url): url is string => !!url);
          const activeIndex = allImages.indexOf(activeLightboxImg);

          const handlePrev = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (allImages.length <= 1) return;
            if (activeIndex > 0) {
              setActiveLightboxImg(allImages[activeIndex - 1]);
            } else {
              setActiveLightboxImg(allImages[allImages.length - 1]);
            }
          };

          const handleNext = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (allImages.length <= 1) return;
            if (activeIndex < allImages.length - 1) {
              setActiveLightboxImg(allImages[activeIndex + 1]);
            } else {
              setActiveLightboxImg(allImages[0]);
            }
          };

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col justify-between items-center p-4 z-[9999] select-none text-left"
              onClick={() => setActiveLightboxImg(null)}
            >
              {/* Top Action Bar */}
              <div className="w-full max-w-4xl flex justify-between items-center py-2 text-white/90 shrink-0">
                <div className="text-left font-sans">
                  <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-black block">
                    {selectedDetailCard.name}
                  </span>
                  <h4 className="text-xs text-stone-300 font-bold">
                    Image {activeIndex !== -1 ? activeIndex + 1 : 1} of {allImages.length}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLightboxImg(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Photo Display */}
              <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center min-h-[40vh]">
                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 hover:scale-105 text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                <div 
                  className="relative max-w-full max-h-[60vh] sm:max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-stone-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={activeLightboxImg}
                    alt={`${selectedDetailCard.name} detailed view`}
                    className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 hover:scale-105 text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              <div 
                className="w-full max-w-4xl flex flex-col items-center gap-3 py-4 shrink-0 font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2.5 overflow-x-auto p-1 max-w-full scrollbar-thin scrollbar-thumb-white/20 justify-center">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLightboxImg(img)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border transition-all duration-150 hover:opacity-90 ${
                        img === activeLightboxImg 
                          ? 'border-amber-400 scale-105 ring-2 ring-amber-400/30' 
                          : 'border-white/20 opacity-60'
                      }`}
                    >
                      <img
                        src={img}
                        alt="thumbnail preview indicator"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>

                <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest text-center">
                  ← Tap outer screen or Click X to collapse →
                </p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}

// Custom helpers for SVG components to keep layout neat and clean
function BookmarkPlaceholder() {
  return (
    <svg className="w-8 h-8 text-stone-300 mx-auto stroke-current fill-none pb-1" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

// Helper block to avoid react key issues during animation transition cycles
interface AnPresenceHelperProps {
  children: React.ReactNode;
  card: ScoutCard | null;
  keyVal: number | string;
}

function AnPresenceHelper({ children, card, keyVal }: AnPresenceHelperProps) {
  return (
    <AnimatePresence mode="popLayout">
      <div key={card ? `act-${keyVal}` : 'empty-scout-st'}>
        {children}
      </div>
    </AnimatePresence>
  );
}
