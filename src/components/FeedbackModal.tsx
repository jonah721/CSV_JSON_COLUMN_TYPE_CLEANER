import React, { useState } from 'react';

export type FeedbackTag = 'satisfied' | 'something missing' | 'unsatisfied';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [selectedTag, setSelectedTag] = useState<FeedbackTag>('satisfied');
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setErrorMessage('Please share a brief note or reason.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formElement = e.currentTarget as HTMLFormElement;
      const honeypotVal = formElement.querySelector<HTMLInputElement>('input[name="botcheck"]')?.checked;
      if (honeypotVal) {
        // Silently treat bot honeypot as success
        setIsSubmitting(false);
        setSubmitStatus('success');
        return;
      }

      const formData = new FormData();
      formData.append('access_key', '284b203a-c9f9-4566-bd8d-7dbe566af604');
      formData.append('subject', `[Column Repair Feedback] ${selectedTag.toUpperCase()}`);
      formData.append('from_name', 'Column Repair User');
      formData.append('feedback_tag', selectedTag);
      formData.append('reason_notes', reason);
      if (email.trim()) {
        formData.append('email', email.trim());
      } else {
        formData.append('email', 'anonymous@columnrepair.app');
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (err: unknown) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitStatus('idle');
    setReason('');
    setEmail('');
    setSelectedTag('satisfied');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-[12px] border border-[#D8D5CE] shadow-2xl p-6 sm:p-7 text-[#1C1E22] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-[#6B6E73] hover:text-[#1C1E22] p-1.5 rounded-[6px] hover:bg-[#F7F6F3] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitStatus === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#E4EFE9] text-[#3C7A5F] mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#1C1E22]">
                Thank you for your feedback!
              </h3>
              <p className="text-[14px] text-[#6B6E73] mt-1 max-w-sm mx-auto">
                Your input directly shapes our upcoming repair rules and CRM validation packs.
              </p>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-2.5 px-6 rounded-[8px] bg-[#2E4057] text-white font-bold text-[14px] hover:bg-[#253447] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7EBF0] text-[#2E4057] text-[11px] font-bold tracking-wider uppercase mb-1.5">
                Community Feedback
              </div>
              <h3 id="feedback-dialog-title" className="text-[19px] font-bold text-[#1C1E22] tracking-tight">
                How is Column Repair working for you?
              </h3>
              <p className="text-[13px] text-[#6B6E73] mt-0.5">
                Help us improve type detection, spreadsheet repair algorithms, and CRM support.
              </p>
            </div>

            {/* Anti-Bot Honeypot */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Section 1: Feedback Tag Selection */}
            <div>
              <label className="block text-[13px] font-bold text-[#1C1E22] mb-2">
                1. How would you describe your experience? <span className="text-[#B94A48]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Satisfied */}
                <button
                  type="button"
                  onClick={() => setSelectedTag('satisfied')}
                  className={`p-3 rounded-[8px] border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedTag === 'satisfied'
                      ? 'bg-[#E4EFE9] border-[#3C7A5F] text-[#1C1E22] ring-1 ring-[#3C7A5F]'
                      : 'bg-white border-[#D8D5CE] text-[#6B6E73] hover:border-[#B9B6AC]'
                  }`}
                >
                  <span className="text-[18px]">✨</span>
                  <span className="text-[12px] font-bold">Satisfied</span>
                </button>

                {/* Something Missing */}
                <button
                  type="button"
                  onClick={() => setSelectedTag('something missing')}
                  className={`p-3 rounded-[8px] border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedTag === 'something missing'
                      ? 'bg-[#FEF3C7] border-[#D97706] text-[#1C1E22] ring-1 ring-[#D97706]'
                      : 'bg-white border-[#D8D5CE] text-[#6B6E73] hover:border-[#B9B6AC]'
                  }`}
                >
                  <span className="text-[18px]">🔍</span>
                  <span className="text-[12px] font-bold">Something Missing</span>
                </button>

                {/* Unsatisfied */}
                <button
                  type="button"
                  onClick={() => setSelectedTag('unsatisfied')}
                  className={`p-3 rounded-[8px] border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedTag === 'unsatisfied'
                      ? 'bg-[#FDF2F2] border-[#B94A48] text-[#1C1E22] ring-1 ring-[#B94A48]'
                      : 'bg-white border-[#D8D5CE] text-[#6B6E73] hover:border-[#B9B6AC]'
                  }`}
                >
                  <span className="text-[18px]">⚠️</span>
                  <span className="text-[12px] font-bold">Unsatisfied</span>
                </button>
              </div>
            </div>

            {/* Section 2: Reason & Details */}
            <div>
              <label htmlFor="feedback-reason" className="block text-[13px] font-bold text-[#1C1E22] mb-1.5">
                2. Reason / Details <span className="text-[#B94A48]">*</span>
              </label>
              <textarea
                id="feedback-reason"
                name="reason"
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  selectedTag === 'satisfied'
                    ? 'What worked great with your CSV/XLSX/JSON file?'
                    : selectedTag === 'something missing'
                    ? 'What column type, rule, or CRM feature would you like to see?'
                    : 'What went wrong or was difficult to use?'
                }
                className="w-full px-3.5 py-2.5 text-[14px] bg-white border border-[#D8D5CE] rounded-[6px] text-[#1C1E22] placeholder:text-[#9E9B93] focus:outline-none focus:border-[#2E4057] focus:ring-1 focus:ring-[#2E4057] resize-none"
              />
            </div>

            {/* Optional Email */}
            <div>
              <label htmlFor="feedback-email" className="block text-[12px] font-medium text-[#6B6E73] mb-1">
                Your Email (optional, if you would like a reply)
              </label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 text-[13px] bg-white border border-[#D8D5CE] rounded-[6px] text-[#1C1E22] placeholder:text-[#9E9B93] focus:outline-none focus:border-[#2E4057]"
              />
            </div>

            {/* Error Banner */}
            {submitStatus === 'error' && (
              <div className="p-3 rounded-[6px] bg-[#FDF2F2] border border-[#E8B4B4] text-[13px] text-[#9A2626]">
                {errorMessage}
              </div>
            )}

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-[14px] font-medium text-[#6B6E73] hover:text-[#1C1E22] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-feedback"
                disabled={isSubmitting}
                className="py-2.5 px-5 rounded-[8px] bg-[#2E4057] text-white font-bold text-[14px] hover:bg-[#253447] disabled:opacity-60 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Feedback</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
