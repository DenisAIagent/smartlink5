import React, { useState, useEffect } from 'react';
import { AlertCircle, X, AlertTriangle, Info } from 'react-feather';
import { errorService } from '../services/errorService';

const ErrorDisplay = () => {
  const [errors, setErrors] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleNewError = (newErrors) => {
      setErrors(newErrors);
    };

    const handleClearErrors = () => {
      setErrors([]);
    };

    errorService.addListener(handleNewError);
    errorService.addListener(handleClearErrors);

    return () => {
      errorService.removeListener(handleNewError);
      errorService.removeListener(handleClearErrors);
    };
  }, []);

  const getErrorIcon = (type) => {
    switch (type) {
      case 'API_ERROR':
        return <AlertCircle className="text-red-500" />;
      case 'NETWORK_ERROR':
        return <AlertTriangle className="text-orange-500" />;
      default:
        return <Info className="text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">
            Erreurs ({errors.length})
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? 'Réduire' : 'Développer'}
          </button>
        </div>

        <div className={`space-y-2 ${isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-20 overflow-hidden'}`}>
          {errors.map((error) => (
            <div
              key={error.id}
              className="flex items-start p-2 rounded border border-red-100 bg-red-50"
            >
              <div className="flex-shrink-0 mt-1">
                {getErrorIcon(error.type)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-red-800">
                    {error.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(error.timestamp)}
                  </span>
                </div>
                {isExpanded && error.context && (
                  <p className="text-xs text-red-600 mt-1">
                    {error.context}
                  </p>
                )}
              </div>
              <button
                onClick={() => errorService.clearErrors(error.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <button
            onClick={() => errorService.clearErrors()}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Effacer toutes les erreurs
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay; 