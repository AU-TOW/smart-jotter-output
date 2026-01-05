import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Define the expected response schema
const BookingDataSchema = z.object({
  customer_name: z.string().nullable(),
  phone: z.string().nullable(),
  vehicle: z.string().nullable(),
  year: z.string().nullable(),
  registration: z.string().nullable(),
  issue: z.string().nullable(),
  notes: z.string().nullable(),
  confidence_score: z.number().min(0).max(1).optional()
});

type BookingData = z.infer<typeof BookingDataSchema>;

// Mock response for when API key is not available
const getMockResponse = (text: string): BookingData => {
  // Simple pattern matching for demo purposes
  const patterns = {
    name: /([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    phone: /(07\d{9}|\+44\s?7\d{3}\s?\d{3}\s?\d{3}|\d{11})/,
    registration: /([A-Z]{2}\d{2}\s?[A-Z]{3})/,
    vehicle: /(Ford|BMW|Audi|Mercedes|Toyota|Honda|Nissan|Volkswagen|Vauxhall|Peugeot)\s+(\w+)/i,
    year: /(19|20)\d{2}/
  };

  const nameMatch = text.match(patterns.name);
  const phoneMatch = text.match(patterns.phone);
  const regMatch = text.match(patterns.registration);
  const vehicleMatch = text.match(patterns.vehicle);
  const yearMatch = text.match(patterns.year);

  return {
    customer_name: nameMatch ? nameMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    vehicle: vehicleMatch ? `${vehicleMatch[1]} ${vehicleMatch[2]}` : null,
    year: yearMatch ? yearMatch[0] : null,
    registration: regMatch ? regMatch[0] : null,
    issue: text.includes('warning') || text.includes('light') || text.includes('problem') ? 
           text.split(',').pop()?.trim() || null : null,
    notes: text,
    confidence_score: 0.7 // Mock confidence
  };
};

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not found, using mock response');
      const mockData = getMockResponse(text);
      
      return NextResponse.json({
        success: true,
        data: mockData,
        mock: true,
        message: 'Using mock parsing - add OPENAI_API_KEY for AI parsing'
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create the structured prompt for OpenAI
    const systemPrompt = `You are an expert at extracting structured booking information from handwritten or typed notes for an automotive repair shop (AUTOW).

Extract the following information from the provided text:
- customer_name: Full name of the customer
- phone: Phone number (UK format preferred)
- vehicle: Make and model of the vehicle
- year: Year of manufacture
- registration: UK vehicle registration number
- issue: Description of the problem or service needed
- notes: Any additional notes or context

Rules:
1. Return null for any field that cannot be determined
2. Clean and format the data (e.g., proper capitalization for names)
3. For phone numbers, keep original format but remove extra spaces
4. For registration numbers, use standard UK format (e.g., AB12 CDE)
5. Be conservative - only extract information you're confident about

Return the data as a JSON object with the exact field names specified.`;

    const userPrompt = `Please extract structured booking information from this text: "${text}"`;

    // Call OpenAI API with structured output
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can upgrade to gpt-4o if needed
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { 
        type: 'json_object' 
      },
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 500
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseContent);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Add confidence score based on usage stats
    const usage = completion.usage;
    const confidence = usage ? Math.min(0.95, 0.5 + (usage.completion_tokens / 200)) : 0.8;
    parsedData.confidence_score = confidence;

    // Validate the response against our schema
    const validatedData = BookingDataSchema.parse(parsedData);

    return NextResponse.json({
      success: true,
      data: validatedData,
      mock: false,
      usage: {
        prompt_tokens: usage?.prompt_tokens || 0,
        completion_tokens: usage?.completion_tokens || 0,
        total_tokens: usage?.total_tokens || 0
      }
    });

  } catch (error) {
    console.error('Error in parse API:', error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid data format from AI parsing',
          details: error.errors,
          success: false 
        },
        { status: 422 }
      );
    }

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'OpenAI API configuration error',
          success: false 
        },
        { status: 500 }
      );
    }

    // Fallback to mock response on any error
    try {
      const { text } = await request.json();
      const mockData = getMockResponse(text);
      
      return NextResponse.json({
        success: true,
        data: mockData,
        mock: true,
        error: 'AI parsing failed, using fallback parsing',
        message: 'Add OPENAI_API_KEY for better AI parsing'
      });
    } catch {
      return NextResponse.json(
        { 
          error: 'Parsing failed completely',
          success: false 
        },
        { status: 500 }
      );
    }
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}