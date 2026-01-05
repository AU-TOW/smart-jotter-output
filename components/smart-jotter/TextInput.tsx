'use client';

import React, { useState, useRef } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  maxLength?: number;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  maxLength = 1000,
  placeholder = "Enter customer details and vehicle information...\n\nExample:\nJohn Smith, 07712345678, Ford Focus 2018, YA19 ABC, Engine warning light"
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = value.length;
  const isOverLimit = characterCount > maxLength;
  const isEmpty = value.trim().length === 0;

  const handleSubmit = () => {
    if (isEmpty || isOverLimit || isLoading) {
      return;
    }
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'text-red-600';
    if (characterCount > maxLength * 0.8) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={8}
          className={`w-full p-4 border-2 rounded-lg resize-none transition-colors focus:outline-none ${
            isFocused
              ? 'border-blue-500 ring-2 ring-blue-200'
              : isOverLimit
              ? 'border-red-300'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          disabled={isLoading}
          aria-label="Customer and vehicle information input"
          aria-describedby="character-count input-help"
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Character Counter and Help Text */}
      <div className="flex items-center justify-between text-sm">
        <div id="input-help" className="text-gray-600">
          Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+Enter</kbd> to process
        </div>
        <div id="character-count" className={`font-medium ${getCharacterCountColor()}`}>
          {characterCount} / {maxLength}
        </div>
      </div>

      {/* Error Messages */}
      {isOverLimit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">
            Input exceeds maximum length of {maxLength} characters. Please shorten your text.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isEmpty || isOverLimit || isLoading}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isEmpty || isOverLimit || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
          aria-label="Process input text"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Process Text'
          )}
        </button>
      </div>

      {/* Input Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-2">Input Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include customer name and phone number</li>
          <li>• Add vehicle make, model, and year</li>
          <li>• Provide registration number if available</li>
          <li>• Describe the issue or required service</li>
          <li>• Use commas to separate different pieces of information</li>
        </ul>
      </div>
    </div>
  );
};

export default TextInput;