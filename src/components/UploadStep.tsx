import React, { useRef, useState } from 'react';
import { parseFile, parseCSVString } from '../core/parser';
import { RawRow } from '../types/schema';
import { ToolDescription } from './ToolDescription';

interface UploadStepProps {
  onFileParsed: (file: File | null, fileName: string, fileSize: number, headers: string[], rows: RawRow[]) => void;
  onContinue?: () => void;
  currentFileName?: string;
  parsedRowsCount?: number;
  headersCount?: number;
  fileSize?: number;
  isProcessing?: boolean;
}

// Sample messy CRM export matching the exact test plan and spec examples
const SAMPLE_MESSY_CSV = `email,firstname,lastname,phone,zip_code,employee_id,account_number,hire_date,close_date,state,country
jonah@acme.com,Jonah,Miller,4155552671,501,0042,4.51032E+11,45123,45000,California,USA
sarah.w@stark.io,Sarah,Williams,+1 555-0199,2801,1089,451032998218,44927,45123,CA,United States
marcus@initech.com,Marcus,Vance,555-0144,42,0012,1.23E+15,45123,45050,Cali,US
marcus@initech.com,Marcus,Vance,555-0144,00042,0012,1.23E+15,45123,45050,CA,US
david.k@globex.org,David,Kim,415-555-0182,94105,0912,4.51032998217E+11,45150,45180,NY,US
elena@hooli.com,Elena,Rostova,,00501,0042,987654321098,44800,,FL,USA
unknown@sample.co,,,+44 20 7946 0912,SW1A 1AA,5501,112233445566,45000,45100,London,GB
alex@dunder.com,Alex,Scott,123-456-7890,18503,0088,4.51032E+11,45123,45100,PA,USA`;

