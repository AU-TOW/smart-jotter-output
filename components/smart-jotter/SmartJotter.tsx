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