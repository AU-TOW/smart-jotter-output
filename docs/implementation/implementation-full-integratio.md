## Implementation Summary

I've completed the full integration of the Smart Jotter feature for the AUTOW Booking System. This implementation includes a complete end-to-end flow from handwriting/text input through OCR processing, AI parsing, structured data preview, and booking creation functionality.

## Files Created/Modified

```app/autow/jotter/page.tsx
'use client';

import React from 'react';
import SmartJotter from '@/components/smart-jotter/SmartJotter';
import { ParsedBookingData } from '@/types/smart-jotter';

export default function SmartJotterPage() {
  const handleBookingCreate = async (data: ParsedBookingData) => {
    try {
      console.log('Creating booking with data:', data);
      // Navigation to booking form with pre-filled data will be handled by SmartJotter
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleEstimateCreate = async (data: ParsedBookingData) => {
    try {
      console.log('Creating estimate with data:', data);
      // Future feature - currently disabled
    } catch (error) {
      console.error('Error creating estimate:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Smart Jotter
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Convert handwritten notes or typed text into booking data
            </p>
          </div>
          
          <div className="p-6">
            <SmartJotter
              onBookingCreate={handleBookingCreate}
              onEstimateCreate={handleEstimateCreate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

```components/smart-jotter/SmartJotter.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { ParsedBookingData, OCRResponse, ProcessingStep } from '@/types/smart-jotter';
import InputSection from './InputSection';
import ProcessingStatus from './ProcessingStatus';
import ParsedDataPreview from './ParsedDataPreview';
import ActionButtons from './ActionButtons';
import { useRouter } from 'next/navigation';

interface SmartJotterProps {
  onBookingCreate?: (data: ParsedBookingData) => void;
  onEstimateCreate?: (data: ParsedBookingData) => void;
}

