import React from 'react';
import { DeclaredSchema, RawRow, ValidationReport } from '../types/schema';
import { downloadCleanedCSV, downloadCleanedXLSX, downloadSchemaConfig, downloadValidationReport } from '../core/exportEngine';

interface ExportStepProps {
  rows: RawRow[];
  headers: string[];
  baseFileName: string;
  schema: DeclaredSchema;
  report: ValidationReport | null;
  totalRepairedCells: number;
}

export const ExportStep: React.FC<ExportStepProps> = ({
  rows,
  headers,
  baseFileName,
  schema,
  report,
  totalRepairedCells,
}) => {
  const cleanName = baseFileName.replace(/\.[^/.]+$/, '') || 'contacts';
  const csvFileName = `${cleanName}_repaired.csv`;
  const reportFileName = `${cleanName}_validation_report.json`;
  const schemaFileName = `${schema.platform}_contacts.schema.json`;

  const handleDownloadCleaned = () => {
    downloadCleanedCSV(rows, headers, cleanName);
  };

  const handleDownloadReport = () => {
    if (report) {
      downloadValidationReport(report, cleanName, schema.platform);
    }
  };

  const handleDownloadSchema = () => {
    downloadSchemaConfig(schema, schema.platform);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* 3 File Download Cards Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Cleaned File */}
        <div
          id="card-download-cleaned"
          className="bg-white border border-[#D8D5CE] rounded-[10px] p-6 flex flex-col justify-between"
        >
          <div>
            {/* Document vector icon */}
            <div className="w-10 h-10 rounded-[6px] bg-[#F7F6F3] border border-[#D8D5CE] flex items-center justify-center mb-4 text-[#2E4057]">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2V8H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 13H8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17H8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 className="text-[17px] font-bold text-[#1C1E22] mb-1">
              Cleaned file
            </h3>
            <p className="font-mono text-[13px] text-[#6B6E73] mb-3 truncate">
              {csvFileName}
            </p>
            <p className="text-[14px] text-[#1C1E22] mb-6">
              {rows.length.toLocaleString()} rows · {totalRepairedCells} cells repaired
            </p>
          </div>

          <button
            type="button"
            id="btn-download-cleaned-csv"
            onClick={handleDownloadCleaned}
            className="w-full py-[13px] px-[22px] rounded-[8px] bg-[#2E4057] text-white font-bold text-[14px] hover:bg-[#253447] focus:outline-none focus:ring-2 focus:ring-[#2E4057] transition-all cursor-pointer text-center"
          >
            Download CSV
          </button>
        </div>

        {/* Card 2: Validation Report */}
        <div
          id="card-download-report"
          className="bg-white border border-[#D8D5CE] rounded-[10px] p-6 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-[6px] bg-[#F7F6F3] border border-[#D8D5CE] flex items-center justify-center mb-4 text-[#2E4057]">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                <path d="M9 11L12 14L22 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 className="text-[17px] font-bold text-[#1C1E22] mb-1">
              Validation report
            </h3>
            <p className="font-mono text-[13px] text-[#6B6E73] mb-3 truncate">
              {reportFileName}
            </p>
            <p className="text-[14px] text-[#1C1E22] mb-6">
              {report?.errorCount || 0} errors · {report?.warningCount || 0} warnings
            </p>
          </div>

          <button
            type="button"
            id="btn-download-report-json"
            onClick={handleDownloadReport}
            className="w-full py-[13px] px-[22px] rounded-[8px] bg-[#2E4057] text-white font-bold text-[14px] hover:bg-[#253447] focus:outline-none focus:ring-2 focus:ring-[#2E4057] transition-all cursor-pointer text-center"
          >
            Download report
          </button>
        </div>

        {/* Card 3: Schema Config */}
        <div
          id="card-download-schema"
          className="bg-white border border-[#D8D5CE] rounded-[10px] p-6 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-[6px] bg-[#F7F6F3] border border-[#D8D5CE] flex items-center justify-center mb-4 text-[#2E4057]">
              <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                <path d="M4 4H20V20H4V4Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 9H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 4V20" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 className="text-[17px] font-bold text-[#1C1E22] mb-1">
              Schema config
            </h3>
            <p className="font-mono text-[13px] text-[#6B6E73] mb-3 truncate">
              {schemaFileName}
            </p>
            <p className="text-[14px] text-[#1C1E22] mb-6">
              Reuse this mapping next time on Step 2
            </p>
          </div>

          <button
            type="button"
            id="btn-download-schema-json"
            onClick={handleDownloadSchema}
            className="w-full py-[13px] px-[22px] rounded-[8px] bg-white border border-[#B9B6AC] text-[#1C1E22] font-bold text-[14px] hover:bg-[#F7F6F3] focus:outline-none focus:ring-2 focus:ring-[#2E4057] transition-all cursor-pointer text-center"
          >
            Download config
          </button>
        </div>
      </div>

      {/* Ledger-tinted info callout for paid-tier upsell */}
      <div className="p-5 rounded-[10px] bg-[#E7EBF0] border border-[#D8D5CE] text-[14px] text-[#1C1E22] flex items-start gap-3">
        <svg className="w-5 h-5 text-[#2E4057] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          Want batch mode, saved rule packs across devices, or Salesforce / Pipedrive / Attio validation? Join the waitlist below: same browser-only processing.
        </span>
      </div>
    </div>
  );
};
