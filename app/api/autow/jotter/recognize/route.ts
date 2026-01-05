import { NextRequest, NextResponse } from 'next/server';

// TypeScript interfaces for OCR processing
interface OCRRequest {
  imageData?: string;
  strokeData?: any[];
  width?: number;
  height?: number;
  inputType: 'image' | 'strokes';
}

interface OCRResponse {
  success: boolean;
  text: string;
  confidence: number;
  processingTime?: number;
  error?: string;
}

interface MyScriptResponse {
  exports?: {
    'text/plain'?: string;
  };
  result?: string;
  confidence?: number;
}

/**
 * OCR API Route for Smart Jotter handwriting recognition
 * Handles both image data and stroke data input formats
 */
export async function POST(request: NextRequest): Promise<NextResponse<OCRResponse>> {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body: OCRRequest = await request.json();
    const { imageData, strokeData, width = 800, height = 400, inputType } = body;

    // Validate input
    if (!imageData && !strokeData) {
      return NextResponse.json({
        success: false,
        text: '',
        confidence: 0,
        error: 'No input data provided. Please provide either imageData or strokeData.'
      }, { status: 400 });
    }

    // Check for MyScript API configuration
    const apiKey = process.env.MYSCRIPT_API_KEY;
    const hmacKey = process.env.MYSCRIPT_HMAC_KEY;

    if (!apiKey || !hmacKey) {
      console.warn('MyScript API keys not configured. Using mock response for testing.');
      
      // Return mock response for testing
      const mockText = generateMockOCRText(imageData || 'mock-input');
      
      return NextResponse.json({
        success: true,
        text: mockText,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
        error: 'Using mock response - MyScript API keys not configured'
      });
    }

    // Process with MyScript API
    let recognizedText = '';
    let confidence = 0;

    if (inputType === 'image' && imageData) {
      // Handle base64 image data
      const result = await processImageWithMyScript(imageData, apiKey, hmacKey);
      recognizedText = result.text;
      confidence = result.confidence;
    } else if (inputType === 'strokes' && strokeData) {
      // Handle stroke data
      const result = await processStrokesWithMyScript(strokeData, width, height, apiKey, hmacKey);
      recognizedText = result.text;
      confidence = result.confidence;
    } else {
      return NextResponse.json({
        success: false,
        text: '',
        confidence: 0,
        error: 'Invalid input type or missing data for the specified input type.'
      }, { status: 400 });
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      text: recognizedText,
      confidence,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    
    return NextResponse.json({
      success: false,
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred during OCR processing',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * Process base64 image data with MyScript Cloud API
 */
async function processImageWithMyScript(
  imageData: string, 
  apiKey: string, 
  hmacKey: string
): Promise<{ text: string; confidence: number }> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // MyScript Cloud API endpoint for image recognition
    const response = await fetch('https://cloud.myscript.com/api/v4.0/iink/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'applicationKey': apiKey,
        'hmac': hmacKey,
      },
      body: JSON.stringify({
        configuration: {
          lang: 'en_US',
          export: {
            'text/plain': {
              granularity: 'word'
            }
          }
        },
        contentType: 'Text',
        conversionState: 'DIGITAL_EDIT',
        inputUnits: [
          {
            textInputType: 'SINGLE_LINE_TEXT',
            components: [
              {
                type: 'image',
                data: base64Data,
                mimeType: 'image/png'
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`MyScript API error: ${response.status} - ${response.statusText}`);
    }

    const result: MyScriptResponse = await response.json();
    
    // Extract text from response
    const text = result.exports?.['text/plain'] || result.result || '';
    const confidence = result.confidence || 0.8; // Default confidence if not provided
    
    return { text: text.trim(), confidence };
    
  } catch (error) {
    console.error('MyScript image processing error:', error);
    throw new Error(`Failed to process image with MyScript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process stroke data with MyScript Cloud API
 */
async function processStrokesWithMyScript(
  strokeData: any[], 
  width: number, 
  height: number,
  apiKey: string, 
  hmacKey: string
): Promise<{ text: string; confidence: number }> {
  try {
    // Convert stroke data to MyScript format
    const myScriptStrokes = convertToMyScriptFormat(strokeData, width, height);
    
    const response = await fetch('https://cloud.myscript.com/api/v4.0/iink/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'applicationKey': apiKey,
        'hmac': hmacKey,
      },
      body: JSON.stringify({
        configuration: {
          lang: 'en_US',
          export: {
            'text/plain': {
              granularity: 'word'
            }
          }
        },
        contentType: 'Text',
        conversionState: 'DIGITAL_EDIT',
        inputUnits: [
          {
            textInputType: 'SINGLE_LINE_TEXT',
            components: myScriptStrokes
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`MyScript API error: ${response.status} - ${response.statusText}`);
    }

    const result: MyScriptResponse = await response.json();
    
    const text = result.exports?.['text/plain'] || result.result || '';
    const confidence = result.confidence || 0.8;
    
    return { text: text.trim(), confidence };
    
  } catch (error) {
    console.error('MyScript stroke processing error:', error);
    throw new Error(`Failed to process strokes with MyScript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert canvas stroke data to MyScript format
 */
function convertToMyScriptFormat(strokeData: any[], width: number, height: number) {
  return strokeData.map((stroke, index) => ({
    type: 'stroke',
    id: `stroke-${index}`,
    pointerType: 'pen',
    x: stroke.map((point: any) => point.x || 0),
    y: stroke.map((point: any) => point.y || 0),
    t: stroke.map((point: any, i: number) => i * 16), // Timestamp simulation
    p: stroke.map(() => 0.5) // Pressure simulation
  }));
}

/**
 * Generate mock OCR text for testing purposes
 */
function generateMockOCRText(input: string): string {
  // Simple hash-based mock text generation for consistent testing
  const mockResponses = [
    'John Smith, 07712345678, Ford Focus 2018, YA19 ABC, Engine warning light',
    'Sarah Johnson, 07823456789, BMW X3 2020, BC20 DEF, Brake service required',
    'Mike Brown, 07934567890, Audi A4 2019, CD21 GHI, Annual MOT inspection',
    'Emma Wilson, 07845678901, Mercedes C200 2017, DE18 JKL, Air conditioning repair',
    'David Taylor, 07956789012, Volkswagen Golf 2021, EF22 MNO, Oil change service'
  ];
  
  // Use input length to select mock response for consistency
  const index = (input.length % mockResponses.length);
  return mockResponses[index];
}

/**
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  const hasApiKeys = !!(process.env.MYSCRIPT_API_KEY && process.env.MYSCRIPT_HMAC_KEY);
  
  return NextResponse.json({
    status: 'healthy',
    service: 'OCR Recognition API',
    myScriptConfigured: hasApiKeys,
    timestamp: new Date().toISOString()
  });
}