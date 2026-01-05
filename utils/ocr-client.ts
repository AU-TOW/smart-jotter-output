// Client-side utilities for OCR processing

/**
 * Client-side OCR processing utility
 * Handles API calls to the OCR recognition endpoint
 */
export class OCRClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/autow/jotter') {
    this.baseUrl = baseUrl;
  }

  /**
   * Process canvas image data for OCR
   */
  async processImage(imageData: string): Promise<OCRResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          inputType: 'image'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OCR image processing error:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process stroke data for OCR
   */
  async processStrokes(
    strokeData: any[], 
    width: number = 800, 
    height: number = 400
  ): Promise<OCRResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strokeData,
          width,
          height,
          inputType: 'strokes'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OCR stroke processing error:', error);
      throw new Error(`Failed to process strokes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check OCR service health
   */
  async checkHealth(): Promise<{ status: string; myScriptConfigured: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/recognize`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OCR health check error:', error);
      return { status: 'unhealthy', myScriptConfigured: false };
    }
  }
}

// Export types for client use
export interface OCRResponse {
  success: boolean;
  text: string;
  confidence: number;
  processingTime?: number;
  error?: string;
}

// Create default instance
export const ocrClient = new OCRClient();