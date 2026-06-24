/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Music, 
  Trash2, 
  Pencil,
  Check, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  BarChart2, 
  Coffee, 
  Smile, 
  HelpCircle, 
  Activity, 
  ArrowRight,
  RefreshCw,
  BookOpen,
  Eye,
  Camera,
  Heart,
  User,
  AlertCircle,
  Wallet,
  Share2,
  Home
} from 'lucide-react';
import { MOCK_TRIPS, STOCK_COVERS, EMOTIONAL_EMOJIS, INSTANT_HABITS, SEED_COMMUNITY_REVIEWS } from './mockData';
import { Trip, ExpenseEntry, ExpenseCategory, EmotionalTag, TravelPersonality, CommunityReview, PaymentMethod } from './types';
import ReactMarkdown from 'react-markdown';
import SignupScreen from './components/SignupScreen';
import OnboardingScreen from './components/OnboardingScreen';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import JournalTab from './components/JournalTab';
import LedgerTab from './components/LedgerTab';
import InsightsTab from './components/InsightsTab';
import ChatTab from './components/ChatTab';
import GooglePlacesSearch from './components/GooglePlacesSearch';
import MiniOSMMap from './components/MiniOSMMap';

// Get date strings list between startDate and endDate
function getDatesInRange(startDateStr: string, endDateStr: string): string[] {
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

// Sound synthesis output helper
function playNomoChords(moodName: string) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    let freqs = [261.63, 329.63, 392.00, 523.25]; // C major
    if (moodName === 'Joyful' || moodName === 'Guilt-free') {
      freqs = [293.66, 369.99, 440.00, 587.33]; // D major
    } else if (moodName === 'Indulgent' || moodName === 'Content') {
      freqs = [349.23, 440.00, 523.25, 698.46]; // F major 7
    } else if (moodName === 'Anxious' || moodName === 'Hesitant') {
      freqs = [293.66, 349.23, 440.00, 523.25]; // D minor susp
    } else if (moodName === 'Regretful') {
      freqs = [220.00, 261.63, 329.63, 392.00]; // A minor
    }

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.4 + idx * 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2 + idx * 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.6);
    });
  } catch (e) {
    console.warn('Audio Context creation blocked by browser ambient layout restriction.', e);
  }
}

// Calculate the detailed settlement among group members
interface Debt {
  from: string;
  to: string;
  amount: number;
}

function guessCurrencyForDestination(destination: string): string | null {
  const destLower = destination.toLowerCase();
  
  const maps: { [key: string]: string } = {
    'japan': 'JPY',
    'tokyo': 'JPY',
    'kyoto': 'JPY',
    'osaka': 'JPY',
    
    'france': 'EUR',
    'paris': 'EUR',
    'italy': 'EUR',
    'spain': 'EUR',
    'netherlands': 'EUR',
    'belgium': 'EUR',
    'austria': 'EUR',
    'greece': 'EUR',
    'germany': 'EUR',
    'ireland': 'EUR',
    'portugal': 'EUR',
    'finland': 'EUR',
    'slovakia': 'EUR',
    'slovenia': 'EUR',
    
    'united kingdom': 'GBP',
    'great britain': 'GBP',
    'london': 'GBP',
    'scotland': 'GBP',
    
    'thailand': 'THB',
    'bangkok': 'THB',
    'phuket': 'THB',
    'chiang mai': 'THB',
    
    'vietnam': 'VND',
    'hanoi': 'VND',
    'ho chi minh': 'VND',
    'da nang': 'VND',
    
    'indonesia': 'IDR',
    'bali': 'IDR',
    'jakarta': 'IDR',
    'ubud': 'IDR',
    'seminyak': 'IDR',
    
    'united states': 'USD',
    'usa': 'USD',
    'new york': 'USD',
    'california': 'USD',
    'washington': 'USD',
    
    'australia': 'AUD',
    'sydney': 'AUD',
    'melbourne': 'AUD',
    
    'canada': 'CAD',
    'toronto': 'CAD',
    'vancouver': 'CAD',
    
    'singapore': 'SGD',
    'malaysia': 'MYR',
    'kuala lumpur': 'MYR',
    'south korea': 'KRW',
    'seoul': 'KRW',
    'india': 'INR',
    'china': 'CNY',
    'hong kong': 'HKD',
    'switzerland': 'CHF',
    'united arab emirates': 'AED',
    'dubai': 'AED',
    'philippines': 'PHP',
    'taiwan': 'TWD',
    'new zealand': 'NZD',
    'brazil': 'BRL',
    'mexico': 'MXN',
    'south africa': 'ZAR',
    'turkey': 'TRY',
    'saudi arabia': 'SAR'
  };

  for (const [key, currency] of Object.entries(maps)) {
    if (destLower.includes(key)) {
      return currency;
    }
  }
  return null;
}

function getPresetCoordsForDest(dest: string): { lat: number; lon: number } {
  const d = (dest || '').toLowerCase();
  if (d.includes('tokyo')) return { lat: 35.6762, lon: 139.6503 };
  if (d.includes('kyoto')) return { lat: 35.0116, lon: 135.7681 };
  if (d.includes('paris')) return { lat: 48.8566, lon: 2.3522 };
  if (d.includes('bangkok')) return { lat: 13.7563, lon: 100.5018 };
  if (d.includes('bali') || d.includes('seminyak') || d.includes('ubud')) return { lat: -8.6853, lon: 115.1584 };
  return { lat: 35.6762, lon: 139.6503 }; // Standard fallback center
}

function getIdealBudgetForDuration(days: number, currency: string): number {
  const curr = (currency || 'USD').toUpperCase();
  const d = Math.max(1, days);
  if (curr === 'JPY') return d * 15000;
  if (curr === 'THB') return d * 2500;
  if (curr === 'EUR') return d * 120;
  if (curr === 'GBP') return d * 100;
  if (curr === 'IDR') return d * 1500000;
  return d * 150; // Custom USD / default units per day
}

function calculateDebts(trip: Trip): Debt[] {
  const balances: Record<string, number> = {};
  trip.members.forEach(m => { balances[m] = 0; });

  trip.expenseEntries.forEach(entry => {
    const paidBy = entry.paidBy;
    const splitWith = entry.splitWith || [];
    if (splitWith.length === 0) return;
    
    const share = entry.amount / splitWith.length;
    
    // Payer is credited the full cost
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += entry.amount;
    }
    
    // Each borrower is debited their share
    splitWith.forEach(member => {
      if (balances[member] !== undefined) {
        balances[member] -= share;
      }
    });
  });

  // Creditors possess positive balances, debtors have negative balances
  const creditors = Object.keys(balances)
    .filter(m => balances[m] > 0.1)
    .map(m => ({ name: m, amount: balances[m] }));
    
  const debtors = Object.keys(balances)
    .filter(m => balances[m] < -0.1)
    .map(m => ({ name: m, amount: -balances[m] }));

  const debts: Debt[] = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const payAmount = Math.min(creditor.amount, debtor.amount);
    debts.push({
      from: debtor.name,
      to: creditor.name,
      amount: Math.round(payAmount),
    });

    creditor.amount -= payAmount;
    debtor.amount -= payAmount;

    if (creditor.amount < 0.1) cIdx++;
    if (debtor.amount < 0.1) dIdx++;
  }

  return debts;
}

