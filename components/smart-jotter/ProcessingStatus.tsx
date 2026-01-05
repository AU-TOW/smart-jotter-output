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