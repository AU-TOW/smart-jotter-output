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