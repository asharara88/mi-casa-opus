import React, { useState } from 'react';
import { Car, Clock, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommuteResult {
  destination: string;
  duration: number; // in minutes
  distance: number; // in km
  mode: 'driving' | 'walking' | 'cycling';
}

interface CommuteCalculatorProps {
  originLatitude?: number;
  originLongitude?: number;
  className?: string;
}

// Common destinations in Dubai
const commonDestinations = [
  { name: 'Dubai Mall', coords: [55.2796, 25.1972] },
  { name: 'DIFC', coords: [55.2803, 25.2121] },
  { name: 'Dubai Marina', coords: [55.1385, 25.0808] },
  { name: 'Palm Jumeirah', coords: [55.1344, 25.1124] },
  { name: 'Dubai Airport (DXB)', coords: [55.3647, 25.2532] },
  { name: 'JBR Beach', coords: [55.1313, 25.0793] },
];

export function CommuteCalculator({
  originLatitude,
  originLongitude,
  className = '',
}: CommuteCalculatorProps) {
  const [customDestination, setCustomDestination] = useState('');
  const [results, setResults] = useState<CommuteResult[]>([]);
  const [loading, setLoading] = useState(false);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const calculateCommute = async (destinationName: string, destCoords: [number, number]) => {
    if (!originLatitude || !originLongitude) {
      // Use demo data
      const mockDuration = Math.floor(Math.random() * 30) + 5;
      const mockDistance = mockDuration * 0.8;
      setResults(prev => [
        ...prev.filter(r => r.destination !== destinationName),
        {
          destination: destinationName,
          duration: mockDuration,
          distance: mockDistance,
          mode: 'driving',
        }
      ]);
      return;
    }

    if (!MAPBOX_TOKEN) {
      // Demo mode
      const mockDuration = Math.floor(Math.random() * 30) + 5;
      const mockDistance = mockDuration * 0.8;
      setResults(prev => [
        ...prev.filter(r => r.destination !== destinationName),
        {
          destination: destinationName,
          duration: mockDuration,
          distance: mockDistance,
          mode: 'driving',
        }
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${originLongitude},${originLatitude};${destCoords[0]},${destCoords[1]}?access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setResults(prev => [
          ...prev.filter(r => r.destination !== destinationName),
          {
            destination: destinationName,
            duration: Math.round(route.duration / 60),
            distance: Math.round(route.distance / 100) / 10,
            mode: 'driving',
          }
        ]);
      }
    } catch (err) {
      console.error('Error calculating commute:', err);
      // Fall back to demo data
      const mockDuration = Math.floor(Math.random() * 30) + 5;
      setResults(prev => [
        ...prev.filter(r => r.destination !== destinationName),
        {
          destination: destinationName,
          duration: mockDuration,
          distance: mockDuration * 0.8,
          mode: 'driving',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAllCommon = async () => {
    setLoading(true);
    for (const dest of commonDestinations) {
      await calculateCommute(dest.name, dest.coords as [number, number]);
    }
    setLoading(false);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Car className="h-4 w-4" />
          Commute Times
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Calculate */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={calculateAllCommon}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Calculate to Popular Destinations
            </>
          )}
        </Button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            {results
              .sort((a, b) => a.duration - b.duration)
              .map((result, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{result.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Car className="h-3 w-3 mr-1" />
                      {result.duration} min
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {result.distance} km
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Common Destinations */}
        <div className="flex flex-wrap gap-1">
          {commonDestinations.map((dest) => (
            <Badge
              key={dest.name}
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => calculateCommute(dest.name, dest.coords as [number, number])}
            >
              {dest.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
