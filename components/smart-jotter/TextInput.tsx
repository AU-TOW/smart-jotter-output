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