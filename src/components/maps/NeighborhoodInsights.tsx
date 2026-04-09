import React, { useEffect, useState } from 'react';
import { School, Hospital, Train, ShoppingCart, Coffee, Dumbbell, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface POI {
  name: string;
  category: string;
  distance: number; // in meters
}

interface NeighborhoodInsightsProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; mapboxCategory: string }> = {
  school: { 
    icon: <School className="h-4 w-4" />, 
    color: 'bg-blue-100 text-blue-700',
    mapboxCategory: 'school'
  },
  hospital: { 
    icon: <Hospital className="h-4 w-4" />, 
    color: 'bg-red-100 text-red-700',
    mapboxCategory: 'hospital'
  },
  transit: { 
    icon: <Train className="h-4 w-4" />, 
    color: 'bg-green-100 text-green-700',
    mapboxCategory: 'transit_station'
  },
  shopping: { 
    icon: <ShoppingCart className="h-4 w-4" />, 
    color: 'bg-purple-100 text-purple-700',
    mapboxCategory: 'shopping_mall'
  },
  cafe: { 
    icon: <Coffee className="h-4 w-4" />, 
    color: 'bg-amber-100 text-amber-700',
    mapboxCategory: 'cafe'
  },
  gym: { 
    icon: <Dumbbell className="h-4 w-4" />, 
    color: 'bg-orange-100 text-orange-700',
    mapboxCategory: 'gym'
  },
};

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// Demo data for when API isn't available
const demoPOIs: POI[] = [
  { name: 'GEMS American Academy', category: 'school', distance: 450 },
  { name: 'Cleveland Clinic Abu Dhabi', category: 'hospital', distance: 800 },
  { name: 'Abu Dhabi Bus Station', category: 'transit', distance: 350 },
  { name: 'The Galleria Al Maryah Island', category: 'shopping', distance: 600 },
  { name: 'Costa Coffee Corniche', category: 'cafe', distance: 150 },
  { name: 'NAS Sports Complex', category: 'gym', distance: 400 },
  { name: 'GEMS Wellington Academy', category: 'school', distance: 1200 },
  { name: 'Saudi German Hospital', category: 'hospital', distance: 2500 },
];

export function NeighborhoodInsights({
  latitude,
  longitude,
  className = '',
}: NeighborhoodInsightsProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    const fetchPOIs = async () => {
      if (!latitude || !longitude) {
        setPois(demoPOIs);
        setLoading(false);
        return;
      }

      if (!MAPBOX_TOKEN) {
        // Use demo data if no token
        setPois(demoPOIs);
        setLoading(false);
        return;
      }

      try {
        // In a real implementation, you would call Mapbox Geocoding API
        // For now, we'll use demo data that simulates nearby POIs
        await new Promise(resolve => setTimeout(resolve, 500));
        setPois(demoPOIs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching POIs:', err);
        setError('Failed to load nearby places');
        setPois(demoPOIs);
        setLoading(false);
      }
    };

    fetchPOIs();
  }, [latitude, longitude, MAPBOX_TOKEN]);

  // Group POIs by category
  const groupedPOIs = pois.reduce((acc, poi) => {
    if (!acc[poi.category]) {
      acc[poi.category] = [];
    }
    acc[poi.category].push(poi);
    return acc;
  }, {} as Record<string, POI[]>);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Nearby Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-4">
            {Object.entries(groupedPOIs).map(([category, categoryPois]) => {
              const config = categoryConfig[category];
              if (!config) return null;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${config.color}`}>
                      {config.icon}
                    </div>
                    <span className="text-sm font-medium capitalize">{category}s</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryPois.length}
                    </Badge>
                  </div>
                  <div className="pl-8 space-y-1">
                    {categoryPois.slice(0, 3).map((poi, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate flex-1">
                          {poi.name}
                        </span>
                        <span className="text-xs font-medium ml-2">
                          {formatDistance(poi.distance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
