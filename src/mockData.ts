/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trip, CommunityReview, PaymentMethod, ItineraryItem } from './types';

export const STOCK_COVERS = [
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', // Tokyo Alley
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Beach sunset
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80', // Nature green forest
  'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80', // Art museum gallery
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', // Aesthetic Cafe workspace
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-chase',
    name: "Sophie's Chase Sapphire",
    type: 'Visa',
    color: 'from-[#0A2540] to-[#124076]'
  },
  {
    id: 'pay-apple',
    name: "Emma's Apple Pay",
    type: 'Apple Pay',
    color: 'from-[#3C3836] to-[#5A5A40]'
  },
  {
    id: 'pay-rev',
    name: "Ryu's Revolut Card",
    type: 'Mastercard',
    color: 'from-[#1E3A8A] to-[#3B82F6]'
  },
  {
    id: 'pay-cash',
    name: "Nomad Petty Cash",
    type: 'Cash',
    color: 'from-[#C26D50] to-[#AA563A]'
  }
];

export const MOCK_TRIPS: Trip[] = [];

export const EMOTIONAL_EMOJIS: Record<string, string> = {
  Joyful: '🌸',
  Content: '😌',
  Indulgent: '✨',
  'Guilt-free': '🌱',
  Hesitant: '🤔',
  Regretful: '🩹',
  Anxious: '🥺'
};

export const INSTANT_HABITS = [
  'Local Café Workspace',
  'Captured Photo',
  'Local Transit Route',
  'Street Food Adventure',
  'Late Night Stroll',
  'Boutique Craft Haul',
  'Sunset Sitting',
  'Cozy Library Stop'
];

export const SEED_COMMUNITY_REVIEWS: CommunityReview[] = [];
