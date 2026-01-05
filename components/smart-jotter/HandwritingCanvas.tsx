'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { HandwritingCanvasProps, CanvasData } from '@/types/smart-jotter';

const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ 
  onDataChange, 
  isProcessing = false,
  className = '' 
}) => {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      
      let width = 800;
      let height = 400;
      
      if (isMobile) {
        width = Math.min(window.innerWidth - 40, 600);
        height = 300;
      } else if (isTablet) {
        width = Math.min(window.innerWidth - 80, 700);
        height = 350;
      }
      
      setCanvasSize({ width, height });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Export canvas data for API submission
  const exportCanvasData = useCallback((): CanvasData | null => {
    if (!canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const canvasIsEmpty = canvas.isEmpty();
    
    if (canvasIsEmpty) return null;
    
    return {
      image: canvas.toDataURL('image/png'),
      strokes: canvas.toData(),
      width: canvasSize.width,
      height: canvasSize.height,
      isEmpty: false
    };
  }, [canvasSize]);

  // Handle drawing end event
  const handleDrawingEnd = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvasIsEmpty = canvasRef.current.isEmpty();
    setIsEmpty(canvasIsEmpty);
    
    if (canvasIsEmpty) {
      onDataChange(null);
    } else {
      const data = exportCanvasData();
      onDataChange(data);
    }
  }, [exportCanvasData, onDataChange]);

  // Clear entire canvas
  const clearCanvas = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setIsEmpty(true);
      onDataChange(null);
    }
  }, [onDataChange]);

  // Undo last stroke
  const undoLastStroke = useCallback(() => {
    if (!canvasRef.current) return;
    
    const data = canvasRef.current.toData();
    if (data.length > 0) {
      data.pop(); // Remove the last stroke
      canvasRef.current.fromData(data);
      handleDrawingEnd();
    }
  }, [handleDrawingEnd]);

  // Prevent scrolling on touch devices when drawing
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (e.target && (e.target as Element).closest('.signature-canvas')) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div className={`handwriting-canvas-container ${className}`}>
      {/* Canvas Header */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Write your booking details below
        </h3>
        <p className="text-sm text-gray-600">
          Include customer name, phone, vehicle details, and issue description
        </p>
      </div>

      {/* Drawing Canvas */}
      <div 
        className={`canvas-wrapper border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 ${
          isProcessing ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <div className="relative bg-white rounded-md shadow-sm">
          <SignatureCanvas
            ref={canvasRef}
            penColor="black"
            canvasProps={{
              width: canvasSize.width,
              height: canvasSize.height,
              className: 'signature-canvas border border-gray-200 rounded-md',
              style: { 
                touchAction: 'none',
                width: '100%',
                height: 'auto',
                maxWidth: `${canvasSize.width}px`,
                display: 'block'
              }
            }}
            backgroundColor="white"
            dotSize={1.5}
            minWidth={0.8}
            maxWidth={2.5}
            velocityFilterWeight={0.7}
            onEnd={handleDrawingEnd}
            clearOnResize={false}
          />
          
          {/* Canvas overlay for empty state */}
          {isEmpty && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">✍️</div>
                <p className="text-sm">Start writing here...</p>
              </div>
            </div>
          )}
          
          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Processing handwriting...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Controls */}
      <div className="canvas-controls mt-4 flex flex-wrap gap-2 justify-center">
        <button 
          onClick={undoLastStroke}
          disabled={isEmpty || isProcessing}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          aria-label="Undo last stroke"
        >
          <span>↶</span>
          <span className="hidden sm:inline">Undo</span>
        </button>
        
        <button 
          onClick={clearCanvas}
          disabled={isEmpty || isProcessing}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          aria-label="Clear canvas"
        >
          <span>🗑️</span>
          <span className="hidden sm:inline">Clear</span>
        </button>
        
        <div className="text-xs text-gray-500 flex items-center px-2">
          {isEmpty ? 'Canvas is empty' : 'Ready to process'}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Write clearly and include all details on separate lines for best results. 
          Example: "John Smith", "07712345678", "Ford Focus 2018", "YA19 ABC", "Engine warning light"
        </p>
      </div>
    </div>
  );
};

export default HandwritingCanvas;