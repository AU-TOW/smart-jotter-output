## Research Summary

MyScript provides cloud-based handwriting recognition APIs that can convert handwritten text from canvas stroke data to digital text. The API supports multiple recognition types including text, math, and diagrams. For the AUTOW Booking System, we'll use their Text Recognition API which is well-suited for converting handwritten booking notes to structured text.

## Key Findings

- **Official Package**: MyScript provides `myscript` npm package, but REST API is more commonly used for web applications
- **Authentication**: Uses Application Key and HMAC signature authentication
- **Free Tier**: 2,000 requests per month, then $0.002 per request
- **Response Time**: Typically 200-500ms for text recognition
- **Input Format**: Accepts JSON stroke data with x,y coordinates and timestamps
- **Output Format**: Returns recognized text with confidence scores and alternatives

## Recommended Approach

1. Use MyScript Cloud REST API directly (more flexible than SDK)
2. Implement canvas drawing component to capture stroke data
3. Convert canvas strokes to MyScript's stroke format
4. Send recognition request to MyScript API
5. Handle response and extract recognized text
6. Pass recognized text to OpenAI for structured data extraction

## Code Examples

```typescript
// Types for MyScript API
interface MyScriptStroke {
  id: string;
  pointerType: 'PEN' | 'TOUCH';
  pointerId: number;
  x: number[];
  y: number[];
  t: number[];
}

interface MyScriptTextRequest {
  configuration: {
    lang: string;
    export: {
      text: {
        format: 'TEXT';
      };
    };
  };
  strokeGroups: Array<{
    strokes: MyScriptStroke[];
  }>;
}

// Authentication helper
function generateHMAC(applicationKey: string, hmacKey: string, data: string): string {
  const crypto = require('crypto');
  const timestamp = Date.now().toString();
  const message = `${applicationKey}\n${timestamp}\n${data}`;
  return crypto.createHmac('sha512', hmacKey).update(message).digest('hex');
}

// API call function
async function recognizeHandwriting(strokes: MyScriptStroke[]): Promise<string> {
  const APPLICATION_KEY = process.env.MYSCRIPT_APP_KEY!;
  const HMAC_KEY = process.env.MYSCRIPT_HMAC_KEY!;
  
  const requestBody: MyScriptTextRequest = {
    configuration: {
      lang: 'en_US',
      export: {
        text: {
          format: 'TEXT'
        }
      }
    },
    strokeGroups: [{
      strokes: strokes
    }]
  };

  const bodyString = JSON.stringify(requestBody);
  const hmac = generateHMAC(APPLICATION_KEY, HMAC_KEY, bodyString);
  const timestamp = Date.now().toString();

  const response = await fetch('https://cloud-api.myscript.com/api/v4.0/iink/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'applicationKey': APPLICATION_KEY,
      'hmac': hmac,
      'timestamp': timestamp
    },
    body: bodyString
  });

  const result = await response.json();
  return result.exports?.['text/plain'] || '';
}

// Canvas stroke capture component
interface CanvasDrawingProps {
  onStrokesChange: (strokes: MyScriptStroke[]) => void;
}

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({ onStrokesChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<MyScriptStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<MyScriptStroke | null>(null);

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newStroke: MyScriptStroke = {
      id: `stroke-${Date.now()}`,
      pointerType: 'PEN',
      pointerId: 1,
      x: [x],
      y: [y],
      t: [Date.now()]
    };
    
    setCurrentStroke(newStroke);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !currentStroke) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const updatedStroke = {
      ...currentStroke,
      x: [...currentStroke.x, x],
      y: [...currentStroke.y, y],
      t: [...currentStroke.t, Date.now()]
    };
    
    setCurrentStroke(updatedStroke);
    
    // Draw on canvas
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (currentStroke) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      onStrokesChange(newStrokes);
      setCurrentStroke(null);
    }
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      className="border border-gray-300 cursor-crosshair"
    />
  );
};
```

## Dependencies

- **No npm package required** - Using REST API directly
- **crypto** (Node.js built-in) - For HMAC signature generation
- **fetch** (built-in) - For API requests
- **React hooks** (useState, useRef, useEffect) - For canvas component

## API Specifications

### Endpoint
```
POST https://cloud-api.myscript.com/api/v4.0/iink/batch
```

### Authentication Headers
```
applicationKey: YOUR_APP_KEY
hmac: GENERATED_HMAC_SIGNATURE  
timestamp: CURRENT_TIMESTAMP_MS
```

### Rate Limits
- Free tier: 2,000 requests/month
- Paid: $0.002 per request after free tier
- Rate limit: 10 requests per second

### Response Format
```json
{
  "instanceId": "string",
  "exports": {
    "text/plain": "Recognized text here"
  }
}
```

## Notes for MK3 (Implementation)

1. **Environment Variables**: Set up `MYSCRIPT_APP_KEY` and `MYSCRIPT_HMAC_KEY` in `.env.local`

2. **Canvas Component**: Implement the drawing canvas first - this is the foundation for stroke capture

3. **Stroke Data Format**: MyScript requires specific format with x,y coordinates arrays and timestamps - ensure proper conversion

4. **Error Handling**: Implement retry logic for network failures and handle API rate limits gracefully

5. **Performance**: Consider debouncing API calls - don't send requests on every stroke, wait for user to pause

6. **Fallback**: Provide manual text input option if handwriting recognition fails

7. **Testing**: Use the provided test strokes in MyScript documentation for initial testing

8. **Security**: API calls should be made from server-side API routes to protect credentials, not directly from client

9. **File Structure**:
   ```
   /components/smart-jotter/
   ├── CanvasDrawing.tsx
   ├── HandwritingRecognition.ts
   └── types.ts
   /pages/api/
   └── recognize-handwriting.ts
   ```

10. **Integration Flow**:
    - User draws on canvas
    - Canvas captures stroke data
    - Send strokes to `/api/recognize-handwriting`
    - Server calls MyScript API
    - Return recognized text to client
    - Pass text to OpenAI parsing function