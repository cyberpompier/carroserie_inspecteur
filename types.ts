
export interface Marker {
  id: number;
  x: number;
  y: number;
  comment: string;
  author: string;
  timestamp: string;
}

export interface InspectionImages {
  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
  [key: string]: string | null;
}

export interface InspectionMarkers {
  front: Marker[];
  back: Marker[];
  left: Marker[];
  right: Marker[];
  [key: string]: Marker[];
}

export interface InspectionData {
  images: InspectionImages;
  markers: InspectionMarkers;
}

export interface Vehicle {
  id: string;
  name: string;
  caserne: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  prenom: string | null;
  nom: string | null;
  phone: string | null;
  caserne: string | null;
  rank: string | null;
  avatarUrl: string | null;
  role: string | null;
}
