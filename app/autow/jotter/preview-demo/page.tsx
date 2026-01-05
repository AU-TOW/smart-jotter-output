'use client';

import React, { useState } from 'react';
import JotterPreview from '@/components/smart-jotter/JotterPreview';
import { ParsedBookingData, FieldConfidence } from '@/types/smart-jotter';

const PreviewDemoPage: React.FC = () => {
  // Sample parsed data with varying completeness
  const [sampleData, setSampleData] = useState<ParsedBookingData>({
    customer_name: "John Smith",
    phone: "07712345678",
    vehicle: "Ford Focus",
    year: "2018",
    registration: "YA19 ABC",
    issue: "Engine warning light comes on intermittently, especially when accelerating",
    confidence_score: 0.85
  });

  // Sample confidence scores
  const [fieldConfidence] = useState<FieldConfidence>({
    customer_name: 0.95,
    phone: 0.88,
    vehicle: 0.92,
    year: 0.75,
    registration: 0.98,
    issue: 0.82
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle data changes from the preview component
  const handleDataChange = (updatedData: ParsedBookingData) => {
    setSampleData(updatedData);
    console.log('Data updated:', updatedData);
  };

  // Handle booking creation
  const handleCreateBooking = async (data: ParsedBookingData) => {
    setIsLoading(true);
    console.log('Creating booking with data:', data);
    
    // Simulate API call
    setTimeout(() => {
      alert('Booking created successfully!');
      setIsLoading(false);
    }, 2000);
  };

  // Handle estimate creation
  const handleCreateEstimate = async (data: ParsedBookingData) => {
    setIsLoading(true);
    console.log('Creating estimate with data:', data);
    
    // Simulate API call
    setTimeout(() => {
      alert('Estimate created successfully!');
      setIsLoading(false);
    }, 2000);
  };

  // Sample data presets for testing
  const samplePresets = {
    complete: {
      customer_name: "John Smith",
      phone: "07712345678",
      vehicle: "Ford Focus",
      year: "2018",
      registration: "YA19 ABC",
      issue: "Engine warning light comes on intermittently",
      confidence_score: 0.85
    },
    partial: {
      customer_name: "Jane Doe",
      phone: "07798765432",
      issue: "Strange noise from engine",
      confidence_score: 0.62
    },
    minimal: {
      customer_name: "Bob Wilson",
      phone: "",
      issue: "Car won't start",
      confidence_score: 0.45
    },
    empty: {
      confidence_score: 0.1
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Jotter Preview Demo
          </h1>
          <p className="text-gray-600">
            Test the JotterPreview component with different data scenarios
          </p>
        </div>

        {/* Sample Data Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Data Presets</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSampleData(samplePresets.complete)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Data
            </button>
            <button
              onClick={() => setSampleData(samplePresets.partial)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Partial Data
            </button>
            <button
              onClick={() => setSampleData(samplePresets.minimal)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Minimal Data
            </button>
            <button
              onClick={() => setSampleData(samplePresets.empty)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Empty Data
            </button>
          </div>
        </div>

        {/* Main Preview Component */}
        <JotterPreview
          data={sampleData}
          fieldConfidence={fieldConfidence}
          onDataChange={handleDataChange}
          onCreateBooking={handleCreateBooking}
          onCreateEstimate={handleCreateEstimate}
          isLoading={isLoading}
        />

        {/* Debug Information */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Debug: Current Data State</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(sampleData, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
};

export default PreviewDemoPage;