import React from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'react-feather';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  className = ''
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          disabled={isLoading}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className={`p-2 rounded-md ${
            currentPage === 1 || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center px-4">
            <Loader className="animate-spin text-blue-600" size={20} />
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            {renderPageNumbers()}
          </div>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className={`p-2 rounded-md ${
            currentPage === totalPages || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
};

export default Pagination; 