## Research Summary

I need to research the technical specifications for the Smart Jotter feature in the AUTOW Booking System. This involves combining research from multiple sources (MyScript API, OpenAI parsing, Canvas implementation) to create a comprehensive technical specification document.

## Key Findings

### Architecture Components Required:
- **Canvas Drawing Component**: HTML5 Canvas for handwriting input
- **Text Input Component**: Fallback typed text input
- **OCR Service Integration**: MyScript API for handwriting recognition
- **AI Parsing Service**: OpenAI GPT-4o for data extraction
- **Preview Component**: Structured data display
- **Action Buttons**: Create Booking/Estimate functionality

### Data Flow Process:
1. User Input (Canvas/Text) → 
2. OCR Processing (MyScript) → 
3. AI Parsing (OpenAI) → 
4. Structured Preview → 
5. Action Selection

### API Architecture:
- `/api/ocr` - MyScript handwriting recognition
- `/api/parse` - OpenAI text parsing
- `/api/booking` - Create booking from parsed data
- `/api/estimate` - Create estimate from parsed data

## Recommended Approach

### Component Architecture:
```
SmartJotter (Parent)
├── InputSection
│   ├── CanvasDrawing
│   └── TextInput
├── ProcessingStatus
├── ParsedDataPreview
└── ActionButtons
```

### State Management:
- Use React hooks (useState, useEffect) for local state
- Context API for sharing parsed data across components

## Code Examples

### TypeScript Interfaces:
```typescript
interface ParsedBookingData {
  customer_name: string;
  phone: string;
  vehicle: string;
  year: string;
  registration: string;
  issue: string;
  confidence_score?: number;
}

interface OCRResponse {
  text: string;
  confidence: number;
}

interface SmartJotterProps {
  onBookingCreate?: (data: ParsedBookingData) => void;
  onEstimateCreate?: (data: ParsedBookingData) => void;
}
```

### API Route Structure:
```typescript
// /api/ocr
export async function POST(request: Request) {
  const { imageData } = await request.json();
  // MyScript API integration
  return NextResponse.json({ text, confidence });
}

// /api/parse
export async function POST(request: Request) {
  const { text } = await request.json();
  // OpenAI GPT-4o parsing
  return NextResponse.json({ parsedData });
}
```

## Dependencies

- **@myscript/iinkjs** - MyScript SDK for handwriting recognition
- **openai** - OpenAI API client
- **canvas-confetti** - Visual feedback (optional)
- **react-canvas-draw** - Enhanced canvas drawing capabilities
- **zod** - Runtime type validation
- **@hookform/resolvers** - Form validation helpers

## Notes for MK3 (Implementation)

### Implementation Priority:
1. **Phase 1**: Basic canvas input and text fallback
2. **Phase 2**: MyScript OCR integration
3. **Phase 3**: OpenAI parsing integration
4. **Phase 4**: Preview and action buttons
5. **Phase 5**: Error handling and validation

### Critical Considerations:
- **API Key Security**: Store MyScript and OpenAI keys in environment variables
- **Error Handling**: Graceful fallbacks for OCR/API failures
- **Mobile Responsiveness**: Touch-friendly canvas for mobile devices
- **Data Validation**: Validate parsed data before allowing booking creation
- **Loading States**: Clear feedback during OCR and parsing operations

### File Structure:
```
components/
├── smart-jotter/
│   ├── SmartJotter.tsx
│   ├── CanvasInput.tsx
│   ├── TextInput.tsx
│   ├── ParsedPreview.tsx
│   └── ActionButtons.tsx
api/
├── ocr.ts
├── parse.ts
├── booking.ts
└── estimate.ts
types/
└── smart-jotter.ts
```

### Environment Variables Needed:
- `MYSCRIPT_API_KEY`
- `MYSCRIPT_HMAC_KEY`
- `OPENAI_API_KEY`

The technical specification should include detailed component responsibilities, API contracts, and clear separation of concerns for maintainable code.