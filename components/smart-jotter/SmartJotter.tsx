'use client';

import React, { useState, useCallback } from 'react';
import HandwritingCanvas from './HandwritingCanvas';
import TextInput from './TextInput';
import { SmartJotterProps, CanvasData, InputMode } from '@/types/smart-jotter';

const SmartJotter: React.FC<SmartJotterProps> = ({
  onBookingCreate,
  onEstimateCreate,
  className = ''
}) => {
  // State management
  const [currentMode, setCurrentMode] = useState<InputMode['type']>('canvas');
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [textData, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Input modes configuration
  const inputModes: InputMode[] = [
    { type: 'canvas', label: 'Handwriting', icon: '✍️' },
    { type: 'text', label: 'Type Text', icon: '⌨️' }
  ];

  // Handle canvas data changes
  const handleCanvasDataChange = useCallback((data: CanvasData | null) => {
    setCanvasData(data);
  }, []);

  // Handle text data changes
  const handleTextDataChange = useCallback((text: string) => {
    setText(text);
  }, []);

  // Switch between input modes
  const switchMode = useCallback((mode: InputMode['type']) => {
    setCurrentMode(mode);
    // Clear data when switching modes
    setCanvasData(null);
    setText('');
  }, []);

  // Check if we have any input data
  const hasData = currentMode === 'canvas' ? canvasData !== null : text.trim().length > 0;

  // Process the input data (placeholder for OCR/parsing)
  const processInput = useCallback(async () => {
    if (!hasData) return;
    
    setIsProcessing(true);
    
    try {
      // TODO: Implement actual OCR and parsing logic
      console.log('Processing input:', currentMode === 'canvas' ? canvasData : textData);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed data
      const mockParsedData = {
        customer_name: "John Smith",
        phone: "07712345678",
        vehicle: "Ford Focus",
        year: "2018",
        registration: "YA19 ABC",
        issue: "Engine warning light"
      };
      
      console.log('Parsed data:', mockParsedData);
      
    } catch (error) {
      console.error('Error processing input:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [hasData, currentMode, canvasData, textData]);

  return (
    <div className={`smart-jotter-container max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Smart Jotter
        </h1>
        <p className="text-gray-600">
          Capture booking details with handwriting or text input
        </p>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector mb-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            {inputModes.map((mode) => (
              <button
                key={mode.type}
                onClick={() => switchMode(mode.type)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  currentMode === mode.type
                    ? 'bg-white shadow-sm text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="input-section mb-6">
        {currentMode === 'canvas' ? (
          <HandwritingCanvas 
            onDataChange={handleCanvasDataChange}
            isProcessing={isProcessing}
          />
        ) : (
          <TextInput 
            onDataChange={handleTextDataChange}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        <div className="flex justify-center gap-4">
          <button
            onClick={processInput}
            disabled={!hasData || isProcessing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Process & Extract Data</span>
              </>
            )}
          </button>
        </div>
        
        {/* Data Status */}
        <div className="text-center mt-4 text-sm text-gray-600">
          {hasData ? (
            <span className="text-green-600">
              ✅ {currentMode === 'canvas' ? 'Handwriting' : 'Text'} data ready
            </span>
          ) : (
            <span>
              Please {currentMode === 'canvas' ? 'draw' : 'type'} your booking details above
            </span>
          )}
        </div>
      </div>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-section mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Debug Information:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Current Mode: {currentMode}</div>
            <div>Has Canvas Data: {canvasData !== null ? 'Yes' : 'No'}</div>
            <div>Text Length: {textData.length} characters</div>
            <div>Processing: {isProcessing ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartJotter;