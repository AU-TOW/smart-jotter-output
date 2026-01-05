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
  error?: string;
}

export interface ParseResponse {
  parsedData: ParsedBookingData;
  confidence: number;
  error?: string;
}

export interface SmartJotterProps {
  onBookingCreate?: (data: ParsedBookingData) => void;
  onEstimateCreate?: (data: ParsedBookingData) => void;
}

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export interface CanvasInputProps {
  onDataChange: (data: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}