export default function App() {
  // User authentication and dynamic onboarding state
  const [user, setUser] = useState<{
    name: string;
    email: string;
    specialty: string;
    seedingMood: string;
    password?: string;
    profilePicture?: string;
  } | null>(() => {
    const saved = localStorage.getItem('nomo_user_v3');
    return saved ? JSON.parse(saved) : null;
  });

  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(() => {
    const onboardingDone = localStorage.getItem('nomo_onboarding_done_v3');
    return onboardingDone !== 'true';
  });

  // State
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('nomo_trips_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Trip[];
        return parsed;
      } catch (e) {
        return [];
      }
    }
    return []; // Return empty trip list for empty app experience
  });

  // Global list of registered payment methods / cards
  const [registeredCards, setRegisteredCards] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('nomo_registered_cards_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return []; // Start completely empty so user has to explicitly connect
  });

  // Save registered cards to local storage
  useEffect(() => {
    localStorage.setItem('nomo_registered_cards_v5', JSON.stringify(registeredCards));
  }, [registeredCards]);

  const [communityReviews, setCommunityReviews] = useState<CommunityReview[]>(() => {
    const saved = localStorage.getItem('nomo_community_reviews_v3');
    return saved ? JSON.parse(saved) : []; // Default to empty community reviews list
  });
  
  const [activeTripId, setActiveTripId] = useState<string>(() => {
    return trips[0]?.id || '';
  });

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || null;

  // Budget left and Next spot computations for persistent header/navbar
  const totalBudgetLeftComputed = (() => {
    if (!activeTrip) return 0;
    const spentAmount = activeTrip.expenseEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
    return activeTrip.budget - spentAmount;
  })();

  const nextItinerarySpotComputed = activeTrip?.itinerary?.find(item => !item.visited) || null;

  // Profile settings modal state
  const [showProfileSettingsModal, setShowProfileSettingsModal] = useState(false);

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };
  
  // Highlighted item for the Visual Polaroid Spotlight view
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  
  // Active selected expense id
  const activeExpense = activeTrip?.expenseEntries?.[spotlightIndex] || activeTrip?.expenseEntries?.[0] || null;

  // New trip page & list states
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [showTripListModal, setShowTripListModal] = useState(false);
  const [newTripForm, setNewTripForm] = useState({
    name: '',
    destination: '',
    description: '',
    budget: '',
    currency: 'PHP',
    membersString: user ? `${user.name}, Emma, Ryu` : 'Sophie, Emma, Ryu',
    startDate: '2026-06-01',
    endDate: '2026-06-08',
    accommodationType: 'hotel' as 'hotel' | 'airbnb' | 'apartment',
    accommodationName: '',
    latitude: null as number | null,
    longitude: null as number | null,
    selectedPaymentMethodIds: [] as string[],
  });

  const [recommendationPinpoint, setRecommendationPinpoint] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  // Destination auto-suggest states
  const [destPredictions, setDestPredictions] = useState<Array<{ id: string; title: string; description: string }>>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const destDropdownRef = useRef<HTMLDivElement>(null);

  // Parse and fetch OpenStreetMap Nominatim city/town/country predictions
  useEffect(() => {
    if (!newTripForm.destination || newTripForm.destination.trim().length < 2) {
      setDestPredictions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      // Avoid re-triggering query if value is exactly one of the known selections to keep it efficient
      const isExactMatch = destPredictions.some(p => `${p.title}, ${p.description}` === newTripForm.destination);
      if (isExactMatch) return;

      setDestLoading(true);
      fetch(
        `/api/places/search?q=${encodeURIComponent(newTripForm.destination)}&limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const parsed = data.map((item: any, index: number) => {
              const parts = item.display_name.split(',');
              const title = parts[0]?.trim() || 'Unknown';
              const description = parts.slice(1).map((p: any) => p.trim()).join(', ');
              return {
                id: `${item.place_id || 'osm'}-${index}`,
                title: title,
                description: description || 'Scenic location',
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon)
              };
            });
            setDestPredictions(parsed);
          } else {
            setDestPredictions([]);
          }
        })
        .catch((err) => {
          console.error("Error searching via geocoding proxy:", err);
          setDestPredictions([]);
        })
        .finally(() => {
          setDestLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [newTripForm.destination]);

  // Lodging stay place autocomplete suggest states
  const [accomPredictions, setAccomPredictions] = useState<Array<{ id: string; title: string; description: string; lat?: number; lon?: number }>>([]);
  const [accomLoading, setAccomLoading] = useState(false);
  const [accomFocused, setAccomFocused] = useState(false);

  // Parse and fetch OpenStreetMap Nominatim lodging predictions matching destination bias
  useEffect(() => {
    if (!newTripForm.accommodationName || newTripForm.accommodationName.trim().length < 2) {
      setAccomPredictions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const isExactMatch = accomPredictions.some(p => p.title === newTripForm.accommodationName || `${p.title}, ${p.description}` === newTripForm.accommodationName);
      if (isExactMatch) return;

      setAccomLoading(true);
      const query = newTripForm.destination 
        ? `${newTripForm.accommodationName}, ${newTripForm.destination.split(',')[0]}`
        : newTripForm.accommodationName;

      fetch(
        `/api/places/search?q=${encodeURIComponent(query)}&limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const parsed = data.map((item: any, index: number) => {
              const parts = item.display_name.split(',');
              const title = parts[0]?.trim() || 'Unknown Place';
              const description = parts.slice(1).map((p: any) => p.trim()).join(', ');
              return {
                id: `accom-${item.place_id || 'osm'}-${index}`,
                title: title,
                description: description || 'Local Lodge/Hotel',
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon)
              };
            });
            setAccomPredictions(parsed);
          } else {
            setAccomPredictions([]);
          }
        })
        .catch((err) => {
          console.error("Error searching lodging via proxy:", err);
          setAccomPredictions([]);
        })
        .finally(() => {
          setAccomLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [newTripForm.accommodationName, newTripForm.destination]);

  // Auto-detect currency when destination changes
  useEffect(() => {
    if (!newTripForm.destination) return;
    const detected = guessCurrencyForDestination(newTripForm.destination);
    if (detected) {
      setNewTripForm(prev => ({ ...prev, currency: detected }));
    }
  }, [newTripForm.destination]);

  // Handle clicking outside destination predictions container popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (destDropdownRef.current && !destDropdownRef.current.contains(event.target as Node)) {
        setDestFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newTripStep, setNewTripStep] = useState(1);
  const [plannerDayIndex, setPlannerDayIndex] = useState(0);
  const [initialItinerary, setInitialItinerary] = useState<Array<{ id: string; title: string; description: string; estimatedCost: number; arrivalTime?: string; visitDate?: string; lat?: number; lon?: number }>>([]);
  const [suggestedSpots, setSuggestedSpots] = useState<Array<{ title: string; description: string; estimatedCost: number; lat?: number; lon?: number }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [itineraryForm, setItineraryForm] = useState<{ title: string; description: string; estimatedCost: string; arrivalTime: string; lat?: number; lon?: number }>({ title: '', description: '', estimatedCost: '', arrivalTime: '' });
  const [showOptionalItineraryFields, setShowOptionalItineraryFields] = useState(false);

  const [editingItineraryId, setEditingItineraryId] = useState<string | null>(null);
  const [editingItineraryForm, setEditingItineraryForm] = useState<{ title: string; description: string; estimatedCost: string; arrivalTime: string; visitDate: string }>({ title: '', description: '', estimatedCost: '', arrivalTime: '', visitDate: '' });

  // New expense state
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [expenseStep, setExpenseStep] = useState(1);
  const [newExpenseForm, setNewExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Cafe' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    emotionalTag: 'Joyful' as EmotionalTag,
    selectedHabits: [] as string[],
    note: '',
    song: '',
    artist: '',
    paidBy: '',
    splitWith: [] as string[],
    photoCover: '',
  });

  // AI Insights states
  const [personality, setPersonality] = useState<TravelPersonality | null>(null);
  const [analyzingPersonality, setAnalyzingPersonality] = useState(false);
  const [recapText, setRecapText] = useState<{title: string; text: string} | null>(null);
  const [generatingRecap, setGeneratingRecap] = useState(false);

  // Chat window state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'model'; content: string}>>([
    { role: 'model', content: "Hey! I'm Nomo, your soulful companion. 🎋 Select a workspace, play some city soundtracks, or ask me how to enjoy your travels guilt-free! How is your current nomad spark?" }
  ]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Visual/Audio extras
  const [isPlayingVinyl, setIsPlayingVinyl] = useState(false);
  const [vinylDegrees, setVinylDegrees] = useState(0);
  const [activeTab, setActiveTab] = useState<'journal' | 'ledger' | 'insights' | 'chat'>('journal');

  // Feature walk-through tour state (only triggers first time)
  const [tourStep, setTourStep] = useState<number | null>(() => {
    const done = localStorage.getItem('nomo_feature_tour_done_v3');
    const onboardingDone = localStorage.getItem('nomo_onboarding_done_v3') === 'true';
    const userExists = localStorage.getItem('nomo_user_v3') !== null;
    return (userExists && onboardingDone && done !== 'true') ? 1 : null;
  });

  // Automatically switch active tab during the walk-through tour
  useEffect(() => {
    if (tourStep === 1) {
      setActiveTab('journal');
    } else if (tourStep === 2) {
      setActiveTab('ledger');
    } else if (tourStep === 3) {
      setActiveTab('insights');
    } else if (tourStep === 4) {
      setActiveTab('chat');
    }
  }, [tourStep]);

  // Save trips to local storage
  useEffect(() => {
    localStorage.setItem('nomo_trips_v3', JSON.stringify(trips));
  }, [trips]);

  // Save community reviews
  useEffect(() => {
    localStorage.setItem('nomo_community_reviews_v3', JSON.stringify(communityReviews));
  }, [communityReviews]);

  // Adjust spotlightIndex whenever activeTrip changes
  useEffect(() => {
    setSpotlightIndex(0);
    setPersonality(null);
    setRecapText(null);
  }, [activeTripId]);

  // Handle Vinyl rotation animation when playing
  useEffect(() => {
    let interval: any;
    if (isPlayingVinyl) {
      interval = setInterval(() => {
        setVinylDegrees(prev => (prev + 3) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlayingVinyl]);

  // Prepopulate standard payer details for new expenses
  useEffect(() => {
    if (activeTrip) {
      setNewExpenseForm(prev => ({
        ...prev,
        paidBy: activeTrip.members[0] || user?.name || 'Sophie',
        splitWith: activeTrip.members,
      }));
    }
  }, [activeTrip, showNewExpenseModal, user]);

  // Play synthetic tone on changing highlighted expense or mood
  const handleSpotlightChange = (index: number) => {
    if (activeTrip?.expenseEntries?.[index]) {
      setSpotlightIndex(index);
      const entry = activeTrip.expenseEntries[index];
      playNomoChords(entry.emotionalTag);
    }
  };

  // Create Trip
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripForm.name || !newTripForm.destination) return;

    const members = newTripForm.membersString
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: newTripForm.name,
      destination: newTripForm.destination,
      description: newTripForm.description || `Adventures in ${newTripForm.destination}`,
      coverImage: STOCK_COVERS[Math.floor(Math.random() * STOCK_COVERS.length)],
      budget: Number(newTripForm.budget) || 1000,
      currency: newTripForm.currency.toUpperCase(),
      startDate: newTripForm.startDate,
      endDate: newTripForm.endDate,
      accommodation: newTripForm.accommodationType,
      accommodationName: newTripForm.accommodationName || undefined,
      latitude: newTripForm.latitude || undefined,
      longitude: newTripForm.longitude || undefined,
      members: members.length > 0 ? members : [user?.name || 'Sophie'],
      expenseEntries: [],
      itinerary: initialItinerary.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        estimatedCost: item.estimatedCost,
        arrivalTime: item.arrivalTime,
        visitDate: item.visitDate,
        visited: false,
        lat: item.lat,
        lon: item.lon
      })),
      paymentMethods: newTripForm.selectedPaymentMethodIds.length > 0
        ? registeredCards.filter(rc => newTripForm.selectedPaymentMethodIds.includes(rc.id))
        : registeredCards
    };

    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
    setIsCreatingTrip(false);
    setNewTripStep(1);
    setPlannerDayIndex(0);
    setInitialItinerary([]);
    setSuggestedSpots([]);
    // Reset form
    setNewTripForm({
      name: '',
      destination: '',
      description: '',
      budget: '',
      currency: 'PHP',
      membersString: user ? `${user.name}, Emma, Ryu` : 'Sophie, Emma, Ryu',
      startDate: '2026-06-01',
      endDate: '2026-06-08',
      accommodationType: 'hotel' as 'hotel' | 'airbnb' | 'apartment',
      accommodationName: '',
      latitude: null as number | null,
      longitude: null as number | null,
      selectedPaymentMethodIds: [] as string[],
    });
  };

  // Fetch AI suggested itinerary spots
  const handleFetchItinerarySuggestions = async (forceRefresh = false) => {
    if (!newTripForm.destination) return;
    setLoadingSuggestions(true);
    try {
      const nextRefreshCount = forceRefresh ? refreshCount + 1 : refreshCount;
      if (forceRefresh) {
        setRefreshCount(nextRefreshCount);
      }

      // Determine center coordinates and reference pinpoints
      const centerLat = recommendationPinpoint?.lat ?? newTripForm.latitude;
      const centerLon = recommendationPinpoint?.lon ?? newTripForm.longitude;
      const pinpointName = recommendationPinpoint?.name ?? newTripForm.accommodationName ?? newTripForm.destination;

      // Extract existing titles to exclude
      const addedSpots = initialItinerary.map(item => item.title);

      const response = await fetch('/api/gemini/suggest-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: newTripForm.destination,
          budget: newTripForm.budget,
          currency: newTripForm.currency,
          lat: centerLat,
          lon: centerLon,
          pinpointName: pinpointName,
          accommodationType: newTripForm.accommodationType,
          accommodationName: newTripForm.accommodationName,
          addedSpots: addedSpots,
          refreshCount: nextRefreshCount
        })
      });
      const data = await response.json();
      if (data && data.suggestions) {
        setSuggestedSpots(data.suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddSuggestedSpot = (spot: { title: string; description: string; estimatedCost: number; lat?: number; lon?: number }) => {
    const datesList = getDatesInRange(newTripForm.startDate, newTripForm.endDate);
    const currentDateStr = datesList[plannerDayIndex] || newTripForm.startDate;
    const newItem = {
      id: `itinerary-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: spot.title,
      description: spot.description,
      estimatedCost: spot.estimatedCost,
      arrivalTime: '11:00 AM',
      visitDate: currentDateStr,
      lat: spot.lat,
      lon: spot.lon
    };
    setInitialItinerary(prev => [...prev, newItem]);
    setSuggestedSpots(prev => prev.filter(s => s.title !== spot.title));

    // After selection, update the selected recommended spot as the new map & suggestion pinpoint!
    if (spot.lat && spot.lon) {
      setRecommendationPinpoint({
        name: spot.title,
        lat: spot.lat,
        lon: spot.lon
      });
    }
  };

  const handleAddManualSpot = () => {
    if (!itineraryForm.title) return;
    const datesList = getDatesInRange(newTripForm.startDate, newTripForm.endDate);
    const currentDateStr = datesList[plannerDayIndex] || newTripForm.startDate;
    const newItem = {
      id: `itinerary-${Date.now()}`,
      title: itineraryForm.title,
      description: itineraryForm.description,
      estimatedCost: Number(itineraryForm.estimatedCost) || 0,
      arrivalTime: itineraryForm.arrivalTime || undefined,
      visitDate: currentDateStr,
      lat: itineraryForm.lat,
      lon: itineraryForm.lon
    };
    setInitialItinerary(prev => [...prev, newItem]);
    setItineraryForm({ title: '', description: '', estimatedCost: '', arrivalTime: '', lat: undefined, lon: undefined });
    setShowOptionalItineraryFields(false);
  };

  // Create Expense Entry
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseForm.title || !newExpenseForm.amount) return;

    const entry: ExpenseEntry = {
      id: `exp-${Date.now()}`,
      title: newExpenseForm.title,
      amount: Number(newExpenseForm.amount) || 0,
      category: newExpenseForm.category,
      date: newExpenseForm.date,
      emotionalTag: newExpenseForm.emotionalTag,
      habits: newExpenseForm.selectedHabits,
      soundtrack: newExpenseForm.song ? {
        song: newExpenseForm.song,
        artist: newExpenseForm.artist || 'Ambient',
      } : null,
      note: newExpenseForm.note,
      photoCover: newExpenseForm.photoCover || STOCK_COVERS[Math.floor(Math.random() * STOCK_COVERS.length)],
      paidBy: newExpenseForm.paidBy,
      splitWith: newExpenseForm.splitWith,
    };

    setTrips(prev => prev.map(t => {
      if (activeTrip && t.id === activeTrip.id) {
        return {
          ...t,
          expenseEntries: [entry, ...t.expenseEntries]
        };
      }
      return t;
    }));

    // Reset Form
    setNewExpenseForm({
      title: '',
      amount: '',
      category: 'Cafe',
      date: new Date().toISOString().split('T')[0],
      emotionalTag: 'Joyful',
      selectedHabits: [],
      note: '',
      song: '',
      artist: '',
      paidBy: activeTrip?.members[0] || user?.name || 'Sophie',
      splitWith: activeTrip?.members || [],
      photoCover: '',
    });

    setExpenseStep(1);
    setShowNewExpenseModal(false);
    setSpotlightIndex(0);
    playNomoChords(entry.emotionalTag);
  };

  // Delete Expense Entry
  const handleDeleteExpense = (id: string) => {
    setTrips(prev => prev.map(t => {
      if (activeTrip && t.id === activeTrip.id) {
        const filtered = t.expenseEntries.filter(e => e.id !== id);
        return {
          ...t,
          expenseEntries: filtered
        };
      }
      return t;
    }));
    setSpotlightIndex(0);
  };

  // Call Gemini for Persona Analysis
  const requestPersonalityInsight = async () => {
    setAnalyzingPersonality(true);
    setPersonality(null);
    try {
      const response = await fetch('/api/gemini/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip: activeTrip }),
      });
      const data = await response.json();
      setPersonality(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingPersonality(false);
    }
  };

  // Call Gemini for Scrapbook Recap Story
  const requestDiaryRecap = async () => {
    setGeneratingRecap(true);
    setRecapText(null);
    try {
      const response = await fetch('/api/gemini/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip: activeTrip }),
      });
      const data = await response.json();
      setRecapText({
        title: data.title || `The Story of ${activeTrip.name}`,
        text: data.recapMarkdown,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingRecap(false);
    }
  };

  // Call Gemini Chat Companion
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuery.trim() || sendingChat) return;

    const userMsg = currentQuery;
    setCurrentQuery('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSendingChat(true);

    try {
      const updatedHistory = [...chatMessages, { role: 'user', content: userMsg }];
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: updatedHistory,
          trip: activeTrip,
        }),
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'model', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev, 
        { role: 'model', content: "My thoughts are drifting currently... Let's retry in a second!" }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  // Statistics calculation for the active selected trip
  const totalSpent = activeTrip?.expenseEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const budgetUtilization = activeTrip ? Math.round((totalSpent / activeTrip.budget) * 100) : 0;
  
  // Aggregate Emotional Distribution
  const emotionCounts: Record<string, number> = {};
  activeTrip?.expenseEntries?.forEach(e => {
    emotionCounts[e.emotionalTag] = (emotionCounts[e.emotionalTag] || 0) + 1;
  });
  const maxEmotionCount = Math.max(...Object.values(emotionCounts), 1);

  // Aggregate Habit Streaks
  const habitCounts: Record<string, number> = {};
  activeTrip?.expenseEntries?.forEach(e => {
    e.habits.forEach(h => {
      habitCounts[h] = (habitCounts[h] || 0) + 1;
    });
  });
  const topHabits = Object.entries(habitCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);

  // Calculate Debts Settling
  const activeDebts = activeTrip ? calculateDebts(activeTrip) : [];

  if (!user) {
    return (
      <SignupScreen 
        onSignupComplete={(userData, isNewUser) => {
          setUser(userData);
          const onboardingDone = localStorage.getItem('nomo_onboarding_done_v3') === 'true';
          if (!isNewUser && onboardingDone) {
            setIsOnboardingActive(false);
          } else {
            setIsOnboardingActive(true);
          }
        }}
        onSkipToDemo={() => {
          const demoUser = {
            name: 'Sophie',
            email: 'sophie@nomad.com',
            specialty: 'Remote Creative',
            seedingMood: 'Joyful',
            password: 'coffee2026',
            profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
          };
          setUser(demoUser);
          localStorage.setItem('nomo_user_v3', JSON.stringify(demoUser));
          setIsOnboardingActive(false);
          localStorage.setItem('nomo_onboarding_done_v3', 'true');
          setTourStep(1);
        }}
      />
    );
  }

  if (isOnboardingActive) {
    return (
      <OnboardingScreen 
        userName={user.name}
        userSpecialty={user.specialty}
        onOnboardingComplete={() => {
          setIsOnboardingActive(false);
          localStorage.setItem('nomo_onboarding_done_v3', 'true');
          setTourStep(1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-[#3C3836] font-sans antialiased flex flex-col justify-center items-center py-0 sm:py-8 overflow-hidden select-none relative">
      
      {/* Background aesthetics for desktop */}
      <div className="absolute top-8 left-12 hidden xl:flex flex-col text-left">
        <h1 className="text-4xl font-serif italic text-[#5A5A40] tracking-tight font-bold">nomo.</h1>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#A8A29E] font-bold mt-1">Aesthetic Solitary Travel Companion</p>
        <div className="mt-6 bg-white p-4 rounded-2xl border border-[#FAF8F5] max-w-[240px] shadow-sm text-[10px] space-y-2">
          <p className="font-serif italic text-stone-700">"Wander slowly. Trace café lattes, subway trains, or vintage bookstore purchases alongside your active mood flow spectrum."</p>
          <p className="font-mono text-stone-400 font-bold">Designed mobile-first. Interactive WebAudio synth is responsive.</p>
        </div>
      </div>

      {/* Main simulated phone containment chassis */}
      <div className="relative w-full max-w-[420px] min-h-screen sm:min-h-[810px] sm:h-[810px] bg-white sm:rounded-[44px] sm:shadow-2xl sm:border-[10px] sm:border-[#3C3836] flex flex-col justify-between overflow-hidden">
        
        {/* Dynamic Island camera punch hole inside simulated phone chassis */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#3C3836] rounded-b-2xl z-50 items-center justify-center">
          <div className="w-10 h-0.5 bg-[#1C1B19] rounded-full" />
          <div className="w-1.5 h-1.5 bg-[#151619] rounded-full ml-3" />
        </div>

        {/* Small spacer for top notches */}
        <div className="h-4 sm:h-6 bg-white shrink-0" />

        {/* Top Header Controls bar */}
        {!isCreatingTrip && (
          <header className="px-4 py-2 border-b border-[#F1EFE9] bg-white shrink-0 flex flex-col gap-1 z-10 animate-fade-in select-none">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-serif italic text-[#5A5A40] font-black">nomo.</h2>
              
              <div className="flex items-center gap-1.5 shrink-0">
                {activeTrip && (
                  <>
                    {/* Share Button representing the 'Share Itinerary' enhancement */}
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="p-1 px-1.5 rounded-lg hover:bg-stone-50 text-[#5A5A40] hover:text-[#4a4a34] active:scale-95 transition-all shrink-0 border border-transparent hover:border-stone-100 flex items-center gap-1 text-[9px] font-mono tracking-tight font-bold"
                      title="Share and dynamic sync connected itinerary code"
                    >
                      <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Sync</span>
                    </button>

                    {/* Delete Current Journey Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = activeTrip?.id;
                        if (!targetId) return;
                        if (confirm(`Do you really want to delete your current journey "${activeTrip.name}"? This removes all local checked-in spots and ledger receipts.`)) {
                          const index = trips.findIndex(curr => curr.id === targetId);
                          const filtered = trips.filter(curr => curr.id !== targetId);
                          setTrips(filtered);
                          if (filtered.length === 0) {
                            setActiveTripId('');
                            setIsCreatingTrip(true);
                          } else {
                            const fallbackIndex = index === 0 ? 0 : index - 1;
                            setActiveTripId(filtered[fallbackIndex]?.id || filtered[0]?.id || '');
                          }
                        }
                      }}
                      className="p-1 px-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 active:scale-95 transition-all shrink-0 border border-transparent cursor-pointer"
                      title="Delete current journey"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {/* User profile bubble */}
                {user && (
                  <button 
                    type="button"
                    onClick={() => setShowProfileSettingsModal(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-full border border-[#FAF8F5] bg-[#5A5A40] text-white text-[10px] font-bold font-serif uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden"
                    title="View card profile"
                  >
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span className="only:block hidden">{user.name[0]}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Premium, horizontal scrollable tab list of journeys */}
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 border-t border-[#F8F6F2]">
              <span className="text-[8px] font-mono text-stone-400 uppercase font-bold tracking-wider select-none shrink-0">Bridges:</span>
              {trips.map(curr => (
                <button
                  key={curr.id}
                  type="button"
                  onClick={() => setActiveTripId(curr.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight transition-all shrink-0 ${
                    curr.id === activeTripId
                      ? 'bg-[#5A5A40] text-white shadow-3xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-[#5A5A40]'
                  }`}
                >
                  🚀 {curr.name}
                </button>
              ))}
              <button 
                type="button"
                onClick={() => {
                  setNewTripStep(1);
                  setIsCreatingTrip(true);
                }}
                className="h-5 px-2 rounded-full bg-stone-50 hover:bg-stone-100 border border-dashed border-stone-300 text-stone-500 text-[8.5px] uppercase font-mono font-bold flex items-center gap-0.5 transition-colors shrink-0 active:scale-95"
                title="Assemble brand new voyage"
              >
                + New
              </button>
            </div>
          </header>
        )}

        {/* PERSISTENT STATUS BAR: ACTIVE ITINERARY & BUDGET LEFT */}
        {activeTrip && !isCreatingTrip && (
          <div className="bg-[#FAF8F5] border-b border-[#F1EFE9] px-4 py-2 flex items-center justify-between gap-3 text-xs select-none animate-fade-in">
            {/* Itinerary progress / Next Spot */}
            <div className="flex items-center gap-1.5 min-w-0 animate-fade-in">
              <span className="text-[12px] leading-none shrink-0" title="Next Destination">📍</span>
              <div className="min-w-0 text-left">
                <span className="text-[7.5px] font-mono uppercase text-[#8C857E] block leading-none font-bold tracking-wider">NEXT ITINERARY</span>
                <span className="text-[10px] font-sans font-black text-[#5A5A40] truncate block max-w-[155px] sm:max-w-[190px]" title={nextItinerarySpotComputed ? nextItinerarySpotComputed.title : "No upcoming spots"}>
                  {nextItinerarySpotComputed ? nextItinerarySpotComputed.title : 'All Clear / Finished ✓'}
                </span>
              </div>
            </div>

            {/* Budget status */}
            <div className="flex items-center gap-1.5 text-right shrink-0">
              <div className="text-right">
                <span className="text-[7.5px] font-mono uppercase text-[#8C857E] block leading-none font-bold tracking-wider">BUDGET LEFT</span>
                <span className={`text-[10px] font-mono font-black ${totalBudgetLeftComputed < 0 ? 'text-red-500 font-bold' : 'text-[#3C3836]'}`}>
                  {totalBudgetLeftComputed.toLocaleString()} {activeTrip.currency}
                </span>
              </div>
              <span className="text-[11px] leading-none shrink-0 animate-pulse">
                {totalBudgetLeftComputed < 0 ? '⚠️' : '💼'}
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-hidden relative bg-[#FAF9F7] flex flex-col">
          {isCreatingTrip ? (
            <div className="absolute inset-0 bg-white z-40 flex flex-col h-full animate-fade-in divide-y divide-stone-100 overflow-y-auto pb-4">
              {/* Header */}
              <div className="p-4 bg-white flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[8px] font-mono uppercase bg-neutral-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                    Step {newTripStep} of 3
                  </span>
                  <h3 className="font-serif italic text-base text-[#5A5A40] font-black mt-0.5">
                    {newTripStep === 1 && "Choose Where and When"}
                    {newTripStep === 2 && "Set Your Budget"}
                    {newTripStep === 3 && "Add Places to Plan"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingTrip(false);
                    setNewTripStep(1);
                    setInitialItinerary([]);
                    setSuggestedSpots([]);
                  }}
                  className="text-[9px] font-mono uppercase bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg text-stone-600 font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Progress Indicators */}
              <div className="flex items-center justify-between px-6 py-3 bg-stone-50 select-none shrink-0 text-left border-y border-stone-100">
                <button
                  type="button"
                  onClick={() => setNewTripStep(1)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${newTripStep >= 1 ? 'bg-[#5A5A40] text-white' : 'bg-stone-200 text-stone-500'}`}>1</span>
                  <span className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${newTripStep === 1 ? 'text-[#5A5A40] font-black' : 'text-stone-400'}`}>Dates</span>
                </button>
                <div className="h-[1px] bg-stone-200 flex-1 mx-2"></div>
                <button
                  type="button"
                  disabled={!newTripForm.name || !newTripForm.destination}
                  onClick={() => setNewTripStep(2)}
                  className="flex items-center gap-1.5 focus:outline-none disabled:opacity-55"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${newTripStep >= 2 ? 'bg-[#5A5A40] text-white' : 'bg-stone-200 text-stone-500'}`}>2</span>
                  <span className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${newTripStep === 2 ? 'text-[#5A5A40] font-black' : 'text-stone-400'}`}>Budget</span>
                </button>
                <div className="h-[1px] bg-stone-200 flex-1 mx-2"></div>
                <button
                  type="button"
                  disabled={!newTripForm.name || !newTripForm.destination || !newTripForm.budget || !newTripForm.currency}
                  onClick={() => setNewTripStep(3)}
                  className="flex items-center gap-1.5 focus:outline-none disabled:opacity-55"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${newTripStep >= 3 ? 'bg-[#5A5A40] text-white' : 'bg-stone-200 text-stone-500'}`}>3</span>
                  <span className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${newTripStep === 3 ? 'text-[#5A5A40] font-black' : 'text-stone-400'}`}>Places</span>
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-5 space-y-4 text-left overflow-y-auto">
                
                {/* STEP 1 */}
                {newTripStep === 1 && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div>
                      <label className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">Trip Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kyoto Cherry Blossom Run"
                        value={newTripForm.name}
                        onChange={(e) => setNewTripForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                      />
                    </div>

                    <div ref={destDropdownRef} className="relative">
                      <label className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">Where are you going?</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Search city, town, province, or country..."
                          value={newTripForm.destination}
                          onFocus={() => setDestFocused(true)}
                          onChange={(e) => {
                            setNewTripForm(prev => ({ ...prev, destination: e.target.value }));
                            setDestFocused(true);
                          }}
                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none pr-8 font-sans"
                        />
                        {destLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-[#5A5A40] rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Airbnb Style Suggestions Dropdown */}
                      {destFocused && destPredictions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-250 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-stone-50 p-1">
                          <div className="px-2.5 py-1.5 text-[8.5px] font-mono text-stone-400 uppercase tracking-widest bg-[#FAF9F5]/80 rounded-lg mb-1 font-bold">
                            🗺️ Destination Results:
                          </div>
                          {destPredictions.map((p: any) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setNewTripForm(prev => ({
                                  ...prev,
                                  destination: `${p.title}, ${p.description}`,
                                  name: prev.name ? prev.name : `${p.title} Nomad Scout`,
                                  latitude: p.lat || null,
                                  longitude: p.lon || null
                                }));
                                setDestPredictions([]);
                                setDestFocused(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-[#FAF8F5] transition-all flex gap-3 items-start text-xs rounded-xl"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-extrabold text-stone-850 font-sans truncate leading-tight text-left">{p.title}</p>
                                <p className="text-[9.5px] text-[#8C857E] truncate mt-0.5 leading-normal text-left">{p.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-1.5 mt-1.5 items-center">
                        <span className="text-[8px] font-mono text-stone-400 uppercase font-bold">Presets:</span>
                        {['Tokyo', 'Kyoto', 'Paris', 'Bangkok'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setNewTripForm(prev => ({
                                  ...prev,
                                  destination: `${p}, Global`,
                                  name: prev.name ? prev.name : `${p} Nomad Scout`
                              }));
                              setDestPredictions([]);
                              setDestFocused(false);
                            }}
                            className="text-[8px] font-mono bg-stone-100 hover:bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded animate-none"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">Start Date</label>
                        <input
                          type="date"
                          value={newTripForm.startDate}
                          onChange={(e) => setNewTripForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg p-1.5 text-xs focus:outline-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">End Date</label>
                        <input
                          type="date"
                          value={newTripForm.endDate}
                          onChange={(e) => setNewTripForm(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg p-1.5 text-xs focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Quick duration presets representing Clever and Intuitive dates logic */}
                    <div className="mt-1">
                      <span className="text-[8px] font-mono text-stone-400 uppercase font-black tracking-wide block mb-1">Quick days:</span>
                      <div className="flex gap-1.5">
                        {[3, 5, 7, 14].map((days) => {
                          return (
                            <button
                              key={days}
                              type="button"
                              onClick={() => {
                                const startStr = newTripForm.startDate || new Date().toISOString().split('T')[0];
                                const startD = new Date(startStr);
                                const endD = new Date(startD.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
                                const endStr = endD.toISOString().split('T')[0];
                                
                                // Detect preset coordinates & suggest ideal budget
                                const presetCoords = getPresetCoordsForDest(newTripForm.destination);
                                const suggestedBudget = getIdealBudgetForDuration(days, newTripForm.currency);

                                setNewTripForm(prev => ({
                                  ...prev,
                                  startDate: startStr,
                                  endDate: endStr,
                                  latitude: prev.latitude || presetCoords.lat,
                                  longitude: prev.longitude || presetCoords.lon,
                                  budget: suggestedBudget.toString()
                                }));
                              }}
                              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] py-1 rounded-lg border border-stone-200 transition-all font-mono font-bold active:scale-95 text-center"
                            >
                              {days} Days
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!newTripForm.name || !newTripForm.destination}
                      onClick={() => {
                        // Ensure coordinates fallback exist on step proceed
                        if (!newTripForm.latitude || !newTripForm.longitude) {
                          const preset = getPresetCoordsForDest(newTripForm.destination);
                          setNewTripForm(prev => ({
                            ...prev,
                            latitude: preset.lat,
                            longitude: preset.lon
                          }));
                        }
                        setNewTripStep(2);
                      }}
                      className="w-full mt-2 py-2.5 bg-[#5A5A40] disabled:opacity-50 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to Budget</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                )}

                {/* STEP 2 */}
                {newTripStep === 2 && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">Total budget limit</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 350000"
                          value={newTripForm.budget}
                          onChange={(e) => setNewTripForm(prev => ({ ...prev, budget: e.target.value }))}
                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">Currency</label>
                        <input
                          type="text"
                          required
                          placeholder="JPY"
                          value={newTripForm.currency}
                          onChange={(e) => setNewTripForm(prev => ({ ...prev, currency: e.target.value }))}
                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick currency bubbles */}
                    <div className="flex gap-1.5 items-center">
                      <span className="text-[8px] font-mono text-stone-400 uppercase">Frequent:</span>
                      {['USD', 'EUR', 'JPY', 'THB', 'VND'].map(cur => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => setNewTripForm(prev => ({ ...prev, currency: cur }))}
                          className={`text-[8px] font-mono px-2 py-0.5 rounded-md transition-all ${
                            newTripForm.currency === cur
                              ? 'bg-[#5A5A40] text-white'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                          }`}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Accommodation stay picker */}
                    <div className="space-y-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
                      <div>
                        <label className="text-[9px] font-mono uppercase text-[#5A5A40] block mb-1 font-extrabold">🏡 Where are you staying?</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['hotel', 'airbnb', 'apartment'] as const).map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNewTripForm(prev => ({ ...prev, accommodationType: type }))}
                              className={`py-1 rounded-lg text-[9px] uppercase font-mono font-bold transition-all border ${
                                newTripForm.accommodationType === type
                                  ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                       <div className="relative">
                        <label className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">Hotel or place name</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. Kyoto Boutique Hotel, Shijo-Omiya"
                            value={newTripForm.accommodationName}
                            onFocus={() => setAccomFocused(true)}
                            onChange={(e) => {
                              setNewTripForm(prev => ({ ...prev, accommodationName: e.target.value }));
                              setAccomFocused(true);
                            }}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2.5 text-xs py-1.5 focus:outline-none pr-8 font-sans"
                          />
                          {accomLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-[#5A5A40] rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Accom suggestions autocomplete */}
                        {accomFocused && accomPredictions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-250 rounded-2xl shadow-xl z-55 max-h-52 overflow-y-auto divide-y divide-stone-50 p-1">
                            <div className="px-2.5 py-1.5 text-[8.5px] font-mono text-stone-400 uppercase tracking-widest bg-[#FAF9F5]/80 rounded-lg mb-1 font-bold">
                              🏨 Hotel / lodging results:
                            </div>
                            {accomPredictions.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setNewTripForm(prev => ({
                                    ...prev,
                                    accommodationName: p.title
                                  }));
                                  setAccomPredictions([]);
                                  setAccomFocused(false);
                                }}
                                className="w-full text-left p-2.5 hover:bg-[#FAF8F5] transition-all flex gap-3 items-start text-xs rounded-xl"
                              >
                                <Home className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="font-extrabold text-stone-850 font-sans truncate leading-tight text-left">{p.title}</p>
                                  <p className="text-[9px] text-[#8C857E] truncate mt-0.5 leading-normal text-left">{p.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 💳 SELECT PAYMENT METHODS */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9.5px] font-mono uppercase text-[#5A5A40] font-extrabold flex items-center gap-1">
                            <span>💳 Payment Cards</span>
                          </label>
                        </div>
                        <p className="text-[8px] text-stone-400 leading-normal mb-2.5">
                          Select the payment cards you want to use for this trip. When you spend money during your trip, Nomo will automatically charge your selected cards. If a card runs out of money, it will try the next card in your list.
                        </p>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {registeredCards.map((card) => {
                            const isSelected = newTripForm.selectedPaymentMethodIds.includes(card.id);
                            const listOrder = newTripForm.selectedPaymentMethodIds.indexOf(card.id);
                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => {
                                  let newIds = [...newTripForm.selectedPaymentMethodIds];
                                  if (isSelected) {
                                    newIds = newIds.filter(id => id !== card.id);
                                  } else {
                                    newIds.push(card.id);
                                  }
                                  setNewTripForm(prev => ({
                                    ...prev,
                                    selectedPaymentMethodIds: newIds
                                  }));
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left cursor-pointer ${
                                  isSelected 
                                    ? 'bg-white border-[#5A5A40] text-[#3C3836] shadow-2xs' 
                                    : 'bg-[#FBF9F7] border-stone-200 text-stone-500 hover:bg-stone-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                    isSelected 
                                      ? 'bg-[#5A5A40] border-[#5A5A40] text-white' 
                                      : 'border-stone-300 bg-white'
                                  }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10.5px] font-bold font-sans tracking-tight">{card.name}</span>
                                      {card.bankName && (
                                        <span className="text-[7px] font-mono bg-stone-200 text-stone-600 px-1 rounded font-semibold uppercase">{card.bankName}</span>
                                      )}
                                    </div>
                                    <span className="text-[8px] font-mono opacity-80 block">
                                      {card.type} •••• {card.lastFour} {card.balance !== undefined && `• Bal: ₱${card.balance.toLocaleString()}`}
                                    </span>
                                  </div>
                                </div>
                                <span className={`text-[8.5px] font-mono font-bold uppercase transition-all ${
                                  isSelected ? 'text-[#3E7D3F]' : 'text-stone-400'
                                }`}>
                                  {isSelected ? `Try #${listOrder + 1}` : 'Inactive'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* QUICK PH CARD CONNECTION WIDGET WITHIN CREATION */}
                      <div className="border-t border-stone-200/65 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const bank = prompt("Enter Philippine Bank Name (GoTyme, Maya, MariBank, HSBC):");
                            if (!bank) return;
                            const bName = bank.trim().charAt(0).toUpperCase() + bank.trim().slice(1);
                            if (!['GoTyme', 'Maya', 'MariBank', 'HSBC'].includes(bName)) {
                              alert("Please enter a supported Philippines partner: GoTyme, Maya, MariBank, or HSBC.");
                              return;
                            }
                            const name = prompt("Enter Cardholder Name:", user?.name || "Sophie Nomad");
                            if (!name) return;
                            const num = prompt("Enter 16-Digit Card Number (mock digits):", "4532 9918 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000));
                            if (!num) return;

                            // Ask for card CVV & expiry date for real payment validation
                            const expire = prompt("Enter Card Expiry Date (MM/YY):", "12/28");
                            if (!expire) return;
                            const cvvInput = prompt("Enter 3-Digit Card Security Code (CVV):", "123");
                            if (!cvvInput) return;

                            fetch('/api/payment/connect-card', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                bankName: bName, 
                                cardNumber: num, 
                                cardholderName: name,
                                expiryDate: expire,
                                cvv: cvvInput
                              })
                            })
                            .then(r => r.json())
                            .then(data => {
                              if (data.success && data.card) {
                                setRegisteredCards(prev => [...prev, data.card]);
                                setNewTripForm(prev => ({
                                  ...prev,
                                  selectedPaymentMethodIds: [...prev.selectedPaymentMethodIds, data.card.id]
                                }));
                                alert(`🎉 Successfully connected to ${bName}!\n💳 ${data.card.name} is now added.`);
                              } else {
                                alert(`🚨 Connection Error: ${data.error || 'Failed to authenticate card.'}`);
                              }
                            });
                          }}
                          className="w-full py-1.5 bg-white border border-[#CDCDCD] hover:border-[#5A5A40] text-stone-600 hover:text-[#5A5A40] font-mono text-[8px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>＋ Add card</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setNewTripStep(1)}
                        className="flex-1 py-2 bg-stone-100 text-stone-600 font-mono text-[9px] uppercase font-bold tracking-wider rounded-xl hover:bg-stone-200 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={!newTripForm.budget || !newTripForm.currency}
                        onClick={() => setNewTripStep(3)}
                        className="flex-1 py-2 bg-[#5A5A40] disabled:opacity-50 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Create Trip Plan</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {newTripStep === 3 && (() => {
                  const datesList = getDatesInRange(newTripForm.startDate, newTripForm.endDate);
                  const totalDays = datesList.length || 1;
                  const currentDateStr = datesList[plannerDayIndex] || newTripForm.startDate;
                  
                  // Filter the list they see in this step to match the active day they are planning
                  const spotsForCurrentDay = initialItinerary.filter(item => item.visitDate === currentDateStr);
                  
                  return (
                    <div className="space-y-4 animate-fade-in text-left">
                      
                      {/* Interactive Active Day Badge Card */}
                      <div className="bg-[#5A5A40] text-white p-4 rounded-3xl shadow-sm relative overflow-hidden">
                        {/* Tape effect */}
                        <div className="absolute top-1 right-4 w-24 h-4 bg-white/20 flex items-center justify-center font-mono text-[7px] text-white font-bold uppercase tracking-wider rotate-2">
                          🗺️ Agenda Set
                        </div>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#EAE0D8] font-bold">Currently Planning:</span>
                        <h4 className="font-serif italic text-xl font-bold mt-0.5">Day {plannerDayIndex + 1} of {totalDays}</h4>
                        <p className="text-[10px] text-white/90 font-mono font-bold mt-1 uppercase">🗓️ Date: {currentDateStr}</p>
                      </div>

                      {/* User Instruction Banner */}
                      <div className="p-3.5 bg-[#FAF8F5] border border-[#DDD0C5] rounded-2xl space-y-1">
                        <span className="text-[8px] font-mono uppercase font-black text-[#5A5A40] block tracking-wide">
                          📅 How to proceed:
                        </span>
                        <p className="text-[10px] text-stone-600 leading-relaxed font-sans">
                          Add all planned spots for <strong>Day {plannerDayIndex + 1} ({currentDateStr})</strong>. Once finished, click <strong>"Proceed to Next Day"</strong> to configure subsequent dates until your journey concludes!
                        </p>
                      </div>

                      {/* AI Suggestions Sparkles Button */}
                      {suggestedSpots.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleFetchItinerarySuggestions(false)}
                          disabled={loadingSuggestions}
                          className="w-full py-2.5 bg-gradient-to-r from-[#FAF8F5] to-white border border-[#DDD0C5] text-[#5A5A40] text-xs font-mono uppercase tracking-wider font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none hover:bg-stone-50"
                        >
                          {loadingSuggestions ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5A5A40]" />
                              <span>Consulting local pathfinders...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                              <span>Nomo recommendations</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-mono text-[#5A5A40] uppercase font-bold tracking-wider">🎯 Nomo recommendations (within 15km):</p>
                            <button
                              type="button"
                              onClick={() => handleFetchItinerarySuggestions(true)}
                              disabled={loadingSuggestions}
                              className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-650 hover:text-[#5A5A40] text-[9px] px-2 py-0.5 rounded-lg font-mono font-bold transition-all disabled:opacity-50 active:scale-95"
                              title="Shuffle recommendations within 15km radius"
                            >
                              <RefreshCw className={`w-2.5 h-2.5 ${loadingSuggestions ? 'animate-spin' : ''}`} />
                              <span>Refresh</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {suggestedSpots.map((spot, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-3 text-xs shadow-3xs">
                                <div className="min-w-0 flex-1">
                                  <h6 className="font-serif italic font-bold text-stone-800">{spot.title}</h6>
                                  <p className="text-[9px] text-stone-500 mt-0.5 leading-snug">{spot.description}</p>
                                  <span className="inline-block mt-1 text-[8px] font-mono bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-bold">
                                    Est: {spot.estimatedCost} {newTripForm.currency || 'USD'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddSuggestedSpot(spot)}
                                  className="bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-mono text-[9px] uppercase font-bold py-1 px-2.5 rounded-lg transition-colors shrink-0"
                                >
                                  + Add to Day {plannerDayIndex + 1}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual Custom Spot Input Form with Google Maps search */}
                      <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/60 space-y-2.5 text-left">
                        <h5 className="text-[10px] font-mono text-[#5A5A40] uppercase tracking-wider font-extrabold">Add Spot to Day {plannerDayIndex + 1}:</h5>
                        
                        {/* GOOGLE MAPS PLACE SEARCH INTEGRATION */}
                        <GooglePlacesSearch
                          onPlaceSelect={(place) => {
                            setItineraryForm(prev => ({
                              ...prev,
                              title: place.title,
                              description: place.description,
                              lat: place.lat,
                              lon: place.lon
                            }));
                            setShowOptionalItineraryFields(true);
                          }}
                          currency={newTripForm.currency}
                          biasDestination={newTripForm.destination}
                          placeholder="Search tourist spots, bakeries, cafes..."
                        />

                        <div>
                          <label className="text-[8.5px] font-mono uppercase text-stone-500 block mb-0.5 font-bold">Selected or Custom Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Cat Cafe Sanzo"
                            value={itineraryForm.title}
                            onChange={(e) => setItineraryForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                          />
                        </div>
                        
                        {showOptionalItineraryFields ? (
                          <div className="space-y-2 pt-1 animate-fade-in text-left">
                            <div>
                              <label className="text-[8.5px] font-mono uppercase text-stone-500 block mb-0.5">Estimated Arrival Time</label>
                              <input
                                type="text"
                                value={itineraryForm.arrivalTime}
                                placeholder="e.g. 10:30 AM or Sunset"
                                onChange={(e) => setItineraryForm(prev => ({ ...prev, arrivalTime: e.target.value }))}
                                className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8.5px] font-mono uppercase text-stone-500 block">Activity / Note</label>
                                <input
                                  type="text"
                                  placeholder="..."
                                  value={itineraryForm.description}
                                  onChange={(e) => setItineraryForm(prev => ({ ...prev, description: e.target.value }))}
                                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[8.5px] font-mono uppercase text-stone-500 block">Estimated Cost</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={itineraryForm.estimatedCost}
                                  onChange={(e) => setItineraryForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                                  className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-center"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowOptionalItineraryFields(true)}
                            className="text-[9px] font-mono font-bold text-[#5A5A40] hover:underline block text-left"
                          >
                            + Add Details (Time, Note & Cost Optionals)
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={handleAddManualSpot}
                          disabled={!itineraryForm.title}
                          className="w-full py-1.5 text-[9.5px] font-mono uppercase font-bold tracking-wider text-[#5A5A40] bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-all"
                        >
                          + Save to Day {plannerDayIndex + 1}
                        </button>
                      </div>

                      {/* Display spots planned for Day X inside Timeline scroll */}
                      <div className="space-y-2 text-left pt-1">
                        <p className="text-[10px] font-mono text-[#8C857E] uppercase tracking-wider font-extrabold flex justify-between">
                          <span>Agenda for Day {plannerDayIndex + 1}:</span>
                          <span className="text-[#5A5A40] font-bold">{spotsForCurrentDay.length} spots saved</span>
                        </p>
                        
                        {/* Map visualization of currently planned daily spots rundown */}
                        <MiniOSMMap destination={newTripForm.destination} spots={spotsForCurrentDay} />
                        
                        {spotsForCurrentDay.length > 0 ? (
                          <div className="relative border-l border-dashed border-[#5A5A40]/30 ml-3 pl-4 space-y-3 max-h-[160px] overflow-y-auto pr-1">
                            {spotsForCurrentDay.map((item, idx) => {
                              const isEditing = editingItineraryId === item.id;
                              return (
                                <div key={item.id} className="relative group text-left">
                                  <span className="absolute -left-[21px] top-2 w-2 h-2 rounded-full border border-white bg-[#5A5A40] shrink-0" />
                                  {isEditing ? (
                                    <div className="p-3 bg-white border border-[#5A5A40] rounded-xl text-xs space-y-2.5 my-1.5 shadow-2xs">
                                      <div className="space-y-1 text-left">
                                        <label className="text-[8.5px] font-mono uppercase text-stone-500 block font-bold">Edit Title</label>
                                        <input
                                          type="text"
                                          value={editingItineraryForm.title}
                                          onChange={(e) => setEditingItineraryForm(p => ({ ...p, title: e.target.value }))}
                                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Edit Time</label>
                                          <input
                                            type="text"
                                            value={editingItineraryForm.arrivalTime}
                                            onChange={(e) => setEditingItineraryForm(p => ({ ...p, arrivalTime: e.target.value }))}
                                            className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Edit Cost</label>
                                          <input
                                            type="number"
                                            value={editingItineraryForm.estimatedCost}
                                            onChange={(e) => setEditingItineraryForm(p => ({ ...p, estimatedCost: e.target.value }))}
                                            className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-1 text-left">
                                        <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Edit Note</label>
                                        <input
                                          type="text"
                                          value={editingItineraryForm.description}
                                          onChange={(e) => setEditingItineraryForm(p => ({ ...p, description: e.target.value }))}
                                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none"
                                        />
                                      </div>
                                      <div className="space-y-1 text-left">
                                        <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Planned Day/Date</label>
                                        <select
                                          value={editingItineraryForm.visitDate}
                                          onChange={(e) => setEditingItineraryForm(p => ({ ...p, visitDate: e.target.value }))}
                                          className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none text-[11px]"
                                        >
                                          {datesList.map((dt, i) => (
                                            <option key={dt} value={dt}>
                                              Day {i + 1} ({dt})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex gap-1.5 justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setEditingItineraryId(null)}
                                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-[9px] font-mono font-bold uppercase"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setInitialItinerary(prev => prev.map(i => i.id === item.id ? {
                                              ...i,
                                              title: editingItineraryForm.title,
                                              description: editingItineraryForm.description,
                                              estimatedCost: Number(editingItineraryForm.estimatedCost) || 0,
                                              arrivalTime: editingItineraryForm.arrivalTime,
                                              visitDate: editingItineraryForm.visitDate
                                            } : i));
                                            setEditingItineraryId(null);
                                          }}
                                          className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded text-[9px] font-mono font-bold uppercase transition-colors"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between gap-2 p-2 bg-stone-50 border border-stone-200/50 rounded-xl text-xs hover:border-[#5A5A40]/30 transition-all">
                                      <div className="truncate flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[8px] font-mono font-bold bg-[#FAF8F5] border px-1.5 py-0.5 text-[#5A5A40] rounded shrink-0 leading-none">
                                            {item.arrivalTime || 'TBA'}
                                          </span>
                                          <span className="text-[#3C3836] font-bold text-xs truncate">{item.title}</span>
                                        </div>
                                        {item.description && <span className="text-stone-400 text-[9px] block truncate mt-0.5">{item.description}</span>}
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-[8px] font-mono font-bold bg-neutral-100 px-1 text-stone-500 rounded text-right">
                                          {item.estimatedCost} {newTripForm.currency || 'USD'}
                                        </span>
                                        
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingItineraryId(item.id);
                                            setEditingItineraryForm({
                                              title: item.title,
                                              description: item.description,
                                              estimatedCost: String(item.estimatedCost),
                                              arrivalTime: item.arrivalTime || '11:00 AM',
                                              visitDate: item.visitDate || currentDateStr
                                            });
                                          }}
                                          className="text-stone-400 hover:text-[#5A5A40] transition-colors p-0.5"
                                          title="Edit spot"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => setInitialItinerary(prev => prev.filter(i => i.id !== item.id))}
                                          className="text-stone-400 hover:text-red-500 transition-colors p-0.5"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-stone-400 text-[10px] py-4 italic text-center border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                            No spots mapped for this Day yet. Complete with Google Search or Manual input.
                          </div>
                        )}
                      </div>

                      {/* Summary of ALL planned days */}
                      {initialItinerary.length > 0 && (
                        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-250 text-[10px] text-stone-600">
                          <p className="font-bold underline mb-1 uppercase font-mono text-[9px] text-stone-500">Trip Timeline Overview ({initialItinerary.length} total spots mapped):</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {datesList.map((dt, i) => {
                              const spotsNum = initialItinerary.filter(item => item.visitDate === dt).length;
                              return (
                                <button
                                  key={dt}
                                  type="button"
                                  onClick={() => setPlannerDayIndex(i)}
                                  className={`px-2 py-1 rounded text-[8.5px] font-mono border uppercase font-bold transition-all ${
                                    plannerDayIndex === i
                                      ? 'bg-[#5A5A40] text-white border-transparent'
                                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-100'
                                  }`}
                                >
                                  Day {i + 1}: {spotsNum} spots
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Navigation buttons: Next Day or Submit */}
                      <div className="flex gap-2 pt-2 border-t border-stone-100">
                        {plannerDayIndex > 0 ? (
                          <button
                            type="button"
                            onClick={() => setPlannerDayIndex(prev => prev - 1)}
                            className="flex-1 py-1.5 bg-stone-100 text-stone-600 font-mono text-[9px] uppercase font-bold tracking-wider rounded-xl hover:bg-stone-200 transition-all cursor-pointer"
                          >
                            ⬅️ Day {plannerDayIndex}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setNewTripStep(2)}
                            className="flex-1 py-1.5 bg-stone-100 text-stone-600 font-mono text-[9px] uppercase font-bold tracking-wider rounded-xl hover:bg-stone-200 transition-all cursor-pointer"
                          >
                            Back
                          </button>
                        )}

                        {plannerDayIndex < totalDays - 1 ? (
                          <button
                            type="button"
                            onClick={() => setPlannerDayIndex(prev => prev + 1)}
                            className="flex-1 py-1.5 bg-[#5A5A40] text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] transition-all shadow-md"
                          >
                            Proceed to Day {plannerDayIndex + 2} ➡️
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleCreateTrip}
                            className="flex-1 py-1.5 bg-[#5A5A40] text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Pin Journey ({initialItinerary.length} spots)</span>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'journal' && (
                <JournalTab 
                  activeTrip={activeTrip}
                  communityReviews={communityReviews}
                  onAddCommunityReview={(rev) => setCommunityReviews(prev => [rev, ...prev])}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onAskAIAboutSpot={(query) => {
                    setCurrentQuery(query);
                    setActiveTab('chat');
                  }}
                />
              )}
              
              {activeTab === 'ledger' && (
                trips.length === 0 ? (
                  <div className="flex flex-col justify-center items-center text-center p-8 h-full bg-white animate-fade-in relative">
                    <div className="p-4 rounded-full bg-[#EAE0D8] text-[#5A5A40] mb-4">
                      <MapPin className="w-10 h-10 stroke-[1.5] animate-pulse" />
                    </div>
                    <h3 className="font-serif italic text-base text-[#3C3836] font-bold">Your Travel Scrapbook is Unwritten</h3>
                    <p className="text-[11px] text-[#8C857E] mt-2 max-w-xs leading-relaxed">
                      Map gorgeous third-wave coffee shops, track expenses with emotional tags, and balance shared balances simply.
                    </p>
                    <button
                      onClick={() => {
                        setIsCreatingTrip(true);
                      }}
                      className="mt-6 px-5 py-2.5 bg-[#5A5A40] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Pin Your First Journey</span>
                      <Plus className="w-3.5 h-3.5 font-bold" />
                    </button>
                  </div>
                ) : (
                  <LedgerTab 
                    activeTrip={activeTrip!}
                    onUpdateTrip={handleUpdateTrip}
                    totalSpent={totalSpent}
                    budgetUtilization={budgetUtilization}
                    activeDebts={activeDebts}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                    onAddCommunityReviewDirectly={(rev) => setCommunityReviews(prev => [rev, ...prev])}
                    onOpenTripModal={() => setIsCreatingTrip(true)}
                    registeredCards={registeredCards}
                    setRegisteredCards={setRegisteredCards}
                  />
                )
              )}

              {activeTab === 'insights' && (
                trips.length === 0 ? (
                  <div className="flex flex-col justify-center items-center text-center p-8 h-full bg-white animate-fade-in relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#C8B8AB]/20 flex items-center justify-center font-mono text-[7px] text-[#5A5A40] font-bold uppercase -rotate-1 pointer-events-none">
                      🧠 AI Empty State
                    </div>
                    <div className="p-4 rounded-full bg-[#EAE0D8] text-[#5A5A40] mb-4">
                      <Sparkles className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="font-serif italic text-base text-[#3C3836] font-bold">Uncharted Travel Personality</h3>
                    <p className="text-[11px] text-[#8C857E] mt-2 max-w-xs leading-relaxed">
                      Nomo requires at least one active trip with expense tags to compute your travel persona and generate cozy diary scrapbooks.
                    </p>
                    <button
                      onClick={() => {
                        setIsCreatingTrip(true);
                      }}
                      className="mt-6 px-5 py-2.5 bg-[#5A5A40] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Build First Journey</span>
                      <Plus className="w-3.5 h-3.5 font-bold" />
                    </button>
                  </div>
                ) : (
                  <InsightsTab 
                    activeTrip={activeTrip!}
                    onUpdateTrip={handleUpdateTrip}
                    communityReviews={communityReviews}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                  />
                )
              )}

              {activeTab === 'chat' && (
                <ChatTab 
                  chatMessages={chatMessages}
                  sendingChat={sendingChat}
                  currentQuery={currentQuery}
                  onQueryChange={setCurrentQuery}
                  onSubmitChat={sendChatMessage}
                  activeTrip={activeTrip}
                />
              )}
            </>
          )}
        </main>

        {/* PERSISTENT BOTTOM TAB NAVBAR CONTROLLER */}
        {!isCreatingTrip && (
          <nav className="h-14 border-t border-[#F1EFE9] bg-white text-[#3C3836] flex justify-around items-center shrink-0 z-20 pb-safe shadow-md animate-fade-in">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-all active:scale-95 ${
                activeTab === 'ledger' ? 'text-[#5A5A40] font-bold' : 'text-[#A8A29E] hover:text-stone-600'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[8px] font-mono mt-1 tracking-wider uppercase">Planner</span>
            </button>
            
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-all active:scale-95 ${
                activeTab === 'journal' ? 'text-[#5A5A40] font-bold' : 'text-[#A8A29E] hover:text-stone-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[8px] font-mono mt-1 tracking-wider uppercase">Community</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-all active:scale-95 ${
                activeTab === 'insights' ? 'text-[#5A5A40] font-bold' : 'text-[#A8A29E] hover:text-stone-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[8px] font-mono mt-1 tracking-wider uppercase">AI Scout</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-all active:scale-95 ${
                activeTab === 'chat' ? 'text-[#5A5A40] font-bold' : 'text-[#A8A29E] hover:text-stone-600'
              }`}
            >
              <MessageSquare className="w-4 h-4 animate-none" />
              <span className="text-[8px] font-mono mt-1 tracking-wider uppercase">Chat</span>
            </button>
          </nav>
        )}

        {/* INTERACTIVE FEATURE TOUR OVERLAY */}
        {tourStep !== null && (
          <div className="absolute inset-x-0 bottom-0 top-[48px] bg-black/60 z-40 flex flex-col justify-end p-4 animate-fade-in">
            <div className="bg-[#FAF9F7] rounded-[24px] border border-[#DDD0C5] p-5 shadow-2xl text-left space-y-3 relative mb-[20px] transform transition-all duration-300">
              
              {/* Step indicator */}
              <div className="flex justify-between items-center pb-2 border-b border-[#F1EFE9]">
                <span className="text-[10px] uppercase font-mono font-bold text-[#5A5A40] tracking-wider flex items-center gap-1">
                  💡 companion tour • Step {tourStep} of 4
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTourStep(null);
                    localStorage.setItem('nomo_feature_tour_done_v3', 'true');
                  }}
                  className="text-stone-400 hover:text-stone-600 text-[10px] font-mono tracking-wider uppercase font-bold"
                >
                  Skip
                </button>
              </div>

              {/* Step Details */}
              {tourStep === 1 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-[#EAE0D8] text-[#5A5A40]">
                      <BookOpen className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-serif italic font-bold text-xs text-[#3C3836]">🌸 Community Spot Reviews</h4>
                  </div>
                  <p className="text-[11px] text-[#8C857E] leading-relaxed">
                    This is your collective check-in space. Exchange boutique spot recommendations, write aesthetic coffee reviews, and filter other verified ratings of visited places from fellow travelers.
                  </p>
                </div>
              )}

              {tourStep === 2 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-[#EAE0D8] text-[#5A5A40]">
                      <Wallet className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-serif italic font-bold text-xs text-[#3C3836]">🗺️ Travel Planner & Itinerary</h4>
                  </div>
                  <p className="text-[11px] text-[#8C857E] leading-relaxed">
                    The heart of your trace. Plan daily agendas, log cash/card expenditures with diary highlights, rate visited spots, and let Nomo divide pocket ledger debts with your travel partners seamlessly.
                  </p>
                </div>
              )}

              {tourStep === 3 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-[#EAE0D8] text-[#5A5A40]">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-serif italic font-bold text-xs text-[#3C3836]">🧠 Planner AI Scout</h4>
                  </div>
                  <p className="text-[11px] text-[#8C857E] leading-relaxed">
                    Your personal travel logs analyzer. Here, Nomo maps spending distributions into a **Budget Utilization Breakdown** and structures reviews into structured route suggestions.
                  </p>
                </div>
              )}

              {tourStep === 4 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-[#EAE0D8] text-[#5A5A40]">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-serif italic font-bold text-xs text-[#3C3836]">💬 Pocket AI Chat</h4>
                  </div>
                  <p className="text-[11px] text-[#8C857E] leading-relaxed">
                    Consult Nomo at any moment. Ask for low-cost alternative destinations, inquire about currency conversion & expense parameters, or design custom itineraries together.
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-[#F1EFE9]">
                <button
                  type="button"
                  onClick={() => tourStep > 1 && setTourStep(tourStep - 1)}
                  disabled={tourStep === 1}
                  className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold tracking-wider rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none text-stone-500"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tourStep < 4) {
                      setTourStep(tourStep + 1);
                    } else {
                      setTourStep(null);
                      localStorage.setItem('nomo_feature_tour_done_v3', 'true');
                    }
                  }}
                  className="px-3 py-1 text-[9px] font-mono uppercase font-bold tracking-wider text-white bg-[#5A5A40] hover:bg-[#4a4a34] rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                >
                  <span>{tourStep === 4 ? "Wander Now" : "Next Step"}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Bouncing tab overlay arrows */}
            <div className="w-full flex justify-around select-none pointer-events-none pb-[12px] px-1">
              <div className={`w-14 flex justify-center transition-all duration-300 ${tourStep === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-t-[#FAF9F7] border-l-transparent border-r-transparent animate-bounce" />
              </div>
              <div className={`w-14 flex justify-center transition-all duration-300 ${tourStep === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-t-[#FAF9F7] border-l-transparent border-r-transparent animate-bounce-short" />
              </div>
              {/* quick add spacer */}
              <div className="w-12 h-1 shrink-0" />
              <div className={`w-14 flex justify-center transition-all duration-300 ${tourStep === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-t-[#FAF9F7] border-l-transparent border-r-transparent animate-bounce" />
              </div>
              <div className={`w-14 flex justify-center transition-all duration-300 ${tourStep === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-t-[#FAF9F7] border-l-transparent border-r-transparent animate-bounce" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: TRIP LISTS & MANAGEMENT */}
      {showTripListModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#F1EFE9] shadow-2xl text-left space-y-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-serif italic font-bold text-[#5A5A40] text-sm">Your Travel Journeys</h3>
              <button 
                type="button" 
                onClick={() => setShowTripListModal(false)}
                className="text-[9px] font-mono uppercase bg-[#F3F2EE] hover:bg-[#E7E5E4] px-2 py-1 rounded text-stone-500 font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {trips.map((t) => {
                const isActive = t.id === activeTripId;
                const spentAmount = t.expenseEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTripId(t.id);
                      setShowTripListModal(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#FAF8F5] border-[#5A5A40] shadow-2xs'
                        : 'bg-white border-[#F1EFE9] hover:bg-stone-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-sans font-extrabold truncate ${isActive ? 'text-[#5A5A40]' : 'text-stone-800'}`}>
                          {t.name}
                        </h4>
                        {isActive && (
                          <span className="bg-[#5A5A40] text-white text-[7px] font-mono uppercase font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        📍 {t.destination} • {t.members?.length || 1} nomads
                      </p>
                      <p className="text-[9px] text-stone-400 font-mono uppercase mt-1">
                        Spent: {spentAmount.toLocaleString()} / {t.budget.toLocaleString()} {t.currency}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Do you really want to delete the journey "${t.name}"? This removes all local checked-in spots and ledger receipts.`)) {
                          const index = trips.findIndex(curr => curr.id === t.id);
                          const filtered = trips.filter(curr => curr.id !== t.id);
                          setTrips(filtered);
                          if (filtered.length === 0) {
                            setActiveTripId('');
                            setIsCreatingTrip(true);
                            setShowTripListModal(false);
                          } else if (isActive) {
                            const fallbackIndex = index === 0 ? 0 : index - 1;
                            setActiveTripId(filtered[fallbackIndex]?.id || filtered[0]?.id || '');
                          }
                        }
                      }}
                      className="p-1 px-1.5 rounded-xl hover:bg-red-55 text-stone-400 hover:text-red-500 active:scale-95 transition-all shrink-0"
                      title="Delete journey"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowTripListModal(false);
                setIsCreatingTrip(true);
              }}
              className="w-full py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[10px] font-mono uppercase tracking-wider font-extrabold rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Chart a New Journey Page</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG NEW EXPENSE FORM SHEET */}
      {showNewExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-[32px] w-full max-w-[420px] p-5 border-t-2 border-[#5A5A40]/10 shadow-2xl relative max-h-[92vh] flex flex-col justify-between overflow-hidden">
            
            {/* Wizard Header & Segmented Progress Bar */}
            <div className="flex flex-col gap-2 mb-4 select-none">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#A8A29E] font-extrabold bg-[#F3F2EE] px-2 py-0.5 rounded-full">
                    Step {expenseStep} of 6
                  </span>
                  <h3 className="font-serif italic text-base text-[#5A5A40] font-bold mt-1">
                    {expenseStep === 1 && "1. Base Metrics"}
                    {expenseStep === 2 && "2. Category & Time"}
                    {expenseStep === 3 && "3. Partners & Splits"}
                    {expenseStep === 4 && "4. Mood Vibe & Habits"}
                    {expenseStep === 5 && "5. Acoustic & Snap"}
                    {expenseStep === 6 && "6. Scribble Note"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewExpenseModal(false);
                    setExpenseStep(1);
                  }}
                  className="text-[9px] font-mono uppercase bg-[#F3F2EE] px-2.5 py-1 rounded-lg text-[#8C857E] hover:bg-[#E7E5E4]"
                >
                  Cancel
                </button>
              </div>
              
              {/* Horizontal segmented indicators */}
              <div className="flex gap-1 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden mt-1">
                {[1, 2, 3, 4, 5, 6].map((st) => (
                  <div
                    key={st}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      st <= expenseStep ? "bg-[#5A5A40]" : "bg-stone-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 flex-1 overflow-y-auto pb-4 pr-0.5 select-none text-left">
              
              {/* STEP 1: Basic Metrics */}
              {expenseStep === 1 && (
                <div className="space-y-4 py-1">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F1EFE9] text-left">
                    <p className="text-[11px] text-[#5A5A40] font-serif italic leading-relaxed">
                      "To measure is to wander. Describe your purchase or experience trace, and define its value."
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1">Moment Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kyoto Golden Pavilion Ticket"
                        value={newExpenseForm.title}
                        onChange={(e) => setNewExpenseForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-[#F3F2EE] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none focus:bg-white text-[#3C3836] font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1">Cost Amount ({activeTrip.currency})</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1500"
                        value={newExpenseForm.amount}
                        onChange={(e) => setNewExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full bg-[#F3F2EE] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none focus:bg-white text-[#3C3836] font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Category & Time */}
              {expenseStep === 2 && (
                <div className="space-y-4 py-1">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F1EFE9] text-left">
                    <p className="text-[11px] text-[#5A5A40] font-serif italic leading-relaxed">
                      "Classify the energy realm of this transaction, and record when this traces occurred."
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1.5 text-left">Wander Category Category</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { val: "Cafe", label: "☕ Café & Workspace" },
                        { val: "Food", label: "🍽️ Food & Dining" },
                        { val: "Transit", label: "🚇 Local Transit" },
                        { val: "Lodging", label: "🏨 Sleep Lodging" },
                        { val: "Museum/Events", label: "🎨 Gallery Art" },
                        { val: "Entertainment", label: "🎸 Sunset Socials" },
                        { val: "Shopping", label: "🛍️ Local Boutiques" },
                        { val: "Souvenirs", label: "🏮 Vintage Novelty" },
                        { val: "Misc", label: "📦 Other Wander" },
                      ].map((cat) => {
                        const isActive = newExpenseForm.category === cat.val;
                        return (
                          <button
                            key={cat.val}
                            type="button"
                            onClick={() => setNewExpenseForm(prev => ({ ...prev, category: cat.val as ExpenseCategory }))}
                            className={`px-3 py-2 text-left text-xs rounded-xl border transition-all ${
                              isActive 
                                ? "bg-[#5A5A40] text-white border-transparent shadow-xs font-bold" 
                                : "bg-[#FAF8F5] border-[#F1EFE9] text-[#3C3836] hover:bg-[#F3F2EE]"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1">Moment Calendar Date</label>
                    <input
                      type="date"
                      required
                      value={newExpenseForm.date}
                      onChange={(e) => setNewExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none focus:bg-white text-[#3C3836]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Partners & Splits */}
              {expenseStep === 3 && (
                <div className="space-y-4 py-1 text-left">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F1EFE9]">
                    <p className="text-[11px] text-[#5A5A40] font-serif italic leading-relaxed">
                      "Determine the bill sponsor and list any travel partners splitting the cost."
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1.5">Who paid this?</label>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTrip.members.map(member => {
                        const isSelected = newExpenseForm.paidBy === member;
                        return (
                          <button
                            key={member}
                            type="button"
                            onClick={() => setNewExpenseForm(prev => ({ ...prev, paidBy: member }))}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isSelected 
                                ? "bg-[#5A5A40] text-white border-transparent shadow-xs" 
                                : "bg-white border-[#E7E5E4] text-[#8C857E] hover:bg-[#FAF8F5]"
                            }`}
                          >
                            👤 {member}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1.5">Splits Equally Among</label>
                    <div className="p-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl space-y-1.5">
                      {activeTrip.members.map(member => {
                        const included = newExpenseForm.splitWith.includes(member);
                        return (
                          <label 
                            key={member} 
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                              included 
                                ? "bg-white border-[#5A5A40] text-[#3C3836] shadow-2xs" 
                                : "bg-transparent border-transparent text-[#8C857E]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={included}
                              onChange={() => {
                                const updated = included
                                  ? newExpenseForm.splitWith.filter(m => m !== member)
                                  : [...newExpenseForm.splitWith, member];
                                setNewExpenseForm(prev => ({ ...prev, splitWith: updated }));
                              }}
                              className="rounded border-[#E7E5E4] text-[#5A5A40] focus:ring-0 focus:ring-offset-0"
                            />
                            <span>{member}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Routines & Habits Checklist */}
              {expenseStep === 4 && (
                <div className="space-y-4 py-1 text-left">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F1EFE9]">
                    <p className="text-[11px] text-[#5A5A40] font-serif italic leading-relaxed">
                      "Select the traveler routines and habits associated with this specific itinerary expense."
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1.5">Checked Routines / Habits</label>
                    <div className="flex flex-wrap gap-1.5 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E7E5E4]">
                      {INSTANT_HABITS.map(hab => {
                        const exists = newExpenseForm.selectedHabits.includes(hab);
                        return (
                          <button
                            key={hab}
                            type="button"
                            onClick={() => {
                              const updated = exists 
                                ? newExpenseForm.selectedHabits.filter(h => h !== hab)
                                : [...newExpenseForm.selectedHabits, hab];
                              setNewExpenseForm(prev => ({ ...prev, selectedHabits: updated }));
                            }}
                            className={`text-[9px] px-2.5 py-1 rounded-lg border font-bold transition-all ${
                              exists 
                                ? 'bg-[#DBC8AC] border-transparent text-[#5A5A40]' 
                                : 'bg-white border-[#E7E5E4] text-[#8C857E] hover:bg-[#F3F2EE]'
                            }`}
                          >
                            ⚙️ {hab}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Sonic Soundtrack & Visual Cover */}
              {expenseStep === 5 && (
                <div className="space-y-4 py-1 text-left">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F1EFE9]">
                    <p className="text-[11px] text-[#5A5A40] font-serif italic leading-relaxed">
                      "Capture the ambient music playing and tap an aesthetic Polaroid background thumbnail trace."
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1">Acoustic Soundtrack (Optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Song Title"
                        value={newExpenseForm.song}
                        onChange={(e) => setNewExpenseForm(prev => ({ ...prev, song: e.target.value }))}
                        className="w-full bg-[#F3F2EE] border border-[#E7E5E4] rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-[#3C3836]"
                      />
                      <input
                        type="text"
                        placeholder="Artist Name"
                        value={newExpenseForm.artist}
                        onChange={(e) => setNewExpenseForm(prev => ({ ...prev, artist: e.target.value }))}
                        className="w-full bg-[#F3F2EE] border border-[#E7E5E4] rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-[#3C3836]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1.5">Polaroid Photo Cover</label>
                    
                    {/* Tiny Preset Selectors */}
                    <div className="space-y-1 mb-2">
                      <p className="text-[8px] font-mono uppercase text-stone-400 font-bold">Tap a preset image theme:</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {STOCK_COVERS.slice(0, 8).map((url, idx) => {
                          const isSelected = newExpenseForm.photoCover === url;
                          const labels = ["Rainy City", "Neon Light", "Temple", "Pink Bloom", "Shinkansen", "Atmosphere", "Dining", "Coffee Spot"];
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setNewExpenseForm(prev => ({ ...prev, photoCover: url }))}
                              className={`aspect-video rounded-lg overflow-hidden border-2 relative transition-all active:scale-95 ${
                                isSelected ? "border-[#5A5A40] scale-102 shadow-xs" : "border-stone-100 opacity-75 hover:opacity-100"
                              }`}
                              title={labels[idx]}
                            >
                              <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/30 flex items-end justify-center">
                                <span className="text-[6.5px] text-white font-mono break-all font-bold px-0.5 truncate max-w-full text-center">{labels[idx]}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={newExpenseForm.photoCover}
                      onChange={(e) => setNewExpenseForm(prev => ({ ...prev, photoCover: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E7E5E4] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-[#3C3836]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: Notes (Inner Dialogue) & Submit */}
              {expenseStep === 6 && (
                <div className="space-y-4 py-1 text-left">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F1EFE9]">
                    <p className="text-[11px] text-[#5A5A40] font-serif italic leading-relaxed">
                      "Finally, scribble your traveling memory. Let Nomo use this to map your travel characteristics!"
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#8C857E] font-bold block mb-1">Mind Scribble Prose</label>
                    <textarea
                      required
                      placeholder="e.g. Sitting inside drafty temples listening to the bell tolls while drinking simple matcha. Money didn't buy luxury, but it bought absolute tranquility..."
                      value={newExpenseForm.note}
                      onChange={(e) => setNewExpenseForm(prev => ({ ...prev, note: e.target.value }))}
                      rows={5}
                      className="w-full bg-[#F3F2EE] border border-[#E7E5E4] rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none text-[#3C3836] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Step Navigation Controls Footer */}
              <div className="flex gap-2 pt-3 border-t border-stone-100 mt-2 select-none">
                {expenseStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setExpenseStep(prev => prev - 1)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#5A5A40] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Back
                  </button>
                )}
                
                {expenseStep < 6 ? (
                  <button
                    type="button"
                    disabled={expenseStep === 1 && (!newExpenseForm.title.trim() || !newExpenseForm.amount)}
                    onClick={() => setExpenseStep(prev => prev + 1)}
                    className="flex-1 py-1.5 bg-[#5A5A40] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#4a4a34] transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none text-center"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md text-center"
                  >
                    Log Memoir 🌸
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && activeTrip && (
        <div className="fixed inset-0 bg-[#3C3836]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="w-full max-w-[360px] bg-white rounded-[32px] p-5 border border-stone-200 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-lg">
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-serif italic text-stone-850 font-black">Share Itinerary</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowShareModal(false)}
                className="w-5 h-5 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-850 rounded-full flex items-center justify-center text-[10px] transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] font-sans text-[#8C857E] leading-normal">
              Copy this link to share your trip itinerary. Anyone with the link can view your plans on their device.
            </p>

            <div className="space-y-3.5">
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-stone-200 text-stone-750">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#5A5A40] font-black block mb-1">Trip Itinerary Link:</span>
                <div className="flex gap-1.5 mt-1 items-center bg-white p-1.5 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-500 select-all truncate flex-1">
                    https://nomo.travel/sync/{activeTrip.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://nomo.travel/sync/${activeTrip.id}`);
                      alert('Share link copied to clipboard successfully!');
                    }}
                    className="p-1 px-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[9px] font-mono uppercase font-black rounded-lg transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PROFILE SETTINGS SHEET */}
      {showProfileSettingsModal && user && (
        <ProfileSettingsModal
          isOpen={showProfileSettingsModal}
          onClose={() => setShowProfileSettingsModal(false)}
          user={user}
          onSave={(updatedUser) => {
            // Find and update credentials inside local user DB list
            const dbStr = localStorage.getItem('nomo_users_db_v3');
            if (dbStr) {
              const db = JSON.parse(dbStr);
              const updatedDb = db.map((u: any) => 
                u.email.toLowerCase() === user.email.toLowerCase() ? updatedUser : u
              );
              localStorage.setItem('nomo_users_db_v3', JSON.stringify(updatedDb));
            }
            setUser(updatedUser);
            localStorage.setItem('nomo_user_v3', JSON.stringify(updatedUser));
          }}
          onLogout={() => {
            localStorage.removeItem('nomo_user_v3');
            localStorage.removeItem('nomo_onboarding_done_v3');
            localStorage.removeItem('nomo_feature_tour_done_v3');
            setUser(null);
            setIsOnboardingActive(true);
            setShowProfileSettingsModal(false);
          }}
          onDeleteProfile={() => {
            // Delete specifically from the traveler database list
            const dbStr = localStorage.getItem('nomo_users_db_v3');
            if (dbStr) {
              const db = JSON.parse(dbStr);
              const updatedDb = db.filter((u: any) => u.email.toLowerCase() !== user.email.toLowerCase());
              localStorage.setItem('nomo_users_db_v3', JSON.stringify(updatedDb));
            }
            localStorage.removeItem('nomo_user_v3');
            localStorage.removeItem('nomo_onboarding_done_v3');
            localStorage.removeItem('nomo_feature_tour_done_v3');
            localStorage.removeItem('nomo_trips_v3');
            localStorage.removeItem('nomo_community_reviews_v3');
            setUser(null);
            setIsOnboardingActive(true);
            setTrips([]);
            setCommunityReviews([]);
            setShowProfileSettingsModal(false);
          }}
        />
      )}

    </div>
  );
}
