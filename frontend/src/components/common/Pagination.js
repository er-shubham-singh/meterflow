'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ page = 1, totalPages = 1, total = 0, limit = 10, onPageChange }) {
  if (total === 0) {
    return null;
  }

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  // Generate page numbers with sliding window
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, page + 2);

      if (page <= 3) {
        start = 1;
        end = 5;
      } else if (page >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 py-4 mt-4 border-t border-[var(--border-subtle)] w-full">
      {/* Count summary */}
      <div className="text-xs text-[var(--text-muted)]">
        Showing <span className="font-semibold text-[var(--text-heading)]">{startItem}</span> to{' '}
        <span className="font-semibold text-[var(--text-heading)]">{endItem}</span> of{' '}
        <span className="font-semibold text-[var(--text-heading)]">{total}</span> items
      </div>

      {/* Page navigation controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* First page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="First page"
          className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-medium)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-medium)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 border border-emerald-500'
                    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-medium)]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-medium)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </button>

        {/* Last page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
          className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-medium)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}
