import React, { useState } from 'react';
import { Plus, Wallet, Sparkles, Camera, MessageSquare, Check, Star, RefreshCw, AlertCircle, CreditCard, DollarSign, Pencil, Trash2, GripVertical, ArrowUp, ArrowDown, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { Trip, ItineraryItem, PaymentMethod, ExpenseEntry, EmotionalTag, ExpenseCategory } from '../types';
import { EMOTIONAL_EMOJIS } from '../mockData';
import GooglePlacesSearch from './GooglePlacesSearch';
import { getApiUrl } from '../utils/api';
import { getCityTheme } from '../utils/cityThemes';
import { LocalNotifications } from '@capacitor/local-notifications';

function getNextIncrementalTime(lastTimeStr?: string): string {
  if (!lastTimeStr) {
    return "09:00";
  }
  const clean = lastTimeStr.trim().toUpperCase();
  let hours = 9;
  let minutes = 0;
  
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const match24 = clean.match(/^(\d{2}):(\d{2})$/);
  
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    const isPm = ampmMatch[3].toUpperCase() === 'PM';
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    hours = h;
    minutes = m;
  } else if (match24) {
    hours = parseInt(match24[1], 10);
    minutes = parseInt(match24[2], 10);
  } else {
    const numMatch = clean.match(/^(\d{1,2})/);
    if (numMatch) {
      hours = parseInt(numMatch[1], 10);
      if (clean.includes('PM') && hours < 12) hours += 12;
      if (clean.includes('AM') && hours === 12) hours = 0;
    }
  }
  
  hours = (hours + 1) % 24;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTime12h(timeStr?: string): string {
  if (!timeStr) return 'TBA';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeStr;
}

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

function formatDuration(mins?: number): string {
  if (!mins) return '60m';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs}h`;
}

function parseArrivalTime(timeStr?: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toUpperCase();
  // Match patterns like "10:30 AM", "10:30AM", "14:20", "2:15 PM", "10 AM", "2 PM"
  const match = cleaned.match(/^(\d+)(?::(\d+))?\s*(AM|PM)?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

interface LedgerTabProps {
  activeTrip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  totalSpent: number;
  budgetUtilization: number;
  activeDebts: Array<{ from: string; to: string; amount: number }>;
  onNavigateToTab: (tab: 'journal' | 'ledger' | 'insights' | 'profile') => void;
  onAddCommunityReviewDirectly: (review: any) => void;
  onOpenTripModal: () => void;
  registeredCards: PaymentMethod[];
  setRegisteredCards: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
}

export default function LedgerTab({
  activeTrip,
  onUpdateTrip,
  totalSpent,
  budgetUtilization,
  activeDebts,
  onNavigateToTab,
  onAddCommunityReviewDirectly,
  onOpenTripModal,
  registeredCards,
  setRegisteredCards,
}: LedgerTabProps) {

  const remainingBudget = activeTrip.budget - totalSpent;

  // Local helper alerts for connection simulations
  const [syncedAlert, setSyncedAlert] = useState<string | null>(null);
  const [syncingCard, setSyncingCard] = useState<string | null>(null);
  const [activeTransactionLogs, setActiveTransactionLogs] = useState<string[] | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // States for check-in review modal
  const [activeCheckInSpot, setActiveCheckInSpot] = useState<ItineraryItem | null>(null);
  const [checkInForm, setCheckInForm] = useState({
    rating: 5,
    review: '',
    spentAmount: '',
    paymentMethodId: activeTrip.paymentMethods?.[0]?.id || 'pay-chase'
  });

  // States for custom budget adjusting slider
  const [isAdjustingBudget, setIsAdjustingBudget] = useState(false);
  const [adjustedBudgetValue, setAdjustedBudgetValue] = useState(activeTrip.budget.toString());

  // States for adding custom planned spot
  const [showAddSpotForm, setShowAddSpotForm] = useState(false);
  const [newSpotForm, setNewSpotForm] = useState({
    title: '',
    description: '',
    estimatedCost: '',
    arrivalTime: '',
    visitDate: activeTrip.startDate || '',
    paymentMethodId: activeTrip.paymentMethods?.[0]?.id || '',
    estimatedTimeSpent: '60' // Default estimated stay duration is 60 minutes
  });
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isCardsSectionCollapsed, setIsCardsSectionCollapsed] = useState(true);
  const [confettiDay, setConfettiDay] = useState<string | null>(null);

  // States for card registration manager form
  const [newCardBank, setNewCardBank] = useState('GoTyme');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('06/30');
  const [newCardCVV, setNewCardCVV] = useState('123');
  const [isConnectingCard, setIsConnectingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [editingSpotForm, setEditingSpotForm] = useState<{
    title: string;
    description: string;
    estimatedCost: string;
    arrivalTime: string;
    visitDate: string;
    estimatedTimeSpent: string;
  }>({ title: '', description: '', estimatedCost: '', arrivalTime: '', visitDate: '', estimatedTimeSpent: '60' });

  // Day Navigation & Spotify Wrapped Recap states
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [showSpotifyRecap, setShowSpotifyRecap] = useState(false);
  const [spotifySlide, setSpotifySlide] = useState(0);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto-populate arrivalTime with +1 hour increment from the last spot's arrivalTime
  React.useEffect(() => {
    const dates = getDatesInRange(activeTrip.startDate, activeTrip.endDate);
    const dateStr = dates[selectedDayIdx] || activeTrip.startDate || '';
    const dayItems = (activeTrip.itinerary || []).filter(item => item.visitDate === dateStr);
    const lastSpot = dayItems[dayItems.length - 1];
    const nextTime = getNextIncrementalTime(lastSpot?.arrivalTime);
    
    setNewSpotForm(prev => ({
      ...prev,
      visitDate: dateStr,
      arrivalTime: nextTime
    }));
  }, [selectedDayIdx, activeTrip.itinerary, activeTrip.startDate, activeTrip.endDate]);

  // Native Push Notifications Support
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [sentNotifications, setSentNotifications] = useState<string[]>([]);

  // Initial permission check & automatic request for web or mobile
  React.useEffect(() => {
    const checkAndRequestPerm = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
          const perm = await LocalNotifications.checkPermissions();
          if (perm.display !== 'granted') {
            const result = await LocalNotifications.requestPermissions();
            setNotificationPermission(result.display);
          } else {
            setNotificationPermission(perm.display);
          }
        } else if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission !== 'granted') {
            const result = await Notification.requestPermission();
            setNotificationPermission(result);
          } else {
            setNotificationPermission(Notification.permission);
          }
        }
      } catch (e) {
        console.warn('Failed to check/request native notification permission', e);
      }
    };
    checkAndRequestPerm();
  }, []);

  const requestNotificationPermission = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const result = await LocalNotifications.requestPermissions();
        setNotificationPermission(result.display);
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        setNotificationPermission(result);
      } else {
        console.warn('Notifications not supported in this browser/device');
      }
    } catch (err) {
      console.error('Error requesting notification permission', err);
    }
  };

  const triggerNativeNotification = async (id: string, title: string, body: string) => {
    if (sentNotifications.includes(id)) return;
    setSentNotifications(prev => [...prev, id]);

    // Also play notification sound chime
    if (soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch (e) {
        console.warn('Audio blocked or failed', e);
      }
    }

    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const randomId = Math.floor(Math.random() * 100000) + 1;
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: randomId,
              schedule: { at: new Date(Date.now() + 500) },
              sound: 'default',
              actionTypeId: 'TRAVEL_ALERT',
            }
          ]
        });
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/826/826070.png', // nice travelers/clock icon
          tag: id,
          requireInteraction: true
        });
      }
    } catch (e) {
      console.error('Failed to trigger native notification', e);
    }
  };

  // Dynamic CSS injector for confetti fall animation
  React.useEffect(() => {
    const cssId = 'confetti-fall-css';
    if (!document.getElementById(cssId)) {
      const style = document.createElement('style');
      style.id = cssId;
      style.innerHTML = `
        @keyframes fall {
          0% {
            top: -10px;
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 100%;
            transform: translateY(220px) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Play ascending gorgeous arpeggio sound for complete day celebration
  function playCelebrationChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + idx * 0.08 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.6);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.7);
      });
    } catch (e) {
      console.warn('Audio Context blocked', e);
    }
  }

  // Toggle Day completed state inside trip data
  const handleToggleDayComplete = (dateStr: string, completed: boolean) => {
    const currentReflections = activeTrip.dayReflections || {};
    const updatedReflections = {
      ...currentReflections,
      [dateStr]: {
        ...currentReflections[dateStr],
        completed
      }
    };
    const updatedTrip = {
      ...activeTrip,
      dayReflections: updatedReflections
    };
    onUpdateTrip(updatedTrip);
    if (completed) {
      playCelebrationChime();
    }
  };

  // Save specific day's text reflection inside trip data
  const handleSaveDayNote = (dateStr: string, note: string) => {
    const currentReflections = activeTrip.dayReflections || {};
    const updatedReflections = {
      ...currentReflections,
      [dateStr]: {
        ...currentReflections[dateStr],
        note
      }
    };
    const updatedTrip = {
      ...activeTrip,
      dayReflections: updatedReflections
    };
    onUpdateTrip(updatedTrip);
  };

  // Sync planned spot date with activeTrip start date
  React.useEffect(() => {
    if (activeTrip?.startDate) {
      setNewSpotForm(prev => ({
        ...prev,
        visitDate: prev.visitDate || activeTrip.startDate,
        paymentMethodId: prev.paymentMethodId || activeTrip.paymentMethods?.[0]?.id || ''
      }));
    }
  }, [activeTrip]);

  // Joyful bell chime sound trigger for successful check-ins
  function playSuccessChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.7);
    } catch (e) {
      console.warn('Audio Context blocked', e);
    }
  }

  // Handle adjusting trip budget limit
  const handleSaveBudget = () => {
    const amt = parseFloat(adjustedBudgetValue);
    if (!isNaN(amt) && amt > 0) {
      const updated = {
        ...activeTrip,
        budget: amt
      };
      onUpdateTrip(updated);
      setIsAdjustingBudget(false);
    }
  };

  // Add itinerary spot
  const handleAddSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotForm.title.trim()) return;

    // Generate automatic progressive arrival time if none is typed
    const times = ['09:30 AM', '01:00 PM', '04:30 PM', '08:00 PM', '10:00 PM'];
    const autoTime = times[Math.min((activeTrip.itinerary || []).length, times.length - 1)];

    const cost = parseFloat(newSpotForm.estimatedCost) || 0;
    const duration = parseInt(newSpotForm.estimatedTimeSpent, 10) || 60;
    const item: ItineraryItem = {
      id: `itin-${Date.now()}`,
      title: newSpotForm.title,
      description: newSpotForm.description,
      estimatedCost: cost,
      arrivalTime: newSpotForm.arrivalTime || autoTime,
      visitDate: newSpotForm.visitDate || activeTrip.startDate,
      visited: false,
      paymentMethodId: newSpotForm.paymentMethodId || activeTrip.paymentMethods?.[0]?.id || 'pay-chase',
      estimatedTimeSpent: duration
    };

    const updated = {
      ...activeTrip,
      itinerary: [...(activeTrip.itinerary || []), item]
    };
    onUpdateTrip(updated);

    // Reset Form
    setNewSpotForm({ 
      title: '', 
      description: '', 
      estimatedCost: '', 
      arrivalTime: '', 
      visitDate: activeTrip.startDate || '',
      paymentMethodId: activeTrip.paymentMethods?.[0]?.id || '',
      estimatedTimeSpent: '60'
    });
    setShowOptionalFields(false);
    setShowAddSpotForm(false);
  };

  // Check in / Rate spot
  const triggerCheckInInput = (spot: ItineraryItem) => {
    setActiveCheckInSpot(spot);
    setCheckInForm({
      rating: 5,
      review: '',
      spentAmount: spot.estimatedCost.toString(),
      paymentMethodId: spot.paymentMethodId || activeTrip.paymentMethods?.[0]?.id || 'pay-chase'
    });
  };

  const submitCheckInReview = () => {
    if (!activeCheckInSpot) return;

    const amt = parseFloat(checkInForm.spentAmount) || 0;
    const visitDate = new Date().toISOString().split('T')[0];

    // Find the primary selected card
    const selectedCard = registeredCards.find(rc => rc.id === checkInForm.paymentMethodId) ||
                       activeTrip.paymentMethods?.find(pm => pm.id === checkInForm.paymentMethodId);

    // If selectedCard is Cash (or petty cash/none)
    if (!selectedCard || selectedCard.type === 'Cash' || selectedCard.bankName === 'Cash' || checkInForm.paymentMethodId === 'none') {
      // Manual Cash entry
      const updatedItinerary = activeTrip.itinerary.map(item => {
        if (item.id === activeCheckInSpot.id) {
          return {
            ...item,
            visited: true,
            rating: checkInForm.rating,
            review: checkInForm.review || `Completed visit to ${activeCheckInSpot.title}!`,
            vibe: 'Joyful' as EmotionalTag,
            visitDate,
            paymentMethodId: checkInForm.paymentMethodId
          };
        }
        return item;
      });

      let cat: ExpenseCategory = 'Misc';
      const lowercaseName = activeCheckInSpot.title.toLowerCase();
      if (lowercaseName.includes('cafe') || lowercaseName.includes('coffee') || lowercaseName.includes('tea')) cat = 'Cafe';
      else if (lowercaseName.includes('food') || lowercaseName.includes('dine') || lowercaseName.includes('eat') || lowercaseName.includes('ramen')) cat = 'Food';
      else if (lowercaseName.includes('train') || lowercaseName.includes('metro') || lowercaseName.includes('subway') || lowercaseName.includes('transit')) cat = 'Transit';

      const expense: ExpenseEntry = {
        id: `exp-rev-${Date.now()}`,
        title: activeCheckInSpot.title,
        amount: amt,
        category: cat,
        date: visitDate,
        emotionalTag: 'Joyful' as EmotionalTag,
        habits: ['Captured Photo'],
        soundtrack: null,
        note: checkInForm.review || `[Manual Cash Paid] Self-entered cash amount.`,
        photoCover: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
        paidBy: 'Sophie',
        splitWith: ['Sophie']
      };

      const communityPost = {
        id: `rev-post-${Date.now()}`,
        author: 'You',
        authorVibe: 'Explore-First Member',
        placeName: activeCheckInSpot.title,
        location: activeTrip.destination,
        rating: checkInForm.rating,
        review: checkInForm.review || `Visited and rated this прекрасный spot!`,
        vibe: 'Joyful' as EmotionalTag,
        spentAmount: amt,
        currency: activeTrip.currency,
        date: visitDate
      };

      const updatedTrip = {
        ...activeTrip,
        itinerary: updatedItinerary,
        expenseEntries: [...(activeTrip.expenseEntries || []), expense]
      };

      // Subtract from Cash Balance if appropriate
      if (selectedCard && selectedCard.bankName === 'Cash') {
        setRegisteredCards(prev => prev.map(rc => {
          if (rc.id === selectedCard.id) {
            return { ...rc, balance: Math.max(0, (rc.balance || 0) - amt) };
          }
          return rc;
        }));
      }

      onUpdateTrip(updatedTrip);
      onAddCommunityReviewDirectly(communityPost);
      try { playSuccessChime(); } catch (e) {}
      setActiveCheckInSpot(null);
      setSyncedAlert(`💵 Logged Manual Cash payment of ₱${amt.toLocaleString()} at "${activeCheckInSpot.title}".`);
      setTimeout(() => setSyncedAlert(null), 6000);
      return;
    }

    // AUTOMATED API PAYMENT CHAIN CHARGE WITH FAILOVER SUCCESSORS 
    setIsCharging(true);
    setActiveTransactionLogs(['[Gateway] Connecting to secure Philippines banking sandbox...']);

    // Map order. Try specified card first, then append other automatic trip methods
    const tripCards = activeTrip.paymentMethods || [];
    const prioritizeQueue = [
      selectedCard,
      ...tripCards.filter(pm => pm.id !== selectedCard.id && pm.type !== 'Cash' && pm.bankName !== 'Cash')
    ];
    // Deduplicate cards queue
    const finalQueue = prioritizeQueue.filter((v, idx, self) => self.findIndex(t => t.id === v.id) === idx);

    const activeBalancesMap: Record<string, number> = {};
    registeredCards.forEach(rc => {
      activeBalancesMap[rc.id] = rc.balance || 0;
    });

    fetch(getApiUrl('/api/payment/charge'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amt,
        selectedMethods: finalQueue,
        activeBalances: activeBalancesMap
      })
    })
    .then(r => r.json())
    .then(data => {
      setIsCharging(false);
      if (data.success) {
        setActiveTransactionLogs(data.logs);
        
        // Update local state balances
        if (data.updatedBalances) {
          setRegisteredCards(prev => prev.map(rc => {
            if (data.updatedBalances[rc.id] !== undefined) {
              return { ...rc, balance: data.updatedBalances[rc.id] };
            }
            return rc;
          }));
        }

        const chargedCard = finalQueue.find(pm => pm.id === data.chargedCardId) || selectedCard;

        const updatedItinerary = activeTrip.itinerary.map(item => {
          if (item.id === activeCheckInSpot.id) {
            return {
              ...item,
              visited: true,
              rating: checkInForm.rating,
              review: checkInForm.review || `Checked in and auto-authorized via ${chargedCard.name}!`,
              vibe: 'Joyful' as EmotionalTag,
              visitDate,
              paymentMethodId: data.chargedCardId
            };
          }
          return item;
        });

        let cat: ExpenseCategory = 'Misc';
        const lowercaseTitle = activeCheckInSpot.title.toLowerCase();
        if (lowercaseTitle.includes('cafe') || lowercaseTitle.includes('coffee') || lowercaseTitle.includes('tea')) cat = 'Cafe';
        else if (lowercaseTitle.includes('food') || lowercaseTitle.includes('dine') || lowercaseTitle.includes('eat') || lowercaseTitle.includes('ramen')) cat = 'Food';

        const expense: ExpenseEntry = {
          id: `exp-rev-${Date.now()}`,
          title: activeCheckInSpot.title,
          amount: amt,
          category: cat,
          date: visitDate,
          emotionalTag: 'Joyful' as EmotionalTag,
          habits: ['Captured Photo', 'Card Payment'],
          soundtrack: null,
          note: `Charged ₱${amt.toLocaleString()} using ${data.chargedCardName} (primary card ${selectedCard.name} was unavailable).`,
          photoCover: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
          paidBy: 'Sophie',
          splitWith: ['Sophie']
        };

        const communityPost = {
          id: `rev-post-${Date.now()}`,
          author: 'You',
          authorVibe: 'Explore-First Member',
          placeName: activeCheckInSpot.title,
          location: activeTrip.destination,
          rating: checkInForm.rating,
          review: checkInForm.review || `Paid securely using ${data.chargedCardName}.`,
          vibe: 'Joyful' as EmotionalTag,
          spentAmount: amt,
          currency: activeTrip.currency,
          date: visitDate
        };

        const updatedTrip = {
          ...activeTrip,
          itinerary: updatedItinerary,
          expenseEntries: [...(activeTrip.expenseEntries || []), expense]
        };

        onUpdateTrip(updatedTrip);
        onAddCommunityReviewDirectly(communityPost);
        try { playSuccessChime(); } catch (e) {}
        setActiveCheckInSpot(null);
        setSyncedAlert(`🎉 Payment processed: Charged ₱${amt.toLocaleString()} via ${data.chargedCardName}!`);
        setTimeout(() => setSyncedAlert(null), 8500);
      } else {
        // DECLINED ACROSS ALL CARDS!
        setActiveTransactionLogs(data.logs);
        alert(`🚨 Payment declined: Insufficient balance on all card routes linked to this trip. Please check your accounts or add budget.`);
      }
    })
    .catch(err => {
      console.error(err);
      setIsCharging(false);
      alert("Payment error. Please check your internet connection.");
    });
  };

  // Connect custom bank cards through simulated endpoint
  const handleConnectCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder) {
      setCardError("Card number and cardholder name are required.");
      return;
    }
    setIsConnectingCard(true);
    setCardError(null);

    fetch(getApiUrl('/api/payment/connect-card'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankName: newCardBank,
        cardNumber: newCardNumber,
        cardholderName: newCardHolder,
        expiryDate: newCardExpiry,
        cvv: newCardCVV
      })
    })
    .then(r => r.json())
    .then(data => {
      setIsConnectingCard(false);
      if (data.success && data.card) {
        // Append optional customized card balance if specified
        const enteredLimit = Number(newCardLimit);
        if (!isNaN(enteredLimit) && enteredLimit > 0) {
          data.card.balance = enteredLimit;
        }

        // Add to global registered collection
        setRegisteredCards(prev => {
          const exists = prev.some(c => c.id === data.card.id);
          if (exists) return prev;
          return [...prev, data.card];
        });

        // Auto-assign into current itinerary trip methods
        const currentMethods = activeTrip.paymentMethods || [];
        const isSelected = currentMethods.some(c => c.id === data.card.id);
        if (!isSelected) {
          onUpdateTrip({
            ...activeTrip,
            paymentMethods: [...currentMethods, data.card]
          });
        }

        if (data.logs) {
          setActiveTransactionLogs(data.logs);
        }

        // Clear details
        setNewCardNumber('');
        setNewCardHolder('');
        setNewCardLimit('');
      } else {
        setCardError(data.error || "Handshake failed.");
      }
    })
    .catch(err => {
      console.error(err);
      setIsConnectingCard(false);
      setCardError("Secure connection error. Digital gateway returned protocol mismatch.");
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setRegisteredCards(prev => prev.filter(c => c.id !== cardId));
    const currentMethods = activeTrip.paymentMethods || [];
    onUpdateTrip({
      ...activeTrip,
      paymentMethods: currentMethods.filter(c => c.id !== cardId)
    });
  };

  const handleToggleCardActiveInTrip = (card: PaymentMethod) => {
    const existing = activeTrip.paymentMethods || [];
    const isSelected = existing.some(c => c.id === card.id);
    let updated;
    if (isSelected) {
      updated = existing.filter(c => c.id !== card.id);
    } else {
      updated = [...existing, card];
    }
    onUpdateTrip({
      ...activeTrip,
      paymentMethods: updated
    });
  };

  const handleMoveCardPriority = (index: number, direction: 'up' | 'down') => {
    const methods = [...(activeTrip.paymentMethods || [])];
    if (direction === 'up' && index > 0) {
      const temp = methods[index];
      methods[index] = methods[index - 1];
      methods[index - 1] = temp;
    } else if (direction === 'down' && index < methods.length - 1) {
      const temp = methods[index];
      methods[index] = methods[index + 1];
      methods[index + 1] = temp;
    }
    onUpdateTrip({
      ...activeTrip,
      paymentMethods: methods
    });
  };

  // AUTOMATED PAYMENT CAPTURE ENGINE SIMULATION
  const handleAutoCaptureSimulation = async () => {
    const unvisited = (activeTrip.itinerary || []).filter(item => !item.visited);
    if (unvisited.length === 0) {
      setSyncedAlert("🎉 All active itinerary spots have been checked off! Create a new planned spot to test automatic payment.");
      setTimeout(() => setSyncedAlert(null), 5000);
      return;
    }

    const spot = unvisited[Math.floor(Math.random() * unvisited.length)];
    const amt = spot.estimatedCost;
    setSyncingCard("Contactless sequence initiator");

    const tripCards = activeTrip.paymentMethods || [];
    const activeBalancesMap: Record<string, number> = {};
    registeredCards.forEach(rc => {
      activeBalancesMap[rc.id] = rc.balance || 0;
    });

    fetch(getApiUrl('/api/payment/charge'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amt,
        selectedMethods: tripCards,
        activeBalances: activeBalancesMap
      })
    })
    .then(r => r.json())
    .then(data => {
      setSyncingCard(null);
      if (data.success) {
        setActiveTransactionLogs(data.logs);
        if (data.updatedBalances) {
          setRegisteredCards(prev => prev.map(rc => {
            if (data.updatedBalances[rc.id] !== undefined) {
              return { ...rc, balance: data.updatedBalances[rc.id] };
            }
            return rc;
          }));
        }

        const visitDate = new Date().toISOString().split('T')[0];
        const updatedItinerary = activeTrip.itinerary.map(item => {
          if (item.id === spot.id) {
            return {
              ...item,
              visited: true,
              rating: 5,
              review: `[Auto-Logged Payment via ${data.chargedCardName}] Visited spot and settled payment of ₱${amt.toLocaleString()} automatically.`,
              vibe: 'Joyful' as EmotionalTag,
              visitDate,
              paymentMethodId: data.chargedCardId
            };
          }
          return item;
        });

        const expense: ExpenseEntry = {
          id: `exp-auto-${Date.now()}`,
          title: spot.title,
          amount: amt,
          category: 'Misc',
          date: visitDate,
          emotionalTag: 'Joyful' as EmotionalTag,
          habits: ['Local Transit Route', 'Captured Photo'],
          soundtrack: null,
          note: `[Auto-Capture Log] Charged ₱${amt.toLocaleString()} via ${data.chargedCardName}. Checked in automatically.`,
          photoCover: null,
          paidBy: 'Sophie',
          splitWith: ['Sophie']
        };

        const communityPost = {
          id: `rev-post-auto-${Date.now()}`,
          author: 'You',
          authorVibe: 'Auto-Synced Nomad',
          placeName: spot.title,
          location: activeTrip.destination,
          rating: 5,
          review: `Paid securely using ${data.chargedCardName}. Checked in automatically.`,
          vibe: 'Joyful' as EmotionalTag,
          spentAmount: amt,
          currency: activeTrip.currency,
          date: visitDate
        };

        const updatedTrip = {
          ...activeTrip,
          itinerary: updatedItinerary,
          expenseEntries: [...(activeTrip.expenseEntries || []), expense]
        };

        onUpdateTrip(updatedTrip);
        onAddCommunityReviewDirectly(communityPost);
        try { playSuccessChime(); } catch (e) {}

        setSyncedAlert(`🌟 Payment recorded: ₱${amt.toLocaleString()} charged on ${data.chargedCardName}.`);
        setTimeout(() => setSyncedAlert(null), 9000);
      } else {
        setActiveTransactionLogs(data.logs);
        alert(`🚨 Auto-swipe declined: Insufficient balance on all card routes registered for this trip. Try linking a card or adding budget first.`);
      }
    })
    .catch(err => {
      console.error(err);
      setSyncingCard(null);
    });
  };

  const currentTheme = getCityTheme(activeTrip.destination);

  return (
    <div className={`space-y-4 p-4 pb-20 overflow-y-auto h-full select-none transition-colors ${currentTheme.bgColor}`}>
      
      {/* CITY THEME HERO BANNER (COMPACT EDITION) */}
      <div className={`px-4 py-2 rounded-2xl border ${currentTheme.borderColor} ${currentTheme.cardBg} shadow-3xs relative overflow-hidden flex items-center justify-between text-left animate-fade-in`}>
        <div className="flex items-center gap-2 relative z-10 py-1">
          <span className="text-sm select-none">🗺️</span>
          <div>
            <span className="text-[7px] font-mono uppercase bg-[#5A5A40]/15 text-[#5A5A40] px-1 py-0.2 rounded font-black tracking-widest mr-1.5 inline-block">
              Active Destination
            </span>
            <span className={`font-serif italic text-xs font-black ${currentTheme.textColor} inline-block align-middle`}>
              {currentTheme.name}, {currentTheme.country}
            </span>
            <span className="text-[8px] text-[#8C857E] font-mono ml-2 hidden sm:inline-block">
              • {currentTheme.landmarkName}
            </span>
          </div>
        </div>
        <div className="absolute right-2 top-0 bottom-0 w-24 pointer-events-none opacity-30">
          {currentTheme.illustration}
        </div>
      </div>

      {/* 1. TRAVEL PLANNER HEADER & LIVE BUDGET HEALTH (COMPACT EDITION) */}
      <div className="bg-gradient-to-br from-white to-[#FAF9F5] p-3.5 rounded-2xl border border-[#F1EFE9] shadow-3xs space-y-2.5 relative overflow-hidden text-left">
        {/* Header and Progress combined inline */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#8C857E] font-extrabold leading-none block">Budget Overview</span>
            <h3 className="font-serif italic text-xs font-black text-[#3C3836] mt-0.5 leading-tight">
              {activeTrip.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 max-w-[45%] flex-1">
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden relative border border-stone-200/50">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization > 95 ? 'bg-rose-500' : budgetUtilization > 80 ? 'bg-amber-400' : 'bg-[#5A5A40]'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              />
            </div>
            <span className={`text-[8px] font-mono font-black whitespace-nowrap ${remainingBudget < 0 ? 'text-rose-500 animate-pulse' : 'text-stone-500'}`}>
              {budgetUtilization}%
            </span>
          </div>
        </div>

        {/* Budget Stats Layout (Three columns in single row, but more low-key and text-based) */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#F1EFE9]/60">
          <div className="px-1 text-left">
            <span className="text-[7px] font-mono uppercase text-[#8C857E] block font-black leading-none mb-0.5">Total Budget</span>
            <span className="text-[10.5px] font-extrabold text-[#3C3836] font-mono block">
              {activeTrip.budget.toLocaleString()} <span className="text-[7px] text-stone-400 font-bold">{activeTrip.currency}</span>
            </span>
          </div>

          <div className="px-1 text-left border-l border-stone-100">
            <span className="text-[7px] font-mono uppercase text-[#8C857E] block font-black leading-none mb-0.5">Total Spent</span>
            <span className="text-[10.5px] font-extrabold text-[#3C3836] font-mono block">
              {totalSpent.toLocaleString()} <span className="text-[7px] text-stone-400 font-bold">{activeTrip.currency}</span>
            </span>
          </div>

          <div className={`px-1 text-left border-l border-stone-100 ${remainingBudget < 0 ? 'bg-red-50/20' : ''}`}>
            <span className="text-[7px] font-mono uppercase text-[#8C857E] block font-black leading-none mb-0.5">Remaining</span>
            <span className={`text-[10.5px] font-black font-mono block ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {remainingBudget.toLocaleString()} <span className="text-[7px] text-stone-400 font-bold">{activeTrip.currency}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE TRAVEL ITINERARY CHECK-INS */}
      <div className="bg-white p-5 rounded-3xl border border-[#F1EFE9] shadow-2xs space-y-4 text-left">
        {(() => {
          const datesList = getDatesInRange(activeTrip.startDate, activeTrip.endDate);
          const actualDates = datesList.length > 0 ? datesList : [activeTrip.startDate || 'Day 1'];
          const dateStr = actualDates[selectedDayIdx] || actualDates[0] || 'Day 1';

          // Group items for focused day
          const dayItems = (activeTrip.itinerary || []).filter(item => {
            if (selectedDayIdx === 0 && !item.visitDate) return true;
            return item.visitDate === dateStr;
          });

          const dayTotalSpent = dayItems
            .filter(item => item.visited)
            .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

          const visitedCount = dayItems.filter(item => item.visited).length;
          const totalCount = dayItems.length;

          const dayRef = activeTrip.dayReflections?.[dateStr] || {};
          const isCelebrated = dayRef.completed || false;

          const nextSpotObj = (activeTrip.itinerary || []).find(item => !item.visited);

          return (
            <div className="space-y-3.5">
              {/* 1. Next Destination Slim Inline Bar */}
              {nextSpotObj && (
                <div className="px-3 py-1.5 bg-[#5A5A40]/5 border border-[#5A5A40]/15 rounded-xl flex items-center justify-between gap-2.5 text-left animate-fade-in text-[10px] shadow-3xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[8px] font-mono uppercase bg-[#5A5A40] text-white px-1.5 py-0.5 rounded leading-none shrink-0 font-black">
                      🎯 Next Destination
                    </span>
                    <span className="font-bold text-stone-800 truncate" title={nextSpotObj.title}>
                      {nextSpotObj.title}
                    </span>
                    {nextSpotObj.arrivalTime && (
                      <span className="text-[8.5px] text-[#8C857E] font-mono shrink-0">
                        ({formatTime12h(nextSpotObj.arrivalTime)})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const query = `${nextSpotObj.title}, ${activeTrip.destination}`;
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                      window.open(url, '_blank');
                    }}
                    className="py-1 px-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[8px] font-mono uppercase font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Navigation className="w-2 h-2 fill-white text-white" />
                    <span>Navigate</span>
                  </button>
                </div>
              )}

              {/* 2. Sleek, Unified Day Switcher & Stats Dashboard Card */}
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/50 space-y-2.5 shadow-3xs">
                <div className="flex items-center justify-between select-none">
                  <button
                    type="button"
                    disabled={selectedDayIdx === 0}
                    onClick={() => {
                      setSelectedDayIdx(prev => Math.max(0, prev - 1));
                    }}
                    className="p-1 px-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 disabled:opacity-30 transition-all font-mono text-[9px] font-black flex items-center gap-0.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-3 h-3 stroke-[3]" />
                    <span>Prev</span>
                  </button>

                  <div className="text-center">
                    <span className="text-[11px] font-serif font-black text-[#5A5A40] block">
                      Day {selectedDayIdx + 1} of {Math.max(1, actualDates.length)}
                    </span>
                    <span className="text-[8px] font-mono text-stone-500 font-bold uppercase tracking-wide leading-none block mt-0.5">
                      {(() => {
                        const dateObj = new Date(dateStr + 'T00:00:00');
                        return isNaN(dateObj.getTime())
                          ? dateStr
                          : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      })()}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={selectedDayIdx >= Math.max(1, actualDates.length) - 1}
                    onClick={() => {
                      setSelectedDayIdx(prev => Math.min(actualDates.length - 1, prev + 1));
                    }}
                    className="p-1 px-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 disabled:opacity-30 transition-all font-mono text-[9px] font-black flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>

                {/* Inline Stats Ribbon */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-stone-200/80">
                  <div className="text-left">
                    <span className="text-[7.5px] font-mono uppercase text-[#8C857E] block font-black leading-none">Spent Today</span>
                    <span className="text-[10.5px] font-extrabold text-[#3C3836] font-mono mt-0.5 block">
                      {dayTotalSpent.toLocaleString()} {activeTrip.currency}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] font-mono uppercase text-[#8C857E] block font-black leading-none font-sans">Progress</span>
                    <span className="text-[10.5px] font-extrabold text-[#5A5A40] font-mono mt-0.5 block">
                      {visitedCount} / {totalCount} Visited
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">

                {/* Day Itinerary elements chronological vertical line list */}
                <div className="relative border-l border-dashed border-[#5A5A40]/30 ml-3 pl-4 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {dayItems.length > 0 ? (
                    dayItems.map((item) => {
                      const isEditing = editingSpotId === item.id;
                      return (
                        <div key={item.id} className="relative group text-left">
                          {/* Visual Bullet node indicator connected by line */}
                          <span className={`absolute -left-[20px] top-[14px] w-2 h-2 rounded-full border border-white shadow-xs z-10 transition-colors ${
                            item.visited ? 'bg-[#8C857E]' : 'bg-[#5A5A40]'
                          }`} />

                          {isEditing ? (
                            <div className="p-3 bg-white border border-[#5A5A40] rounded-xl text-xs space-y-2.5 my-1.5 shadow-2xs">
                              <div className="space-y-1 text-left">
                                <label className="text-[8.5px] font-mono uppercase text-stone-500 block font-bold">Edit Title</label>
                                <input
                                  type="text"
                                  value={editingSpotForm.title}
                                  onChange={(e) => setEditingSpotForm(p => ({ ...p, title: e.target.value }))}
                                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                <div>
                                  <label className="text-[8.5px] font-mono uppercase text-[#5A5A40] block font-bold">⏰ Edit Time</label>
                                  <input
                                    type="time"
                                    value={editingSpotForm.arrivalTime}
                                    onChange={(e) => setEditingSpotForm(p => ({ ...p, arrivalTime: e.target.value }))}
                                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none text-[11px] focus:ring-1 focus:ring-[#5A5A40]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Stay (mins)</label>
                                  <input
                                    type="number"
                                    value={editingSpotForm.estimatedTimeSpent}
                                    onChange={(e) => setEditingSpotForm(p => ({ ...p, estimatedTimeSpent: e.target.value }))}
                                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none text-[11px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Edit Cost</label>
                                  <input
                                    type="number"
                                    value={editingSpotForm.estimatedCost}
                                    onChange={(e) => setEditingSpotForm(p => ({ ...p, estimatedCost: e.target.value }))}
                                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none text-[11px]"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1 text-left">
                                <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Edit Note</label>
                                <input
                                  type="text"
                                  value={editingSpotForm.description}
                                  onChange={(e) => setEditingSpotForm(p => ({ ...p, description: e.target.value }))}
                                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1 text-left">
                                <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Planned Day/Date</label>
                                <select
                                  value={editingSpotForm.visitDate}
                                  onChange={(e) => setEditingSpotForm(p => ({ ...p, visitDate: e.target.value }))}
                                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none text-[11px]"
                                >
                                  {(() => {
                                    const datesList = getDatesInRange(activeTrip.startDate, activeTrip.endDate);
                                    return (datesList.length > 0 ? datesList : [activeTrip.startDate]).map((dt, i) => (
                                      <option key={dt} value={dt}>
                                        Day {i + 1} ({dt})
                                      </option>
                                    ));
                                  })()}
                                </select>
                              </div>
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingSpotId(null)}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-[9px] font-mono font-bold uppercase"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = activeTrip.itinerary.map(i => i.id === item.id ? {
                                      ...i,
                                      title: editingSpotForm.title,
                                      description: editingSpotForm.description,
                                      estimatedCost: Number(editingSpotForm.estimatedCost) || 0,
                                      arrivalTime: editingSpotForm.arrivalTime,
                                      visitDate: editingSpotForm.visitDate,
                                      estimatedTimeSpent: Number(editingSpotForm.estimatedTimeSpent) || 60
                                    } : i);
                                    onUpdateTrip({ ...activeTrip, itinerary: updated });
                                    setEditingSpotId(null);
                                  }}
                                  className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded text-[9px] font-mono font-bold uppercase transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              draggable
                              onDragStart={(e) => {
                                setDraggedItemId(item.id);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (!draggedItemId || draggedItemId === item.id) return;
                                const currentItinerary = [...activeTrip.itinerary];
                                const draggedIndex = currentItinerary.findIndex(x => x.id === draggedItemId);
                                const targetIndex = currentItinerary.findIndex(x => x.id === item.id);
                                
                                if (draggedIndex !== -1 && targetIndex !== -1) {
                                  const [movedItem] = currentItinerary.splice(draggedIndex, 1);
                                  currentItinerary.splice(targetIndex, 0, movedItem);
                                  onUpdateTrip({
                                    ...activeTrip,
                                    itinerary: currentItinerary
                                  });
                                }
                                setDraggedItemId(null);
                              }}
                              className={`p-3 rounded-xl border border-[#F1EFE9] transition-all text-left flex flex-col justify-between gap-2 relative cursor-grab active:cursor-grabbing hover:shadow-xs select-none ${
                                item.visited 
                                  ? 'bg-stone-50/80 border-dashed border-stone-200 opacity-90' 
                                  : 'bg-white hover:bg-[#FAF8F5]/50 hover:border-[#5A5A40]/30 shadow-3xs'
                              } ${draggedItemId === item.id ? 'opacity-40 scale-98 border-amber-300' : ''}`}
                            >
                              {/* Spot top metadata & title */}
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <GripVertical className="w-3 h-3 text-[#8C857E] cursor-grab shrink-0 mt-0.5" />
                                    <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.5 bg-[#FAF8F5] border border-stone-200 text-[#5A5A40] rounded uppercase shrink-0">
                                      {formatTime12h(item.arrivalTime)}
                                    </span>
                                    <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.5 bg-stone-100 border border-stone-200/60 text-stone-600 rounded uppercase shrink-0 flex items-center gap-0.5">
                                      ⏱️ {formatDuration(item.estimatedTimeSpent)}
                                    </span>
                                    <h5 className={`text-xs font-sans font-extrabold flex items-center gap-1 truncate ${item.visited ? 'text-[#8C857E]' : 'text-[#3C3836]'}`}>
                                      {item.visited && (
                                        <span className="inline-flex items-center justify-center w-3 h-3 bg-green-50 text-green-600 rounded-full text-[7px] border border-green-200 shrink-0 font-bold">
                                          ✓
                                        </span>
                                      )}
                                      {item.title}
                                    </h5>
                                  </div>
                                  {item.description && <p className="text-[9.5px] text-[#8C857E] leading-normal mt-0.5 ml-4 line-clamp-2">{item.description}</p>}
                                </div>
                                
                                <div className="text-right shrink-0">
                                  <span className="font-mono text-xs font-bold block text-[#3C3836]">
                                    {item.visited ? 'Spent ' : 'Est '}{item.estimatedCost.toLocaleString()}
                                  </span>
                                  <span className="text-[7.5px] font-bold text-[#8C857E] uppercase block leading-none">
                                    {activeTrip.currency}
                                  </span>
                                </div>
                              </div>

                              {/* Action toolbar containing Directions, Check-in */}
                              <div className="flex justify-between items-center pt-2 border-t border-stone-50 gap-2 flex-wrap select-none">
                                {!item.visited ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const query = `${item.title}, ${activeTrip.destination}`;
                                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                                      window.open(url, '_blank');
                                    }}
                                    className="p-1 px-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-100 transition-all flex items-center gap-1 text-[8.5px] font-mono cursor-pointer"
                                    title="Open directions in Google Maps"
                                  >
                                    <Navigation className="w-2.5 h-2.5" />
                                    <span>Directions</span>
                                  </button>
                                ) : (
                                  <div />
                                )}

                                {item.visited ? (
                                  <div className="bg-amber-50/40 px-2 py-0.5 rounded-lg border border-amber-100 text-[8.5px] text-amber-800 flex items-center gap-1 font-mono font-bold uppercase shrink-0">
                                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                    <span>Checked In✓</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => triggerCheckInInput(item)}
                                      className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] rounded-lg text-[8.5px] font-mono text-white font-bold transition-all uppercase flex items-center gap-1 shrink-0 shadow-3xs cursor-pointer"
                                    >
                                      <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                                      <span>Check In</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {item.visited && item.review && (
                                <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 flex items-center gap-1.5 text-[9.5px] mt-1">
                                  <div className="flex gap-0.5 shrink-0">
                                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                                      <Star key={i} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                    ))}
                                  </div>
                                  <span className="font-serif italic text-stone-550 truncate">"{item.review}"</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[10px] font-sans text-[#A8A29E] italic py-8 text-center bg-[#FAF8F5]/30 border border-stone-100/60 rounded-2xl w-full">
                      🏖️ No scheduled hotspots for Day {selectedDayIdx + 1} yet!
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSpotForm(true);
                          setNewSpotForm(prev => ({ ...prev, visitDate: dateStr }));
                        }}
                        className="mt-2 block mx-auto px-3 py-1.5 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] text-[9.5px] font-mono font-bold uppercase rounded-lg border border-dashed border-[#5A5A40]/40 transition-all"
                      >
                        + Add First Location
                      </button>
                    </div>
                  )}
                </div>

                {/* Add spot button and form placed at the bottom of the itinerary list */}
                <div className="space-y-3 pt-1">
                  {!showAddSpotForm ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSpotForm(true);
                        setNewSpotForm(prev => ({ ...prev, visitDate: dateStr }));
                      }}
                      className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 border border-dashed border-stone-300 text-[#5A5A40] text-[9.5px] font-mono font-bold uppercase rounded-xl flex items-center justify-center gap-1 transition-all shadow-3xs cursor-pointer"
                    >
                      <span>+ Add Spot to Day {selectedDayIdx + 1}</span>
                    </button>
                  ) : (
                    <form onSubmit={handleAddSpot} className="p-3.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl space-y-2.5 text-left animate-fade-in">
                      <div className="flex justify-between items-center pb-1 border-b border-stone-200">
                        <h5 className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-[#5A5A40]">Add Spot to Day {selectedDayIdx + 1}</h5>
                        <button
                          type="button"
                          onClick={() => setShowAddSpotForm(false)}
                          className="text-[9px] font-mono font-bold text-stone-500 hover:text-stone-800"
                        >
                          Cancel
                        </button>
                      </div>
                      
                      {/* GOOGLE MAPS PLACE SEARCH INTEGRATION */}
                      <GooglePlacesSearch
                        onPlaceSelect={(place) => {
                          setNewSpotForm(prev => ({
                            ...prev,
                            title: place.title,
                            description: place.description
                          }));
                          setShowOptionalFields(true);
                        }}
                        currency={activeTrip.currency}
                        biasDestination={activeTrip.destination}
                        placeholder="Search Google Maps..."
                      />

                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="text-[8px] font-mono uppercase text-[#8C857E] block font-bold">Or Customize Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Shibuya Sky, Fuglen Coffee"
                              value={newSpotForm.title}
                              onChange={(e) => setNewSpotForm({ ...newSpotForm, title: e.target.value })}
                              className="w-full bg-white border border-stone-200 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono uppercase text-[#8C857E] block font-bold">Arrival Time *</label>
                            <input
                              type="time"
                              required
                              value={newSpotForm.arrivalTime}
                              onChange={(e) => setNewSpotForm({ ...newSpotForm, arrivalTime: e.target.value })}
                              className="w-full bg-white border border-stone-200 px-2 py-1.5 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                            />
                          </div>
                        </div>

                        {showOptionalFields ? (
                          <div className="space-y-2 pt-1 animate-fade-in text-left">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-mono uppercase text-[#8C857E] block font-bold">Est. Stay (mins)</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 60"
                                  value={newSpotForm.estimatedTimeSpent}
                                  onChange={(e) => setNewSpotForm({ ...newSpotForm, estimatedTimeSpent: e.target.value })}
                                  className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-mono uppercase text-[#8C857E] block font-bold">Est. Cost ({activeTrip.currency})</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 2500"
                                  value={newSpotForm.estimatedCost}
                                  onChange={(e) => setNewSpotForm({ ...newSpotForm, estimatedCost: e.target.value })}
                                  className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[8px] font-mono uppercase text-[#8C857E] block font-bold">Activity / Notes</label>
                              <input
                                type="text"
                                placeholder="e.g. Catch orange hues"
                                value={newSpotForm.description}
                                onChange={(e) => setNewSpotForm({ ...newSpotForm, description: e.target.value })}
                                className="w-full bg-white border border-stone-200 px-2.5 py-1.5 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowOptionalFields(true)}
                            className="text-[9px] font-mono font-bold text-[#5A5A40] hover:underline block text-left"
                          >
                            + Add Details (Time, Note & Cost Optionals)
                          </button>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full mt-1 px-3 py-1.5 bg-[#5A5A40] text-white border border-transparent rounded-lg text-[9px] font-bold uppercase font-mono hover:bg-[#4a4a34] cursor-pointer"
                      >
                        Add to Itinerary
                      </button>
                    </form>
                  )}
                </div>

                {/* Celebrative End-of-Day Wrap Action Bar */}
                {dayItems.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3 rounded-2xl border border-amber-200/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h6 className="font-serif italic text-[11.5px] font-extrabold text-amber-900 flex items-center gap-1">
                        <span>{isCelebrated ? '🥂 Day Completed & Celebrated' : '✨ Day End Celebration'}</span>
                      </h6>
                      <p className="text-[8px] font-mono text-stone-500 uppercase">
                        {visitedCount} of {totalCount} visited spots
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        // Play the celebration bell arpeggio chime!
                        playCelebrationChime();
                        // Open high emotional Spotify Wrapped popup
                        setSpotifySlide(0);
                        setShowSpotifyRecap(true);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 self-end sm:self-auto shrink-0"
                    >
                      <span>🎉 {isCelebrated ? 'Replay Day Recap' : 'Complete & Wrap Day'}</span>
                      <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ----------------- SPOTIFY WRAPPED-STYLE JOURNEY RECAP OVERLAY/BOTTOM SHEET ----------------- */}
        {showSpotifyRecap && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in select-none">
            {(() => {
              const datesList = getDatesInRange(activeTrip.startDate, activeTrip.endDate);
              const actualDates = datesList.length > 0 ? datesList : [activeTrip.startDate || 'Day 1'];
              const dateStr = actualDates[selectedDayIdx] || actualDates[0];

              const dayItems = (activeTrip.itinerary || []).filter(item => {
                if (selectedDayIdx === 0 && !item.visitDate) return true;
                return item.visitDate === dateStr;
              });

              const dayTotalSpent = dayItems
                .filter(item => item.visited)
                .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

              const visitedCount = dayItems.filter(item => item.visited).length;
              const totalCount = dayItems.length;

              const ratedItems = dayItems.filter(item => item.visited && item.rating);
              const averageRating = ratedItems.length > 0 
                ? (ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length).toFixed(1)
                : null;

              // Find top highlight (highest-rated spot)
              const highestRatedSpot = [...ratedItems].sort((a,b) => (b.rating || 0) - (a.rating || 0))[0];

              // Find biggest spline expense
              const biggestExpenseSpot = [...dayItems].sort((a,b) => (b.estimatedCost || 0) - (a.estimatedCost || 0))[0];

              // Grab current note ref
              const dayRef = activeTrip.dayReflections?.[dateStr] || {};
              const initialSavedNote = dayRef.note || '';

              // Multi preset Spotify neon gradient cards
              const slideGradients = [
                'from-[#134e5e] to-[#71b280] text-emerald-50', // Lush Forest
                'from-[#3a6073] to-[#3a7bd5] text-cyan-50',   // Cyber Ocean
                'from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-orange-50', // Spotify Wrapped sunset
                'from-[#1f1c2c] to-[#928dab] text-purple-100', // Midnight neon
                'from-[#11998e] to-[#38ef7d] text-green-50'    // Acid Lime aura
              ];
              const gradientBg = slideGradients[spotifySlide % slideGradients.length];

              return (
                <div className={`w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-br ${gradientBg} border-2 border-white/20 shadow-2xl p-6 relative flex flex-col justify-between aspect-[3/4] h-[550px] transition-all duration-300 text-left`}>
                  
                  {/* Instagram Story / Spotify Recap progress bars */}
                  <div className="flex gap-1.5 w-full">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-white transition-all duration-300 ${
                            idx < spotifySlide ? 'w-full' : idx === spotifySlide ? 'w-full animate-pulse' : 'w-0'
                          }`} 
                        />
                      </div>
                    ))}
                  </div>

                  {/* Elegant Top row */}
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest bg-black/30 text-amber-200 px-2.5 py-1 rounded-full font-bold">
                        🎵 DAY {selectedDayIdx + 1} WRAPPED
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Mark complete on slide close
                        handleToggleDayComplete(dateStr, true);
                        setShowSpotifyRecap(false);
                      }}
                      className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all focus:outline-none"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Dynamic Slide Content */}
                  <div className="flex-1 flex flex-col justify-center py-6">
                    {spotifySlide === 0 && (
                      <div className="space-y-4 animate-fade-in">
                        <h1 className="font-serif italic text-4xl font-extrabold tracking-tight leading-none">
                          Your Day {selectedDayIdx + 1} <br/>Recap is ready.
                        </h1>
                        <p className="font-sans text-xs opacity-90 leading-relaxed font-bold">
                          You visited new spots, tried local treats, and made the most of your day. Tap next to see your day in review!
                        </p>
                        <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-extrabold border border-white/10">
                          ✨ COMPILING RECAP...
                        </div>
                      </div>
                    )}

                    {spotifySlide === 1 && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <h2 className="font-serif italic text-2xl font-black text-amber-200 leading-tight">
                          The Hard Numbers 💸
                        </h2>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-[9px] font-mono uppercase tracking-wider opacity-85 block">Total Spent Today</span>
                            <span className="text-4xl font-mono font-black tracking-tight text-white">
                              {dayTotalSpent.toLocaleString()} <span className="text-lg font-normal">{activeTrip.currency}</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                              <span className="text-[8px] font-mono uppercase tracking-wide text-stone-300 block">Milestones</span>
                              <span className="text-sm font-sans font-black text-white">{visitedCount} of {totalCount}</span>
                              <p className="text-[7.5px] opacity-80 leading-none">Places checked in</p>
                            </div>
                            
                            <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                              <span className="text-[8px] font-mono uppercase tracking-wide text-stone-300 block">Day Vibe</span>
                              <span className="text-sm font-sans font-black text-white">
                                {averageRating ? `${averageRating} ★ avg` : 'No ratings'}
                              </span>
                              <p className="text-[7.5px] opacity-80 leading-none">Of verified items</p>
                            </div>
                          </div>

                          <p className="text-[10px] font-sans italic opacity-90 font-medium">
                            {dayTotalSpent > activeTrip.budget / Math.max(1, actualDates.length)
                              ? "💸 A proper wanderlust splurge day. Worth every single cent!"
                              : "🌿 Incredibly coordinated budget hiking. Your pocket thanks you!"}
                          </p>
                        </div>
                      </div>
                    )}

                    {spotifySlide === 2 && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <h2 className="font-serif italic text-2xl font-black text-lime-300 leading-tight">
                          Top Highlight 🏆
                        </h2>

                        {highestRatedSpot ? (
                          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2">
                            <div>
                              <span className="text-[8px] font-mono uppercase tracking-wider text-lime-400 font-bold block">
                                THE HIGHEST RATED STOP
                              </span>
                              <h3 className="text-lg font-sans font-extrabold text-white leading-tight">
                                {highestRatedSpot.title}
                              </h3>
                              <p className="text-[9px] font-mono text-stone-300 mt-0.5">
                                Estimated cost: {highestRatedSpot.estimatedCost.toLocaleString()} {activeTrip.currency}
                              </p>
                            </div>

                            <p className="text-xs font-serif italic text-white leading-snug">
                              "{highestRatedSpot.review || 'No written journal text yet, but registered with star ratings!'}"
                            </p>

                            <div className="flex gap-0.5">
                              {Array.from({ length: highestRatedSpot.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-black/20 p-4 rounded-2xl text-center space-y-1">
                            <h3 className="text-sm font-sans font-extrabold text-white">No spots rated yet!</h3>
                            <p className="text-[10px] opacity-90 leading-normal">
                              Check into places on your trail to unlock deep highlight insights.
                            </p>
                          </div>
                        )}

                        {biggestExpenseSpot && (
                          <div className="flex items-center gap-2 bg-black/15 p-2 rounded-xl text-[10px]">
                            <span className="font-mono text-[8.5px] uppercase tracking-wider bg-red-400/20 text-red-100 px-1.5 py-0.5 rounded font-bold shrink-0">
                              Peak Bill
                            </span>
                            <span className="truncate opacity-90 font-medium">{biggestExpenseSpot.title}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {spotifySlide === 3 && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <h2 className="font-serif italic text-2xl font-black text-amber-200 leading-tight">
                          📔 Lock the Memory
                        </h2>
                        
                        <p className="text-[10px] opacity-90 font-medium">
                          What was the absolute high of your day? A brief sunset highlight, a great pour-over cup, or a wild taxi conversation:
                        </p>

                        <div className="space-y-2.5">
                          <textarea
                            placeholder="e.g. Sipped cold matchas, took photos near Shibuya Scramble and caught the cool city lights."
                            defaultValue={initialSavedNote}
                            onBlur={(e) => handleSaveDayNote(dateStr, e.target.value)}
                            className="w-full bg-black/40 border border-white/20 p-3 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-yellow-300 h-20 resize-none font-sans"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const txt = e.currentTarget.previousSibling as HTMLTextAreaElement;
                              if (txt) {
                                handleSaveDayNote(dateStr, txt.value);
                                setSyncedAlert(`📔 Saved memory to Day ${selectedDayIdx + 1} Journal!`);
                                setTimeout(() => setSyncedAlert(null), 3000);
                              }
                            }}
                            className="w-full py-2 bg-white text-black font-mono font-bold text-[9.5px] rounded-lg uppercase tracking-wider hover:opacity-90 transition-all shadow"
                          >
                            Save Highlight Tag Note
                          </button>
                        </div>
                      </div>
                    )}

                    {spotifySlide === 4 && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <h2 className="font-serif italic text-3xl font-black text-white leading-tight">
                          Day {selectedDayIdx + 1} <br/>is in the books. 👣
                        </h2>
                        
                        <p className="text-xs opacity-90 font-bold leading-relaxed">
                          Your payments are recorded, budget is updated, and your memories are saved in your scrapbook. You are ready for your next adventure!
                        </p>

                        <div className="bg-black/20 p-3 rounded-xl border border-white/10 text-[10px] space-y-1">
                          <p className="font-mono text-cyan-300 font-bold">🎯 LEAVING ADVENTURE STAMP:</p>
                          <p className="font-bold">Total places mapped: {totalCount}</p>
                          <p className="font-bold">Total spendings: {dayTotalSpent.toLocaleString()} {activeTrip.currency}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/10">
                    <button
                      type="button"
                      disabled={spotifySlide === 0}
                      onClick={() => setSpotifySlide(prev => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 text-[9px] font-mono font-black uppercase text-white/70 hover:text-white disabled:opacity-30 focus:outline-none"
                    >
                      ← Back
                    </button>

                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            idx === spotifySlide ? 'bg-white scale-125' : 'bg-white/40'
                          }`} 
                        />
                      ))}
                    </div>

                    {spotifySlide < 4 ? (
                      <button
                        type="button"
                        onClick={() => setSpotifySlide(prev => prev + 1)}
                        className="px-4 py-1.5 bg-amber-200 text-black font-mono text-[9.5px] font-black rounded-lg uppercase tracking-wide hover:bg-white transition-all focus:outline-none"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          // Toggle day completed in state
                          handleToggleDayComplete(dateStr, true);
                          setShowSpotifyRecap(false);
                          // Auto route to next day index if possible!
                          if (selectedDayIdx < actualDates.length - 1) {
                            setSelectedDayIdx(prev => prev + 1);
                            setSyncedAlert(`👣 Swapped active view to Day ${selectedDayIdx + 2}!`);
                            setTimeout(() => setSyncedAlert(null), 3000);
                          }
                        }}
                        className="px-4 py-1.5 bg-lime-400 text-stone-950 font-mono text-[9.5px] font-black rounded-lg uppercase tracking-wide hover:bg-lime-300 transition-all focus:outline-none shadow"
                      >
                        {selectedDayIdx < actualDates.length - 1 ? 'Go to Next Day →' : 'Complete & Lock Journal ✓'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* DYNAMIC SPENDING SYNCHRONIZATION FEEDBACK CONTAINER */}
      {syncedAlert && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-2xl flex items-start gap-2.5 text-left shadow-xs">
          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <p className="text-[10px] font-sans text-green-800 leading-normal">
            {syncedAlert}
          </p>
        </div>
      )}

      {/* CHECK-IN/RATING MODAL POPUP */}
      {activeCheckInSpot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-[#F1EFE9] w-full max-w-sm text-left space-y-4 shadow-xl">
            {/* Modal Header */}
            <div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#5A5A40] block font-bold">Write community memoir</span>
              <h4 className="font-serif italic text-base font-bold text-[#3C3836]">
                Check-In & Rate: "{activeCheckInSpot.title}"
              </h4>
              <p className="text-[10px] text-[#8C857E] leading-normal">{activeCheckInSpot.description}</p>
            </div>

            {/* Modal fields */}
            <div className="space-y-3">
              {/* Stars input */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-stone-500 block">Rating Score</label>
                <div className="flex gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map(starValue => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setCheckInForm({ ...checkInForm, rating: starValue })}
                      className="focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${starValue <= checkInForm.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* review commentary */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-stone-500 block">Review Feedbacks</label>
                <textarea
                  required
                  placeholder="e.g. Absolutely outstanding pour-over coffee. Beautiful vinyl record corner..."
                  rows={2}
                  value={checkInForm.review}
                  onChange={(e) => setCheckInForm({ ...checkInForm, review: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-[#3C3836] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Spent cost and Currency */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-stone-500 block">Amount Spent</label>
                <input
                  type="number"
                  required
                  value={checkInForm.spentAmount}
                  onChange={(e) => setCheckInForm({ ...checkInForm, spentAmount: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-[#3C3836] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] mt-1"
                />
              </div>

              {/* Cash spending information */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-stone-500 block">Payment Mode</label>
                <div className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-[10px] text-stone-600 font-mono font-bold uppercase mt-1">
                  💵 Cash / Manual Spent Input
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveCheckInSpot(null)}
                className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-bold text-center uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCheckInReview}
                className="flex-1 py-2 rounded-xl bg-[#5A5A40] text-white hover:bg-[#4a4a34] text-xs font-mono font-bold text-center uppercase"
              >
                Submit Review ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
