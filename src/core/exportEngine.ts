import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DeclaredSchema, RawRow, ValidationReport } from '../types/schema';

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadCleanedCSV(
  rows: RawRow[],
  headers: string[],
  baseFileName = 'contacts'
): void {
  const csvString = Papa.unparse({
    fields: headers,
    data: rows.map((r) => headers.map((h) => r[h] ?? '')),
  });

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const filename = `${baseFileName.replace(/\.[^/.]+$/, '')}_repaired.csv`;
  triggerBlobDownload(blob, filename);
}

export function downloadCleanedXLSX(
  rows: RawRow[],
  headers: string[],
  baseFileName = 'contacts'
): void {
  const worksheetData = [
    headers,
    ...rows.map((r) => headers.map((h) => r[h] ?? '')),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Repaired_Data');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `${baseFileName.replace(/\.[^/.]+$/, '')}_repaired.xlsx`;
  triggerBlobDownload(blob, filename);
}

export function downloadValidationReport(
  report: ValidationReport,
  baseFileName = 'contacts',
  platform = 'hubspot'
): void {
  const reportPayload = {
    generatedAt: new Date().toISOString(),
    generator: 'CSV/JSON Column Type Cleaner Phase 1',
    privacyNote: 'Processed entirely in client browser with zero server storage',
    platform,
    summary: {
      totalRows: report.totalRows,
      passCount: report.passCount,
      warningCount: report.warningCount,
      errorCount: report.errorCount,
    },
    issues: report.issues,
  };

  const jsonString = JSON.stringify(reportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const filename = `${baseFileName.replace(/\.[^/.]+$/, '')}_validation_report.json`;
  triggerBlobDownload(blob, filename);
}

export function downloadSchemaConfig(
  schema: DeclaredSchema,
  platform = 'hubspot'
): void {
  const configPayload = {
    version: '1.0',
    platform: schema.platform || platform,
    createdAt: new Date().toISOString(),
    columnMap: schema.columnMap,
    identifierColumns: schema.identifierColumns,
    dedupeKey: schema.dedupeKey,
    requiredFields: schema.requiredFields,
  };

  const jsonString = JSON.stringify(configPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const filename = `${schema.platform || platform}_contacts.schema.json`;
  triggerBlobDownload(blob, filename);
}
