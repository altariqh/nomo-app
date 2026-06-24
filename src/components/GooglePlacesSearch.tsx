import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Globe } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface GooglePlacesSearchProps {
  onPlaceSelect: (place: { title: string; description: string; estimatedCost?: number; lat?: number; lon?: number }) => void;
  currency: string;
  biasDestination?: string;
  placeholder?: string;
}

export default function GooglePlacesSearch({
  onPlaceSelect,
  biasDestination = '',
  placeholder = "Search tourist spots, cafes, temples on maps..."
}: GooglePlacesSearchProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Array<{ id: string; title: string; description: string; lat?: number; lon?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search OSM Nominatim API when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setPredictions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      
      // Combine with location bias country/city to prioritize local travel targets
      const searchQuery = biasDestination ? `${query}, ${biasDestination}` : query;
      
      fetch(
        getApiUrl(`/api/places/search?q=${encodeURIComponent(searchQuery)}&limit=8`)
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const parsed = data.map((item: any, index: number) => {
              const parts = item.display_name.split(',');
              const title = parts[0]?.trim() || 'Unknown Attraction';
              const description = parts.slice(1).map((p: any) => p.trim()).join(', ');
              return {
                id: `${item.place_id || 'osm'}-${index}`,
                title: title,
                description: description || 'Scenic location',
                lat: item.lat ? parseFloat(item.lat) : undefined,
                lon: item.lon ? parseFloat(item.lon) : undefined
              };
            });
            setPredictions(parsed);
          } else {
            setPredictions([]);
          }
        })
        .catch((err) => {
          console.error("Error searching via geocoding proxy:", err);
          setPredictions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [query, biasDestination]);

  // Handle clicking outside predictions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPrediction = (place: { title: string; description: string; lat?: number; lon?: number }) => {
    onPlaceSelect({
      title: place.title,
      description: place.description,
      lat: place.lat,
      lon: place.lon
    });
    setQuery('');
    setPredictions([]);
    setFocused(false);
  };

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-[9px] font-mono uppercase text-[#8C857E] block font-bold">
        <span className="flex items-center gap-1">🌍 Search Spot / Cafe</span>
      </label>
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C857E]" />
        <input
          type="text"
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocused(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white border border-stone-200 pl-8 pr-10 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-[#5A5A40] focus:outline-none placeholder:text-stone-400 font-sans shadow-3xs"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border border-stone-300 border-t-[#5A5A40] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {predictions.length > 0 && focused && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-250 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-stone-50 p-1">
          <div className="px-2.5 py-1.5 text-[8px] font-mono text-stone-400 uppercase tracking-widest bg-stone-50 rounded-lg mb-1">
            🗺️ Places Results ({biasDestination ? `Near ${biasDestination}` : 'Global'}):
          </div>
          {predictions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPrediction(p)}
              className="w-full text-left p-2.5 hover:bg-[#FAF8F5] transition-all flex gap-2.5 items-start text-xs rounded-xl"
            >
              <MapPin className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold text-stone-850 font-sans truncate leading-tight text-left">{p.title}</p>
                <p className="text-[9px] text-[#8C857E] truncate mt-0.5 leading-normal text-left">{p.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
