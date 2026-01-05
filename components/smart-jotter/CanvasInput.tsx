'use client';

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface CanvasInputProps {
  onDataChange: (data: string) => void;
  isDisabled?: boolean;
}

const CanvasInput: React.FC<CanvasInputProps> = ({
  onDataChange,
  isDisabled = false,
}) => {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth < 768 ? Math.min(window.innerWidth - 80, 600) : 800;
      setCanvasSize({ width, height: 400 });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const handleEnd = () => {
    if (canvasRef.current && !isDisabled) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const canvasIsEmpty = canvasRef.current.isEmpty();
      setIsEmpty(canvasIsEmpty);
      
      if (!canvasIsEmpty) {
        onDataChange(dataURL);
      } else {
        onDataChange('');
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current && !isDisabled) {
      canvasRef.current.clear();
      setIsEmpty(true);
      onDataChange('');
    }
  };

  const undoLast = () => {
    if (canvasRef.current && !isDisabled) {
      const data = canvasRef.current.toData();
      if (data.length > 0) {
        data.pop(); // Remove last stroke
        canvasRef.current.fromData(data);
        handleEnd();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Write your booking details in the area below
        </p>
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <SignatureCanvas
            ref={canvasRef}
            penColor="black"
            canvasProps={{
              width: canvasSize.width,
              height: canvasSize.height,
              className: `signature-canvas bg-white rounded border ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'
              }`,
              style: { 
                touchAction: 'none',
                maxWidth: '100%',
                height: 'auto'
              }
            }}
            backgroundColor="white"
            dotSize={2}
            minWidth={1}
            maxWidth={3}
            velocityFilterWeight={0.7}
            onEnd={handleEnd}
          />
        </div>
      </div>

      {/* Canvas Controls */}
      <div className="flex justify-center space-x-3">
        <button
          type="button"
          onClick={undoLast}
          disabled={isEmpty || isDisabled}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Undo last stroke"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          onClick={clearCanvas}
          disabled={isEmpty || isDisabled}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Clear canvas"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Mobile Touch Instructions */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          💡 Use your finger or stylus to write on touch devices
        </p>
      </div>
    </div>
  );
};

export default CanvasInput;