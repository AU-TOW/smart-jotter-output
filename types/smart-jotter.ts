// TypeScript type definitions for Smart Jotter feature

export interface OCRRequest {
  imageData?: string;
  strokeData?: StrokeData[];
  width?: number;
  height?: number;
  inputType: 'image' | 'strokes';
}

export interface OCRResponse {
  success: boolean;
  text: string;
  confidence: number;
  processingTime?: number;
  error?: string;
}

export interface StrokeData {
  x: number[];
  y: number[];
  time?: number[];
  pressure?: number[];
}

export interface ParsedBookingData {
  customer_name: string;
  phone: string;
  vehicle: string;
  year: string;
  registration: string;
  issue: string;
  confidence_score?: number;
}

export interface SmartJotterState {
  canvasData: string | null;
  recognizedText: string;
  parsedData: ParsedBookingData | null;
  isProcessing: boolean;
  error: string | null;
  confidence: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// MyScript API Types
export interface MyScriptConfig {
  lang: string;
  export: {
    'text/plain': {
      granularity: string;
    };
  };
}

export interface MyScriptInputUnit {
  textInputType: string;
  components: MyScriptComponent[];
}

export interface MyScriptComponent {
  type: 'image' | 'stroke';
  data?: string;
  mimeType?: string;
  id?: string;
  pointerType?: string;
  x?: number[];
  y?: number[];
  t?: number[];
  p?: number[];
}

export interface MyScriptResponse {
  exports?: {
    'text/plain'?: string;
  };
  result?: string;
  confidence?: number;
}