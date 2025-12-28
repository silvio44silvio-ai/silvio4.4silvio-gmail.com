
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Waypoint, CanoeLocation, RouteData, LargeVessel } from '../types';

interface MapComponentProps {
  waypoints: Waypoint[];
  onAddWaypoint: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
  userPhoto?: string;
  vessels?: LargeVessel[];
}

const MapComponent: React.FC<MapComponentProps> = ({ waypoints, onAddWaypoint, userLocation, userPhoto, vessels = [] }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const vesselMarkersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, { 
        zoomControl: false,
        attributionControl: false 
      }).setView([-23.5505, -46.6333], 13);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapRef.current);
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      
      vesselMarkersRef.current = L.layerGroup().addTo(mapRef.current);
      
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onAddWaypoint(e.latlng.lat, e.latlng.lng);
      });
    }

    // Cleanup function to prevent "Map already initialized" error
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync Polyline
  useEffect(() => {
    if (!mapRef.current) return;
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    if (waypoints.length > 1) {
      const latlngs = waypoints.map(w => [w.lat, w.lng] as [number, number]);
      polylineRef.current = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.8,
        lineJoin: 'round',
        dashArray: '1, 10'
      }).addTo(mapRef.current);
    }
  }, [waypoints]);

  // Sync Vessels
  useEffect(() => {
    if (!vesselMarkersRef.current || !mapRef.current) return;
    vesselMarkersRef.current.clearLayers();

    vessels.forEach(v => {
      const shipIcon = L.divIcon({
        className: 'vessel-marker',
        iconSize: [30, 30],
        html: `
          <div class="relative flex flex-col items-center">
            <div class="bg-red-600 w-6 h-8 rounded-t-full rounded-b-sm shadow-xl border border-white" style="transform: rotate(${v.heading}deg)">
               <div class="w-full h-1 bg-white/30 mt-1"></div>
            </div>
          </div>
        `
      });
      L.marker([v.lat, v.lng], { icon: shipIcon }).addTo(vesselMarkersRef.current!);
    });
  }, [vessels]);

  // Sync User
  useEffect(() => {
    if (mapRef.current && userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-icon',
        html: `
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            <div class="relative w-12 h-12 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-blue-600">
              <img src="${userPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=paddler'}" class="w-full h-full object-cover" />
            </div>
          </div>
        `
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
          icon: userIcon, 
          zIndexOffset: 1000 
        }).addTo(mapRef.current);
        mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
      }
    }
  }, [userLocation, userPhoto]);

  return <div ref={containerRef} className="h-full w-full relative z-10" />;
};

export default MapComponent;
