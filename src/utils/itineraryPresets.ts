import { ItineraryItem } from '../types';

interface PresetSpot {
  title: string;
  description: string;
  arrivalTime: string;
  estimatedCost: number;
  lat: number;
  lon: number;
}

const PRESETS: Record<string, PresetSpot[]> = {
  tokyo: [
    {
      title: '☕ Fuglen Tokyo (Yoyogi)',
      description: 'Aesthetic Oslo-style retro cafe. Sip an outstanding light roast espresso while observing local vinyl collectors.',
      arrivalTime: '08:30 AM',
      estimatedCost: 850,
      lat: 35.6669,
      lon: 139.6897
    },
    {
      title: '🌳 Meiji Jingu Shrine Forest Walk',
      description: 'Serene gravel walks underneath giant cedar Torii gates. Reconnect and center yourself in historical Tokyo.',
      arrivalTime: '10:15 AM',
      estimatedCost: 0,
      lat: 35.6764,
      lon: 139.6993
    },
    {
      title: '🍜 Harajuku Gyoza Lou',
      description: 'Legendary, humble pocket restaurant. Savor pristine steamed and pan-fried garlic-chive dumplings.',
      arrivalTime: '12:30 PM',
      estimatedCost: 1200,
      lat: 35.6681,
      lon: 139.7058
    },
    {
      title: '🛍️ Daikanyama T-Site Bookshop',
      description: 'Award-winning architectural bento of design, indie magazines, and custom fountain pens. A slow culture sanctuary.',
      arrivalTime: '03:00 PM',
      estimatedCost: 2500,
      lat: 35.6489,
      lon: 139.7001
    },
    {
      title: '🗼 Tokyo Tower Sunset Observatory',
      description: 'Behold the retro-futuristic orange lattice spire as Mount Fuji casts silhouettes in the dusky sky.',
      arrivalTime: '06:00 PM',
      estimatedCost: 1200,
      lat: 35.6586,
      lon: 139.7454
    },
    {
      title: '🍢 Omoide Yokocho (Memory Lane)',
      description: 'Cozy charcoal alleyways in Shinjuku. Savor smoky chicken yakitori under local lanterns.',
      arrivalTime: '08:15 PM',
      estimatedCost: 3200,
      lat: 35.6931,
      lon: 139.6997
    }
  ],
  seoul: [
    {
      title: '☕ Onion Hanok Cafe (Anguk)',
      description: 'Stunning traditional Korean courtyard house serving freshly baked black-sesame croissants and hand-drips.',
      arrivalTime: '09:00 AM',
      estimatedCost: 9500,
      lat: 37.5760,
      lon: 126.9841
    },
    {
      title: '🏰 Gyeongbokgung Palace',
      description: 'Observe the historic Royal Guard Changing Ceremony, framed by mountains in the heart of modern Seoul.',
      arrivalTime: '11:00 AM',
      estimatedCost: 3000,
      lat: 37.5796,
      lon: 126.9770
    },
    {
      title: '🍲 Tosokchon Samgyetang',
      description: 'World-famous ginseng chicken soup served in a historical, cozy Korean floor-seating dining hall.',
      arrivalTime: '01:00 PM',
      estimatedCost: 20000,
      lat: 37.5766,
      lon: 126.9727
    },
    {
      title: '🛍️ Bukchon Hanok Heritage Village',
      description: 'Walk through quiet alleys lined with hundreds of preserved traditional stone and wood homes.',
      arrivalTime: '03:30 PM',
      estimatedCost: 0,
      lat: 37.5829,
      lon: 126.9835
    },
    {
      title: '🏙️ Dongdaemun Design Plaza (DDP)',
      description: 'A futuristic silver spacecraft designed by Zaha Hadid. Marvel at the structural contours and indie design shops.',
      arrivalTime: '06:30 PM',
      estimatedCost: 5000,
      lat: 37.5668,
      lon: 127.0094
    },
    {
      title: '🥩 Myeongdong Kyoja & Street Food',
      description: 'Savor Michelin-starred handmade knife-cut noodles (Kalguksu) and warm garlicky kimchi.',
      arrivalTime: '08:00 PM',
      estimatedCost: 15000,
      lat: 37.5626,
      lon: 126.9854
    }
  ],
  beijing: [
    {
      title: '☕ Berry Beans (Dashilan)',
      description: 'Vintage rooftop cafe hidden in old Hutong alleyways. Sip custom cinnamon-infused cold brews.',
      arrivalTime: '09:00 AM',
      estimatedCost: 45,
      lat: 39.8943,
      lon: 116.3912
    },
    {
      title: '⛩️ Tiananmen Square & Forbidden City',
      description: 'Pass through the majestic Meridian Gate to explore the ancient imperial palace of the Ming and Qing dynasties.',
      arrivalTime: '10:30 AM',
      estimatedCost: 60,
      lat: 39.9163,
      lon: 116.3972
    },
    {
      title: '🥟 Baoyuan Dumpling Restaurant',
      description: 'Colorful natural vegetable-dyed dumplings filled with unique regional bean curds and chives.',
      arrivalTime: '01:15 PM',
      estimatedCost: 80,
      lat: 39.9321,
      lon: 116.4102
    },
    {
      title: '🛶 Houhai Lake Hutong Tour',
      description: 'Cycle or ride a rickshaw through preserved old lanes, and view the lotus ponds alongside Houhai lake.',
      arrivalTime: '04:00 PM',
      estimatedCost: 50,
      lat: 39.9419,
      lon: 116.3861
    },
    {
      title: '🦆 Siji Minfu Roast Duck',
      description: 'Savor crispy, wood-fired Beijing roast duck with sweet bean sauce and paper-thin pancakes overlooking palace moats.',
      arrivalTime: '07:00 PM',
      estimatedCost: 180,
      lat: 39.9168,
      lon: 116.4024
    }
  ],
  jakarta: [
    {
      title: '☕ Giyanti Coffee Roastery',
      description: 'Pioneering third-wave coffee roastery hidden behind a colorful art passageway. Sip pristine local Toraja single-origin espresso.',
      arrivalTime: '08:45 AM',
      estimatedCost: 65000,
      lat: -6.1895,
      lon: 106.8378
    },
    {
      title: '🇮🇩 National Monument (Monas)',
      description: 'Towering landmark in Merdeka Square representing independence. Take a stroll in the surrounding green parks.',
      arrivalTime: '10:30 AM',
      estimatedCost: 15000,
      lat: -6.1754,
      lon: 106.8272
    },
    {
      title: '🍛 Sate Khas Senayan',
      description: 'Indulge in classic Indonesian chicken satay bathed in smooth, creamy Javanese peanut sauce.',
      arrivalTime: '12:30 PM',
      estimatedCost: 120000,
      lat: -6.1856,
      lon: 106.8228
    },
    {
      title: '🏛️ Kota Tua (Old Batavia Square)',
      description: 'Sip tea inside the majestic historical Café Batavia, taking in colonial architecture and local street artists.',
      arrivalTime: '03:30 PM',
      estimatedCost: 50000,
      lat: -6.1341,
      lon: 106.8133
    },
    {
      title: '🛍️ Grand Indonesia & Sky Dining',
      description: 'Observe the busy Jakarta skyline sunset while dining on upscale Martabak or Nasi Goreng.',
      arrivalTime: '07:00 PM',
      estimatedCost: 250000,
      lat: -6.1951,
      lon: 106.8197
    }
  ],
  london: [
    {
      title: '☕ Monmouth Coffee (Covent Garden)',
      description: 'Arguably London’s finest organic filter brews. Savor with a fresh sourdough pastry from local bakers.',
      arrivalTime: '08:30 AM',
      estimatedCost: 7.50,
      lat: 51.5136,
      lon: -0.1268
    },
    {
      title: '🏛️ The British Museum',
      description: 'Stand under the magnificent glass-and-steel Great Court roof and explore world heritage highlights.',
      arrivalTime: '10:00 AM',
      estimatedCost: 0,
      lat: 51.5194,
      lon: -0.1270
    },
    {
      title: '🥧 Borough Market Lunch Scout',
      description: 'Vibrant old gourmet market. Savor artisan pork pies, wild mushroom risottos, or warm salted beef bagels.',
      arrivalTime: '01:00 PM',
      estimatedCost: 15.00,
      lat: 51.5055,
      lon: -0.0909
    },
    {
      title: '🎡 South Bank & Tate Modern Walk',
      description: 'Stroll alongside the majestic River Thames, checking out street booksellers and industrial art spaces.',
      arrivalTime: '03:30 PM',
      estimatedCost: 0,
      lat: 51.5076,
      lon: -0.0994
    },
    {
      title: '🎭 West End Theatre / Soho Sunset',
      description: 'Vibrant Soho neon lanes. Sip craft mocktails and enjoy a spectacular stage performance.',
      arrivalTime: '07:30 PM',
      estimatedCost: 45.00,
      lat: 51.5130,
      lon: -0.1312
    }
  ],
  paris: [
    {
      title: '☕ KB Café Shop (Montmartre)',
      description: 'Fantastic outdoor terrace coffee overlooking the Sacré-Cœur slope. Sip custom flat whites with artisan pain au chocolat.',
      arrivalTime: '08:45 AM',
      estimatedCost: 8.50,
      lat: 48.8809,
      lon: 2.3392
    },
    {
      title: '⛪ Sacré-Cœur Basilica & Artists Square',
      description: 'Ascend the winding Montmartre stairs for a breathtaking panoramic view of the Paris limestone rooftops.',
      arrivalTime: '10:15 AM',
      estimatedCost: 0,
      lat: 48.8867,
      lon: 2.3431
    },
    {
      title: '🖼️ Musée de l’Orangerie',
      description: 'Sit in the contemplative, custom-designed oval rooms displaying Claude Monet’s colossal Water Lilies canvases.',
      arrivalTime: '01:00 PM',
      estimatedCost: 12.50,
      lat: 48.8638,
      lon: 2.3227
    },
    {
      title: '🌳 Tuileries Garden Slow Stroll',
      description: 'Pull up a classic green metal chair by the central fountains. Observe Parisian slow-living.',
      arrivalTime: '03:30 PM',
      estimatedCost: 0,
      lat: 48.8635,
      lon: 2.3275
    },
    {
      title: '🗼 Seine River Cruise (Bateaux Parisiens)',
      description: 'Marvel at the Eiffel Tower starting its warm golden beacon sparkle as you glide beneath ancient stone bridges.',
      arrivalTime: '06:30 PM',
      estimatedCost: 18.00,
      lat: 48.8584,
      lon: 2.2945
    },
    {
      title: '🍷 Le Comptoir de La Gastronomie',
      description: 'Authentic retro bistro. Sip local mocktails and enjoy exquisite homemade duck confit and French onion soup.',
      arrivalTime: '08:00 PM',
      estimatedCost: 35.00,
      lat: 48.8632,
      lon: 2.3436
    }
  ]
};

