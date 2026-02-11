import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  propertyName?: string;
  className?: string;
  height?: string;
}

// Default to Abu Dhabi (Corniche area)
const DEFAULT_CENTER: [number, number] = [54.3773, 24.4539];
const DEFAULT_ZOOM = 14;

export function PropertyMap({
  latitude,
  longitude,
  address,
  propertyName,
  className = '',
  height = '300px',
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!MAPBOX_TOKEN) {
      setError('Mapbox access token not configured');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const center: [number, number] = longitude && latitude 
      ? [longitude, latitude] 
      : DEFAULT_CENTER;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom: DEFAULT_ZOOM,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add marker
        if (longitude && latitude) {
          const popupContent = propertyName 
            ? `<strong>${propertyName}</strong>${address ? `<br/>${address}` : ''}`
            : address || 'Property Location';

          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupContent);

          marker.current = new mapboxgl.Marker({ color: '#0070f3' })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map');
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [latitude, longitude, address, propertyName, MAPBOX_TOKEN]);

  // Update marker when coordinates change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (longitude && latitude) {
      // Remove existing marker
      marker.current?.remove();

      // Add new marker
      const popupContent = propertyName 
        ? `<strong>${propertyName}</strong>${address ? `<br/>${address}` : ''}`
        : address || 'Property Location';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);

      marker.current = new mapboxgl.Marker({ color: '#0070f3' })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current);

      // Pan to new location
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: DEFAULT_ZOOM,
      });
    }
  }, [latitude, longitude, address, propertyName, mapLoaded]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center text-muted-foreground" style={{ height }}>
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Property Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapContainer} 
          className="rounded-b-lg"
          style={{ height }}
        />
      </CardContent>
    </Card>
  );
}
