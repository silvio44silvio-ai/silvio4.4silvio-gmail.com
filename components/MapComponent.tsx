
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Waypoint, MapStyle, MarineDetection } from '../types';

interface MapComponentProps {
  waypoints: Waypoint[];
  onAddWaypoint: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
  originLocation: { lat: number; lng: number } | null;
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
  targetLocation?: { lat: number; lng: number } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  userLocation, originLocation, mobLocation, detections = [], heading = 0, userPhoto, 
  sunlightMode, mapStyle = 'TACTICAL', speed = 0, isEstimated = false,
  isNavigatingHome = false, followMode = true, targetLocation
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);
  const mobMarkerRef = useRef<L.Marker | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const headingLineRef = useRef<L.Polyline | null>(null);
  const navigationLineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const getTileUrl = (style: MapStyle, isSunlight: boolean) => {
    if (style === 'STREETS') {
      return isSunlight 
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png';
    }
    if (style === 'HYBRID') {
      return 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    }
    return isSunlight 
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { 
        zoomControl: false,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
      }).setView([userLocation?.lat || -23.5505, userLocation?.lng || -46.6333], 15);

      const resizeObserver = new ResizeObserver(() => {
        mapRef.current?.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    const tileUrl = getTileUrl(mapStyle as MapStyle, !!sunlightMode);
    if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
    
    tileLayerRef.current = L.tileLayer(tileUrl, { 
      maxZoom: 19, 
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      className: sunlightMode ? 'sunlight-map' : ((mapStyle === 'TACTICAL') ? 'vibrant-sea-tiles' : '')
    }).addTo(mapRef.current);

    setTimeout(() => mapRef.current?.invalidateSize(), 200);

    return () => {
      // Manter o mapa vivo para evitar recargas brancas
    };
  }, [mapStyle, sunlightMode]);

  // Marcador de Destino (GPS Search)
  useEffect(() => {
    if (!mapRef.current || !targetLocation) {
      if (targetMarkerRef.current) mapRef.current.removeLayer(targetMarkerRef.current);
      if (navigationLineRef.current) mapRef.current.removeLayer(navigationLineRef.current);
      return;
    }

    const targetIcon = L.divIcon({
      className: 'target-marker',
      html: `<div class="w-10 h-10 flex items-center justify-center bg-yellow-500 border-2 border-white rounded-full shadow-2xl animate-bounce"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [40, 40], iconAnchor: [20, 40]
    });

    if (targetMarkerRef.current) targetMarkerRef.current.setLatLng([targetLocation.lat, targetLocation.lng]);
    else targetMarkerRef.current = L.marker([targetLocation.lat, targetLocation.lng], { icon: targetIcon }).addTo(mapRef.current);

    // Linha de navegação do Barco ao Destino
    if (userLocation) {
      const lineCoords: L.LatLngExpression[] = [[userLocation.lat, userLocation.lng], [targetLocation.lat, targetLocation.lng]];
      if (navigationLineRef.current) navigationLineRef.current.setLatLngs(lineCoords);
      else navigationLineRef.current = L.polyline(lineCoords, { color: '#fbbf24', weight: 3, dashArray: '10, 10', opacity: 0.6 }).addTo(mapRef.current);
    }

    if (!followMode) {
      mapRef.current.flyTo([targetLocation.lat, targetLocation.lng], 16, { animate: true });
    }
  }, [targetLocation, userLocation, followMode]);

  // Marcador do Barco (User)
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (followMode) {
      mapRef.current.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 0.5 });
    }

    const waveOpacity = Math.min(0.8, (speed / 18));
    const boatColor = sunlightMode ? '#000000' : (speed > 16 ? '#fbbf24' : '#22d3ee');
    
    const boatIcon = L.divIcon({
      className: `boat-pointer ${isEstimated ? 'opacity-50' : ''}`,
      iconSize: [160, 160], iconAnchor: [80, 80],
      html: `
        <div class="relative w-[160px] h-[160px] flex items-center justify-center">
          <!-- Rastro de água dinâmico -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style="transform: rotate(${heading}deg);">
             <div class="sea-ripple" style="opacity: ${waveOpacity};"></div>
          </div>
          
          <!-- O Barco -->
          <div class="relative flex items-center justify-center z-10" style="transform: rotate(${heading}deg);">
            <svg width="24" height="80" viewBox="0 0 12 40" fill="none" class="filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
               <path d="M6 0L11 8V32L6 40L1 32V8L6 0Z" fill="${boatColor}" />
               <path d="M6 2L10 9V31L6 38L2 31V9L6 2Z" fill="white" fill-opacity="0.2" />
            </svg>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-slate-900 z-20 shadow-xl">
               <img src="${userPhoto || 'https://api.dicebear.com/7.x/initials/svg?seed=Paddler'}" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>`
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userMarkerRef.current.setIcon(boatIcon);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: boatIcon }).addTo(mapRef.current);
    }

    // Linha de Projeção de Rumo (Heading Projection - 1km à frente)
    const rad = (heading * Math.PI) / 180;
    const projectLat = userLocation.lat + Math.cos(rad) * 0.01;
    const projectLng = userLocation.lng + Math.sin(rad) * 0.01;
    
    if (headingLineRef.current) {
      headingLineRef.current.setLatLngs([[userLocation.lat, userLocation.lng], [projectLat, projectLng]]);
    } else {
      headingLineRef.current = L.polyline([[userLocation.lat, userLocation.lng], [projectLat, projectLng]], { 
        color: boatColor, 
        weight: 1, 
        opacity: 0.4,
        dashArray: '4, 8'
      }).addTo(mapRef.current);
    }
  }, [userLocation, heading, userPhoto, speed, isEstimated, followMode, sunlightMode]);

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '100%' }} />
    </div>
  );
};

export default MapComponent;
