import React from 'react';
import { DeclaredSchema, PlatformId, RulePack } from '../types/schema';

interface SchemaStepProps {
  headers: string[];
  schema: DeclaredSchema;
  rulePack: RulePack;
  onSchemaChange: (updated: DeclaredSchema) => void;
  isAutoFilledFromStorage?: boolean;
}

export const SchemaStep: React.FC<SchemaStepProps> = ({
  headers,
  schema,
  rulePack,
  onSchemaChange,
  isAutoFilledFromStorage = false,
}) => {
  const handlePlatformSelect = (platform: PlatformId) => {
    onSchemaChange({
      ...schema,
      platform,
    });
  };

  const handleFieldMappingChange = (col: string, targetField: string) => {
    const newMap = { ...schema.columnMap, [col]: targetField };
    // If target field is required by rule pack, ensure required flag is set
    const ruleField = rulePack.fields.find((f) => f.name === targetField);
    const newRequired = { ...schema.requiredFields };
    if (ruleField?.required) {
      newRequired[targetField] = true;
    }

    onSchemaChange({
      ...schema,
      columnMap: newMap,
      requiredFields: newRequired,
    });
  };

  const toggleKeepExactFormat = (col: string) => {
    const current = schema.identifierColumns.includes(col);
    const newIdentifiers = current
      ? schema.identifierColumns.filter((c) => c !== col)
      : [...schema.identifierColumns, col];

    onSchemaChange({
      ...schema,
      identifierColumns: newIdentifiers,
    });
  };

  const toggleRequired = (targetField: string) => {
    const isRequired = schema.requiredFields[targetField] ?? false;
    onSchemaChange({
      ...schema,
      requiredFields: {
        ...schema.requiredFields,
        [targetField]: !isRequired,
      },
    });
  };

  const handleDedupeKeyChange = (key: string) => {
    onSchemaChange({
      ...schema,
      dedupeKey: key === '__none__' ? null : key,
    });
  };

  const platforms: { id: PlatformId; label: string; active: boolean; note?: string }[] = [
    { id: 'hubspot', label: 'HubSpot', active: true },
    { id: 'salesforce', label: 'Salesforce', active: false, note: '(packs are static JSON, more ship fast-follow)' },
    { id: 'pipedrive', label: 'Pipedrive', active: false, note: '(packs are static JSON, more ship fast-follow)' },
    { id: 'attio', label: 'Attio', active: false, note: '(packs are static JSON, more ship fast-follow)' },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Target Platform Section */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B6E73] uppercase tracking-wide">
          Target platform
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              id={`platform-chip-${p.id}`}
              onClick={() => handlePlatformSelect(p.id)}
              className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
                schema.platform === p.id
                  ? 'bg-[#2E4057] text-white shadow-none'
                  : 'bg-white border border-[#B9B6AC] text-[#6B6E73] hover:border-[#6B6E73]'
              }`}
            >
              {p.label} {p.note && <span className="text-[12px] font-normal opacity-80">{p.note}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Column Mapping Table */}
      <div className="bg-white border border-[#D8D5CE] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#D8D5CE] bg-[#F7F6F3]/50">
                <th className="py-3.5 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider">
                  SOURCE COLUMN
                </th>
                <th className="py-3.5 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider">
                  MAPS TO FIELD
                </th>
                <th className="py-3.5 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider text-center">
                  KEEP EXACT FORMAT
                </th>
                <th className="py-3.5 px-5 text-[12px] font-bold text-[#6B6E73] uppercase tracking-wider text-center">
                  REQUIRED
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D5CE]">
              {headers.map((col) => {
                const targetField = schema.columnMap[col] || '';
                const isIdentifier = schema.identifierColumns.includes(col);
                const ruleField = rulePack.fields.find((f) => f.name === targetField);
                const isRequired = targetField
                  ? (ruleField?.required ?? false) || (schema.requiredFields[targetField] ?? false)
                  : false;

                return (
                  <tr key={col} className="hover:bg-[#F7F6F3]/40 transition-colors">
                    {/* Source Column Name (Mono) */}
                    <td className="py-3 px-5 font-mono text-[14px] text-[#1C1E22] font-semibold">
                      {col}
                    </td>

                    {/* Maps to Field Dropdown */}
                    <td className="py-3 px-5">
                      <div className="relative inline-block w-full max-w-[280px]">
                        <select
                          id={`select-map-${col}`}
                          value={targetField}
                          onChange={(e) => handleFieldMappingChange(col, e.target.value)}
                          className="w-full appearance-none bg-white border border-[#B9B6AC] rounded-[8px] py-1.5 pl-3 pr-8 text-[14px] text-[#1C1E22] focus:outline-none focus:border-[#2E4057] focus:ring-1 focus:ring-[#2E4057] cursor-pointer"
                        >
                          <option value="">-- Do not map / keep as is --</option>
                          {rulePack.fields.map((field) => (
                            <option key={field.name} value={field.name}>
                              {field.label || field.name} {field.required ? '*' : ''}
                            </option>
                          ))}
                        </select>
                        {/* Custom SVG dropdown caret */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#6B6E73]">
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 10 6">
                            <polygon points="0,0 10,0 5,6" />
                          </svg>
                        </div>
                      </div>
                    </td>

                    {/* Keep Exact Format Checkbox */}
                    <td className="py-3 px-5 text-center">
                      <button
                        type="button"
                        id={`check-identifier-${col}`}
                        onClick={() => toggleKeepExactFormat(col)}
                        className={`w-5 h-5 rounded-[4px] inline-flex items-center justify-center transition-all cursor-pointer ${
                          isIdentifier
                            ? 'bg-[#2E4057] text-white border border-[#2E4057]'
                            : 'bg-white border border-[#B9B6AC] hover:border-[#6B6E73]'
                        }`}
                      >
                        {isIdentifier && (
                          <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.5]" viewBox="0 0 16 16">
                            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </td>

                    {/* Required Checkbox */}
                    <td className="py-3 px-5 text-center">
                      <button
                        type="button"
                        id={`check-required-${col}`}
                        onClick={() => targetField && toggleRequired(targetField)}
                        disabled={!targetField}
                        className={`w-5 h-5 rounded-[4px] inline-flex items-center justify-center transition-all ${
                          !targetField
                            ? 'bg-[#EDEBE6] border border-[#D8D5CE] cursor-not-allowed opacity-50'
                            : isRequired
                            ? 'bg-[#2E4057] text-white border border-[#2E4057] cursor-pointer'
                            : 'bg-white border border-[#B9B6AC] hover:border-[#6B6E73] cursor-pointer'
                        }`}
                      >
                        {isRequired && (
                          <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.5]" viewBox="0 0 16 16">
                            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedupe Key Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-[#D8D5CE] rounded-[10px]">
        <div className="flex flex-col">
          <label className="text-[14px] font-bold text-[#1C1E22] mb-1">
            Dedupe key
          </label>
          <span className="text-[13px] text-[#6B6E73]">
            {isAutoFilledFromStorage
              ? `Auto-filled from your last ${platforms.find((p) => p.id === schema.platform)?.label} mapping on this device`
              : 'Select a primary identifier to flag duplicate rows during validation'}
          </span>
        </div>

        <div className="relative inline-block w-full sm:w-[260px]">
          <select
            id="select-dedupe-key"
            value={schema.dedupeKey || '__none__'}
            onChange={(e) => handleDedupeKeyChange(e.target.value)}
            className="w-full appearance-none bg-white border border-[#B9B6AC] rounded-[8px] py-1.5 pl-3 pr-8 font-mono text-[14px] text-[#1C1E22] focus:outline-none focus:border-[#2E4057] focus:ring-1 focus:ring-[#2E4057] cursor-pointer"
          >
            <option value="__none__">-- No dedupe key --</option>
            {headers.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#6B6E73]">
            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 10 6">
              <polygon points="0,0 10,0 5,6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
