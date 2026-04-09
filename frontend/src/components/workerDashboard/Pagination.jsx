import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const { theme } = useTheme();

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setCurrentPage((p) => p - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded ${theme.buttonSecondaryText}`}
      >
        Prev
      </button>

      <span>
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => setCurrentPage((p) => p + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded ${theme.buttonSecondaryText}`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;