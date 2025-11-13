export interface Vehicle {
  id: number;
  name: string;
  caserne: string;
}

export interface Marker {
  id: number;
  x: number;
  y: number;
  comment: string;
  author: string;
  timestamp: string; // ISO 8601 string
}

export type VehicleFace = 'front' | 'back' | 'left' | 'right';

export interface InspectionData {
  images: Record<VehicleFace, string | null>;
  markers: Record<VehicleFace, Marker[]>;
}

export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Profile {
  id: string; // user id
  prenom: string | null;
  nom: string | null;
  phone: string | null;
  caserne: string | null;
  rank: string | null;
  avatarUrl: string | null;
  role: string | null;
}