const SmartJotter: React.FC<SmartJotterProps> = ({
  onBookingCreate,
  onEstimateCreate,
}) => {
  const router = useRouter();
  const [inputType, setInputType] = useState<'canvas' | 'text'>('canvas');
  const [inputData, setInputData] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('input');
  const [error, setError] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedBookingData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processInput = useCallback(async (data: string, type: 'canvas' | 'text') => {
    try {
      setIsProcessing(true);
      setError('');
      setCurrentStep('processing');

      let textToProcess = data;

      // If canvas input, perform OCR first
      if (type === 'canvas') {
        setCurrentStep('ocr');
        
        const ocrResponse = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: data }),
        });

        if (!ocrResponse.ok) {
          throw new Error('OCR processing failed');
        }

        const ocrResult: OCRResponse = await ocrResponse.json();
        textToProcess = ocrResult.text;

        if (!textToProcess.trim()) {
          throw new Error('No text could be extracted from the handwriting');
        }
      }

      // Parse the text with AI
      setCurrentStep('parsing');
      
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess }),
      });

      if (!parseResponse.ok) {
        throw new Error('Text parsing failed');
      }

      const parseResult = await parseResponse.json();
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Failed to parse booking data');
      }

      setParsedData(parseResult.data);
      setCurrentStep('preview');
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!inputData.trim()) {
      setError('Please provide some input before processing');
      return;
    }

    processInput(inputData, inputType);
  }, [inputData, inputType, processInput]);

  const handleCreateBooking = useCallback(() => {
    if (!parsedData) return;

    try {
      // Create URL search params with the parsed data
      const params = new URLSearchParams({
        customer_name: parsedData.customer_name || '',
        phone: parsedData.phone || '',
        vehicle: parsedData.vehicle || '',
        year: parsedData.year || '',
        registration: parsedData.registration || '',
        issue: parsedData.issue || '',
        from_jotter: 'true'
      });

      // Navigate to booking form with pre-filled data
      router.push(`/autow/booking?${params.toString()}`);

      // Call the callback if provided
      onBookingCreate?.(parsedData);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    }
  }, [parsedData, router, onBookingCreate]);

  const handleCreateEstimate = useCallback(() => {
    if (!parsedData) return;

    // Future feature - currently shows message
    setError('Estimate creation feature is coming soon!');
    
    // Call the callback if provided
    onEstimateCreate?.(parsedData);
  }, [parsedData, onEstimateCreate]);

  const resetForm = useCallback(() => {
    setInputData('');
    setParsedData(null);
    setCurrentStep('input');
    setError('');
    setIsProcessing(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {(currentStep === 'input' || currentStep === 'error') && (
        <InputSection
          inputType={inputType}
          onInputTypeChange={setInputType}
          onInputChange={setInputData}
          onSubmit={handleSubmit}
          isDisabled={isProcessing}
          error={error}
        />
      )}

      {/* Processing Status */}
      {isProcessing && (
        <ProcessingStatus
          currentStep={currentStep}
          error={error}
        />
      )}

      {/* Parsed Data Preview */}
      {currentStep === 'preview' && parsedData && (
        <ParsedDataPreview
          data={parsedData}
          onEdit={() => setCurrentStep('input')}
        />
      )}

      {/* Action Buttons */}
      {currentStep === 'preview' && parsedData && (
        <ActionButtons
          onCreateBooking={handleCreateBooking}
          onCreateEstimate={handleCreateEstimate}
          onStartOver={resetForm}
          isEstimateDisabled={true}
        />
      )}

      {/* Error State with Reset Option */}
      {currentStep === 'error' && (
        <div className="text-center pt-4">
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartJotter;
```

```components/smart-jotter/InputSection.tsx
'use client';

import React, { useState } from 'react';
import CanvasInput from './CanvasInput';
import TextInput from './TextInput';

interface InputSectionProps {
  inputType: 'canvas' | 'text';
  onInputTypeChange: (type: 'canvas' | 'text') => void;
  onInputChange: (data: string) => void;
  onSubmit: () => void;
  isDisabled?: boolean;
  error?: string;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputType,
  onInputTypeChange,
  onInputChange,
  onSubmit,
  isDisabled = false,
  error = '',
}) => {
  const [hasInput, setHasInput] = useState(false);

  const handleInputChange = (data: string) => {
    setHasInput(!!data.trim());
    onInputChange(data);
  };

  return (
    <div className="space-y-4">
      {/* Input Type Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <button
          type="button"
          onClick={() => onInputTypeChange('canvas')}
          className={`px-4 py-2 rounded-md transition-colors ${
            inputType === 'canvas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={isDisabled}
        >
          ✏️ Handwriting
        </button>
        <button
          type="button"
          onClick={() => onInputTypeChange('text')}
          className={`px-4 py-2 rounded-md transition-colors ${
            inputType === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={isDisabled}
        >
          ⌨️ Type Text
        </button>
      </div>

      {/* Input Component */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        {inputType === 'canvas' ? (
          <CanvasInput
            onDataChange={handleInputChange}
            isDisabled={isDisabled}
          />
        ) : (
          <TextInput
            onDataChange={handleInputChange}
            isDisabled={isDisabled}
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          disabled={isDisabled || !hasInput}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDisabled ? 'Processing...' : 'Process Input'}
        </button>
      </div>

      {/* Example Format */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm font-medium text-blue-900 mb-1">Example format:</p>
        <p className="text-sm text-blue-700">
          "John Smith, 07712345678, Ford Focus 2018, YA19 ABC, Engine warning light"
        </p>
      </div>
    </div>
  );
};

export default InputSection;
```

```components/smart-jotter/CanvasInput.tsx
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
```

```components/smart-jotter/TextInput.tsx
'use client';

import React, { useState } from 'react';

interface TextInputProps {
  onDataChange: (data: string) => void;
  isDisabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  onDataChange,
  isDisabled = false,
}) => {
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onDataChange(newText);
  };

  const fillExample = () => {
    const exampleText = "John Smith, 07712345678, Ford Focus 2018, YA19 ABC, Engine warning light";
    setText(exampleText);
    onDataChange(exampleText);
  };

  const clearText = () => {
    setText('');
    onDataChange('');
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Type your booking details in the text area below
        </p>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder="Enter booking details here...&#10;&#10;Example: John Smith, 07712345678, Ford Focus 2018, YA19 ABC, Engine warning light"
          className="w-full h-64 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'monospace' }}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {text.length} characters
        </div>
      </div>

      {/* Text Controls */}
      <div className="flex justify-center space-x-3">
        <button
          type="button"
          onClick={fillExample}
          disabled={isDisabled}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📝 Use Example
        </button>
        <button
          type="button"
          onClick={clearText}
          disabled={isDisabled || !text}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for better parsing:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Separate details with commas</li>
          <li>• Include customer name, phone, vehicle make/model, year, registration, and issue</li>
          <li>• Use clear formatting like "Ford Focus 2018" for vehicle info</li>
          <li>• Registration format: "YA19 ABC" or "YA19ABC"</li>
        </ul>
      </div>
    </div>
  );
};

export default TextInput;
```

```components/smart-jotter/ProcessingStatus.tsx
'use client';

import React from 'react';
import { ProcessingStep } from '@/types/smart-jotter';

interface ProcessingStatusProps {
  currentStep: ProcessingStep;
  error?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  currentStep,
  error = '',
}) => {
  const steps = [
    { key: 'processing', label: 'Initializing', icon: '🔄' },
    { key: 'ocr', label: 'Reading Handwriting', icon: '👁️' },
    { key: 'parsing', label: 'Extracting Data', icon: '🧠' },
    { key: 'preview', label: 'Complete', icon: '✅' },
  ];

  const getStepStatus = (stepKey: string) => {
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    
    if (error && currentStep === 'error') {
      return stepIndex <= currentIndex ? 'error' : 'pending';
    }
    
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepClassName = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500 text-white';
      case 'active':
        return 'bg-blue-500 text-white animate-pulse';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Processing Your Input
        </h3>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <p className="text-gray-600">
            Please wait while we process your booking information...
          </p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          
          return (
            <div key={step.key} className="flex items-center">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${getStepClassName(status)}`}
              >
                {status === 'active' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="ml-2 mr-4">
                <p className={`text-sm font-medium ${
                  status === 'active' ? 'text-blue-600' :
                  status === 'complete' ? 'text-green-600' :
                  status === 'error' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  getStepStatus(steps[index + 1].key) === 'complete' || 
                  getStepStatus(steps[index + 1].key) === 'active'
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Description */}
      <div className="text-center">
        {currentStep === 'processing' && (
          <p className="text-sm text-gray-600">Setting up processing pipeline...</p>
        )}
        {currentStep === 'ocr' && (
          <p className="text-sm text-gray-600">Converting handwriting to text using AI...</p>
        )}
        {currentStep === 'parsing' && (
          <p className="text-sm text-gray-600">Extracting booking information from text...</p>
        )}
        {currentStep === 'preview' && (
          <p className="text-sm text-green-600">Processing complete! Review your data below.</p>
        )}
      </div>

      {/* Loading Animation */}
      {!error && currentStep !== 'preview' && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
```

```components/smart-jotter/ParsedDataPreview.tsx
'use client';

import React from 'react';
import { ParsedBookingData } from '@/types/smart-jotter';

interface ParsedDataPreviewProps {
  data: ParsedBookingData;
  onEdit: () => void;
}

const ParsedDataPreview: React.FC<ParsedDataPreviewProps> = ({
  data,
  onEdit,
}) => {
  const fields = [
    { key: 'customer_name', label: 'Customer Name', icon: '👤' },
    { key: 'phone', label: 'Phone Number', icon: '📞' },
    { key: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { key: 'year', label: 'Year', icon: '📅' },
    { key: 'registration', label: 'Registration', icon: '🔖' },
    { key: 'issue', label: 'Issue Description', icon: '⚠️' },
  ];

  const getFieldValue = (key: keyof ParsedBookingData): string => {
    const value = data[key];
    return value || 'Not provided';
  };

  const hasRequiredData = () => {
    return data.customer_name || data.phone || data.vehicle || data.issue;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              ✅ Data Extracted Successfully
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Review the extracted information below
            </p>
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
          >
            ✏️ Edit Input
          </button>
        </div>
      </div>

      {/* Data Fields */}
      <div className="p-6">
        {hasRequiredData() ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              const value = getFieldValue(field.key as keyof ParsedBookingData);
              const isEmpty = !data[field.key as keyof ParsedBookingData];

              return (
                <div
                  key={field.key}
                  className={`p-4 rounded-lg border-2 ${
                    isEmpty
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{field.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isEmpty ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {field.label}
                      </h4>
                      <p className={`mt-1 ${
                        isEmpty ? 'text-gray-400 italic' : 'text-gray-700'
                      }`}>
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Limited Data Extracted
            </h4>
            <p className="text-gray-600">
              We couldn't extract much information from your input. 
              You may want to try again with more detailed information.
            </p>
          </div>
        )}
      </div>

      {/* Confidence Score */}
      {data.confidence_score && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence Score:</span>
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded text-sm font-medium ${
                data.confidence_score >= 0.8
                  ? 'bg-green-100 text-green-800'
                  : data.confidence_score >= 0.6
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {Math.round(data.confidence_score * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> If any information is missing or incorrect, 
          you can edit it when creating the booking.
        </p>
      </div>
    </div>
  );
};

export default ParsedDataPreview;
```

```components/smart-jotter/ActionButtons.tsx
'use client';

import React from 'react';

interface ActionButtonsProps {
  onCreateBooking: () => void;
  