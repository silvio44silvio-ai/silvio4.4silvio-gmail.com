
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Waypoint, MapStyle, MarineDetection } from '../types';

interface MapComponentProps {
  waypoints: Waypoint[];
  onAddWaypoint: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
  originLocation?: { lat: number; lng: number } | null;
  mobLocation?: { lat: number; lng: number } | null;
  detections?: MarineDetection[];
  heading?: number;
  userPhoto?: string;
  sunlightMode?: boolean;
  mapStyle?: MapStyle;
  speed?: number;
  isEstimated?: boolean;
  isNavigatingHome?: boolean;
  followMode?: boolean;
  targetLocation?: { lat: number; lng: number; name?: string } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  userLocation, mobLocation, detections = [], heading = 0, userPhoto, 
  sunlightMode, mapStyle = 'TACTICAL', speed = 0, isEstimated = false,
  followMode = true, targetLocation
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);
  const navigationLineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const getTileUrl = (style: MapStyle, isSunlight: boolean) => {
    switch (style) {
      case 'STREETS':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'HYBRID':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      default:
        return isSunlight 
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { 
        zoomControl: false,
        attributionControl: false,
        zoomAnimation: true,
      }).setView([userLocation?.lat || -23.5505, userLocation?.lng || -46.6333], 15);
    }

    const tileUrl = getTileUrl(mapStyle, !!sunlightMode);
    if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
    
    tileLayerRef.current = L.tileLayer(tileUrl, { 
      maxZoom: 19, 
      className: sunlightMode ? 'sunlight-map' : (mapStyle === 'TACTICAL' ? 'vibrant-sea-tiles' : '')
    }).addTo(mapRef.current);

    mapRef.current.invalidateSize();
  }, [mapStyle, sunlightMode]);

  // Efeito para centralizar no RESULTADO DA BUSCA (Target)
  useEffect(() => {
    if (mapRef.current && targetLocation) {
      console.log("Movendo mapa para o alvo da busca:", targetLocation.name);
      mapRef.current.flyTo([targetLocation.lat, targetLocation.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [targetLocation]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (followMode && !targetLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 0.8 });
    }

    const boatColor = mapStyle === 'STREETS' ? '#0ea5e9' : (speed > 16 ? '#fbbf24' : '#22d3ee');
    
    const boatIcon = L.divIcon({
      className: 'boat-marker',
      iconSize: [80, 80], iconAnchor: [40, 40],
      html: `
        <div class="relative w-20 h-20 flex items-center justify-center" style="transform: rotate(${heading}deg);">
          <svg width="20" height="60" viewBox="0 0 12 40" fill="none">
             <path d="M6 0L11 8V32L6 40L1 32V8L6 0Z" fill="${boatColor}" stroke="white" stroke-width="1" />
          </svg>
        </div>`
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]).setIcon(boatIcon);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: boatIcon }).addTo(mapRef.current);
    }
  }, [userLocation, heading, speed, followMode, mapStyle, targetLocation]);

  useEffect(() => {
    if (!mapRef.current || !targetLocation) {
      if (targetMarkerRef.current) mapRef.current.removeLayer(targetMarkerRef.current);
      if (navigationLineRef.current) mapRef.current.removeLayer(navigationLineRef.current);
      return;
    }

    const targetIcon = L.divIcon({
      className: 'target-marker',
      html: `<div class="w-10 h-10 flex items-center justify-center bg-yellow-500 border-2 border-white rounded-full shadow-2xl animate-bounce">📍</div>`,
      iconSize: [40, 40], iconAnchor: [20, 40]
    });

    if (targetMarkerRef.current) targetMarkerRef.current.setLatLng([targetLocation.lat, targetLocation.lng]);
    else targetMarkerRef.current = L.marker([targetLocation.lat, targetLocation.lng], { icon: targetIcon }).addTo(mapRef.current);

    if (userLocation) {
      const lineCoords: L.LatLngExpression[] = [[userLocation.lat, userLocation.lng], [targetLocation.lat, targetLocation.lng]];
      if (navigationLineRef.current) navigationLineRef.current.setLatLngs(lineCoords);
      else navigationLineRef.current = L.polyline(lineCoords, { color: '#fbbf24', weight: 3, dashArray: '10, 10' }).addTo(mapRef.current);
    }
  }, [targetLocation, userLocation]);

  return <div ref={containerRef} className="w-full h-full bg-slate-900" />;
};

export default MapComponent;
