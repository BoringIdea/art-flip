import * as React from 'react';

interface PaginationProps {
  totalPages: number;
  offset: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const DOTS = '...';

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  offset,
  onPageChange,
  siblingCount = 1,
}) => {
  const currentPage = offset + 1;

  const getPageNumbers = (): (number | string)[] => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 2;

    const firstPage = 1;
    const lastPage = totalPages;

    if (!showLeftDots && showRightDots) {
      const leftRange = Array.from(
        { length: siblingCount * 2 + 3 },
        (_, i) => i + 1
      );
      return [...leftRange, DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = Array.from(
        { length: siblingCount * 2 + 3 },
        (_, i) => totalPages - (siblingCount * 2 + 2) + i
      );
      return [firstPage, DOTS, ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      const middleRange = Array.from(
        { length: siblingCount * 2 + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPage, DOTS, ...middleRange, DOTS, lastPage];
    }

    return [];
  };

  const pageNumbers = getPageNumbers();

  const baseButton =
    'w-8 h-8 flex items-center justify-center rounded-full text-sm select-none';
  const activeButton = 'bg-[#3af73e] text-black font-semibold';
  const inactiveButton = 'hover:bg-[#2f343e]';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseButton} ${currentPage === 1
          ? 'text-gray-500 cursor-not-allowed'
          : inactiveButton
          }`}
      >
        &lt;
      </button>

      {pageNumbers.map((page, index) =>
        page === DOTS ? (
          <span key={index} className="px-2 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(Number(page))}
            className={`${baseButton} ${page === currentPage ? activeButton : inactiveButton
              }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseButton} ${currentPage === totalPages
          ? 'text-gray-500 cursor-not-allowed'
          : inactiveButton
          }`}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
