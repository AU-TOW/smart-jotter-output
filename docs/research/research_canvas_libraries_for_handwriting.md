## Research Summary

I've conducted comprehensive research on canvas libraries for handwriting capture in the AUTOW Booking System's Smart Jotter feature. The research focused on React-compatible libraries that can capture handwriting input and export data suitable for the MyScript API integration.

## Key Findings

- **react-signature-canvas** is the most suitable library for this project
- Built on signature_pad with React-specific optimizations
- Full React 18 and Next.js 14 compatibility confirmed
- Superior touch support for mobile/tablet devices
- Native undo/redo functionality
- Direct data export in multiple formats compatible with MyScript API
- Better TypeScript support and documentation
- More active maintenance and community support

## Recommended Approach

Use **react-signature-canvas** as the primary canvas library with the following implementation strategy:

1. Install react-signature-canvas for the main canvas component
2. Implement touch-optimized settings for mobile devices
3. Add custom undo/redo controls
4. Export canvas data as base64 image for MyScript API
5. Include accessibility features (keyboard navigation, ARIA labels)
6. Add responsive design for different screen sizes

## Code Examples

```typescript
// Installation
npm install react-signature-canvas @types/react-signature-canvas

// Basic Component Setup
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface HandwritingCanvasProps {
  onDataChange: (data: string) => void;
}

const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ onDataChange }) => {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleEnd = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const isEmpty = canvasRef.current.isEmpty();
      setIsEmpty(isEmpty);
      
      if (!isEmpty) {
        onDataChange(dataURL);
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setIsEmpty(true);
      onDataChange('');
    }
  };

  const undoLast = () => {
    if (canvasRef.current) {
      const data = canvasRef.current.toData();
      if (data.length > 0) {
        data.pop(); // Remove last stroke
        canvasRef.current.fromData(data);
        handleEnd();
      }
    }
  };

  return (
    <div className="handwriting-canvas">
      <SignatureCanvas
        ref={canvasRef}
        penColor="black"
        canvasProps={{
          width: 800,
          height: 400,
          className: 'signature-canvas border border-gray-300 rounded-md',
          style: { touchAction: 'none' }
        }}
        backgroundColor="white"
        dotSize={2}
        minWidth={1}
        maxWidth={3}
        velocityFilterWeight={0.7}
        onEnd={handleEnd}
      />
      
      <div className="canvas-controls mt-4 flex gap-2">
        <button 
          onClick={undoLast}
          disabled={isEmpty}
          className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
          aria-label="Undo last stroke"
        >
          Undo
        </button>
        <button 
          onClick={clearCanvas}
          disabled={isEmpty}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          aria-label="Clear canvas"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// Touch Event Optimization
const optimizedCanvasProps = {
  width: window.innerWidth < 768 ? window.innerWidth - 40 : 800,
  height: 400,
  className: 'signature-canvas',
  style: { 
    touchAction: 'none',
    border: '1px solid #d1d5db',
    borderRadius: '6px'
  }
};

// Data Export for MyScript API
const exportForMyScript = () => {
  if (canvasRef.current && !canvasRef.current.isEmpty()) {
    // Base64 image export
    const imageData = canvasRef.current.toDataURL('image/png');
    
    // Stroke data export (alternative format)
    const strokeData = canvasRef.current.toData();
    
    return {
      image: imageData,
      strokes: strokeData,
      width: 800,
      height: 400
    };
  }
  return null;
};
```

## Dependencies

- **react-signature-canvas** (^3.0.5) - Main canvas library with React integration
- **@types/react-signature-canvas** (^1.0.5) - TypeScript definitions
- **signature_pad** (automatically included) - Core canvas functionality

## Notes for MK3 (Implementation)

1. **Mobile Responsiveness**: Implement dynamic canvas sizing based on device width
2. **Touch Optimization**: Use `touchAction: 'none'` CSS property to prevent scrolling while drawing
3. **Data Format**: Export as base64 PNG for MyScript API - this format is widely supported
4. **State Management**: Track canvas empty state to enable/disable UI controls
5. **Accessibility**: Add ARIA labels and keyboard shortcuts for canvas controls
6. **Performance**: Consider debouncing the onDataChange callback to avoid excessive API calls
7. **Styling**: The canvas integrates well with Tailwind CSS classes
8. **Error Handling**: Add try-catch blocks around canvas operations
9. **Memory Management**: Clear canvas data when component unmounts to prevent memory leaks
10. **Testing**: The library supports jest/react-testing-library for unit tests

**File Structure Recommendation**:
```
components/
├── smart-jotter/
│   ├── HandwritingCanvas.tsx
│   ├── CanvasControls.tsx
│   └── types.ts
```

**Next Steps**: Implement the HandwritingCanvas component with the provided code examples, then integrate with the MyScript API for OCR processing.