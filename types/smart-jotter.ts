export interface ParsedBookingData {
  customer_name?: string;
  phone?: string;
  vehicle?: string;
  year?: string;
  registration?: string;
  issue?: string;
  confidence_score?: number;
}

export interface FieldConfidence {
  customer_name?: number;
  phone?: number;
  vehicle?: number;
  year?: number;
  registration?: number;
  issue?: number;
}

export interface JotterPreviewProps {
  data: ParsedBookingData;
  fieldConfidence?: FieldConfidence;
  onDataChange: (updatedData: ParsedBookingData) => void;
  onCreateBooking: (data: ParsedBookingData) => void;
  onCreateEstimate: (data: ParsedBookingData) => void;
  isLoading?: boolean;
}

export interface EditableFieldProps {
  label: string;
  value: string;
  placeholder: string;
  confidence?: number;
  onChange: (value: string) => void;
  type?: 'text' | 'tel' | 'textarea';
  required?: boolean;
}