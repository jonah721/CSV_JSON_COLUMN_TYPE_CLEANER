import React, { useState } from 'react';
import { ColumnDiffGroup } from '../types/schema';
import { IssueBadge } from './IssueBadge';

interface DiffTableProps {
  columnDiffs: Record<string, ColumnDiffGroup>;
  onToggleColumnStatus: (column: string, status: 'accepted' | 'rejected') => void;
}

export const DiffTable: React.FC<DiffTableProps> = ({
  columnDiffs,
  onToggleColumnStatus,
}) => {
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({});

  const toggleExpand = (col: string) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };

  const columns: ColumnDiffGroup[] = Object.values(columnDiffs);

  if (columns.length === 0) {
    return (
      <div className="bg-white border border-[#D8D5CE] rounded-[10px] p-8 text-center">
        <p className="text-[16px] text-[#1C1E22] font-semibold mb-1">
          No coercion damage detected
        </p>
        <p className="text-[14px] text-[#6B6E73]">
          All columns in your file are clean and preserved in their declared data types.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {columns.map((group) => {
        const isAccepted = group.status === 'accepted';
        const isExpanded = expandedColumns[group.column] ?? true;
        const displayLimit = isExpanded ? 50 : 3;
        const visibleFlags = group.flags.slice(0, displayLimit);
        const hasMore = group.flags.length > displayLimit;

        return (
          <div
            key={group.column}
            id={`diff-card-${group.column}`}
            className="bg-white border border-[#D8D5CE] rounded-[10px] p-4 sm:p-5 shadow-none transition-all overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CE] pb-3 mb-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="font-mono font-bold text-[15px] text-[#1C1E22] break-all">
                  {group.column}
                </span>

                {group.mappedField && group.mappedField !== group.column && (
                  <span className="text-[12px] sm:text-[13px] text-[#6B6E73] break-all">
                    (mapped: <span className="font-mono">{group.mappedField}</span>)
                  </span>
                )}

                <IssueBadge
                  variant="flagged"
                  label={`${group.totalRepaired} ${group.totalRepaired === 1 ? 'cell' : 'cells'} repaired`}
                />

                {group.hasUnrecoverable && (
                  <IssueBadge variant="error" label="1 unrecoverable flag" />
                )}
              </div>

              {/* Status Controls */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  id={`btn-accept-${group.column}`}
                  onClick={() => onToggleColumnStatus(group.column, 'accepted')}
                  className={`px-3 py-1 text-[13px] font-bold rounded-[6px] transition-all cursor-pointer ${
                    isAccepted
                      ? 'bg-[#E4EFE9] text-[#3C7A5F] border border-[#3C7A5F]'
                      : 'bg-white text-[#6B6E73] border border-[#D8D5CE] hover:bg-[#F7F6F3]'
                  }`}
                >
                  Accepted
                </button>

                <button
                  type="button"
                  id={`btn-reject-${group.column}`}
                  onClick={() => onToggleColumnStatus(group.column, 'rejected')}
                  className={`px-3 py-1 text-[13px] font-bold rounded-[6px] transition-all cursor-pointer ${
                    !isAccepted
                      ? 'bg-[#F5E1E1] text-[#A63D40] border border-[#A63D40]'
                      : 'bg-white text-[#6B6E73] border border-[#D8D5CE] hover:bg-[#F7F6F3]'
                  }`}
                >
                  Keep original
                </button>
              </div>
            </div>

            {/* Diff Rows */}
            <div className="flex flex-col divide-y divide-[#F7F6F3] max-h-[380px] overflow-y-auto pr-1">
              {visibleFlags.map((flag, idx) => (
                <div
                  key={`${flag.column}-${flag.rowIndex}-${idx}`}
                  className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 hover:bg-[#F7F6F3] rounded transition-colors text-[13px] sm:text-[14px]"
                >
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[12px] text-[#6B6E73] min-w-[48px] font-mono shrink-0">
                      row {flag.rowIndex + 1}
                    </span>

                    {/* Original in Error-Red with Strikethrough */}
                    <span className="font-mono text-[#A63D40] line-through bg-[#F5E1E1]/40 px-1.5 py-0.5 rounded break-all max-w-full">
                      {flag.original || '(empty)'}
                    </span>

                    {/* Arrow in Ink Muted */}
                    <span className="text-[#6B6E73] font-sans font-bold px-0.5">→</span>

                    {/* Repaired or Unrecoverable */}
                    {flag.isUnrecoverable ? (
                      <span className="font-mono font-medium text-[#B8752E] bg-[#F6E9DA] px-2 py-0.5 rounded text-[12px] sm:text-[13px] break-all">
                        unrecoverable (flagged)
                      </span>
                    ) : (
                      <span
                        className={`font-mono px-1.5 py-0.5 rounded break-all ${
                          isAccepted
                            ? 'text-[#3C7A5F] bg-[#E4EFE9]'
                            : 'text-[#6B6E73] line-through'
                        }`}
                      >
                        {flag.repaired}
                      </span>
                    )}
                  </div>

                  {flag.explanation && (
                    <span className="text-[11px] sm:text-[12px] text-[#6B6E73] italic pl-1 sm:pl-0 shrink-0">
                      {flag.explanation}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Expand / Collapse footer if column has many repairs */}
            {group.flags.length > 3 && (
              <div className="mt-2 pt-2 border-t border-[#F7F6F3] flex justify-between items-center text-[12px] text-[#6B6E73]">
                <span>
                  Showing {visibleFlags.length} of {group.flags.length} changes
                </span>
                <button
                  type="button"
                  onClick={() => toggleExpand(group.column)}
                  className="text-[#2E4057] font-semibold hover:underline cursor-pointer"
                >
                  {isExpanded ? 'Show fewer rows' : `View all ${group.flags.length} diff rows`}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
