import React, { useEffect, useMemo, useState } from 'react';
import { AppState, ColumnDiffGroup, DeclaredSchema, PlatformId, RawRow, Step } from './types/schema';
import { getRulePack } from './core/rulePackLoader';
import { loadSchemaFromStorage, saveSchemaToStorage } from './core/schemaStore';
import { inferColumnTypes } from './core/typeInference';
import { applyCoercionRepairs } from './core/coercionRepair';
import { buildColumnDiffs, getEffectiveDataset } from './core/diffEngine';
import { validateDataset } from './core/validator';
import { StepperNav } from './components/StepperNav';
import { UploadStep } from './components/UploadStep';
import { SchemaStep } from './components/SchemaStep';
import { ReviewDiffStep } from './components/ReviewDiffStep';
import { ValidationStep } from './components/ValidationStep';
import { ExportStep } from './components/ExportStep';

const INITIAL_SCHEMA: DeclaredSchema = {
  platform: 'hubspot',
  columnMap: {},
  identifierColumns: [],
  dedupeKey: null,
  requiredFields: {},
};

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    step: 'upload',
    rawFile: null,
    fileName: '',
    fileSize: 0,
    parsedRows: [],
    headers: [],
    declaredSchema: INITIAL_SCHEMA,
    inferredSchema: [],
    columnDiffs: {},
    repairedRows: [],
    coercionFlags: [],
    validationReport: null,
  });

  const [isAutoFilledFromStorage, setIsAutoFilledFromStorage] = useState(false);

  // Active RulePack based on selected platform
  const activeRulePack = useMemo(() => {
    return getRulePack(appState.declaredSchema.platform, 'contacts');
  }, [appState.declaredSchema.platform]);

  // Handle file loaded on Step 1
  const handleFileParsed = (
    file: File | null,
    fileName: string,
    fileSize: number,
    headers: string[],
    rows: RawRow[]
  ) => {
    const { inferredColumns, suggestedMapping, suggestedIdentifiers, suggestedDedupeKey } =
      inferColumnTypes(headers, rows, activeRulePack);

    // Try loading existing saved schema from localStorage
    const savedSchema = loadSchemaFromStorage(appState.declaredSchema.platform, headers);
    let finalSchema: DeclaredSchema;
    let autoFilled = false;

    if (savedSchema) {
      finalSchema = {
        platform: appState.declaredSchema.platform,
        columnMap: { ...suggestedMapping, ...savedSchema.columnMap },
        identifierColumns: savedSchema.identifierColumns || suggestedIdentifiers,
        dedupeKey: savedSchema.dedupeKey ?? suggestedDedupeKey,
        requiredFields: savedSchema.requiredFields || {},
      };
      autoFilled = true;
    } else {
      finalSchema = {
        platform: appState.declaredSchema.platform,
        columnMap: suggestedMapping,
        identifierColumns: suggestedIdentifiers,
        dedupeKey: suggestedDedupeKey,
        requiredFields: {},
      };
    }

    setIsAutoFilledFromStorage(autoFilled);

    setAppState((prev) => ({
      ...prev,
      rawFile: file,
      fileName,
      fileSize,
      headers,
      parsedRows: rows,
      declaredSchema: finalSchema,
      inferredSchema: inferredColumns,
      columnDiffs: {},
      repairedRows: [],
      coercionFlags: [],
      validationReport: null,
    }));
  };

  // Run Coercion Repair when entering Step 3
  const performCoercionRepair = (currentSchema: DeclaredSchema) => {
    saveSchemaToStorage(currentSchema.platform, appState.headers, currentSchema);

    const { repairedRows, coercionFlags } = applyCoercionRepairs(
      appState.parsedRows,
      appState.headers,
      currentSchema,
      activeRulePack
    );

    const columnDiffs = buildColumnDiffs(coercionFlags, currentSchema, appState.columnDiffs);

    setAppState((prev) => ({
      ...prev,
      declaredSchema: currentSchema,
      repairedRows,
      coercionFlags,
      columnDiffs,
    }));
  };

  // Run Validation when entering Step 4
  const performValidation = (diffs: Record<string, ColumnDiffGroup>) => {
    const effectiveRows = getEffectiveDataset(
      appState.parsedRows,
      appState.repairedRows,
      appState.headers,
      diffs
    );

    const report = validateDataset(
      effectiveRows,
      appState.headers,
      appState.declaredSchema,
      activeRulePack
    );

    setAppState((prev) => ({
      ...prev,
      columnDiffs: diffs,
      validationReport: report,
    }));
  };

  // Step transitions
  const goToStep = (targetStep: Step) => {
    if (targetStep === 'review' && appState.step === 'schema') {
      performCoercionRepair(appState.declaredSchema);
    } else if (targetStep === 'validate') {
      performValidation(appState.columnDiffs);
    }
    setAppState((prev) => ({ ...prev, step: targetStep }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    if (appState.step === 'upload') {
      goToStep('schema');
    } else if (appState.step === 'schema') {
      goToStep('review');
    } else if (appState.step === 'review') {
      goToStep('validate');
    } else if (appState.step === 'validate') {
      goToStep('export');
    }
  };

  const handlePrevStep = () => {
    if (appState.step === 'schema') goToStep('upload');
    else if (appState.step === 'review') goToStep('schema');
    else if (appState.step === 'validate') goToStep('review');
    else if (appState.step === 'export') goToStep('validate');
  };

  const handleResetApp = () => {
    setAppState({
      step: 'upload',
      rawFile: null,
      fileName: '',
      fileSize: 0,
      parsedRows: [],
      headers: [],
      declaredSchema: INITIAL_SCHEMA,
      inferredSchema: [],
      columnDiffs: {},
      repairedRows: [],
      coercionFlags: [],
      validationReport: null,
    });
    setIsAutoFilledFromStorage(false);
  };

  const handleToggleColumnDiffStatus = (column: string, status: 'accepted' | 'rejected') => {
    const updatedDiffs = {
      ...appState.columnDiffs,
      [column]: {
        ...appState.columnDiffs[column],
        status,
      },
    };
    setAppState((prev) => ({
      ...prev,
      columnDiffs: updatedDiffs,
    }));
  };

  // Re-run inference when platform changes on Step 2
  const handleSchemaChange = (updatedSchema: DeclaredSchema) => {
    const rulePack = getRulePack(updatedSchema.platform, 'contacts');
    setAppState((prev) => ({
      ...prev,
      declaredSchema: updatedSchema,
    }));
  };

  // Total affected columns & repaired cells count
  const affectedColumnsCount = Object.keys(appState.columnDiffs).length;
  const totalRepairedCells = useMemo(() => {
    const diffGroups: ColumnDiffGroup[] = Object.values(appState.columnDiffs);
    return diffGroups
      .filter((g) => g.status === 'accepted')
      .reduce((sum, g) => sum + g.totalRepaired, 0);
  }, [appState.columnDiffs]);

  // Dynamic titles and subtitles according to UI spec
  const getHeaderInfo = () => {
    switch (appState.step) {
      case 'upload':
        return {
          eyebrow: 'CSV / JSON COLUMN TYPE CLEANER',
          title: 'Repair before you import',
          subtitle: "Fix coercion damage and validate against your CRM's rules: nothing leaves your browser.",
        };
      case 'schema':
        return {
          eyebrow: 'CSV / JSON COLUMN TYPE CLEANER',
          title: 'Declare your schema',
          subtitle: 'Map columns to fields and mark which ones must keep their exact formatting.',
        };
      case 'review':
        return {
          eyebrow: 'CSV / JSON COLUMN TYPE CLEANER',
          title: 'Review the repair',
          subtitle:
            affectedColumnsCount > 0
              ? `${affectedColumnsCount} ${affectedColumnsCount === 1 ? 'column' : 'columns'} had coercion damage. Accept the fix, or reject to keep the original values.`
              : 'No coercion damage was detected in this file.',
        };
      case 'validate':
        const platformTitle =
          appState.declaredSchema.platform.charAt(0).toUpperCase() +
          appState.declaredSchema.platform.slice(1);
        return {
          eyebrow: 'CSV / JSON COLUMN TYPE CLEANER',
          title: `Validate against ${platformTitle}`,
          subtitle: `Checked ${appState.parsedRows.length.toLocaleString()} rows against the Contacts rule pack.`,
        };
      case 'export':
        return {
          eyebrow: 'CSV / JSON COLUMN TYPE CLEANER',
          title: 'Download your files',
          subtitle: 'Everything below was generated in your browser. Nothing is stored on our servers.',
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const isUploadComplete = appState.parsedRows.length > 0;

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#1C1E22] flex flex-col justify-between selection:bg-[#E7EBF0]">
      {/* Top Section */}
      <div>
        {/* Stepper Navigation */}
        <StepperNav
          currentStep={appState.step}
          onStepClick={(step) => goToStep(step)}
          canNavigateToStep={(step) => {
            if (step === 'upload') return true;
            if (step === 'schema') return isUploadComplete;
            if (step === 'review') return isUploadComplete;
            if (step === 'validate') return isUploadComplete;
            if (step === 'export') return isUploadComplete;
            return false;
          }}
        />

        {/* Main Content Area */}
        <main className="max-w-[1312px] mx-auto px-4 sm:px-8 md:px-16 w-full mb-12">
          {/* Page Header (Eyebrow + H1 + Subtitle) */}
          <div className="mb-8">
            <div className="text-[15px] font-bold text-[#2E4057] uppercase tracking-[0.08em] mb-1">
              {headerInfo.eyebrow}
            </div>
            <h1 className="text-[30px] font-bold text-[#1C1E22] tracking-tight leading-tight mb-1">
              {headerInfo.title}
            </h1>
            <p className="text-[17px] text-[#6B6E73] font-normal">
              {headerInfo.subtitle}
            </p>
          </div>

          {/* Active Step Panel */}
          {appState.step === 'upload' && (
            <UploadStep
              onFileParsed={handleFileParsed}
              onContinue={handleNextStep}
              currentFileName={appState.fileName}
              parsedRowsCount={appState.parsedRows.length}
              headersCount={appState.headers.length}
              fileSize={appState.fileSize}
            />
          )}

          {appState.step === 'schema' && (
            <SchemaStep
              headers={appState.headers}
              schema={appState.declaredSchema}
              rulePack={activeRulePack}
              onSchemaChange={handleSchemaChange}
              isAutoFilledFromStorage={isAutoFilledFromStorage}
            />
          )}

          {appState.step === 'review' && (
            <ReviewDiffStep
              columnDiffs={appState.columnDiffs}
              onToggleColumnStatus={handleToggleColumnDiffStatus}
            />
          )}

          {appState.step === 'validate' && appState.validationReport && (
            <ValidationStep
              report={appState.validationReport}
              platformName={appState.declaredSchema.platform}
              objectName="Contacts"
            />
          )}

          {appState.step === 'export' && (
            <ExportStep
              rows={getEffectiveDataset(
                appState.parsedRows,
                appState.repairedRows,
                appState.headers,
                appState.columnDiffs
              )}
              headers={appState.headers}
              baseFileName={appState.fileName}
              schema={appState.declaredSchema}
              report={appState.validationReport}
              totalRepairedCells={totalRepairedCells}
            />
          )}
        </main>
      </div>

      {/* Footer Navigation Bar */}
      <footer className="w-full bg-[#F7F6F3] border-t border-[#D8D5CE] py-5 px-4 sm:px-8 md:px-16 mt-auto">
        <div className="max-w-[1312px] mx-auto flex items-center justify-between">
          {/* Left Action: Back */}
          <div>
            {appState.step !== 'upload' ? (
              <button
                type="button"
                id="btn-nav-back"
                onClick={handlePrevStep}
                className="px-[22px] py-[13px] rounded-[8px] bg-white border border-[#B9B6AC] text-[#1C1E22] font-bold text-[15px] hover:bg-[#F7F6F3] focus:outline-none focus:ring-2 focus:ring-[#2E4057] transition-all cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Right Action: Continue / Start a new file */}
          <div>
            {appState.step === 'export' ? (
              <button
                type="button"
                id="btn-nav-start-new"
                onClick={handleResetApp}
                className="px-[22px] py-[13px] rounded-[8px] bg-[#2E4057] text-white font-bold text-[15px] hover:bg-[#253447] focus:outline-none focus:ring-2 focus:ring-[#2E4057] focus:ring-offset-2 transition-all cursor-pointer"
              >
                Start a new file
              </button>
            ) : appState.step !== 'upload' ? (
              <button
                type="button"
                id="btn-nav-continue"
                onClick={handleNextStep}
                className="px-[22px] py-[13px] rounded-[8px] bg-[#2E4057] text-white font-bold text-[15px] hover:bg-[#253447] focus:outline-none focus:ring-2 focus:ring-[#2E4057] focus:ring-offset-2 transition-all cursor-pointer"
              >
                Continue
              </button>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
