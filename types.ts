
export interface Waypoint {
  lat: number;
  lng: number;
  id: string;
}

export interface RouteData {
  distance: number; // in km
  estimatedTime: number; // in minutes
  waypoints: Waypoint[];
}

export interface StrokeAnalysis {
  spm: number;          // Strokes Per Minute
  dps: number;          // Distance Per Stroke (meters)
  efficiency: number;   // 0-100%
  powerPhase: number;   // seconds
  recoveryPhase: number; // seconds
  techniqueTips: string[];
}

export interface MarineLifeSighting {
  type: 'shark' | 'dolphin' | 'whale';
  name: string;
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export interface LargeVessel {
  id: string;
  name: string;
  type: 'Cargo' | 'Tanker' | 'Passenger' | 'Tug';
  lat: number;
  lng: number;
  heading: number;
  speed: number; // in knots
  distance: number; // in km from user
}

export interface WeatherData {
  temp: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  humidity: number;
  feelsLike: number;
  timestamp: string;
  waveHeight: number; // em metros
  currentSpeed: number; // em km/h ou nós
  currentDirection: string;
  marineLife: MarineLifeSighting[];
}

export type CanoeType = 'OC1' | 'OC4' | 'OC6' | 'Dragon Boat' | 'Surfski' | 'V1' | 'V6';

export interface LevelConfig {
  id: number;
  speed: number;      // m/s
  effort: number;     // kcal/s increment
  dpsBonus: number;   // bonus percentage to Distance Per Stroke
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderTeam: string;
  text: string;
  timestamp: string;
  type: 'text' | 'system' | 'alert' | 'ai';
}

export interface UserProfile {
  userName: string;
  teamName: string;
  photoUrl?: string;
  spotifyPlaylistUrl?: string;
  modality: string;
  nextPaddles: string;
  routeAlertEnabled: boolean;
  bigWaveAlertEnabled: boolean;
  marineLifeAlertEnabled: boolean;
  canoeType: CanoeType;
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: number; 
  levelConfigs: LevelConfig[];
  savedTrainingPlans: any[];
  bookings: any[];
  myPartnerships: any[];
  isPro: boolean;
  chatMessages: ChatMessage[];
  visibilityEnabled: boolean;
  pinCode?: string;
  pinEnabled: boolean;
  isAdmin?: boolean;
}

export interface AnalysisResult {
  safetyScore: number;
  recommendations: string;
  hazards: string[];
  sources: GroundingSource[];
  marineLife?: MarineLifeSighting[];
}

export interface SavedRoute {
  id: string;
  name: string;
  date: string;
  route: RouteData;
  analysis: AnalysisResult | null;
}

export interface TrainingRecord {
  id: string;
  date: string;
  duration: number; 
  distance: number; 
  calories: number;
  strokes: number;
  canoeType: CanoeType;
  route: Waypoint[];
  planName?: string;
  technicalAnalysis?: StrokeAnalysis;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

// Added missing NewsItem interface
export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  url: string;
}

// Added missing CompetitionEvent interface
export interface CompetitionEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  url: string;
}

// Added missing CanoeLocation interface
export interface CanoeLocation {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  description: string;
}
