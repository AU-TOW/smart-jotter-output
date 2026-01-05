## Research Summary

OpenAI's structured output capability is perfect for the Smart Jotter feature. Using the `response_format` parameter with JSON schemas, we can reliably extract booking data from messy handwritten/typed notes. The approach uses function calling with strict schemas to ensure consistent output format, even with incomplete or unclear input.

## Key Findings

- **Structured Output**: OpenAI GPT-4o supports `response_format: { type: "json_schema" }` for guaranteed JSON compliance
- **Schema Definition**: JSON Schema 7 format with strict typing and validation rules
- **Prompt Engineering**: Specific patterns work best for field extraction from unstructured text
- **Error Handling**: Built-in graceful degradation for missing/unclear information
- **Cost**: ~$0.01-0.03 per parsing request (typical note ~100-300 tokens)
- **Response Time**: 1-3 seconds typical latency

## Recommended Approach

1. **Use JSON Schema with strict mode** for guaranteed structure
2. **Implement progressive parsing** - extract what's available, mark missing fields
3. **Add confidence scoring** for extracted fields
4. **Use specific prompt templates** optimized for automotive booking context
5. **Implement fallback handling** for completely unparseable input

## Code Examples

### JSON Schema Definition
```typescript
// types/booking-schema.ts
export const bookingSchema = {
  type: "object",
  properties: {
    customer_name: {
      type: "string",
      description: "Full name of the customer"
    },
    phone: {
      type: "string", 
      pattern: "^[0-9+\\s\\-\\(\\)]+$",
      description: "Phone number in any format"
    },
    vehicle: {
      type: "object",
      properties: {
        make: { type: "string", description: "Vehicle manufacturer" },
        model: { type: "string", description: "Vehicle model" },
        year: { 
          type: "string", 
          pattern: "^(19|20)\\d{2}$",
          description: "4-digit year"
        }
      },
      required: ["make", "model"]
    },
    registration: {
      type: "string",
      description: "UK registration plate"
    },
    issue: {
      type: "string",
      description: "Described problem or service needed"
    },
    notes: {
      type: "string",
      description: "Additional notes or unclear text"
    },
    confidence: {
      type: "object",
      properties: {
        customer_name: { type: "number", minimum: 0, maximum: 1 },
        phone: { type: "number", minimum: 0, maximum: 1 },
        vehicle: { type: "number", minimum: 0, maximum: 1 },
        registration: { type: "number", minimum: 0, maximum: 1 },
        issue: { type: "number", minimum: 0, maximum: 1 }
      }
    }
  },
  required: ["customer_name", "phone", "vehicle", "issue"],
  additionalProperties: false
} as const;

export type BookingData = {
  customer_name: string;
  phone: string;
  vehicle: {
    make: string;
    model: string;
    year?: string;
  };
  registration?: string;
  issue: string;
  notes?: string;
  confidence: {
    customer_name: number;
    phone: number;
    vehicle: number;
    registration: number;
    issue: number;
  };
};
```

### OpenAI API Implementation
```typescript
// lib/openai-parser.ts
import OpenAI from 'openai';
import { bookingSchema, BookingData } from '@/types/booking-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PARSING_PROMPT = `You are an expert at extracting automotive booking information from handwritten or typed notes.

Extract the following information from the provided text:
- Customer name (full name)
- Phone number (any format - mobile, landline)
- Vehicle details (make, model, year if mentioned)
- Registration plate (UK format)
- Issue or service needed
- Any additional notes

