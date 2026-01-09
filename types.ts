
export interface Waypoint {
  lat: number;
  lng: number;
  id: string;
}

export interface IntensityZone {
  id: number;
  label: string;
  speedKmh: number;
  spm: number;
  color: string;
}

export interface MarineDetection {
  type: 'SHARK' | 'DOLPHIN' | 'WHALE';
  label: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface GhostData {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  active: boolean;
}

export interface Telemetry {
  speed: number;
  distance: number;
  spm: number;
  dps: number;
  heading: number;
  calories: number;
  totalStrokes: number;
  gpsAccuracy?: number;
  isEstimated?: boolean;
  bearingToHome?: number;
  distanceToHome?: number;
  isNavigatingHome?: boolean;
  isGhostActive?: boolean;
  mobLocation?: { lat: number; lng: number } | null;
  time?: number;
}

export interface WeatherData {
  temp: number;
  waterTemp: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  humidity: number;
  feelsLike: number;
  timestamp: string;
  waveHeight: number;
  wavePeriod: number;
  currentSpeed: number;
  currentDirection: string;
  marineLife: string[];
}

export interface SafetyAnalysis {
  score: number;
  hazards: string[];
  recommendations: string;
  tsunamiAlert: boolean;
  marineDetections: MarineDetection[];
  lastUpdate?: string;
}

export type UserRole = 'PADDLER' | 'MERCHANT' | 'PRO';
export type TrainingMode = 'WATER' | 'DRY' | 'DRAGON_BOAT';
export type Environment = 'SEA' | 'LAKE' | 'DAM';
export type MapStyle = 'TACTICAL' | 'STREETS' | 'HYBRID';

export interface UserProfile {
  name: string;
  phone?: string;
  role: UserRole;
  sunlightMode: boolean;
  credits?: number;
  isAvailableForHire?: boolean;
  tsunamiAlertEnabled: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  url: string;
}

export interface CompetitionEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  url: string;
}

export interface CanoeLocation {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  description: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  location: string;
  specialty: string;
  contact: string;
  description: string;
  image: string;
  certifications: string[];
  verified: boolean;
  available: boolean;
  yearsExperience: number;
}

export interface JobVacancy {
  id: string;
  baseName: string;
  title: string;
  type: 'CLT' | 'Freelance' | 'Sócio';
  description: string;
  location: string;
  salaryRange?: string;
  requirements: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  storeName: string;
  isFeatured: boolean;
}

export interface StoreAnalytics {
  balance: number;
  totalClicks: number;
  totalLeads: number;
}

export type Language = 'pt' | 'en' | 'fr' | 'es';
