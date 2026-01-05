// TypeScript interfaces for Smart Jotter functionality

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

export interface ParseResponse {
  data: ParsedBookingData;
  confidence: number;
  success: boolean;
  error?: string;
  raw_text?: string;
}

export interface SmartJotterState {
  inputMode: 'text' | 'handwrite';
  textInput: string;
  canvasData: string | null;
  isProcessing: boolean;
  parsedData: ParsedBookingData | null;
  error: string | null;
  ocrResult: string | null;
}

export interface CanvasStroke {
  points: Array<{
    x: number;
    y: number;
    time: number;
  }>;
  color: string;
  width: number;
}

export interface HandwritingData {
  image: string; // Base64 encoded image
  strokes?: CanvasStroke[];
  width: number;
  height: number;
  timestamp: number;
}

export interface MyScriptConfig {
  apiKey: string;
  hmacKey: string;
  endpoint: string;
  applicationKey: string;
}

export interface OpenAIParsingPrompt {
  system: string;
  user: string;
  examples: Array<{
    input: string;
    output: ParsedBookingData;
  }>;
}