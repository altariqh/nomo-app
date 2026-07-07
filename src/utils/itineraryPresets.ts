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
      description: 'Aesthetic Oslo-style retro cafe. Google Maps reviews rave about their light roast pour-over espresso and vintage vinyl selection.',
      arrivalTime: '08:30 AM',
      estimatedCost: 850,
      lat: 35.6669,
      lon: 139.6897
    },
    {
      title: '🌳 Meiji Jingu Shrine Forest Walk',
      description: 'Serene gravel walks underneath giant cedar Torii gates. Reconnect and center yourself in historical Tokyo away from city bustle.',
      arrivalTime: '10:15 AM',
      estimatedCost: 0,
      lat: 35.6764,
      lon: 139.6993
    },
    {
      title: '🍜 Harajuku Gyoza Lou',
      description: 'Legendary, humble pocket restaurant. Savor pristine steamed and pan-fried garlic-chive dumplings praised highly by street food guides.',
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
      description: 'Behold the retro-futuristic orange lattice spire as Mount Fuji casts stunning silhouettes in the dusky sky.',
      arrivalTime: '06:00 PM',
      estimatedCost: 1200,
      lat: 35.6586,
      lon: 139.7454
    },
    {
      title: '🍢 Omoide Yokocho (Memory Lane)',
      description: 'Cozy charcoal alleyways in Shinjuku. Savor smoky chicken yakitori under local lanterns in a highly atmospheric setting.',
      arrivalTime: '08:15 PM',
      estimatedCost: 3200,
      lat: 35.6931,
      lon: 139.6997
    },
    {
      title: '⛩️ Senso-ji Temple & Nakamise-dori',
      description: 'Tokyo\'s oldest and most iconic Buddhist temple in historic Asakusa. Best to try: Savor freshly baked sweet potato dumplings along the path.',
      arrivalTime: '09:00 AM',
      estimatedCost: 0,
      lat: 35.7148,
      lon: 139.7967
    },
    {
      title: '🍣 Tsukiji Outer Market Seafood Scout',
      description: 'Savor incredibly fresh sea urchin, blowtorched wagyu skewers, and sweet rolled tamagoyaki omelets from decades-old street vendors.',
      arrivalTime: '07:30 AM',
      estimatedCost: 3000,
      lat: 35.6655,
      lon: 139.7702
    },
    {
      title: '🌿 Shinjuku Gyoen National Garden',
      description: 'Stroll through a magnificent blend of French, English, and traditional Japanese gardens with serene reflective ponds and large lawns.',
      arrivalTime: '02:00 PM',
      estimatedCost: 500,
      lat: 35.6852,
      lon: 139.7101
    },
    {
      title: '🍜 Menya Musashi Ramen (Shinjuku)',
      description: 'Experience thick, robust pork-and-seafood tsukemen dipping noodles. Google Maps reviews highlight their incredibly tender braised pork belly.',
      arrivalTime: '01:00 PM',
      estimatedCost: 1300,
      lat: 35.6942,
      lon: 139.6990
    },
    {
      title: '🏙️ Shibuya Crossing & Shibuya Sky',
      description: 'Behold the world\'s busiest pedestrian crossing from a stunning 229-meter high open-air glass observation deck. Best to go: at golden hour.',
      arrivalTime: '05:00 PM',
      estimatedCost: 2000,
      lat: 35.6585,
      lon: 139.7013
    },
    {
      title: '🍢 Golden Gai Tiny Record Bars',
      description: 'Explore an architectural labyrinth of over 200 tiny, thematic 10-seater watering holes oozing retro Showa-era charm and vinyl tunes.',
      arrivalTime: '09:00 PM',
      estimatedCost: 2500,
      lat: 35.6938,
      lon: 139.7042
    }
  ],
  seoul: [
    {
      title: '☕ Onion Hanok Cafe (Anguk)',
      description: 'Stunning traditional Korean courtyard house serving freshly baked black-sesame croissants and hand-drips praised on social reviews.',
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
      description: 'World-famous ginseng chicken soup served in a historical, cozy Korean floor-seating dining hall. A favorite among locals and travelers.',
      arrivalTime: '01:00 PM',
      estimatedCost: 20000,
      lat: 37.5766,
      lon: 126.9727
    },
    {
      title: '🛍️ Bukchon Hanok Heritage Village',
      description: 'Walk through quiet alleys lined with hundreds of beautifully preserved traditional stone and wood homes from the Joseon dynasty.',
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
      description: 'Savor Michelin-starred handmade knife-cut noodles (Kalguksu) and famously warm, garlicky home-made cabbage kimchi.',
      arrivalTime: '08:00 PM',
      estimatedCost: 15000,
      lat: 37.5626,
      lon: 126.9854
    },
    {
      title: '🗼 N Seoul Tower (Namsan Park)',
      description: 'Ascend Namsan via cable car or a paved forest walk to enjoy panoramic skyline views of the Han River and Seoul’s neon grids.',
      arrivalTime: '05:30 PM',
      estimatedCost: 16000,
      lat: 37.5512,
      lon: 126.9882
    },
    {
      title: '☕ Fritz Coffee Company (Dohwa)',
      description: 'An iconic vintage Hanok café known for its legendary retro seal mascot, incredible freshly roasted single-origins, and award-winning baristas.',
      arrivalTime: '08:30 AM',
      estimatedCost: 6000,
      lat: 37.5431,
      lon: 126.9472
    },
    {
      title: '🌿 Cheonggyecheon Stream Walk',
      description: 'A beautifully restored 11km urban stream flowing below street level. A highly peaceful pathway popular for relaxing strolls.',
      arrivalTime: '10:30 AM',
      estimatedCost: 0,
      lat: 37.5694,
      lon: 126.9784
    },
    {
      title: '🛍️ Insadong Antique & Tea Street',
      description: 'Wander through art galleries, calligraphy shops, and historic wooden teahouses. Savor traditional hot ginger tea with rice cakes.',
      arrivalTime: '03:00 PM',
      estimatedCost: 12000,
      lat: 37.5732,
      lon: 126.9863
    },
    {
      title: '🥘 Gwangjang Market Food Tour',
      description: 'Immerse yourself in a busy sensory haven. Savor legendary crispy mung bean pancakes (binadaetteok) and hand-rolled gimbap.',
      arrivalTime: '01:00 PM',
      estimatedCost: 10000,
      lat: 37.5701,
      lon: 126.9997
    },
    {
      title: '🎶 Hongdae Youth & Indie Music Street',
      description: 'Experience Seoul’s creative energy with amazing street buskers, local clothing shops, and neon-lit retro beer halls.',
      arrivalTime: '08:30 PM',
      estimatedCost: 15000,
      lat: 37.5564,
      lon: 126.9242
    }
  ],
  milan: [
    {
      title: '⛪ Duomo di Milano Cathedral',
      description: 'Marvel at the breathtaking Gothic spires, pink-tinged Candoglia marble, and the gold Madonnina watching over Milan.',
      arrivalTime: '09:00 AM',
      estimatedCost: 15.00,
      lat: 45.4642,
      lon: 9.1900
    },
    {
      title: '☕ Caffè in Galleria Vittorio Emanuele II',
      description: 'Walk through Italy\'s oldest active shopping gallery, styled under a majestic iron-and-glass dome. Savor a pristine Italian espresso.',
      arrivalTime: '11:00 AM',
      estimatedCost: 6.00,
      lat: 45.4655,
      lon: 9.1899
    },
    {
      title: '🍕 Luini Panzerotti Historic Bakery',
      description: 'Savor legendary warm, melt-in-your-mouth mozzarella and tomato deep-fried panzerotti, a true Milanese street food tradition since 1888.',
      arrivalTime: '01:00 PM',
      estimatedCost: 5.00,
      lat: 45.4659,
      lon: 9.1920
    },
    {
      title: '🏰 Castello Sforzesco Castle Walks',
      description: 'Stroll through the massive 15th-century courtyards built by the Duke of Milan, situated alongside the beautiful Sempione Park.',
      arrivalTime: '03:00 PM',
      estimatedCost: 0,
      lat: 45.4705,
      lon: 9.1793
    },
    {
      title: '🎨 Pinacoteca di Brera Art Gallery',
      description: 'Explore Milan\'s main public gallery for paintings, boasting an exceptional collection of Renaissance and Baroque masterpieces.',
      arrivalTime: '05:30 PM',
      estimatedCost: 15.00,
      lat: 45.4719,
      lon: 9.1878
    },
    {
      title: '🌅 Navigli Grande Sunset & Aperitivo',
      description: 'Conclude the evening with a beautiful sunset alongside Milan\'s historic canals, partaking in a traditional Italian Aperitivo ritual.',
      arrivalTime: '07:30 PM',
      estimatedCost: 12.00,
      lat: 45.4526,
      lon: 9.1741
    },
    {
      title: '🎭 Teatro alla Scala Opera House',
      description: 'One of the most prestigious opera houses in the world, renowned for its incredible acoustics and breathtaking red-and-gold auditorium.',
      arrivalTime: '02:00 PM',
      estimatedCost: 12.00,
      lat: 45.4675,
      lon: 9.1895
    },
    {
      title: '🎨 Santa Maria delle Grazie & The Last Supper',
      description: 'A beautiful Renaissance church housing Leonardo da Vinci\'s iconic mural \'The Last Supper\' in its historical refectory.',
      arrivalTime: '10:00 AM',
      estimatedCost: 15.00,
      lat: 45.4660,
      lon: 9.1709
    },
    {
      title: '🌿 QC Termemilano Spa & Wellness',
      description: 'Relax in natural thermal pools, steam rooms, and saunas housed within ancient Spanish stone walls. A stunning wellness oasis.',
      arrivalTime: '04:30 PM',
      estimatedCost: 45.00,
      lat: 45.4518,
      lon: 9.2014
    },
    {
      title: '🍝 Trattoria Milanese (Since 1933)',
      description: 'Indulge in authentic Risotto alla Milanese (golden saffron risotto) and tender Ossobuco at this legendary local culinary landmark.',
      arrivalTime: '08:30 PM',
      estimatedCost: 35.00,
      lat: 45.4623,
      lon: 9.1852
    },
    {
      title: '🛍️ 10 Corso Como Concept Store',
      description: 'Browse a unique, beautiful blend of art, high fashion, design books, and a lush, ivy-draped courtyard garden cafe.',
      arrivalTime: '03:30 PM',
      estimatedCost: 0,
      lat: 45.4828,
      lon: 9.1875
    },
    {
      title: '🍕 Piz Pizzeria',
      description: 'Highly rated local pizzeria known for its incredibly airy wood-fired crusts, complimentary glass of Prosecco, and high-energy staff.',
      arrivalTime: '12:30 PM',
      estimatedCost: 10.00,
      lat: 45.4630,
      lon: 9.1848
    }
  ],
  rome: [
    {
      title: '🏛️ Colosseum (Anfiteatro Flavio)',
      description: 'Step inside the grandest amphitheater of the Roman Empire, imagining epic gladiator spectacles and ancient Roman triumphs.',
      arrivalTime: '09:00 AM',
      estimatedCost: 18.00,
      lat: 41.8902,
      lon: 12.4922
    },
    {
      title: '⛲ Trevi Fountain (Fontana di Trevi)',
      description: 'Toss a coin into the majestic Baroque fountain to guarantee your return to Rome, admiring the intricate marble carvings of Oceanus.',
      arrivalTime: '11:00 AM',
      estimatedCost: 0,
      lat: 41.9009,
      lon: 12.4833
    },
    {
      title: '🍕 Bonci Pizzarium',
      description: 'Savor Rome\'s absolute finest pizza al taglio (pizza by the slice) topped with wild mushrooms, burrata, and cured meats on organic dough.',
      arrivalTime: '12:30 PM',
      estimatedCost: 12.00,
      lat: 41.9075,
      lon: 12.4516
    },
    {
      title: '🏛️ Pantheon Temple of the Gods',
      description: 'Stand underneath the world\'s largest unreinforced concrete dome, marveling at the sunlight streaming through the central oculus.',
      arrivalTime: '02:30 PM',
      estimatedCost: 5.00,
      lat: 41.8986,
      lon: 12.4769
    },
    {
      title: '🍧 Frigidarium Artisan Gelateria',
      description: 'Indulge in legendary, velvety hand-crafted gelato dipped in a premium dark or white chocolate shell for an exceptional treat.',
      arrivalTime: '04:00 PM',
      estimatedCost: 4.00,
      lat: 41.8998,
      lon: 12.4722
    },
    {
      title: '🌇 Piazza Navona Fountain Walk',
      description: 'Stroll through the lively oval-shaped Baroque square, watching street portrait artists and spectacular Bernini installations.',
      arrivalTime: '05:30 PM',
      estimatedCost: 0,
      lat: 41.8989,
      lon: 12.4731
    },
    {
      title: '⛪ Vatican Museums & Sistine Chapel',
      description: 'Stand in awe of Michelangelo\'s magnificent ceiling frescoes and wander through miles of historical papal art collections.',
      arrivalTime: '09:30 AM',
      estimatedCost: 20.00,
      lat: 41.9062,
      lon: 12.4536
    },
    {
      title: '🍝 Da Enzo al 29 (Trastevere)',
      description: 'Queue early for Rome\'s absolute best Cacio e Pepe and Carbonara pasta, served in a cozy, authentic Roman tavern setting.',
      arrivalTime: '07:30 PM',
      estimatedCost: 22.00,
      lat: 41.8881,
      lon: 12.4782
    },
    {
      title: '🌿 Villa Borghese Gardens & Art Gallery',
      description: 'Cycle through Rome\'s grandest public park, visiting the exquisite museum featuring jaw-dropping Bernini marble sculptures.',
      arrivalTime: '03:00 PM',
      estimatedCost: 15.00,
      lat: 41.9131,
      lon: 12.4862
    },
    {
      title: '☕ Sant\'Eustachio il Caffè',
      description: 'Sip Rome\'s most legendary, frothy sweetened espresso prepared behind a secret metal screen since 1938.',
      arrivalTime: '08:30 AM',
      estimatedCost: 3.50,
      lat: 41.8981,
      lon: 12.4748
    },
    {
      title: '🛍️ Spanish Steps & Via Condotti Walk',
      description: 'Walk down the elegant 135-step staircase, exploring high-fashion design boutiques and historic literary cafes.',
      arrivalTime: '04:30 PM',
      estimatedCost: 0,
      lat: 41.9059,
      lon: 12.4827
    },
    {
      title: '🍷 Trastevere Evening Wine Stroll',
      description: 'Lose yourself in ivy-draped medieval alleyways filled with vibrant craft beer bars, street musicians, and cozy wine cellars.',
      arrivalTime: '08:30 PM',
      estimatedCost: 18.00,
      lat: 41.8893,
      lon: 12.4704
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
    },
    {
      title: '🌿 Hyde Park & Serpentine Lake Stroll',
      description: 'Rent a classic rowboat or walk through the grand Royal Park. Stop by the Serpentine Pavilion design exhibit.',
      arrivalTime: '02:00 PM',
      estimatedCost: 0,
      lat: 51.5073,
      lon: -0.1657
    },
    {
      title: '🏰 Tower of London & Tower Bridge',
      description: 'Uncover nearly a thousand years of royal history and marvel at the Crown Jewels before crossing Tower Bridge.',
      arrivalTime: '10:30 AM',
      estimatedCost: 30.00,
      lat: 51.5081,
      lon: -0.0759
    },
    {
      title: '☕ Workshop Coffee (Marylebone)',
      description: 'Exquisite, light-flooded coffee bar. Google Maps reviews praise their incredibly precise, sweet seasonal filter coffees.',
      arrivalTime: '08:00 AM',
      estimatedCost: 6.00,
      lat: 51.5178,
      lon: -0.1492
    },
    {
      title: '🥧 Dishoom Covent Garden (Bombay Cafe)',
      description: 'Savor London\'s absolute best bacon naan roll or house black daal in a beautiful, retro Bombay-styled cafe setting.',
      arrivalTime: '12:30 PM',
      estimatedCost: 20.00,
      lat: 51.5126,
      lon: -0.1264
    },
    {
      title: '🛍️ Liberty London & Regent Street',
      description: 'Explore the iconic mock-Tudor department store filled with floral fabrics, premium lifestyle goods, and artisan glass.',
      arrivalTime: '04:00 PM',
      estimatedCost: 0,
      lat: 51.5137,
      lon: -0.1396
    },
    {
      title: '🎨 Tate Britain Fine Art Archive',
      description: 'Browse the majestic brick gallery housing the largest collection of J.M.W. Turner paintings in the world.',
      arrivalTime: '03:00 PM',
      estimatedCost: 0,
      lat: 51.4911,
      lon: -0.1278
    },
    {
      title: '🍷 Gordon\'s Wine Bar (Since 1890)',
      description: 'Sip historic ports and sherries inside a candle-lit, vaulted stone cave cellar. London\'s oldest wine bar.',
      arrivalTime: '08:30 PM',
      estimatedCost: 25.00,
      lat: 51.5078,
      lon: -0.1239
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
    },
    {
      title: '☕ Café de Flore (Saint-Germain)',
      description: 'Enjoy a classic, historic Parisian breakfast of hot chocolate and buttered baguettes where Sartre and de Beauvoir used to write.',
      arrivalTime: '08:30 AM',
      estimatedCost: 18.00,
      lat: 48.8543,
      lon: 2.3301
    },
    {
      title: '🖼️ The Louvre Museum Art Scout',
      description: 'Enter through the iconic glass pyramid to behold the Mona Lisa, Winged Victory, and Venus de Milo in person.',
      arrivalTime: '10:30 AM',
      estimatedCost: 17.00,
      lat: 48.8606,
      lon: 2.3376
    },
    {
      title: '🥙 L\'As du Fallafel (Le Marais)',
      description: 'Savor Paris\'s absolute best, highly legendary warm pita stuffed with crispy green falafels, roasted eggplants, and tahini sauce.',
      arrivalTime: '01:00 PM',
      estimatedCost: 10.00,
      lat: 48.8575,
      lon: 2.3591
    },
    {
      title: '📚 Shakespeare and Company Bookstore',
      description: 'Wander through a legendary, highly atmospheric English-language bookstore overlooking the Seine and Notre-Dame.',
      arrivalTime: '04:00 PM',
      estimatedCost: 0,
      lat: 48.8525,
      lon: 2.3471
    },
    {
      title: '🌿 Jardin du Luxembourg Palace Walk',
      description: 'Stroll among statues, orange trees, and gravel paths. Enjoy a fresh crepe while children sail toy boats on the pond.',
      arrivalTime: '02:30 PM',
      estimatedCost: 0,
      lat: 48.8462,
      lon: 2.3371
    },
    {
      title: '🥖 Du Pain et des Idées (Since 1889)',
      description: 'A striking 19th-century boulangerie. Google Maps reviews swear by their iconic \'Escargot Chocolat Praliné\' pastry.',
      arrivalTime: '09:00 AM',
      estimatedCost: 6.00,
      lat: 48.8712,
      lon: 2.3614
    }
  ],
  bali: [
    {
      title: '☕ Seniman Coffee Ubud (Bali)',
      description: 'Interactive organic boutique beans roaster. Best to try: Order their hand-brewed signature Flores pour-over tasting board served on small wooden trays.',
      arrivalTime: '08:30 AM',
      estimatedCost: 60000,
      lat: -8.5069,
      lon: 115.2625
    },
    {
      title: '🌿 Campuhan Ridge Sunset Walk',
      description: 'A pristine scenic valley walk overlooking endless tropical valleys. Best to do: Walk between 5:15 PM and dusk for an exquisite, calm valley sunset photo.',
      arrivalTime: '05:30 PM',
      estimatedCost: 0,
      lat: -8.5034,
      lon: 115.2547
    },
    {
      title: '🐒 Sacred Monkey Forest Sanctuary',
      description: 'Walk through dense, atmospheric ancient nutmeg tree forests housing over a thousand playful, curious gray long-tailed macaques.',
      arrivalTime: '10:00 AM',
      estimatedCost: 80000,
      lat: -8.5186,
      lon: 115.2623
    },
    {
      title: '🌾 Tegallalang Rice Terraces View',
      description: 'Marvel at the iconic, terraced green slopes sculpted by the ancient cooperative Balinese subak irrigation system.',
      arrivalTime: '02:30 PM',
      estimatedCost: 20000,
      lat: -8.4316,
      lon: 115.2798
    },
    {
      title: '⛩️ Uluwatu Cliff Temple & Fire Dance',
      description: 'Stand on a dramatic 70-meter limestone cliff overlooking the Indian Ocean. Stay for the sunset Kecak chant and fire dance.',
      arrivalTime: '05:00 PM',
      estimatedCost: 150000,
      lat: -8.8291,
      lon: 115.0849
    },
    {
      title: '🍛 Warung Liku (Kuta)',
      description: 'Highly popular local joint serving Bali\'s most authentic, mouth-watering Nasi Ayam Betutu (spiced slow-cooked chicken) in local style.',
      arrivalTime: '12:30 PM',
      estimatedCost: 25000,
      lat: -8.6942,
      lon: 115.1764
    },
    {
      title: '☕ Revolver Espresso (Seminyak)',
      description: 'A highly sensory wooden-saloon style alleyway coffee house. Best to try: Order their rich house-blend double espresso poured over coconut milk pancakes.',
      arrivalTime: '08:00 AM',
      estimatedCost: 55000,
      lat: -8.6853,
      lon: 115.1584
    },
    {
      title: '🏖️ Seminyak Beach & Surf Scout',
      description: 'Walk along soft, volcanic sands. Sit on colorful beanbags under beach umbrellas to enjoy acoustic music and fresh coconut.',
      arrivalTime: '04:00 PM',
      estimatedCost: 30000,
      lat: -8.6901,
      lon: 115.1542
    },
    {
      title: '🥗 Kynd Community Café',
      description: 'Stunning pink-themed plant-based cafe known for custom letter-carved fruit smoothie bowls and organic vegan waffles.',
      arrivalTime: '09:00 AM',
      estimatedCost: 95000,
      lat: -8.6754,
      lon: 115.1518
    },
    {
      title: '🌋 Mount Batur Sunrise Trekking',
      description: 'Climb an active volcano under starlight to stand above the clouds, observing the golden morning sunrise over Lake Batur.',
      arrivalTime: '04:00 AM',
      estimatedCost: 450000,
      lat: -8.2439,
      lon: 115.3781
    },
    {
      title: '⛩️ Tirta Empul Sacred Water Temple',
      description: 'Experience deep spiritual cleansing. Stroll through crystal-clear pools containing historical fresh-water mountain springs.',
      arrivalTime: '11:00 AM',
      estimatedCost: 50000,
      lat: -8.4121,
      lon: 115.3152
    },
    {
      title: '🌊 Potato Head Beach Club Sunset',
      description: 'Relax in an architectural beachfront infinity pool crafted with vintage window shutters, enjoying signature mocktails and retro electronic sets.',
      arrivalTime: '07:00 PM',
      estimatedCost: 150000,
      lat: -8.6792,
      lon: 115.1511
    }
  ],
  beijing: [
    {
      title: '☕ Berry Beans (Dashilan)',
      description: 'Vintage rooftop cafe hidden in old Hutong alleyways. Sip custom cinnamon-infused cold brews with great tiled views.',
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
      description: 'Colorful natural vegetable-dyed dumplings filled with unique regional bean curds and chives. Highly praised on review platforms.',
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
  venice: [
    {
      title: '⛪ St. Mark\'s Basilica & Square',
      description: 'Admire the breathtaking Byzantine gold mosaics and spectacular stone domes framing Venice\'s grandest square.',
      arrivalTime: '09:00 AM',
      estimatedCost: 10,
      lat: 45.4345,
      lon: 12.3396
    },
    {
      title: '🚣 Grand Canal Gondola Glide',
      description: 'Float through historic secondary canals and admire the magnificent Gothic palaces from a hand-crafted Venetian gondola.',
      arrivalTime: '11:00 AM',
      estimatedCost: 80,
      lat: 45.4371,
      lon: 12.3352
    },
    {
      title: '🥪 Cantina Do Mori (Since 1462)',
      description: 'Venice\'s oldest bacaro wine bar. Savor delicious local \'cicchetti\' tapas skewers with a glass of sparkling Prosecco.',
      arrivalTime: '12:30 PM',
      estimatedCost: 12,
      lat: 45.4378,
      lon: 12.3341
    },
    {
      title: '🌉 Rialto Bridge Scenic Lookout',
      description: 'Stand atop Venice\'s oldest and most iconic stone arch bridge spanning the bustling, vessel-filled Grand Canal.',
      arrivalTime: '03:00 PM',
      estimatedCost: 0,
      lat: 45.4380,
      lon: 12.3359
    },
    {
      title: '🎨 Peggy Guggenheim Modern Art Collection',
      description: 'Explore highly acclaimed surrealist and abstract art masterpieces housed in Peggy Guggenheim\'s elegant canal-front palace.',
      arrivalTime: '05:00 PM',
      estimatedCost: 18,
      lat: 45.4305,
      lon: 12.3315
    },
    {
      title: '🌅 Riva degli Schiavoni Sunset Walk',
      description: 'Stroll along the spacious lagoon promenade watching gondolas bob in front of the crimson Venetian sunset.',
      arrivalTime: '07:30 PM',
      estimatedCost: 0,
      lat: 45.4336,
      lon: 12.3442
    }
  ],
  florence: [
    {
      title: '⛪ Florence Cathedral (Duomo di Firenze)',
      description: 'Gaze up at Brunelleschi\'s magnificent red-tiled terracotta dome and the striking green, white, and pink marble facade.',
      arrivalTime: '09:00 AM',
      estimatedCost: 15,
      lat: 43.7731,
      lon: 11.2560
    },
    {
      title: '☕ Caffè Gilli (Since 1733)',
      description: 'Florence\'s oldest Belle Époque café. Google Maps reviews recommend their incredibly rich hot chocolate and foam-art cappuccino.',
      arrivalTime: '11:00 AM',
      estimatedCost: 7,
      lat: 43.7714,
      lon: 11.2543
    },
    {
      title: '🥪 All\'Antico Vinaio Schiacciata',
      description: 'Indulge in Florence\'s legendary warm schiacciata bread filled with creamy pistachio cream, fresh truffles, and spicy mortadella.',
      arrivalTime: '12:30 PM',
      estimatedCost: 10,
      lat: 43.7689,
      lon: 11.2565
    },
    {
      title: '🎨 Uffizi Gallery Renaissance Tour',
      description: 'Stand before Michelangelo, Leonardo da Vinci, and Botticelli\'s masterpiece \'The Birth of Venus\' in Italy\'s premier art vault.',
      arrivalTime: '02:30 PM',
      estimatedCost: 20,
      lat: 43.7678,
      lon: 11.2553
    },
    {
      title: '🌉 Ponte Vecchio Medieval Stone Bridge',
      description: 'Stroll across the iconic 14th-century stone arch bridge, admiring the colorful overhanging gold artisan workshops.',
      arrivalTime: '05:00 PM',
      estimatedCost: 0,
      lat: 43.7680,
      lon: 11.2532
    },
    {
      title: '🌅 Piazzale Michelangelo Sunset Views',
      description: 'Climb the steps to Florence\'s ultimate panoramic hilltop viewpoint to observe the sunset over the Arno river and the city dome.',
      arrivalTime: '07:30 PM',
      estimatedCost: 0,
      lat: 43.7629,
      lon: 11.2651
    }
  ]
};

/**
 * Automatically creates structured itinerary items mapped across the selected trip date ranges.
 * Guarantees that EVERY single spot across all days of the trip is 100% unique!
 */
export function generatePresetItinerary(destination: string, dates: string[]): ItineraryItem[] {
  const normalizedDest = destination.toLowerCase();
  const cityOnly = destination.split(',')[0].trim();
  
  // Find matching preset key, otherwise we generate a dynamic custom city preset!
  let presetKey = '';
  for (const key of Object.keys(PRESETS)) {
    if (normalizedDest.includes(key) || key.includes(normalizedDest)) {
      presetKey = key;
      break;
    }
  }

  let spots: PresetSpot[] = [];
  if (presetKey) {
    // Clone preset spots so we can modify or consume them safely
    spots = [...PRESETS[presetKey]];
  } else {
    // Dynamically create a large set of unique templated spots for this custom city
    // We will generate 3 unique spots for each day dynamically
    spots = [];
    dates.forEach((_, dateIdx) => {
      const dayNum = dateIdx + 1;
      spots.push(
        {
          title: `☕ Specialty Cafe in ${cityOnly} (Day ${dayNum})`,
          description: `Kickstart your Day ${dayNum} in ${cityOnly} at a highly rated local coffee house. Google Maps reviews praise their freshly roasted single-origin espresso and quiet morning vibe.`,
          arrivalTime: '08:30 AM',
          estimatedCost: 10,
          lat: 0,
          lon: 0
        },
        {
          title: `🏛️ Landmark Exploration (Day ${dayNum})`,
          description: `Discover one of ${cityOnly}'s most scenic historical monuments or structural wonders. Renowned on tourist review sites for its breathtaking architecture and photo opportunities.`,
          arrivalTime: '11:00 AM',
          estimatedCost: 15,
          lat: 0,
          lon: 0
        },
        {
          title: `🍜 Authentic Culinary Special (Day ${dayNum})`,
          description: `Savor authentic regional dishes at a highly recommended family-run bistro. Best to try: Order their chef's daily special crafted with fresh local ingredients.`,
          arrivalTime: '01:30 PM',
          estimatedCost: 20,
          lat: 0,
          lon: 0
        },
        {
          title: `🌳 Scenic Nature Pathway (Day ${dayNum})`,
          description: `Stroll through a picturesque public park or quiet botanical escape in ${cityOnly}. Highly recommended by locals for a relaxing afternoon walk away from crowds.`,
          arrivalTime: '04:00 PM',
          estimatedCost: 0,
          lat: 0,
          lon: 0
        },
        {
          title: `🎨 Signature Creative Center & Gallery (Day ${dayNum})`,
          description: `Explore local contemporary art exhibitions, craft workshops, or design boutiques showing the modern cultural spirit of ${cityOnly}.`,
          arrivalTime: '06:30 PM',
          estimatedCost: 12,
          lat: 0,
          lon: 0
        },
        {
          title: `🌅 Panoramic Sunset Lookout (Day ${dayNum})`,
          description: `Watch the sunset over the gorgeous skyline of ${cityOnly}. A highly recommended, peaceful scenic vantage spot to write in your journal or reflect on your day.`,
          arrivalTime: '08:00 PM',
          estimatedCost: 0,
          lat: 0,
          lon: 0
        }
      );
    });
  }

  const items: ItineraryItem[] = [];

  // Each day gets exactly 3 unique, non-repeating spots sequentially from the spots array!
  dates.forEach((date, dateIdx) => {
    // Grab three spots sequentially from the array.
    // If we exceed spots length (e.g. incredibly long trip), we generate beautiful dynamic spots so we NEVER repeat!
    for (let i = 0; i < 3; i++) {
      const spotIndex = dateIdx * 3 + i;
      let s: PresetSpot;

      if (spotIndex < spots.length) {
        s = spots[spotIndex];
      } else {
        // Dynamic unique spot fallback to absolutely prevent any repetition!
        const extraNum = spotIndex - spots.length + 1;
        const types = [
          { name: 'Hidden Courtyard Cafe', desc: 'A secluded sanctuary with ivy-draped brick walls. Best to try: Order their hand-crafted seasonal cold brew.', time: '09:00 AM', cost: 8 },
          { name: 'Historical Heritage Path', desc: 'A beautifully preserved cobblestone alleyway steeped in history. Best to do: Walk early in the morning for crisp, atmospheric light.', time: '11:30 AM', cost: 0 },
          { name: 'Authentic Local Market Tavern', desc: 'A cozy corner spot near the central market. Best to eat: Savor their traditional pan-fried dumplings or regional skewers.', time: '01:30 PM', cost: 15 },
          { name: 'Botanical Sanctuary walk', desc: 'A serene greenhouse garden with lush tropical ferns and water fountains. Free access for a quiet mid-afternoon stroll.', time: '04:00 PM', cost: 0 },
          { name: 'Indie Design & Record Bar', desc: 'An intimate creative space playing classic vinyl records. Best to do: Flip through local artist magazines while sipping a warm jasmine tea.', time: '06:30 PM', cost: 12 },
          { name: 'Scenic Hilltop Star-Viewpoint', desc: 'A breathtaking high elevation lookout point offering starry night views of the valley. Perfect for a cozy evening chat.', time: '08:30 PM', cost: 0 }
        ];
        const t = types[extraNum % types.length];
        s = {
          title: `✨ Custom ${t.name} (No. ${extraNum})`,
          description: `${t.desc} Discovered in ${cityOnly}.`,
          arrivalTime: t.time,
          estimatedCost: t.cost,
          lat: 0,
          lon: 0
        };
      }

      items.push({
        id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: s.title,
        description: s.description,
        visitDate: date,
        arrivalTime: s.arrivalTime,
        estimatedCost: s.estimatedCost,
        lat: s.lat || undefined,
        lon: s.lon || undefined,
        visited: false,
        review: ''
      });
    }
  });

  return items;
}