IMPORTANT RULES:
1. If information is unclear or missing, set confidence score accordingly (0.0 = completely unsure, 1.0 = completely certain)
2. For vehicle year, only extract if explicitly mentioned (don't guess)
3. Clean up phone numbers but preserve all digits
4. Put any unclear or extra information in the notes field
5. If you can't find required information, still provide your best guess with low confidence

Examples of input variations:
- "John Smith 07712345678 Ford Focus 2018 YA19ABC engine light"
- "Mrs. Jones - 01234 567890, Vauxhall Corsa, registration YX21 DEF, brake noise"
- "Mike, mobile: 07890123456, BMW 3 Series, needs MOT"`;

export async function parseJotterNote(noteText: string): Promise<{
  data: BookingData | null;
  error?: string;
  rawResponse?: string;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: PARSING_PROMPT
        },
        {
          role: "user",
          content: `Extract booking information from this note:\n\n"${noteText}"`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "booking_data",
          strict: true,
          schema: bookingSchema
        }
      },
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 500
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error('No response from OpenAI');
    }

    const parsedData = JSON.parse(rawResponse) as BookingData;
    
    // Validate minimum required fields
    if (!parsedData.customer_name || !parsedData.phone || !parsedData.issue) {
      return {
        data: null,
        error: 'Could not extract minimum required information (name, phone, issue)',
        rawResponse
      };
    }

    return { data: parsedData, rawResponse };

  } catch (error) {
    console.error('OpenAI parsing error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

// Utility function for confidence-based validation
export function validateBookingConfidence(data: BookingData, minimumConfidence = 0.3): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isValid = true;

  Object.entries(data.confidence).forEach(([field, confidence]) => {
    if (confidence < minimumConfidence) {
      warnings.push(`Low confidence for ${field}: ${(confidence * 100).toFixed(0)}%`);
    }
    if (confidence < 0.1) {
      isValid = false;
    }
  });

  return { isValid, warnings };
}
```

### React Component Usage
```typescript
// components/smart-jotter/JotterParser.tsx
import { useState } from 'react';
import { parseJotterNote, validateBookingConfidence } from '@/lib/openai-parser';
import { BookingData } from '@/types/booking-schema';

interface JotterParserProps {
  noteText: string;
  onParsed: (data: BookingData) => void;
}

export function JotterParser({ noteText, onParsed }: JotterParserProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<BookingData | null>(null);
  const [error, setError] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleParse = async () => {
    if (!noteText.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await parseJotterNote(noteText);
      
      if (result.error || !result.data) {
        setError(result.error || 'Failed to parse note');
        return;
      }

      const validation = validateBookingConfidence(result.data);
      setParsedData(result.data);
      setWarnings(validation.warnings);
      
      if (validation.isValid) {
        onParsed(result.data);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parsing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={handleParse}
        disabled={isLoading || !noteText.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Parsing...' : 'Extract Booking Info'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <ul className="list-disc list-inside">
            {warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {parsedData && (
        <div className="bg-green-100 border border-green-400 p-4 rounded">
          <h3 className="font-semibold mb-2">Extracted Information:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Customer:</strong> {parsedData.customer_name}</div>
            <div><strong>Phone:</strong> {parsedData.phone}</div>
            <div><strong>Vehicle:</strong> {parsedData.vehicle.make} {parsedData.vehicle.model}</div>
            {parsedData.vehicle.year && <div><strong>Year:</strong> {parsedData.vehicle.year}</div>}
            {parsedData.registration && <div><strong>Registration:</strong> {parsedData.registration}</div>}
            <div className="col-span-2"><strong>Issue:</strong> {parsedData.issue}</div>
            {parsedData.notes && <div className="col-span-2"><strong>Notes:</strong> {parsedData.notes}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Dependencies

- `openai` (^4.20.0) - Official OpenAI SDK for API calls
- `zod` (^3.22.0) - Optional: Runtime schema validation as backup
- `@types/node` - For TypeScript support

## Notes for MK3 (Implementation)

1. **Environment Setup**: Ensure `OPENAI_API_KEY` is configured in `.env.local`
2. **Error Boundaries**: Wrap parsing components in error boundaries for graceful failures
3. **Rate Limiting**: Consider implementing request queuing for high-volume usage
4. **Caching**: Cache successful parses to avoid re-processing identical notes
5. **Testing**: Create test cases with various handwriting scenarios
6. **Progressive Enhancement**: Start with basic extraction, add advanced features iteratively
7. **User Feedback**: Allow users to correct extracted data and learn from corrections
8. **Cost Monitoring**: Track API usage and implement usage limits if needed

**File Structure Recommendations:**
```
lib/
  openai-parser.ts      # Main parsing logic
  schema-validator.ts   # Backup validation
types/
  booking-schema.ts     # Schema definitions
components/
  smart-jotter/
    JotterParser.tsx    # Main component
    ConfidenceIndicator.tsx  # Show confidence levels
```

The structured output approach is robust and will handle the majority of real-world jotter scenarios with high accuracy.