export const UploadStep: React.FC<UploadStepProps> = ({
  onFileParsed,
  onContinue,
  currentFileName,
  parsedRowsCount = 0,
  headersCount = 0,
  fileSize = 0,
  isProcessing = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasLoadedFile = parsedRowsCount > 0 && !!currentFileName;

  const handleFile = async (file: File) => {
    setParseError(null);
    setSizeWarning(null);

    if (file.size > 150 * 1024 * 1024) {
      setSizeWarning(
        `File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Files over 150MB may approach browser memory limits.`
      );
    }

    try {
      const result = await parseFile(file);
      if (result.errors.length > 0 && result.rows.length === 0) {
        setParseError(result.errors.join(' '));
        return;
      }
      onFileParsed(file, file.name, file.size, result.headers, result.rows);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setParseError(`Could not read file: ${msg}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = async () => {
    setParseError(null);
    setSizeWarning(null);
    const result = await parseCSVString(SAMPLE_MESSY_CSV);
    const blob = new Blob([SAMPLE_MESSY_CSV], { type: 'text/csv' });
    const sampleFile = new File([blob], 'contacts_crm_export_raw.csv', { type: 'text/csv' });
    onFileParsed(sampleFile, 'contacts_crm_export_raw.csv', blob.size, result.headers, result.rows);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Upload Dropzone Box */}
      <div
        id="upload-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full bg-white border-2 border-dashed rounded-[10px] p-10 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-[#2E4057] bg-[#E7EBF0]/20'
            : hasLoadedFile
            ? 'border-[#3C7A5F] bg-[#F7FAF8]'
            : 'border-[#B9B6AC] hover:border-[#6B6E73]'
        }`}
      >
        {hasLoadedFile ? (
          /* State when file is loaded */
          <div className="flex flex-col items-center">
            {/* Success vector glyph */}
            <div className="mx-auto w-14 h-14 rounded-full bg-[#E4EFE9] border border-[#3C7A5F]/30 flex items-center justify-center mb-4 text-[#3C7A5F]">
              <svg className="w-7 h-7 stroke-current fill-none stroke-[2.5]" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p className="text-[20px] font-bold text-[#1C1E22] mb-1">
              {currentFileName}
            </p>
            <p className="text-[14px] text-[#6B6E73] mb-6">
              {parsedRowsCount.toLocaleString()} rows • {headersCount} columns
              {fileSize > 0 ? ` • ${(fileSize / 1024).toFixed(1)} KB` : ''}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.xlsx,.xls,.json"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
              id="file-input-control"
            />

            {/* Action buttons with Continue in #2E4057 matching Choose File */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              {onContinue && (
                <button
                  type="button"
                  id="btn-upload-continue"
                  onClick={onContinue}
                  className="px-[26px] py-[13px] rounded-[8px] bg-[#2E4057] text-white font-bold text-[15px] hover:bg-[#253447] focus:outline-none focus:ring-2 focus:ring-[#2E4057] focus:ring-offset-2 transition-all cursor-pointer shadow-sm"
                >
                  Continue to Schema Mapping →
                </button>
              )}

              <button
                type="button"
                id="btn-choose-different-file"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-[22px] py-[13px] rounded-[8px] bg-white border border-[#B9B6AC] text-[#1C1E22] font-bold text-[15px] hover:bg-[#F7F6F3] focus:outline-none focus:ring-2 focus:ring-[#2E4057] transition-all cursor-pointer"
              >
                Choose different file
              </button>
            </div>
          </div>
        ) : (
          /* State when no file is uploaded yet */
          <div className="flex flex-col items-center">
            {/* Upload vector glyph (drawn shape, not font icon) */}
            <div className="mx-auto w-14 h-14 rounded-full bg-[#F7F6F3] border border-[#D8D5CE] flex items-center justify-center mb-5 text-[#2E4057]">
              <svg className="w-6 h-6 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                <path d="M12 16V4M12 4L7 9M12 4L17 9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Text */}
            <p className="text-[18px] font-bold text-[#1C1E22] mb-1">
              Drop a CSV, XLSX, or JSON file here
            </p>
            <p className="text-[15px] text-[#6B6E73] mb-6">
              or click to browse
            </p>

            {/* Choose file primary button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.xlsx,.xls,.json"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
              id="file-input-control"
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button
                type="button"
                id="btn-choose-file"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-[22px] py-[13px] rounded-[8px] bg-[#2E4057] text-white font-bold text-[15px] hover:bg-[#253447] focus:outline-none focus:ring-2 focus:ring-[#2E4057] focus:ring-offset-2 transition-all cursor-pointer"
              >
                {isProcessing ? 'Processing file...' : 'Choose file'}
              </button>

              <button
                type="button"
                id="btn-load-sample-file"
                onClick={handleLoadSample}
                disabled={isProcessing}
                className="px-[22px] py-[13px] rounded-[8px] bg-white border border-[#B9B6AC] text-[#1C1E22] font-bold text-[15px] hover:bg-[#F7F6F3] focus:outline-none focus:ring-2 focus:ring-[#2E4057] transition-all cursor-pointer"
              >
                Load sample messy CRM export
              </button>
            </div>
          </div>
        )}

        {/* Pill-shaped privacy note inside dropzone near bottom */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E4EFE9] text-[#3C7A5F] text-[13px] font-medium border border-[#3C7A5F]/20">
          {/* Hand-drawn vector checkmark */}
          <svg className="w-4 h-4 stroke-current fill-none stroke-[2.5]" viewBox="0 0 16 16">
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            Processed entirely in your browser: your file is never uploaded to a server
          </span>
        </div>
      </div>

      {/* Errors or Warnings */}
      {parseError && (
        <div className="w-full mt-4 p-4 rounded-[8px] bg-[#F5E1E1] border border-[#A63D40] text-[#A63D40] text-[14px]">
          <strong>File Parse Error:</strong> {parseError}
        </div>
      )}

      {sizeWarning && (
        <div className="w-full mt-4 p-4 rounded-[8px] bg-[#F6E9DA] border border-[#B8752E] text-[#B8752E] text-[14px]">
          <strong>Size Notice:</strong> {sizeWarning}
        </div>
      )}

      {/* Tool Description & FAQs below upload window */}
      <ToolDescription />
    </div>
  );
};
