import React from 'react';

interface SpinnerProps {
  text?: string;
  size?: 'sm' | 'md';
}

export const Spinner: React.FC<SpinnerProps> = ({ text, size = 'md' }) => {
  if (size === 'sm') {
    return (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400 mb-3"></div>
      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
};