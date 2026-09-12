import React, { useState } from 'react';
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

  // Waitlist form state
  const [email, setEmail] = useState('');
  const [wantRulePacks, setWantRulePacks] = useState(true);
  const [wantBatchMode, setWantBatchMode] = useState(true);
  const [targetPlatform, setTargetPlatform] = useState<string>(schema.platform || 'salesforce');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('access_key', '18c632d4-48c6-430f-9458-4913ecc242ec');
      formData.append('subject', 'Column Repair Waitlist Signup');
      formData.append('from_name', 'Column Repair App');
      formData.append('email', email);
      
      // Honeypot check for bots
      const honeypotVal = (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>('input[name="botcheck"]')?.checked;
      if (honeypotVal) {
        // Silently return if bot triggered honeypot
        setIsSubmitting(false);
        setSubmitStatus('success');
        return;
      }
      
      // The 3 requested options
      formData.append('feature_rule_packs', wantRulePacks ? 'Yes' : 'No');
      formData.append('feature_batch_mode', wantBatchMode ? 'Yes' : 'No');
      formData.append('target_platform', targetPlatform);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Could not join waitlist. Please try again.');
      }
    } catch (err: unknown) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Ledger-tinted info callout */}
      <div className="p-5 rounded-[10px] bg-[#E7EBF0] border border-[#D8D5CE] text-[14px] text-[#1C1E22] flex items-start gap-3">
        <svg className="w-5 h-5 text-[#2E4057] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          Want automated batch mode, custom saved rule packs, or native Salesforce, Attio &amp; Pipedrive connectors? Join early access below - 100% in-browser processing guaranteed.
        </span>
      </div>

      {/* Interactive Web3Forms Waitlist Section */}
      <div
        id="waitlist-section"
        className="bg-white border border-[#D8D5CE] rounded-[10px] p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E4EFE9] text-[#3C7A5F] text-[11px] font-bold tracking-wider uppercase mb-2 border border-[#3C7A5F]/20">
              Pro &amp; Team Features
            </div>
            <h3 className="text-[20px] font-bold text-[#1C1E22] tracking-tight">
              Join the Early Access Waitlist
            </h3>
            <p className="text-[14px] text-[#6B6E73] mt-1">
              Tell us what you need next, and be the first to test upcoming release packs.
            </p>
          </div>
        </div>

        {submitStatus === 'success' ? (
          <div
            id="waitlist-success-banner"
            className="p-6 rounded-[8px] bg-[#E4EFE9] border border-[#3C7A5F]/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3C7A5F] text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1C1E22]">
                  You&apos;re on the early access list!
                </h4>
                <p className="text-[13px] text-[#3C7A5F] font-medium">
                  We&apos;ve recorded your preferences for {targetPlatform.toUpperCase()} &amp; batch capabilities.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitStatus('idle');
                setEmail('');
              }}
              className="text-[13px] font-bold text-[#2E4057] underline hover:text-[#1C1E22] cursor-pointer"
            >
              Register another email
            </button>
          </div>
        ) : (
          <form id="form-waitlist" onSubmit={handleWaitlistSubmit} className="space-y-6">
            {/* Anti-bot Honeypot */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Email Field */}
            <div>
              <label htmlFor="waitlist-email" className="block text-[13px] font-bold text-[#1C1E22] mb-1.5">
                Work Email <span className="text-[#B94A48]">*</span>
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="revops@company.com"
                className="w-full sm:max-w-md px-3.5 py-2.5 text-[14px] bg-white border border-[#D8D5CE] rounded-[6px] text-[#1C1E22] placeholder:text-[#9E9B93] focus:outline-none focus:border-[#2E4057] focus:ring-1 focus:ring-[#2E4057]"
              />
            </div>

            {/* 3 Interest Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Option 1: Rule Packs */}
              <label
                htmlFor="opt-rule-packs"
                className={`p-3.5 rounded-[8px] border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  wantRulePacks
                    ? 'bg-[#F7F6F3] border-[#2E4057] text-[#1C1E22]'
                    : 'bg-white border-[#D8D5CE] text-[#6B6E73] hover:border-[#B9B6AC]'
                }`}
              >
                <input
                  id="opt-rule-packs"
                  type="checkbox"
                  checked={wantRulePacks}
                  onChange={(e) => setWantRulePacks(e.target.checked)}
                  className="mt-0.5 rounded border-[#D8D5CE] text-[#2E4057] focus:ring-[#2E4057] cursor-pointer"
                />
                <div>
                  <span className="block text-[13px] font-bold text-[#1C1E22]">Custom Rule Packs</span>
                  <span className="block text-[12px] text-[#6B6E73] mt-0.5">
                    Save schema rules &amp; team presets across devices
                  </span>
                </div>
              </label>

              {/* Option 2: Batch Mode */}
              <label
                htmlFor="opt-batch-mode"
                className={`p-3.5 rounded-[8px] border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  wantBatchMode
                    ? 'bg-[#F7F6F3] border-[#2E4057] text-[#1C1E22]'
                    : 'bg-white border-[#D8D5CE] text-[#6B6E73] hover:border-[#B9B6AC]'
                }`}
              >
                <input
                  id="opt-batch-mode"
                  type="checkbox"
                  checked={wantBatchMode}
                  onChange={(e) => setWantBatchMode(e.target.checked)}
                  className="mt-0.5 rounded border-[#D8D5CE] text-[#2E4057] focus:ring-[#2E4057] cursor-pointer"
                />
                <div>
                  <span className="block text-[13px] font-bold text-[#1C1E22]">Batch Processing</span>
                  <span className="block text-[12px] text-[#6B6E73] mt-0.5">
                    Clean 50+ CSV/XLSX files concurrently in-browser
                  </span>
                </div>
              </label>

              {/* Option 3: Target Platform */}
              <div className="p-3.5 rounded-[8px] border border-[#D8D5CE] bg-white">
                <label htmlFor="opt-platform-select" className="block text-[13px] font-bold text-[#1C1E22] mb-1">
                  Primary CRM / Tool
                </label>
                <select
                  id="opt-platform-select"
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[13px] font-medium bg-[#F7F6F3] border border-[#D8D5CE] rounded-[6px] text-[#1C1E22] focus:outline-none focus:border-[#2E4057] cursor-pointer"
                >
                  <option value="hubspot">HubSpot CRM</option>
                  <option value="salesforce">Salesforce</option>
                  <option value="attio">Attio</option>
                  <option value="pipedrive">Pipedrive</option>
                  <option value="zoho">Zoho CRM</option>
                  <option value="other">Other / Custom Warehouse</option>
                </select>
                <span className="block text-[11px] text-[#6B6E73] mt-1.5">
                  Prioritize native schema pack
                </span>
              </div>
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div id="waitlist-error-banner" className="p-3 rounded-[6px] bg-[#FDF2F2] border border-[#E8B4B4] text-[13px] text-[#9A2626]">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                id="btn-submit-waitlist"
                disabled={isSubmitting}
                className="py-[11px] px-[24px] rounded-[8px] bg-[#2E4057] text-white font-bold text-[14px] hover:bg-[#253447] focus:outline-none focus:ring-2 focus:ring-[#2E4057] disabled:opacity-60 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Request Early Access</span>
                )}
              </button>

              <span className="text-[12px] text-[#6B6E73]">
                No spam. Unsubscribe anytime.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