/**
 * Automatically creates structured itinerary items mapped across the selected trip date ranges
 */
export function generatePresetItinerary(destination: string, dates: string[]): ItineraryItem[] {
  const normalizedDest = destination.toLowerCase();
  
  // Find matching preset key, fallback to Tokyo
  let presetKey = 'tokyo';
  for (const key of Object.keys(PRESETS)) {
    if (normalizedDest.includes(key) || key.includes(normalizedDest)) {
      presetKey = key;
      break;
    }
  }

  const spots = PRESETS[presetKey] || PRESETS.tokyo;
  const items: ItineraryItem[] = [];

  // Distribute spots across the days
  dates.forEach((date, dateIdx) => {
    // Each day gets 2-3 spots from our preset, rotating or shifting
    const dailySpots = [
      spots[(dateIdx * 2) % spots.length],
      spots[(dateIdx * 2 + 1) % spots.length],
      spots[(dateIdx * 2 + 2) % spots.length]
    ];

    dailySpots.forEach(s => {
      items.push({
        id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: s.title,
        description: s.description,
        visitDate: date,
        arrivalTime: s.arrivalTime,
        estimatedCost: s.estimatedCost,
        lat: s.lat,
        lon: s.lon,
        visited: false,
        review: ''
      });
    });
  });

  return items;
}
