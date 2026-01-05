'use client';

import React, { useState, useCallback } from 'react';

interface TextInputProps {
  onDataChange: (text: string) => void;
  isProcessing?: boolean;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({ 
  onDataChange, 
  isProcessing = false,
  className = '' 
}) => {
  const [text, setText] = useState('');

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onDataChange(newText);
  }, [onDataChange]);

  const clearText = useCallback(() => {
    setText('');
    onDataChange('');
  }, [onDataChange]);

  const insertExample = useCallback(() => {
    const exampleText = 'John Smith\n07712345678\nFord Focus 2018\nYA19 ABC\nEngine warning light';
    setText(exampleText);
    onDataChange(exampleText);
  }, [onDataChange]);

  return (
    <div className={`text-input-container ${className}`}>
      {/* Input Header */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Type your booking details
        </h3>
        <p className="text-sm text-gray-600">
          Enter customer information, vehicle details, and issue description
        </p>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          disabled={isProcessing}
          placeholder="Enter booking details here...&#10;&#10;Example:&#10;John Smith&#10;07712345678&#10;Ford Focus 2018&#10;YA19 ABC&#10;Engine warning light"
          className={`w-full h-64 p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none transition-colors ${
            isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          rows={10}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
          {text.length} characters
        </div>
        
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Processing text...</p>
            </div>
          </div>
        )}
      </div>

      {/* Text Controls */}
      <div className="text-controls mt-4 flex flex-wrap gap-2 justify-center">
        <button 
          onClick={insertExample}
          disabled={isProcessing}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span>📝</span>
          <span className="hidden sm:inline">Insert Example</span>
        </button>
        
        <button 
          onClick={clearText}
          disabled={!text || isProcessing}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span>🗑️</span>
          <span className="hidden sm:inline">Clear</span>
        </button>
        
        <div className="text-xs text-gray-500 flex items-center px-2">
          {text ? `${text.split('\n').length} lines` : 'No text entered'}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-4 p-3 bg-green-50 rounded-md">
        <p className="text-xs text-green-800">
          <strong>💡 Tip:</strong> Put each piece of information on a separate line for best parsing results. 
          Include customer name, phone number, vehicle details, registration, and issue description.
        </p>
      </div>
    </div>
  );
};

export default TextInput;