// Type definitions for Smart Jotter feature

export interface ParsedBookingData {
  customer_name: string;
  phone: string;
  vehicle: string;
  year: string;
  registration: string;
  issue: string;
  confidence_score?: number;
}

export interface OCRResponse {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}

export interface CanvasData {
  image: string; // base64 image data
  strokes: any[]; // stroke data from signature canvas
  width: number;
  height: number;
  isEmpty: boolean;
}

export interface SmartJotterProps {
  onBookingCreate?: (data: ParsedBookingData) => void;
  onEstimateCreate?: (data: ParsedBookingData) => void;
  className?: string;
}

export interface HandwritingCanvasProps {
  onDataChange: (data: CanvasData | null) => void;
  isProcessing?: boolean;
  className?: string;
}

export interface InputMode {
  type: 'canvas' | 'text';
  label: string;
  icon: string;
}