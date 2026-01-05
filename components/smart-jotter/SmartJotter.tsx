'use client';

import React, { useState } from 'react';
import TextInput from './TextInput';
import { ParsedBookingData } from '@/types/smart-jotter';

interface SmartJotterProps {
  onBookingCreate?: (data: ParsedBookingData) => void;
  onEstimateCreate?: (data: ParsedBookingData) => void;
}

const SmartJotter: React.FC<SmartJotterProps> = ({
  onBookingCreate,
  onEstimateCreate
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'canvas'>('text');
  const [inputData, setInputData] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedBookingData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (data: string) => {
    setInputData(data);
    // Reset parsed data when input changes
    if (parsedData) {
      setParsedData(null);
    }
  };

  const handleProcess = async () => {
    if (!inputData.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement API call to parse text
      // For now, simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed data - will be replaced with actual API call
      const mockParsedData: ParsedBookingData = {
        customer_name: "John Smith",
        phone: "07712345678",
        vehicle: "Ford Focus",
        year: "2018",
        registration: "YA19 ABC",
        issue: "Engine warning light",
        confidence_score: 0.95
      };
      
      setParsedData(mockParsedData);
    } catch (error) {
      console.error('Error processing input:', error);
      // TODO: Add proper error handling
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setInputMode('text')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            inputMode === 'text'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Text Input
        </button>
        <button
          onClick={() => setInputMode('canvas')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            inputMode === 'canvas'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled
        >
          Handwriting (Coming Soon)
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        {inputMode === 'text' ? (
          <TextInput
            value={inputData}
            onChange={handleInputChange}
            onSubmit={handleProcess}
            isLoading={isProcessing}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Canvas input mode coming soon...</p>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-700">Processing your input...</p>
          </div>
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Extracted Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <p className="text-gray-900">{parsedData.customer_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <p className="text-gray-900">{parsedData.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <p className="text-gray-900">{parsedData.vehicle} ({parsedData.year})</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration
              </label>
              <p className="text-gray-900">{parsedData.registration}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description
              </label>
              <p className="text-gray-900">{parsedData.issue}</p>
            </div>
          </div>

          {/* Confidence Score */}
          {parsedData.confidence_score && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confidence Score</span>
                <span className="text-sm font-medium text-green-700">
                  {Math.round(parsedData.confidence_score * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onBookingCreate?.(parsedData)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Booking
            </button>
            <button
              onClick={() => onEstimateCreate?.(parsedData)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
            >
              Create Estimate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartJotter;