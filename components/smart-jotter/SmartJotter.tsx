'use client';

import React, { useState } from 'react';
import { PencilIcon, KeyboardIcon } from '@heroicons/react/24/outline';

type InputMode = 'text' | 'handwrite';

interface ParsedData {
  customer_name?: string;
  phone?: string;
  vehicle?: string;
  year?: string;
  registration?: string;
  issue?: string;
}

const SmartJotter: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!textInput.trim() && inputMode === 'text') {
      setError('Please enter some text to process');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock parsed data - will be replaced with actual API calls
      const mockParsedData: ParsedData = {
        customer_name: "John Smith",
        phone: "07712345678",
        vehicle: "Ford Focus",
        year: "2018",
        registration: "YA19 ABC",
        issue: "Engine warning light"
      };
      
      setParsedData(mockParsedData);
    } catch (err) {
      setError('Failed to process the input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setTextInput('');
    setParsedData(null);
    setError(null);
  };

  const handleCreateBooking = () => {
    if (parsedData) {
      // TODO: Navigate to booking creation with parsed data
      console.log('Creating booking with data:', parsedData);
      alert('Booking creation functionality will be implemented next');
    }
  };

  const handleCreateEstimate = () => {
    if (parsedData) {
      // TODO: Navigate to estimate creation with parsed data
      console.log('Creating estimate with data:', parsedData);
      alert('Estimate creation functionality will be implemented next');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mode Toggle */}
      <div className="mb-6">
        <div className="flex rounded-lg bg-gray-100 p-1 max-w-md">
          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <KeyboardIcon className="w-5 h-5 mr-2" />
            Text Input
          </button>
          <button
            onClick={() => setInputMode('handwrite')}
            className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
              inputMode === 'handwrite'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Handwriting
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {inputMode === 'text' ? 'Type Your Notes' : 'Draw Your Notes'}
          </h2>
          
          {inputMode === 'text' ? (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter customer details, vehicle information, and issue description...&#10;Example: John Smith, 07712345678, Ford Focus 2018, YA19 ABC, Engine warning light"
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isProcessing}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <PencilIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Handwriting canvas will be implemented here</p>
              <p className="text-sm text-gray-400">
                This will use react-signature-canvas for drawing input
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleClear}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Clear
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isProcessing || (!textInput.trim() && inputMode === 'text')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Process Notes'
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-red-800">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {parsedData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Extracted Information</h2>
            
            {/* Parsed Data Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {parsedData.customer_name || 'Not detected'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {parsedData.phone || 'Not detected'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {parsedData.vehicle || 'Not detected'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {parsedData.year || 'Not detected'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {parsedData.registration || 'Not detected'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {parsedData.issue || 'Not detected'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateBooking}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Create Booking
              </button>
              <button
                onClick={handleCreateEstimate}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Estimate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartJotter;