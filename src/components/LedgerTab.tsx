import React, { useState } from 'react';
import { Plus, Wallet, Sparkles, Camera, MessageSquare, Check, Star, RefreshCw, AlertCircle, CreditCard, DollarSign, Pencil, Trash2, GripVertical, ArrowUp, ArrowDown, Navigation } from 'lucide-react';
import { Trip, ItineraryItem, PaymentMethod, ExpenseEntry, EmotionalTag, ExpenseCategory } from '../types';
import { EMOTIONAL_EMOJIS } from '../mockData';
import GooglePlacesSearch from './GooglePlacesSearch';
import MiniOSMMap from './MiniOSMMap';

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
  onNavigateToTab: (tab: 'journal' | 'ledger' | 'insights' | 'chat') => void;
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

  // Synchronized Device Time & Itinerary Stay Tracker states
  const [useSimulatedTime, setUseSimulatedTime] = useState(false);
  const [deviceTime, setDeviceTime] = useState<Date>(new Date());
  const [simulatedTimeOffsetMs, setSimulatedTimeOffsetMs] = useState(0); // offset from real time in ms
  const [activeStaySpotId, setActiveStaySpotId] = useState<string | null>(null);
  const [activeStayStartTime, setActiveStayStartTime] = useState<number | null>(null); // timestamp when stay started
  const [lastDismissedReminderSpotId, setLastDismissedReminderSpotId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Native Push Notifications Support
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [sentNotifications, setSentNotifications] = useState<string[]>([]);

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this browser/device');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
    } catch (err) {
      console.error('Error requesting notification permission', err);
    }
  };

  const triggerNativeNotification = (id: string, title: string, body: string) => {
    if (sentNotifications.includes(id)) return;
    setSentNotifications(prev => [...prev, id]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/826/826070.png', // nice travelers/clock icon
          tag: id,
          requireInteraction: true
        });
      } catch (e) {
        console.error('Failed to trigger native notification', e);
      }
    }
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
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDeviceTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getVirtualTime = (): Date => {
    if (useSimulatedTime) {
      return new Date(deviceTime.getTime() + simulatedTimeOffsetMs);
    }
    return deviceTime;
  };

  // Native Push Notifications Auto-fire effect
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const datesList = getDatesInRange(activeTrip.startDate, activeTrip.endDate);
    const actualDates = datesList.length > 0 ? datesList : [activeTrip.startDate || 'Day 1'];
    const dateStr = actualDates[selectedDayIdx] || actualDates[0] || 'Day 1';

    const dayItems = (activeTrip.itinerary || []).filter(item => {
      if (selectedDayIdx === 0 && !item.visitDate) return true;
      return item.visitDate === dateStr;
    });

    const virtualTime = getVirtualTime();

    // 1. Check if active stay tracking is overdue
    if (activeStaySpotId) {
      const activeSpot = dayItems.find(s => s.id === activeStaySpotId);
      if (activeSpot && !activeSpot.visited) {
        const elapsedMs = virtualTime.getTime() - (activeStayStartTime || virtualTime.getTime());
        const activeElapsedTimeMins = Math.floor(elapsedMs / (1000 * 60));
        const totalMins = activeSpot.estimatedTimeSpent || 60;

        if (activeElapsedTimeMins >= totalMins) {
          // Trigger push notification!
          triggerNativeNotification(
            `overdue-${activeSpot.id}`,
            `⏱️ Trail Stay Completed: ${activeSpot.title}`,
            `You've spent your planned ${totalMins} minutes at "${activeSpot.title}". Ready to head to the next spot?`
          );
        }
      }
    }

    // 2. Check if any scheduled spot on this day is past scheduled departure
    dayItems.forEach(spot => {
      if (spot.visited) return;
      if (spot.id === lastDismissedReminderSpotId) return;

      const parsedTime = parseArrivalTime(spot.arrivalTime);
      if (!parsedTime) return;

      const schedArrivalDate = new Date(virtualTime);
      schedArrivalDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

      const stayMins = spot.estimatedTimeSpent || 60;
      const schedDepartureDate = new Date(schedArrivalDate.getTime() + stayMins * 60 * 1000);

      if (virtualTime.getTime() > schedDepartureDate.getTime()) {
        triggerNativeNotification(
          `scheduled-overdue-${spot.id}`,
          `🚨 Trail Departure Alert: ${spot.title}`,
          `Your scheduled visit at "${spot.title}" should be complete by now. Ready to head to your next destination?`
        );
      }
    });

  }, [
    deviceTime,
    useSimulatedTime,
    simulatedTimeOffsetMs,
    activeStaySpotId,
    activeStayStartTime,
    activeTrip.itinerary,
    selectedDayIdx,
    lastDismissedReminderSpotId
  ]);

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

    fetch('/api/payment/charge', {
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
          habits: ['Captured Photo', 'Modern NFC Swipe'],
          soundtrack: null,
          note: `[Chained API Charge] ₱${amt.toLocaleString()} captured. Attempted primary: ${selectedCard.name}, Authorized source: ${data.chargedCardName}.`,
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
          review: checkInForm.review || `Contactless billing synced. Authenticated via ${data.chargedCardName}.`,
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
        setSyncedAlert(`🎉 Automated Payment Chaining Success: Charge of ₱${amt.toLocaleString()} processed via ${data.chargedCardName}!`);
        setTimeout(() => setSyncedAlert(null), 8500);
      } else {
        // DECLINED ACROSS ALL CARDS!
        setActiveTransactionLogs(data.logs);
        alert(`🚨 ALL CARDS DECLINED!\nEvery connected trip payment method in the fallback loop failed-over with insufficient balance or network declination! Account balance remains untouched.`);
      }
    })
    .catch(err => {
      console.error(err);
      setIsCharging(false);
      alert("Payment processor network handshake error. Verify server is online.");
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

    fetch('/api/payment/connect-card', {
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
      setSyncedAlert("🎉 All active itinerary spots have been checked off! Create a new planned spot to run the sync runner.");
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

    fetch('/api/payment/charge', {
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
              review: `[Auto-Captured Contactless via ${data.chargedCardName}] Handshake completed with automatic failover chain validation.`,
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
          note: `[Auto-Capture Handshake] Charged ₱${amt.toLocaleString()} via ${data.chargedCardName}. Checked in automatically!`,
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
          review: `[Auto-Captured via ${data.chargedCardName}] Quick contactless card reader swipe authenticated successfully! Spot review written.`,
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

        setSyncedAlert(`🌟 Contactless swipe of ₱${amt.toLocaleString()} on "${data.chargedCardName}" completed successfully! Auto-Sync logged.`);
        setTimeout(() => setSyncedAlert(null), 9000);
      } else {
        setActiveTransactionLogs(data.logs);
        alert(`🚨 DECLINED AUTO-SWIPE: Insufficient balance on all card routes/methods registered for this trip fallback sequence! Try linking a card or adding budget first.`);
      }
    })
    .catch(err => {
      console.error(err);
      setSyncingCard(null);
    });
  };

  return (
    <div className="space-y-5 p-4 pb-20 overflow-y-auto max-h-[calc(100vh-140px)] select-none">
      
      {/* 1. TRAVEL PLANNER HEADER & LIVE BUDGET HEALTH */}
      <div className="bg-gradient-to-br from-white to-[#FAF9F5] p-5 rounded-3xl border border-[#F1EFE9] shadow-2xs space-y-3 relative overflow-hidden">
        {/* Scrap tape decoration */}
        <div className="absolute top-1 right-6 w-24 h-4 bg-[#DDD0C5]/30 flex items-center justify-center font-mono text-[7px] text-[#5A5A40] font-bold uppercase tracking-widest rotate-2 select-none">
          🏷️ Budget Sync
        </div>

        {/* Destination & Dates */}
        <div className="text-left -mb-1">
          <p className="text-[8px] font-mono uppercase tracking-widest text-[#8C857E] font-extrabold leading-none">Budget Reminder</p>
          <h3 className="font-serif italic text-lg font-black text-[#3C3836] mt-1 leading-tight">
            {activeTrip.name}
          </h3>
          <p className="text-[9px] font-mono text-[#A8A29E] mt-0.5 font-bold uppercase">📍 {activeTrip.destination}</p>
        </div>

        {/* Budget stats */}
        <div className="space-y-2 pt-2 border-t border-[#F1EFE9]/60 text-left">
          <div className="flex justify-between items-baseline">
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-[#8C857E] font-extrabold">Active Budget Limit</span>
            {isAdjustingBudget ? (
              <div className="flex gap-1.5 items-center">
                <input
                  type="number"
                  value={adjustedBudgetValue}
                  onChange={(e) => setAdjustedBudgetValue(e.target.value)}
                  className="w-20 px-1.5 py-0.5 rounded-lg border border-stone-300 text-[10px] font-mono focus:outline-none bg-white font-extrabold text-[#3C3836]"
                />
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="bg-[#5A5A40] text-white px-2 py-0.5 rounded-md text-[8px] font-bold uppercase font-mono hover:bg-[#4a4a34] transition-all"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdjustingBudget(true)}
                className="text-[9px] text-[#5A5A40] underline hover:text-[#4a4a34] font-extrabold uppercase font-mono tracking-wide"
              >
                Edit Limit
              </button>
            )}
          </div>

          <div className="flex justify-between items-baseline">
            <h4 className="text-xl font-bold font-serif italic text-[#3C3836] tracking-tight">
              {totalSpent.toLocaleString()}
              <span className="text-[9px] font-mono text-[#8C857E] ml-1 uppercase font-normal">
                {activeTrip.currency} Spent
              </span>
            </h4>
            <span className="text-[10px] font-mono font-extrabold text-[#5A5A40]">
              / {activeTrip.budget.toLocaleString()} {activeTrip.currency}
            </span>
          </div>

          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden relative border border-stone-200/50">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUtilization > 95 ? 'bg-rose-500' : budgetUtilization > 80 ? 'bg-amber-400' : 'bg-[#5A5A40]'
              }`}
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>

          <div className="flex justify-between text-[8px] font-mono text-[#8C857E] font-bold uppercase tracking-wider leading-none">
            <span>{budgetUtilization}% utilized</span>
            <span className={remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-700'}>
              {remainingBudget < 0 ? 'Exceeded by ' : 'Left '}{Math.abs(remainingBudget).toLocaleString()} {activeTrip.currency}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE TRAVEL ITINERARY CHECK-INS */}
      <div className="bg-white p-5 rounded-3xl border border-[#F1EFE9] shadow-2xs space-y-4 text-left">
        {(() => {
          const nextSpotObj = (activeTrip.itinerary || []).find(item => !item.visited);
          if (!nextSpotObj) return null;
          return (
            <div className="p-3 bg-[#5A5A40]/5 border border-[#5A5A40]/15 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left animate-fade-in mb-2">
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 text-[7.5px] font-mono uppercase bg-[#5A5A40]/10 text-[#5A5A40] px-1.5 py-0.5 rounded font-black">
                  🎯 Next Destination
                </span>
                <h4 className="text-xs font-sans font-extrabold text-stone-800 leading-tight">
                  {nextSpotObj.title}
                </h4>
                {nextSpotObj.arrivalTime && (
                  <p className="text-[8.5px] text-[#8C857E] font-mono leading-none">
                    Expected Arrival: {nextSpotObj.arrivalTime}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const dest = nextSpotObj.lat && nextSpotObj.lon 
                    ? `${nextSpotObj.lat},${nextSpotObj.lon}` 
                    : `${nextSpotObj.title}, ${activeTrip.destination}`;
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
                  window.open(url, '_blank');
                }}
                className="py-1 px-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-[8.5px] font-mono uppercase font-black rounded-lg transition-all shadow-3xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Navigation className="w-2.5 h-2.5 fill-white text-white" />
                <span>Navigate</span>
              </button>
            </div>
          );
        })()}

        <div className="flex justify-between items-center bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F1EFE9]">
          <div>
            <h4 className="text-[9px] font-mono uppercase tracking-widest text-[#8C857E] font-bold">Itinerary</h4>
            <p className="text-[8px] font-mono text-[#A8A29E] leading-none uppercase">Check off visited places to post community reviews</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSpotForm(!showAddSpotForm)}
            className="px-2 py-1 bg-[#5A5A40] text-white font-mono text-[8px] font-bold tracking-wider rounded-lg hover:bg-[#4a4a34] cursor-pointer"
          >
            {showAddSpotForm ? 'Cancel' : '+ Add Spot'}
          </button>
        </div>

        {/* Quick Add planned spot form */}
        {showAddSpotForm && (
          <form onSubmit={handleAddSpot} className="p-3.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl space-y-2.5 text-left animate-fade-in">
            <h5 className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#5A5A40]">Add Itinerary Spot</h5>
            
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
              <div>
                <label className="text-[8.5px] font-mono uppercase text-stone-500 block">Or Customize Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shibuya Sky, Fuglen Coffee"
                  value={newSpotForm.title}
                  onChange={(e) => setNewSpotForm({ ...newSpotForm, title: e.target.value })}
                  className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>

              {(() => {
                const datesList = getDatesInRange(activeTrip.startDate, activeTrip.endDate);
                if (datesList.length <= 1) return null;
                return (
                  <div>
                    <label className="text-[8.5px] font-mono uppercase text-stone-500 block">🗓️ Planned Day</label>
                    <select
                      value={newSpotForm.visitDate || activeTrip.startDate || ''}
                      onChange={(e) => setNewSpotForm({ ...newSpotForm, visitDate: e.target.value })}
                      className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                    >
                      {datesList.map((dt, i) => (
                        <option key={dt} value={dt}>
                          Day {i + 1} ({dt})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div>
                <label className="text-[8.5px] font-mono uppercase text-stone-500 block">💳 Linked Payment Card</label>
                <select
                  value={newSpotForm.paymentMethodId || activeTrip.paymentMethods?.[0]?.id || ''}
                  onChange={(e) => setNewSpotForm({ ...newSpotForm, paymentMethodId: e.target.value })}
                  className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none cursor-pointer"
                >
                  {activeTrip.paymentMethods && activeTrip.paymentMethods.map(card => (
                    <option key={card.id} value={card.id}>{card.name} ({card.type})</option>
                  ))}
                  <option value="none">None (Manual Cash / Guest Spent)</option>
                </select>
              </div>

              {showOptionalFields ? (
                <div className="space-y-2 pt-1 animate-fade-in text-left">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono uppercase text-stone-500 block">Estimated Arrival Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 10:30 AM"
                        value={newSpotForm.arrivalTime}
                        onChange={(e) => setNewSpotForm({ ...newSpotForm, arrivalTime: e.target.value })}
                        className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono uppercase text-stone-500 block">Est. Stay (mins)</label>
                      <input
                        type="number"
                        placeholder="e.g. 60"
                        value={newSpotForm.estimatedTimeSpent}
                        onChange={(e) => setNewSpotForm({ ...newSpotForm, estimatedTimeSpent: e.target.value })}
                        className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8.5px] font-mono uppercase text-stone-500 block">Activity / Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Catch orange hues"
                        value={newSpotForm.description}
                        onChange={(e) => setNewSpotForm({ ...newSpotForm, description: e.target.value })}
                        className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] font-mono uppercase text-stone-500 block">Est. Cost ({activeTrip.currency})</label>
                      <input
                        type="number"
                        placeholder="e.g. 2500"
                        value={newSpotForm.estimatedCost}
                        onChange={(e) => setNewSpotForm({ ...newSpotForm, estimatedCost: e.target.value })}
                        className="w-full bg-white border border-stone-200 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none"
                      />
                    </div>
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
              className="w-full mt-1 px-3 py-1.5 bg-[#5A5A40] text-white border border-transparent rounded-lg text-[9px] font-bold uppercase font-mono hover:bg-[#4a4a34]"
            >
              Add to Itinerary
            </button>
          </form>
        )}

        {/* Day-by-Day Navigation Carousel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E] font-bold">Choose Day</span>
            <span className="text-[8.5px] font-mono text-[#5A5A40] font-bold bg-[#FAF8F5] border border-stone-200 px-2 py-0.5 rounded-md">
              Day {selectedDayIdx + 1} of {Math.max(1, getDatesInRange(activeTrip.startDate, activeTrip.endDate).length)}
            </span>
          </div>

          <div className="flex gap-2 pb-2 overflow-x-auto select-none no-scrollbar snap-x scroll-smooth">
            {(() => {
              const datesList = getDatesInRange(activeTrip.startDate, activeTrip.endDate);
              const actualDates = datesList.length > 0 ? datesList : [activeTrip.startDate || 'Day 1'];

              return actualDates.map((dateStr, dayIdx) => {
                const dayItems = (activeTrip.itinerary || []).filter(item => {
                  if (dayIdx === 0 && !item.visitDate) return true;
                  return item.visitDate === dateStr;
                });
                const visitedCount = dayItems.filter(item => item.visited).length;
                const totalCount = dayItems.length;
                const dayRef = activeTrip.dayReflections?.[dateStr] || {};
                const isCelebrated = dayRef.completed || false;
                const isActive = selectedDayIdx === dayIdx;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDayIdx(dayIdx);
                      // Align planned spot default date
                      setNewSpotForm(prev => ({ ...prev, visitDate: dateStr }));
                    }}
                    className={`flex-shrink-0 px-3.5 py-2.5 rounded-2xl border text-left transition-all snap-start flex flex-col justify-between gap-1 min-w-[125px] ${
                      isActive
                        ? 'bg-[#5A5A40] border-[#5A5A40] text-white shadow-md scale-[1.02]'
                        : 'bg-white hover:bg-[#FAF8F5]/60 border-stone-200/80 text-[#3C3836] shadow-3xs'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-[10px] font-serif italic ${isActive ? 'text-amber-200' : 'text-[#5A5A40]'} font-extrabold`}>
                        Day {dayIdx + 1}
                      </span>
                      {isCelebrated && (
                        <span className="text-[10px] animate-bounce">🎉</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-[9px] font-mono leading-none ${isActive ? 'text-stone-200' : 'text-stone-500'}`}>
                        {(() => {
                          const dateObj = new Date(dateStr + 'T00:00:00');
                          return isNaN(dateObj.getTime())
                            ? dateStr
                            : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        })()}
                      </p>
                      <p className={`text-[7.5px] font-mono font-bold mt-1 uppercase ${isActive ? 'text-amber-100/80' : 'text-[#8C857E]'}`}>
                        {visitedCount}/{totalCount} Spots
                      </p>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Focused Active Day Trail Panel */}
        <div className="space-y-4 text-left">
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
            const savedNote = dayRef.note || '';

            return (
              <div className="space-y-4">
                {/* Active Day Summary Ribbon */}
                <div className="flex items-center justify-between bg-amber-50/50 border border-amber-200/40 p-3 rounded-2xl shadow-3xs">
                  <div>
                    <h5 className="font-serif italic text-xs font-black text-[#5A5A40]">
                      🍂 Day {selectedDayIdx + 1} Current Trail
                    </h5>
                    <p className="text-[8.5px] font-mono font-medium text-stone-500 uppercase leading-none">
                      {(() => {
                        const dateObj = new Date(dateStr + 'T00:00:00');
                        return isNaN(dateObj.getTime())
                          ? dateStr
                          : dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                      })()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-extrabold text-[#3C3836] block">
                      {dayTotalSpent.toLocaleString()} {activeTrip.currency} Spent
                    </span>
                    <span className="text-[7.5px] font-mono text-[#8C857E] uppercase font-bold tracking-wider">
                      {visitedCount} of {totalCount} places checked in
                    </span>
                  </div>
                </div>

                {(() => {
                  // 1. Current Virtual Time
                  const virtualTime = getVirtualTime();
                  const virtualTimeStr = virtualTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

                  // 2. Determine active spot based on manual tracker
                  let currentActiveSpot: ItineraryItem | null = null;
                  let activeElapsedTimeMins = 0;
                  let activeProgressPercent = 0;
                  let activeTimeRemaining = 0;
                  let activeIsOverdue = false;

                  if (activeStaySpotId) {
                    const spot = dayItems.find(s => s.id === activeStaySpotId);
                    if (spot && !spot.visited) {
                      currentActiveSpot = spot;
                      const elapsedMs = virtualTime.getTime() - (activeStayStartTime || virtualTime.getTime());
                      activeElapsedTimeMins = Math.floor(elapsedMs / (1000 * 60));
                      const totalMins = spot.estimatedTimeSpent || 60;
                      activeProgressPercent = Math.min(100, (activeElapsedTimeMins / totalMins) * 100);
                      activeTimeRemaining = Math.max(0, totalMins - activeElapsedTimeMins);
                      activeIsOverdue = activeElapsedTimeMins >= totalMins;
                    }
                  }

                  // 3. Automated background checks for ANY unvisited spot on this day that is scheduled and past its planned departure
                  const overdueScheduledSpots = dayItems.filter(spot => {
                    if (spot.visited) return false;
                    if (spot.id === lastDismissedReminderSpotId) return false;
                    
                    const parsedTime = parseArrivalTime(spot.arrivalTime);
                    if (!parsedTime) return false;

                    // Create a Date object for today with the scheduled hours & minutes
                    const schedArrivalDate = new Date(virtualTime);
                    schedArrivalDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

                    const stayMins = spot.estimatedTimeSpent || 60;
                    const schedDepartureDate = new Date(schedArrivalDate.getTime() + stayMins * 60 * 1000);

                    // It's overdue if current time is past scheduled departure time
                    return virtualTime.getTime() > schedDepartureDate.getTime();
                  });

                  // The main urgent warning to display
                  const primaryReminderSpot = currentActiveSpot && activeIsOverdue 
                    ? currentActiveSpot 
                    : (overdueScheduledSpots.length > 0 ? overdueScheduledSpots[0] : null);

                  // Find next unvisited spot to suggest moving to
                  const currentSpotIndex = primaryReminderSpot 
                    ? dayItems.findIndex(s => s.id === primaryReminderSpot.id) 
                    : -1;
                  const nextSuggestedSpot = currentSpotIndex !== -1 
                    ? dayItems.slice(currentSpotIndex + 1).find(s => !s.visited) 
                    : dayItems.find(s => !s.visited && s.id !== (primaryReminderSpot?.id || ''));

                  return (
                    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 space-y-3.5 shadow-3xs relative overflow-hidden my-1">
                      {/* Decorative glowing gradient header */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-[#5A5A40] to-stone-400" />
                      
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <h4 className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#5A5A40] flex items-center gap-1">
                            ⏰ Connected Device Co-Pilot
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-stone-200/60 px-2 py-0.5 rounded-lg">
                          <span className="text-[10px] font-mono text-stone-600 font-bold tracking-tight">
                            {virtualTimeStr}
                          </span>
                          <span className="text-[8px] font-mono bg-[#5A5A40] text-white px-1 rounded font-extrabold uppercase">
                            {useSimulatedTime ? 'SIMULATED' : 'LIVE'}
                          </span>
                        </div>
                      </div>

                      {/* Simulation tools to fast forward / test reminders */}
                      <div className="bg-[#FAF8F5] border border-stone-200/50 p-2 rounded-xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="toggle-sim-time"
                            checked={useSimulatedTime}
                            onChange={(e) => {
                              setUseSimulatedTime(e.target.checked);
                              if (!e.target.checked) {
                                setSimulatedTimeOffsetMs(0); // reset
                              }
                            }}
                            className="rounded border-stone-300 text-[#5A5A40] focus:ring-[#5A5A40] cursor-pointer w-3 h-3"
                          />
                          <label htmlFor="toggle-sim-time" className="text-[9px] font-mono text-[#5A5A40] font-bold uppercase cursor-pointer select-none">
                            Simulate Time (Test Reminders)
                          </label>
                        </div>

                        {useSimulatedTime && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSimulatedTimeOffsetMs(prev => prev + 15 * 60 * 1000)}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-[#5A5A40] hover:text-white border border-stone-200 text-[#5A5A40] rounded font-mono text-[8px] font-bold transition-all cursor-pointer"
                            >
                              +15m
                            </button>
                            <button
                              type="button"
                              onClick={() => setSimulatedTimeOffsetMs(prev => prev + 60 * 60 * 1000)}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-[#5A5A40] hover:text-white border border-stone-200 text-[#5A5A40] rounded font-mono text-[8px] font-bold transition-all cursor-pointer"
                            >
                              +1h
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSimulatedTimeOffsetMs(0);
                                setUseSimulatedTime(false);
                              }}
                              className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded font-mono text-[8px] font-bold transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Push Notification permission indicator & tester */}
                      <div className="bg-[#FAF8F5] border border-stone-200/50 p-2.5 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-500">🔔</span>
                            <span className="font-mono text-[9px] font-bold uppercase text-stone-600">
                              System Notifications
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {notificationPermission === 'granted' ? (
                              <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                Active / Granted
                              </span>
                            ) : notificationPermission === 'denied' ? (
                              <span className="text-[9px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                Blocked 🛑
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={requestNotificationPermission}
                                className="text-[9px] font-mono font-black text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-0.5 rounded-lg uppercase tracking-wide transition-all shadow-3xs cursor-pointer"
                              >
                                Enable Push ⚡
                              </button>
                            )}

                            {/* Sound FX Toggle */}
                            <button
                              type="button"
                              onClick={() => setSoundEnabled(!soundEnabled)}
                              className={`p-1 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                soundEnabled 
                                  ? 'bg-[#5A5A40]/10 border-[#5A5A40]/30 text-[#5A5A40]' 
                                  : 'bg-stone-50 border-stone-200 text-stone-400'
                              }`}
                              title={soundEnabled ? 'Mute Chime Sound' : 'Enable Chime Sound'}
                            >
                              {soundEnabled ? '🔊' : '🔇'}
                            </button>
                          </div>
                        </div>

                        {/* Test Notification Trigger */}
                        {notificationPermission === 'granted' && (
                          <div className="flex justify-between items-center border-t border-stone-200/40 pt-1.5">
                            <span className="text-[8.5px] font-mono text-stone-500 uppercase">
                              Send real system test push notice
                            </span>
                            <button
                              type="button"
                              onClick={() => triggerNativeNotification(
                                `test-${Date.now()}`, 
                                `🌍 Scout Co-Pilot Push`, 
                                `Co-Pilot system is connected! Your native device notification service is now fully active.`
                              )}
                              className="text-[8.5px] font-mono font-bold bg-[#5A5A40] text-white hover:bg-[#4a4a34] px-2 py-0.5 rounded-md uppercase transition-all cursor-pointer"
                            >
                              Test Push Notice
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Active stay tracker progress */}
                      {currentActiveSpot ? (
                        <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 p-3 rounded-xl space-y-2 text-left animate-fade-in">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-[8px] font-mono text-[#8C857E] uppercase font-bold">CURRENT ACTIVE STAY</p>
                              <h6 className="text-xs font-sans font-extrabold text-[#3C3836]">
                                📍 {currentActiveSpot.title}
                              </h6>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] font-mono font-bold ${activeIsOverdue ? 'text-red-600 animate-pulse' : 'text-[#5A5A40]'}`}>
                                {activeElapsedTimeMins}m / {currentActiveSpot.estimatedTimeSpent || 60}m
                              </span>
                              <span className="text-[8px] text-[#8C857E] uppercase font-bold block leading-none mt-0.5">
                                {activeIsOverdue ? 'OVERDUE' : `${activeTimeRemaining}m left`}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden relative">
                            <div 
                              style={{ width: `${activeProgressPercent}%` }}
                              className={`h-full rounded-full transition-all duration-1000 ${
                                activeIsOverdue ? 'bg-red-500 animate-pulse' : 'bg-[#5A5A40]'
                              }`}
                            />
                          </div>

                          <div className="flex justify-between items-center pt-1 text-[9px] font-mono">
                            <button
                              type="button"
                              onClick={() => {
                                triggerCheckInInput(currentActiveSpot!);
                                setActiveStaySpotId(null);
                                setActiveStayStartTime(null);
                              }}
                              className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              ✓ Check In Spot
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStaySpotId(null);
                                setActiveStayStartTime(null);
                              }}
                              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200/50 rounded-lg font-bold transition-all cursor-pointer"
                            >
                              Stop Tracker
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-stone-200 p-3 rounded-xl text-center">
                          <p className="text-[9.5px] font-mono text-[#8C857E] leading-relaxed">
                            🛋️ No live tracking active. Click <span className="font-bold text-[#5A5A40]">⚡ Tracker</span> on any spot card below to start its live stay timer!
                          </p>
                        </div>
                      )}

                      {/* Pulsing OVERDUE Warning Banner */}
                      {primaryReminderSpot && (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-2 text-left animate-pulse shadow-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-base">🚨</span>
                            <div className="flex-1">
                              <h6 className="text-[10px] font-mono font-extrabold text-amber-800 uppercase leading-none">Smart Stay Notification</h6>
                              <p className="text-xs font-sans font-black text-[#3C3836] mt-1">
                                Time to head to your next spot!
                              </p>
                              <p className="text-[9.5px] text-stone-600 leading-normal mt-0.5">
                                You've spent more than your planned {primaryReminderSpot.estimatedTimeSpent || 60} mins at "{primaryReminderSpot.title}".
                                {nextSuggestedSpot ? ` Next scheduled: "${nextSuggestedSpot.title}".` : ' This was the final spot on today\'s trail!'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setLastDismissedReminderSpotId(primaryReminderSpot.id)}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-mono text-[9px] font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Snooze
                            </button>
                            {nextSuggestedSpot && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Mark current spot as visited first, and automatically start tracker on the next one!
                                  const currentItinerary = activeTrip.itinerary || [];
                                  const updated = currentItinerary.map(i => {
                                    if (i.id === primaryReminderSpot.id) {
                                      return { ...i, visited: true, rating: 5, review: 'Completed stay on route schedule!' };
                                    }
                                    return i;
                                  });
                                  onUpdateTrip({ ...activeTrip, itinerary: updated });

                                  // Start stay tracker on the next spot!
                                  setActiveStaySpotId(nextSuggestedSpot.id);
                                  setActiveStayStartTime(getVirtualTime().getTime());
                                  setLastDismissedReminderSpotId(primaryReminderSpot.id);
                                }}
                                className="px-3 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-mono text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-3xs cursor-pointer"
                              >
                                🚀 Move to "{nextSuggestedSpot.title}"
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Compact OpenStreetMap Map Visualization of current day spots rundown */}
                <MiniOSMMap 
                  destination={activeTrip.destination} 
                  spots={dayItems} 
                />

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
                                  <label className="text-[8.5px] font-mono uppercase text-[#8C857E] block font-bold">Edit Time</label>
                                  <input
                                    type="text"
                                    value={editingSpotForm.arrivalTime}
                                    onChange={(e) => setEditingSpotForm(p => ({ ...p, arrivalTime: e.target.value }))}
                                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded px-2 py-1 focus:outline-none text-[11px]"
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
                                      {item.arrivalTime || 'TBA'}
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
                                  {item.description && <p className="text-[9.5px] text-[#8C857E] leading-normal mt-0.5 ml-4">{item.description}</p>}
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

                              {/* Action toolbar containing Edit, Delete, Check-in */}
                              <div className="flex justify-between items-center pt-2 border-t border-stone-50 gap-2 flex-wrap select-none">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSpotId(item.id);
                                      setEditingSpotForm({
                                        title: item.title,
                                        description: item.description,
                                        arrivalTime: item.arrivalTime || '11:00 AM',
                                        estimatedCost: String(item.estimatedCost),
                                        visitDate: item.visitDate || activeTrip.startDate,
                                        estimatedTimeSpent: String(item.estimatedTimeSpent || 60)
                                      });
                                    }}
                                    className="p-1 px-1.5 bg-stone-50 hover:bg-stone-100 text-[#5A5A40] rounded-lg border border-stone-200/50 transition-all flex items-center gap-1 text-[8.5px] font-mono"
                                    title="Edit details"
                                  >
                                    <Pencil className="w-2.5 h-2.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Do you really want to remove the spot "${item.title}"?`)) {
                                        const updatedItinerary = activeTrip.itinerary.filter(sc => sc.id !== item.id);
                                        onUpdateTrip({ ...activeTrip, itinerary: updatedItinerary });
                                      }
                                    }}
                                    className="p-1 px-1.5 bg-red-50/50 hover:bg-red-50 text-red-500 rounded-lg border border-red-100 transition-all flex items-center gap-1 text-[8.5px] font-mono"
                                    title="Remove spot"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                                {!item.visited && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const dest = item.lat && item.lon 
                                        ? `${item.lat},${item.lon}` 
                                        : `${item.title}, ${activeTrip.destination}`;
                                      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
                                      window.open(url, '_blank');
                                    }}
                                    className="p-1 px-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-100 transition-all flex items-center gap-1 text-[8.5px] font-mono cursor-pointer"
                                    title="Open directions in Google Maps"
                                  >
                                    <Navigation className="w-2.5 h-2.5" />
                                    <span>Directions</span>
                                  </button>
                                )}

                                {item.visited ? (
                                  <div className="bg-amber-50/40 px-2 py-0.5 rounded-lg border border-amber-100 text-[8.5px] text-amber-800 flex items-center gap-1 font-mono font-bold uppercase shrink-0">
                                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                    <span>Checked In✓</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {activeStaySpotId === item.id ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveStaySpotId(null);
                                          setActiveStayStartTime(null);
                                        }}
                                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 rounded-lg text-[8.5px] font-mono text-white font-bold transition-all uppercase flex items-center gap-1 shrink-0 animate-pulse shadow-3xs"
                                      >
                                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                        </span>
                                        <span>Tracking Stay</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveStaySpotId(item.id);
                                          setActiveStayStartTime(getVirtualTime().getTime());
                                          setLastDismissedReminderSpotId(null);
                                        }}
                                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200/60 rounded-lg text-[8.5px] font-mono text-stone-700 font-bold transition-all uppercase flex items-center gap-1 shrink-0 shadow-3xs"
                                        title="Start Live Stay Timer"
                                      >
                                        <span>⚡ Tracker</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => triggerCheckInInput(item)}
                                      className="px-2 py-1 bg-[#5A5A40] hover:bg-[#4a4a34] rounded-lg text-[8.5px] font-mono text-white font-bold transition-all uppercase flex items-center gap-1 shrink-0 shadow-3xs"
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
            );
          })()}
        </div>

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
                          You loaded map coordinates, tested native foods, and lived like a real nomad. Click next to see your daily aura stats!
                        </p>
                        <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-extrabold border border-white/10">
                          ⚡ GENERATING MOMENTS...
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
                          Your splits are synced, cards verified, and daily aura metrics logged securely. You are officially ready to hike forward!
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

      {/* 3. SETTLEMENT DEBTS */}
      <div className="bg-white p-5 rounded-3xl border border-[#F1EFE9] shadow-2xs space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#8C857E] font-bold">Expense Settlements</span>
          <span className="text-[8.5px] px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 font-mono font-bold uppercase">Ledger</span>
        </div>
        
        <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
          {activeDebts.length > 0 ? (
            activeDebts.map((debt, idx) => (
              <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-[#3C3836] py-1 border-b border-stone-100 last:border-b-0">
                <span className="font-bold text-red-500">{debt.from}</span>
                <span className="text-[#A8A29E] text-[9px] uppercase font-mono">owes</span>
                <span className="font-bold text-green-600">{debt.to}</span>
                <span className="font-extrabold border-b border-dashed border-[#DDD0C5]">
                  {debt.amount.toLocaleString()} {activeTrip.currency}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-[10px] font-sans text-[#A8A29E] italic">
              All split debts fully cleared between nomads! 🌿
            </div>
          )}
        </div>
      </div>

      {/* 4. PAYMENT CARDS */}
      <div className="bg-[#1C1B19] p-5 rounded-3xl text-white space-y-4 shadow-md relative overflow-hidden text-left border border-stone-800 transition-all duration-300">
        <button 
          type="button"
          onClick={() => setIsCardsSectionCollapsed(!isCardsSectionCollapsed)}
          className="w-full flex justify-between items-center text-left focus:outline-none"
        >
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#8C857E] font-extrabold">Payment Cards & Backup</p>
            <h4 className="font-serif italic text-sm text-[#EAE0D8] leading-tight font-bold flex items-center gap-1.5">
              <span>💳 Manage your Payment Cards</span>
              <span className="text-[9px] text-[#A8A29E] font-mono font-medium px-1.5 py-0.5 bg-stone-900 rounded border border-stone-800">
                {isCardsSectionCollapsed ? 'Expand Panel' : 'Minimize'}
              </span>
            </h4>
          </div>
          <span className="text-[8px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider shrink-0">
            Active
          </span>
        </button>

        {!isCardsSectionCollapsed && (
          <div className="space-y-4 pt-4 border-t border-stone-800 animate-fade-in text-stone-200">
            
            {/* Part A: Priority Failover Chain */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-extrabold">
                  Selected Card Order ({activeTrip.paymentMethods?.length || 0})
                </span>
                <span className="text-[8px] text-stone-500 font-mono italic">
                  Change which card gets tried first
                </span>
              </div>

              {(!activeTrip.paymentMethods || activeTrip.paymentMethods.length === 0) ? (
                <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-center text-stone-400 space-y-1">
                  <p className="text-xs font-serif italic text-stone-300">No cards selected for this trip.</p>
                  <p className="text-[10px] text-stone-500">Connect digital wallets or cards below and enable them to pay for your trip automatic transactions!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTrip.paymentMethods.map((card, idx) => {
                    const latestCard = registeredCards.find(rc => rc.id === card.id) || card;
                    return (
                      <div 
                        key={card.id} 
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#282724] border border-stone-800 gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Priority index box */}
                          <span className="w-5 h-5 flex items-center justify-center rounded bg-stone-800 border border-stone-700 text-[9px] font-mono font-black text-[#5A5A40]">
                            #{idx + 1}
                          </span>
                          {/* Card small visual representation */}
                          <div className={`w-12 py-1.5 rounded bg-gradient-to-br ${card.color} text-center font-bold text-[8px] tracking-wide shrink-0 font-mono select-none`}>
                            {card.type}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold truncate text-[#EAE0D8] leading-tight">{card.name}</p>
                            <p className="text-[8.5px] text-amber-200 font-mono">
                              ₱{(latestCard.balance || 0).toLocaleString()} <span className="opacity-60 text-stone-400">•••• {card.id.split('-').slice(-1)[0]?.substring(0, 4) || '4242'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Order manipulation and delete buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCardPriority(idx, 'up')}
                            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-350 disabled:opacity-30 disabled:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === activeTrip.paymentMethods.length - 1}
                            onClick={() => handleMoveCardPriority(idx, 'down')}
                            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-350 disabled:opacity-30 disabled:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleCardActiveInTrip(card)}
                            className="px-1.5 py-1 rounded bg-[#5A5A40]/30 hover:bg-[#5A5A40]/50 text-amber-100 text-[8px] font-mono font-bold uppercase transition-colors cursor-pointer"
                            title="Remove from Trip"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part B: All Registered System Wallets */}
            <div className="space-y-2 pt-2 border-t border-stone-850">
              <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                All Added Cards ({registeredCards.length})
              </span>
              {registeredCards.length === 0 ? (
                <p className="text-[10px] text-stone-500 italic">No saved cards found. Please add a payment card below.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {registeredCards.map(c => {
                    const isActive = activeTrip.paymentMethods?.some(tc => tc.id === c.id);
                    return (
                      <div 
                        key={c.id} 
                        className={`p-2.5 rounded-2xl bg-stone-900 border transition-all ${
                          isActive ? 'border-[#5A5A40]' : 'border-stone-850 opacity-70'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[7.5px] font-mono text-[#8C857E] uppercase">{c.bankName}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(c.id)}
                            className="text-stone-550 hover:text-red-400 p-0.5 cursor-pointer"
                            title="Remove entirely"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10.5px] font-extrabold text-[#EAE0D8] mt-1 line-clamp-1">{c.name}</p>
                        <p className="text-[9.5px] font-mono text-amber-200 mt-0.5 font-bold">
                          ₱{(c.balance || 0).toLocaleString()}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-[8px] font-mono text-stone-500">•••• {c.id.split('-').slice(-1)[0]?.substring(0, 4)}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleCardActiveInTrip(c)}
                            className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-black transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                                : 'bg-[#5A5A40]/20 text-stone-400 hover:bg-[#5A5A40]/30'
                            }`}
                          >
                            {isActive ? 'Active ✓' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part C: Connect New Card Form */}
            <form onSubmit={handleConnectCardSubmit} className="pt-2 border-t border-stone-850 space-y-2.5 text-left bg-stone-900/50 p-3 rounded-2xl border border-stone-800">
              <div>
                <span className="text-[9px] font-sans text-stone-300 font-extrabold flex items-center gap-1">
                  <Plus className="w-3 h-3 text-[#5A5A40]" /> Add a new card
                </span>
                <p className="text-[8px] text-stone-400 mt-0.5">Enter your credit or debit card details to connect it to your account.</p>
              </div>

              {cardError && (
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-[9px] font-mono">
                  ⚠ {cardError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#8C857E] block font-mono">Bank or Wallet</label>
                  <select
                    value={newCardBank}
                    onChange={(e) => setNewCardBank(e.target.value)}
                    className="w-full bg-[#282724] border border-stone-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                  >
                    <option value="GoTyme">Gotyme Bank</option>
                    <option value="Maya">Maya Wallet</option>
                    <option value="MariBank">MariBank</option>
                    <option value="HSBC">HSBC Philippines</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#8C857E] block font-mono">Card Balance (PHP)</label>
                  <input
                    type="number"
                    value={newCardLimit}
                    onChange={(e) => setNewCardLimit(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-[#282724] border border-[#3C3836] rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#8C857E] block font-mono">Name on Card</label>
                  <input
                    type="text"
                    required
                    value={newCardHolder}
                    onChange={(e) => setNewCardHolder(e.target.value)}
                    placeholder="SOPHIE TAN"
                    className="w-full bg-[#282724] border border-[#3C3836] rounded px-2 py-1 text-[10px] text-white focus:outline-none placeholder-stone-600 uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#8C857E] block font-mono">Card Number</label>
                  <input
                    type="text"
                    required
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    placeholder="4532 9901 2281 9901"
                    className="w-full bg-[#282724] border border-[#3C3836] rounded px-2 py-1 text-[10px] text-white focus:outline-none placeholder-stone-600"
                  />
                </div>
              </div>

              {/* Added CVV and Expiry Date inputs to make payment real */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#8C857E] block font-mono">Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    required
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    placeholder="e.g. 12/28"
                    maxLength={5}
                    className="w-full bg-[#282724] border border-[#3C3836] rounded px-2 py-1 text-[10px] text-white focus:outline-none placeholder-stone-600"
                  />
                </div>

                <div>
                  <label className="text-[8px] uppercase tracking-wider text-[#8C857E] block font-mono">Security Code (CVV)</label>
                  <input
                    type="text"
                    required
                    value={newCardCVV}
                    onChange={(e) => setNewCardCVV(e.target.value)}
                    placeholder="e.g. 123"
                    maxLength={4}
                    className="w-full bg-[#282724] border border-[#3C3836] rounded px-2 py-1 text-[10px] text-white focus:outline-none placeholder-stone-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isConnectingCard || !newCardNumber || !newCardHolder || !newCardExpiry || !newCardCVV}
                className="w-full py-1.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-mono uppercase text-[9px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
              >
                {isConnectingCard ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-white" />
                    <span>Adding card...</span>
                  </>
                ) : (
                  <>
                    <span>💳 Add Card</span>
                  </>
                )}
              </button>
            </form>

            {/* Part D: Test Swiping Card */}
            <div className="pt-2 border-t border-stone-850 space-y-2">
              <button
                onClick={handleAutoCaptureSimulation}
                disabled={syncingCard !== null}
                className="w-full py-2.5 bg-[#5A5A40] text-white font-mono uppercase text-[9px] tracking-widest rounded-xl hover:bg-[#4a4a34] disabled:opacity-40 active:scale-97 transition-all flex items-center justify-center gap-1.5 font-extrabold shadow cursor-pointer"
              >
                {syncingCard ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Payment (using {syncingCard})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Test Swiping Card</span>
                  </>
                )}
              </button>
              
              <p className="text-[8px] text-[#A8A29E] text-center leading-normal">
                💡 Clicking this simulates using your card to pay for a spot on your trip. It will try to charge your first card. If that card has no money, it will automatically try the other cards in your orders!
              </p>
            </div>

            {/* PAYMENT LOGS */}
            {activeTransactionLogs && (
              <div className="bg-[#141414] rounded-xl p-3 border border-stone-800 text-[8.5px] font-mono text-[#EAE0D8] leading-relaxed text-left max-h-[140px] overflow-y-auto pr-1">
                <div className="flex justify-between items-center text-[7px] tracking-widest uppercase font-extrabold text-[#8C857E] mb-1.5 pb-1 border-b border-stone-800">
                  <span>⚡ PAYMENT SEQUENCE LOGS</span>
                  <button 
                    onClick={() => setActiveTransactionLogs(null)}
                    className="hover:text-stone-300 transition-colors cursor-pointer"
                  >
                    CLEAR
                  </button>
                </div>
                {activeTransactionLogs.map((log, index) => (
                  <div key={index} className="flex gap-1.5">
                    <span className="text-stone-600 select-none">{">"}</span>
                    <span className={log.includes('Failed') || log.includes('Declined') ? 'text-rose-450 font-bold' : log.includes('Success') || log.includes('Succeeded') ? 'text-emerald-400 font-bold' : log.includes('Fallback') ? 'text-amber-400 font-bold' : 'text-stone-400'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}
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

              {/* Card option selection */}
              <div>
                <label className="text-[9px] font-mono uppercase tracking-wider text-stone-500 block">Payment Method Used</label>
                <select
                  value={checkInForm.paymentMethodId}
                  onChange={(e) => setCheckInForm({ ...checkInForm, paymentMethodId: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1.5 text-xs text-[#3C3836] font-medium"
                >
                  {activeTrip.paymentMethods && activeTrip.paymentMethods.map(card => (
                    <option key={card.id} value={card.id}>{card.name} ({card.type})</option>
                  ))}
                  <option value="none">None (Manual Cash / Guest Spent)</option>
                </select>
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
