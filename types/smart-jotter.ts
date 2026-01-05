// TypeScript types for the Smart Jotter feature

export interface ParsedBookingData {
  customer_name: string | null;
  phone: string | null;
  vehicle: string | null;
  year: string | null;
  registration: string | null;
  issue: string | null;
  notes: string | null;
  confidence_score?: number;
}

export interface ParseApiResponse {
  success: boolean;
  data: ParsedBookingData;
  mock: boolean;
  message?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ParseApiRequest {
  text: string;
}

export interface SmartJotterState {
  rawText: string;
  parsedData: ParsedBookingData | null;
  isLoading: boolean;
  error: string | null;
  isMocked: boolean;
}