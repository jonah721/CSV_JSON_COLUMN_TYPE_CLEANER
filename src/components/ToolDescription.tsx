import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export const ToolDescription: React.FC = () => {
  const [openFaqIndices, setOpenFaqIndices] = useState<Record<number, boolean>>({});

  const toggleFaq = (index: number) => {
    setOpenFaqIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const faqs: FAQItem[] = [
    {
      question: 'Is this really free?',
      answer: (
        <span>
          Yes. Processing, repairing, validating and exporting a single file is costless and does not require an account. The paid version is only for batch processing multiple files and syncing configurations across devices. Everything described above is currently available free of charge, just by uploading a single file.
        </span>
      ),
    },
    {
      question: 'Is my file getting uploaded anywhere?',
      answer: (
        <span>
          No. Everything works in your browser. Since there's no server involved in processing, your file is not being uploaded or stored anywhere: not even on our servers. You can check that on your own by observing your browser's network activity when using the tool.
        </span>
      ),
    },
    {
      question: 'What file types are supported?',
      answer: <span>CSV, XLSX, and JSON.</span>,
    },
    {
      question: 'What exactly is "leading zero restoration"?',
      answer: (
        <span>
          If a value in a cell is treated by a spreadsheet application as a number but supposed to be treated as text (for instance, a ZIP code or an ID number), it will remove leading zeros: <code className="font-mono text-[13px] bg-[#F7F6F3] px-1 py-0.5 rounded text-[#2E4057]">00501</code> will become <code className="font-mono text-[13px] bg-[#F7F6F3] px-1 py-0.5 rounded text-[#2E4057]">501</code>. This tool is designed to detect columns with such issue and restore original formatting.
        </span>
      ),
    },
    {
      question: 'How does date de-coercion work?',
      answer: (
        <span>
          Excel may re-interpret non-date value in a column (ID, SKU etc.) as a date, converting it to a serial number in the process. The tool detects this type of issue and attempts to convert value back to its original form taking into account peculiarities of Excel's date system, even in cases when it's impossible to determine original value reliably.
        </span>
      ),
    },
    {
      question: 'What is scientific-notation reversal?',
      answer: (
        <span>
          Large numeric identifiers (account numbers, card numbers, other unique identifiers) can get formatted in a special form known as scientific notation: <code className="font-mono text-[13px] bg-[#F7F6F3] px-1 py-0.5 rounded text-[#2E4057]">4.51032E+11</code>. When original precision can be determined reliably, value gets reverted back to its original numeric form.
        </span>
      ),
    },
    {
      question: 'What if a value is unrecoverable?',
      answer: (
        <span>
          Unrecoverable values are marked as such without any attempt to guess what they might be, so that you know exactly which cells need a new copy from the original source.
        </span>
      ),
    },
    {
      question: 'Which CRMs are supported?',
      answer: (
        <span>
          HubSpot is supported first. There are fast-following Salesforce, Pipedrive, and Attio rule packs which are just files with information about field and format requirements of the corresponding platforms.
        </span>
      ),
    },
    {
      question: 'What does "validation" validate?',
      answer: (
        <span>
          Validation checks required fields, phone number format, postal code format, picklist values in states/countries (with automatic normalization of frequently used values) and duplicates by a key column.
        </span>
      ),
    },
    {
      question: 'Does validation prevent me from exporting data?',
      answer: (
        <span>
          No, there will be a list of issues in the export report, you will have time to make decisions regarding them.
        </span>
      ),
    },
    {
      question: 'Is my mapping saved for the future usage?',
      answer: (
        <span>
          Yes, you can save your schema/mapping file and use it for the next export or just let the browser save your mapping for you automatically.
        </span>
      ),
    },
    {
      question: 'Do I need to register or install some tools?',
      answer: <span>No, everything works in your browser on this page.</span>,
    },
    {
      question: 'Is there a maximum file size?',
      answer: (
        <span>
          The application is designed to deal easily with standard-sized CRM export files. If you are working with very large files, then they will take longer depending on your internet browser and your device, because everything runs locally.
        </span>
      ),
    },
    {
      question: 'Is there an API?',
      answer: (
        <span>
          Not at the moment, but this is something that will be available in the future.
        </span>
      ),
    },
  ];

  return (
    <div className="w-full mt-12 pt-10 border-t border-[#D8D5CE] text-[#1C1E22]">
      {/* Main Title & Overview */}
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-[#1C1E22] tracking-tight mb-4">
          Fix CSV, XLSX, and JSON import errors before your CRM does it for you
        </h2>
        <p className="text-[15px] text-[#6B6E73] leading-relaxed mb-4">
          Behind each exported CSV or XLSX lies a tale: and more often than not, a tale of data corruption. Take any raw data file in Excel, save it and export it as a CSV or XLSX, and you are immediately subjected to a whole class of hidden damage: ZIP codes lose their leading zeroes, identifiers get rewritten as scientific notation, non-date fields are secretly transformed into Excel serial dates. Nothing blows up. All of this damage silently accumulates, ready to rear its head when it hits the import validator of your choice or, worse yet, when it doesn't and your HubSpot, Salesforce, Pipedrive or Attio import goes ahead anyway, with your bad data live inside it until some report fails three weeks later.
        </p>
        <p className="text-[15px] text-[#6B6E73] leading-relaxed">
          That is what this tool is for: to prevent your data from getting damaged in the first place. Import your CSV, XLSX or JSON file and let it inspect all of your columns, detect exactly what kind of damage has been done by your spreadsheet software, undo everything it can with confidence, and flag everything else before it even comes near your import wizard.
        </p>
      </div>

      {/* What it repairs */}
      <div className="mb-8 bg-white border border-[#D8D5CE] rounded-[10px] p-6">
        <h3 className="text-[18px] font-bold text-[#2E4057] mb-3">
          What it repairs
        </h3>
        <ul className="space-y-3 text-[14px] text-[#6B6E73] leading-relaxed list-disc list-inside">
          <li>
            <strong className="text-[#1C1E22]">Leading-zero and identifier restoration.</strong> Any ZIP code, employee ID, SKU or another identifier that may look like a number, but isn't, gets automatically detected and restored: and not converted to a number and stripped of its formatting, which Excel tends to do.
          </li>
          <li>
            <strong className="text-[#1C1E22]">Excel date de-coercion.</strong> All non-date columns that Excel has secretly converted to its serial dates (including some peculiar edge-cases related to Excel's 1900 leap year bug) are restored to their original values if it is possible mathematically.
          </li>
          <li>
            <strong className="text-[#1C1E22]">Scientific-notation reversal.</strong> Account numbers and identifiers that have been silently converted to scientific notation (<code className="font-mono text-[13px] bg-[#F7F6F3] px-1 py-0.5 rounded text-[#2E4057]">4.51032E+11</code>), where the original data was not lost, get reconstructed to their complete numeric form.
          </li>
          <li>
            <strong className="text-[#1C1E22]">Honest treatment of the unrecoverable.</strong> If the original value cannot be reliably recovered, that fact is reported clearly and loudly, rather than blindly trying to recover it and potentially making up a fake solution.
          </li>
        </ul>
      </div>

      {/* What it validates */}
      <div className="mb-8 bg-white border border-[#D8D5CE] rounded-[10px] p-6">
        <h3 className="text-[18px] font-bold text-[#2E4057] mb-2">
          What it validates
        </h3>
        <p className="text-[14px] text-[#6B6E73] mb-3">
          Once the data has been fixed, it is validated against a rule pack for your destination CRM platform: starting from HubSpot, followed quickly by Salesforce, Pipedrive and Attio rule packs.
        </p>
        <ul className="space-y-3 text-[14px] text-[#6B6E73] leading-relaxed list-disc list-inside">
          <li>
            <strong className="text-[#1C1E22]">Required-field coverage:</strong> detects rows that lack a value that is going to be rejected by your CRM during import.
          </li>
          <li>
            <strong className="text-[#1C1E22]">Phone number format validation:</strong> validates the phone numbers against the international format standard, rather than a simplistic regular expression.
          </li>
          <li>
            <strong className="text-[#1C1E22]">Postal code format validation:</strong> validates the postal codes according to country-specific requirements, not assuming a US-style &quot;five-digit&quot; pattern.
          </li>
          <li>
            <strong className="text-[#1C1E22]">State and country picklist matching:</strong> normalizes inconsistent entries (&quot;USA&quot;, &quot;US&quot;, &quot;United States&quot;) against your CRM's actual acceptable values, preventing silent picklist mismatches.
          </li>
          <li>
            <strong className="text-[#1C1E22]">In-file duplicate detection:</strong> detects duplicate rows against a key of your choice, ensuring you don't inadvertently duplicate contacts in the import.
          </li>
        </ul>
      </div>

      {/* Built for privacy */}
      <div className="mb-8 bg-[#E4EFE9]/40 border border-[#3C7A5F]/20 rounded-[10px] p-6">
        <h3 className="text-[18px] font-bold text-[#3C7A5F] mb-3">
          Built for privacy, by architecture, not by policy
        </h3>
        <p className="text-[14px] text-[#6B6E73] leading-relaxed">
          All of it: parsing, repairing, validation and exporting: is happening purely in-browser. There is no uploading, transmitting or storing of your file on any server, because there's no server in the file processing pipeline whatsoever. It is not an optional feature you must trust; it is simply how the app is made. You can verify it by yourself, by looking at your browser's network traffic while you use it: you'll see your data doesn't leave the page.
        </p>
      </div>

      {/* What you get out */}
      <div className="mb-8 bg-white border border-[#D8D5CE] rounded-[10px] p-6">
        <h3 className="text-[18px] font-bold text-[#2E4057] mb-3">
          What you get out
        </h3>
        <ul className="space-y-3 text-[14px] text-[#6B6E73] leading-relaxed list-disc list-inside">
          <li>A repaired, cleansed file, in the exact format in which you uploaded it.</li>
          <li>A report of all warnings and errors found in your file, together with row, column and rule it was triggered by, so that you can solve root cause problems at source system instead of making guesses.</li>
          <li>A downloadable schema/mapping configuration you can use again next time, so next import skips column mapping step completely.</li>
        </ul>
      </div>

      {/* Who this is for */}
      <div className="mb-8 bg-white border border-[#D8D5CE] rounded-[10px] p-6">
        <h3 className="text-[18px] font-bold text-[#2E4057] mb-3">
          Who this is for
        </h3>
        <p className="text-[14px] text-[#6B6E73] leading-relaxed">
          Professionals in ops and revenue ops preparing their contact, company or deal data for CRM import; people who ever had an import silently failed: or succeeded silently with bad data: due to an Excel roundtrip; and people who want a repair tool that does not require uploading their customer data to some unknown third party in order to complete task.
        </p>
      </div>

      {/* Free to use, no account required */}
      <div className="mb-10 bg-white border border-[#D8D5CE] rounded-[10px] p-6">
        <h3 className="text-[18px] font-bold text-[#2E4057] mb-3">
          Free to use, no account required
        </h3>
        <p className="text-[14px] text-[#6B6E73] leading-relaxed">
          Core repair and validate workflow is free for a single file, without account, installation and even any uploading step whatsoever. A paid version exists to process multiple files in batch and to reuse saved rule packs on other devices. Everything described above is currently available free of charge and without signups, the moment you drop in a file.
        </p>
      </div>

      <hr className="border-[#D8D5CE] my-10" />

      {/* Frequently Asked Questions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#1C1E22] tracking-tight">
            Frequently Asked Questions
          </h2>
          <button
            type="button"
            onClick={() => {
              const allOpen = faqs.every((_, i) => openFaqIndices[i]);
              if (allOpen) {
                setOpenFaqIndices({});
              } else {
                const newIndices: Record<number, boolean> = {};
                faqs.forEach((_, i) => {
                  newIndices[i] = true;
                });
                setOpenFaqIndices(newIndices);
              }
            }}
            className="text-[13px] font-semibold text-[#2E4057] hover:underline cursor-pointer"
          >
            {faqs.every((_, i) => openFaqIndices[i]) ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = !!openFaqIndices[idx];
            return (
              <div
                key={idx}
                className="bg-white border border-[#D8D5CE] rounded-[10px] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[15px] text-[#1C1E22] hover:bg-[#F7F6F3]/60 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`w-6 h-6 rounded-full bg-[#F7F6F3] border border-[#D8D5CE] flex items-center justify-center text-[16px] text-[#2E4057] shrink-0 font-mono transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-[14px] text-[#6B6E73] leading-relaxed border-t border-[#F0EFEB]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
