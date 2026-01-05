// Utility functions for API calls

import { ParseApiRequest, ParseApiResponse } from '@/types/smart-jotter';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Parse text using the Smart Jotter API
 */
export async function parseText(text: string): Promise<ParseApiResponse> {
  if (!text.trim()) {
    throw new ApiError('Text cannot be empty', 400);
  }

  const request: ParseApiRequest = { text: text.trim() };

  try {
    const response = await fetch('/api/autow/jotter/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to parse text',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      'Network error - please check your connection',
      0,
      error
    );
  }
}

/**
 * Format parsed data for display
 */
export function formatParsedData(data: ParseApiResponse['data']) {
  const formatted: Record<string, string> = {};

  if (data.customer_name) formatted['Customer Name'] = data.customer_name;
  if (data.phone) formatted['Phone'] = data.phone;
  if (data.vehicle) formatted['Vehicle'] = data.vehicle;
  if (data.year) formatted['Year'] = data.year;
  if (data.registration) formatted['Registration'] = data.registration;
  if (data.issue) formatted['Issue'] = data.issue;
  if (data.notes && data.notes !== data.issue) formatted['Notes'] = data.notes;

  return formatted;
}

/**
 * Validate UK phone number format
 */
export function isValidUkPhone(phone: string | null): boolean {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\s/g, '');
  const ukPhoneRegex = /^(07\d{9}|\+447\d{9}|447\d{9})$/;
  
  return ukPhoneRegex.test(cleaned);
}

/**
 * Validate UK registration number format
 */
export function isValidUkRegistration(reg: string | null): boolean {
  if (!reg) return false;
  
  const cleaned = reg.replace(/\s/g, '').toUpperCase();
  const ukRegexes = [
    /^[A-Z]{2}\d{2}[A-Z]{3}$/, // Current format: AB12 CDE
    /^[A-Z]\d{3}[A-Z]{3}$/, // Old format: A123 BCD
    /^[A-Z]{3}\d{3}[A-Z]$/, // Old format: ABC 123D
  ];
  
  return ukRegexes.some(regex => regex.test(cleaned));
}