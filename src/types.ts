/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmotionalTag = 'Joyful' | 'Content' | 'Indulgent' | 'Hesitant' | 'Guilt-free' | 'Regretful' | 'Anxious';

export type ExpenseCategory = 'Food' | 'Cafe' | 'Transit' | 'Lodging' | 'Museum/Events' | 'Entertainment' | 'Shopping' | 'Souvenirs' | 'Misc';

export interface ExpenseEntry {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  emotionalTag: EmotionalTag;
  habits: string[]; // e.g. ["Local Café Workspace", "Captured Photo", "Local Transit Route", "Street Food Adventure", "Late Night Stroll"]
  soundtrack: {
    song: string;
    artist: string;
  } | null;
  note: string;
  photoCover: string | null; // Base64 or stock illustration url
  paidBy: string; // Member who paid
  splitWith: string[]; // List of members sharing the cost (including paidBy if applicable)
}

export interface ItineraryItem {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  visited: boolean;
  arrivalTime?: string; // e.g. "10:30 AM" or "Afternoon"
  rating?: number; // 1-5 stars if visited
  review?: string; // review notes if visited
  vibe?: EmotionalTag; // Travel vibe of the visit
  visitDate?: string;
  paymentMethodId?: string; // connected card used
  lat?: number;
  lon?: number;
  estimatedTimeSpent?: number; // Estimated duration in minutes (e.g., 60, 90, 120)
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g. "Chase Sapphire Preferred"
  type: 'Visa' | 'Mastercard' | 'Apple Pay' | 'Debit' | 'Amex' | 'Cash';
  color: string; // Tailwind bg color class, e.g. "from-blue-600 to-indigo-800"
  lastFour?: string;
  bankName?: 'Maya' | 'GoTyme' | 'MariBank' | 'HSBC' | 'Cash' | 'Other';
  balance?: number;
  apiConnected?: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  description: string;
  coverImage: string; // Stock photo or generated illustration
  budget: number;
  currency: string; // e.g. USD, EUR, JPY, THB, SGD, VND
  startDate: string;
  endDate: string;
  members: string[]; // Splitting group members e.g. ['Sophie', 'Ryu', 'Emma']
  expenseEntries: ExpenseEntry[];
  itinerary: ItineraryItem[];
  paymentMethods: PaymentMethod[];
  savedSpots?: ItineraryItem[];
  dayReflections?: Record<string, { note?: string; completed?: boolean }>;
  accommodation?: 'apartment' | 'hotel' | 'airbnb';
  accommodationName?: string;
  latitude?: number;
  longitude?: number;
}

export interface CommunityReview {
  id: string;
  author: string;
  authorVibe: string;
  placeName: string;
  location: string;
  rating: number; // 1-5
  review: string;
  vibe: EmotionalTag;
  spentAmount: number;
  currency: string;
  date: string;
}

export interface AIRecap {
  tripId: string;
  title: string;
  recapMarkdown: string;
  generatedAt: string;
}

export interface TravelPersonality {
  title: string; // e.g., "The Slow-Brew Coffee Shop Nomad"
  tagline: string; // e.g., "Crafting layouts, sipping lattes, chasing sunsets."
  spendingAura: string; // e.g., "Joyful Indulgence (Warm Terracotta)"
  vibeScore: string; // e.g., "88% Heart-centered, 12% Spreadsheet-led"
  description: string;
  advices: string[];
}
