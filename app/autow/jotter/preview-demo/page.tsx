'use client';

import React, { useState } from 'react';
import JotterPreview from '../../../../components/smart-jotter/JotterPreview';
import { ParsedBookingData, FieldConfidence } from '../../../../types/smart-jotter';

// Demo data for testing
const sampleData: ParsedBookingData = {
  customer_name: 'John Smith',
  phone: '07712345678',
  vehicle: 'Ford Focus',
  year: '2018',
  registration: 'YA19 ABC',
  issue: 'Engine warning light is on, car making strange noise when accelerating',
  confidence_score: 0.85
};

const sampleConfidences: FieldConfidence = {
  customer_name: 0.95,
  phone: 0.90,
  vehicle: 0.88,
  year: 0.92,
  registration: 0.85,
  issue: 0.75
};

const incompleteData: ParsedBookingData = {
  customer_name: 'Jane Doe',
  phone: '07798765432',
  vehicle: '',
  year: '',
  registration: 'BD21 XYZ',
  issue: 'Brake issues'
};

const lowConfidenceData: ParsedBookingData = {
  customer_name: 'Bob Wilson',
  phone: '0771234567',
  vehicle: 'Toyota Corolla',
  year: '2019',
  registration: 'CX20 DEF',
  issue: 'Oil leak'
};

const lowConfidences: FieldConfidence = {
  customer_name: 0.60,
  phone: 0.45,
  vehicle: 0.70,
  year: 0.80,
  registration: 0.55,
  issue: 0.65
};

export default function PreviewDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<'complete' | 'incomplete' | 'low-confidence' | 'empty'>('complete');
  const [currentData, setCurrentData] = useState<ParsedBookingData>(sampleData);
  const [currentConfidences, setCurrentConfidences] = useState<FieldConfidence>(sampleConfidences);

  const handleDemoChange = (demo: 'complete' | 'incomplete' | 'low-confidence' | 'empty') => {
    setSelectedDemo(demo);
    
    switch (demo) {
      case 'complete':
        setCurrentData(sampleData);
        setCurrentConfidences(sampleConfidences);
        break;
      case 'incomplete':
        setCurrentData(incompleteData);
        setCurrentConfidences({});
        break;
      case 'low-confidence':
        setCurrentData(lowConfidenceData);
        setCurrentConfidences(lowConfidences);
        break;
      case 'empty':
        setCurrentData({});
        setCurrentConfidences({});
        break;
    }
  };

  const handleDataChange = (updatedData: ParsedBookingData) => {
    setCurrentData(updatedData);
    console.log('Data updated:', updatedData);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Jotter Preview Component Demo
          </h1>
          <p className="text-gray-600">
            Test the JotterPreview component with different data scenarios
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Scenarios</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'complete', label: 'Complete Data (High Confidence)' },
              { key: 'incomplete', label: 'Incomplete Data' },
              { key: 'low-confidence', label: 'Low Confidence Data' },
              { key: 'empty', label: 'Empty Data' }
            ].map((demo) => (
              <button
                key={demo.key}
                onClick={() => handleDemoChange(demo.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedDemo === demo.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Component */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <JotterPreview
              parsedData={currentData}
              fieldConfidences={Object.keys(currentConfidences).length > 0 ? currentConfidences : undefined}
              onDataChange={handleDataChange}
            />
          </div>
        </div>

        {/* Current Data Display */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Data State</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-800 overflow-auto">
              {JSON.stringify({ data: currentData, confidences: currentConfidences }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Usage Instructions</h3>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>Inline Editing:</strong> Click the edit icon next to any field to modify its value</p>
            <p>• <strong>Confidence Indicators:</strong> Green checkmark (80%+), Yellow warning (60-79%), Red warning (&lt;60%)</p>
            <p>• <strong>Empty Fields:</strong> Shown with placeholder text and gray styling</p>
            <p>• <strong>Keyboard Shortcuts:</strong> Enter to save, Escape to cancel</p>
            <p>• <strong>Validation:</strong> Character limits and input types are enforced</p>
          </div>
        </div>
      </div>
    </div>
  );
}