import React, { useState } from 'react';
import { FiGlobe, FiDatabase, FiRefreshCw } from 'react-icons/fi';

const RealTimeProductToggle = ({ 
  realTimeEnabled, 
  onToggle, 
  sources, 
  onSourcesChange, 
  isLoading = false 
}) => {
  const [showSourceOptions, setShowSourceOptions] = useState(false);

  const sourceOptions = [
    { value: 'local', label: 'Local Products', icon: FiDatabase },
    { value: 'amazon', label: 'Amazon', icon: FiGlobe },
    { value: 'local,amazon', label: 'All Sources', icon: FiRefreshCw }
  ];

  const handleSourceChange = (sourceValue) => {
    onSourcesChange(sourceValue);
    setShowSourceOptions(false);
  };

  const getCurrentSourceLabel = () => {
    const option = sourceOptions.find(opt => opt.value === sources);
    return option ? option.label : 'Mixed Sources';
  };

  const getCurrentSourceIcon = () => {
    const option = sourceOptions.find(opt => opt.value === sources);
    const IconComponent = option ? option.icon : FiRefreshCw;
    return <IconComponent size={16} />;
  };

  return (
    <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Real-time Toggle */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Real-time Data:
        </label>
        <button
          onClick={onToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            realTimeEnabled 
              ? 'bg-primary-600' 
              : 'bg-gray-200 dark:bg-gray-600'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              realTimeEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        {isLoading && (
          <FiRefreshCw className="animate-spin text-primary-600" size={16} />
        )}
      </div>

      {/* Source Selector */}
      {realTimeEnabled && (
        <div className="relative">
          <button
            onClick={() => setShowSourceOptions(!showSourceOptions)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            {getCurrentSourceIcon()}
            <span className="text-gray-700 dark:text-gray-300">
              {getCurrentSourceLabel()}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${showSourceOptions ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showSourceOptions && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              {sourceOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSourceChange(option.value)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      sources === option.value 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{option.label}</span>
                    {sources === option.value && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {realTimeEnabled 
          ? `Fetching from ${getCurrentSourceLabel().toLowerCase()}` 
          : 'Using local database only'
        }
      </div>
    </div>
  );
};

export default RealTimeProductToggle;
