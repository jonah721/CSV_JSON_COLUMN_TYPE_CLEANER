import React, { useState } from 'react';
import { ValidationReport } from '../types/schema';
import { IssueBadge } from './IssueBadge';

interface ValidationStepProps {
  report: ValidationReport;
  platformName: string;
  objectName: string;
}

export const ValidationStep: React.FC<ValidationStepProps> = ({
  report,
  platformName,
  objectName,
}) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');

  const filteredIssues = report.issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.severity === filter;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 4 Stat Blocks in a Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rows Checked (Neutral) */}
        <div className="bg-[#E7EBF0] border border-[#D8D5CE] rounded-[10px] p-5">
          <div className="text-[34px] font-bold text-[#2E4057] leading-tight">
            {report.totalRows.toLocaleString()}
          </div>
          <div className="text-[14px] font-medium text-[#6B6E73] mt-1">
            rows checked
          </div>
        </div>

        {/* Passed (Repaired) */}
        <div className="bg-[#E4EFE9] border border-[#3C7A5F]/20 rounded-[10px] p-5">
          <div className="text-[34px] font-bold text-[#3C7A5F] leading-tight">
            {report.passCount.toLocaleString()}
          </div>
          <div className="text-[14px] font-medium text-[#3C7A5F] mt-1">
            passed
          </div>
        </div>

        {/* Warnings (Flagged) */}
        <div className="bg-[#F6E9DA] border border-[#B8752E]/20 rounded-[10px] p-5">
          <div className="text-[34px] font-bold text-[#B8752E] leading-tight">
            {report.warningCount.toLocaleString()}
          </div>
          <div className="text-[14px] font-medium text-[#B8752E] mt-1">
            warnings
          </div>
        </div>

        {/* Errors (Error) */}
        <div className="bg-[#F5E1E1] border border-[#A63D40]/20 rounded-[10px] p-5">
          <div className="text-[34px] font-bold text-[#A63D40] leading-tight">
            {report.errorCount.toLocaleString()}
          </div>
          <div className="text-[14px] font-medium text-[#A63D40] mt-1">
            errors
          </div>
        </div>
      </div>

      {/* Issues Table Panel */}
      <div className="bg-white border border-[#D8D5CE] rounded-[10px] overflow-hidden flex flex-col">
        {/* Filter bar if there are issues */}
        {report.issues.length > 0 && (
          <div className="p-3 bg-[#F7F6F3]/50 border-b border-[#D8D5CE] flex items-center justify-between">
            <span className="text-[13px] text-[#6B6E73] font-medium">
              Found {report.issues.length} {report.issues.length === 1 ? 'item' : 'items'} requiring attention
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-[12px] font-bold rounded-[6px] transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#2E4057] text-white'
                    : 'bg-white border border-[#D8D5CE] text-[#6B6E73]'
                }`}
              >
                All ({report.issues.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('error')}
                className={`px-2.5 py-1 text-[12px] font-bold rounded-[6px] transition-all cursor-pointer ${
                  filter === 'error'
                    ? 'bg-[#A63D40] text-white'
                    : 'bg-white border border-[#D8D5CE] text-[#6B6E73]'
                }`}
              >
                Errors ({report.errorCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('warning')}
                className={`px-2.5 py-1 text-[12px] font-bold rounded-[6px] transition-all cursor-pointer ${
                  filter === 'warning'
                    ? 'bg-[#B8752E] text-white'
                    : 'bg-white border border-[#D8D5CE] text-[#6B6E73]'
                }`}
              >
                Warnings ({report.warningCount})
              </button>
            </div>
          </div>
        )}

        {report.issues.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[16px] font-bold text-[#3C7A5F] mb-1">
              All records passed validation
            </p>
            <p className="text-[14px] text-[#6B6E73]">
              No format errors or rule pack conflicts were detected in this dataset.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-[#F7F6F3] border-b border-[#D8D5CE] shadow-sm">
                <tr>
                  <th className="py-3 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider w-20">
                    ROW
                  </th>
                  <th className="py-3 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider w-40">
                    COLUMN
                  </th>
                  <th className="py-3 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider w-36">
                    RULE
                  </th>
                  <th className="py-3 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider w-28">
                    SEVERITY
                  </th>
                  <th className="py-3 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider">
                    MESSAGE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D5CE]">
                {filteredIssues.map((issue, idx) => (
                  <tr key={`${issue.rowIndex}-${issue.column}-${issue.rule}-${idx}`} className="hover:bg-[#F7F6F3]/40 transition-colors">
                    <td className="py-3 px-5 text-[13px] font-mono text-[#6B6E73]">
                      {issue.rowIndex}
                    </td>
                    <td className="py-3 px-5 text-[14px] font-mono text-[#1C1E22] font-semibold">
                      {issue.column}
                    </td>
                    <td className="py-3 px-5 text-[13px] font-mono text-[#6B6E73]">
                      {issue.rule}
                    </td>
                    <td className="py-3 px-5">
                      <IssueBadge variant={issue.severity === 'error' ? 'error' : 'warning'} label={issue.severity === 'error' ? 'Error' : 'Warning'} />
                    </td>
                    <td className="py-3 px-5 text-[14px] text-[#1C1E22]">
                      {issue.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note inside the panel */}
        <div className="p-4 bg-[#F7F6F3]/60 border-t border-[#D8D5CE] text-[13px] text-[#6B6E73]">
          Errors don't block export: they're flagged in the downloadable report so you can fix them at the source.
        </div>
      </div>
    </div>
  );
};
