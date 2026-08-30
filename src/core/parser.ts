import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RawRow } from '../types/schema';

export interface ParseResult {
  headers: string[];
  rows: RawRow[];
  warnings: string[];
  errors: string[];
}

export function deduplicateHeaders(rawHeaders: string[]): { headers: string[]; duplicateWarnings: string[] } {
  const counts: Record<string, number> = {};
  const headers: string[] = [];
  const duplicateWarnings: string[] = [];

  for (let i = 0; i < rawHeaders.length; i++) {
    const original = (rawHeaders[i] || `column_${i + 1}`).trim();
    if (counts[original] === undefined) {
      counts[original] = 1;
      headers.push(original);
    } else {
      counts[original]++;
      const renamed = `${original}_${counts[original]}`;
      headers.push(renamed);
      duplicateWarnings.push(`Duplicate column name "${original}" was automatically renamed to "${renamed}"`);
    }
  }

  return { headers, duplicateWarnings };
}

export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'xlsx' || extension === 'xls') {
    return parseXLSX(file);
  } else if (extension === 'json') {
    return parseJSON(file);
  } else {
    // Default to CSV / TSV / text
    return parseCSV(file);
  }
}

export function parseCSVString(csvText: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const warnings: string[] = [];
    const errors: string[] = [];

    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      dynamicTyping: false, // Critical: prevent auto-coercion from repeating Excel's bugs
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          results.errors.forEach((err) => {
            const rowNum = err.row !== undefined ? `Row ${err.row + 1}: ` : '';
            errors.push(`${rowNum}${err.message} (${err.code || 'format error'})`);
          });
        }

        const rawHeaders = results.meta.fields || [];
        if (rawHeaders.length === 0 || results.data.length === 0) {
          errors.push('The file is empty or contains no parseable data rows.');
          return resolve({ headers: [], rows: [], warnings, errors });
        }

        const { headers, duplicateWarnings } = deduplicateHeaders(rawHeaders);
        warnings.push(...duplicateWarnings);

        // Standardize all row fields to strings
        const rows: RawRow[] = results.data.map((row) => {
          const stringRow: RawRow = {};
          headers.forEach((h, idx) => {
            const originalField = rawHeaders[idx] || h;
            const val = row[originalField] !== undefined && row[originalField] !== null
              ? String(row[originalField]).trim()
              : '';
            stringRow[h] = val;
          });
          return stringRow;
        });

        resolve({ headers, rows, warnings, errors });
      },
      error: (err) => {
        resolve({
          headers: [],
          rows: [],
          warnings: [],
          errors: [`Failed to parse CSV: ${err.message}`],
        });
      },
    });
  });
}

async function parseCSV(file: File): Promise<ParseResult> {
  const text = await file.text();
  return parseCSVString(text);
}

async function parseXLSX(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', raw: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return {
      headers: [],
      rows: [],
      warnings: [],
      errors: ['No worksheets found in this Excel file.'],
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const jsonData = (XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: true,
  }) as unknown) as unknown[][];

  if (!jsonData || jsonData.length === 0) {
    return {
      headers: [],
      rows: [],
      warnings: [],
      errors: ['Worksheet is empty.'],
    };
  }

  const rawHeaders = (jsonData[0] || []).map((h) => String(h || '').trim());
  const { headers, duplicateWarnings } = deduplicateHeaders(rawHeaders);
  const warnings = [...duplicateWarnings];
  const errors: string[] = [];

  const rows: RawRow[] = [];
  for (let r = 1; r < jsonData.length; r++) {
    const rowValues = jsonData[r] as unknown[];
    if (!rowValues || rowValues.every((c) => c === '' || c === undefined || c === null)) {
      continue;
    }
    const stringRow: RawRow = {};
    headers.forEach((h, cIdx) => {
      const cellVal = rowValues[cIdx];
      stringRow[h] = cellVal !== undefined && cellVal !== null ? String(cellVal).trim() : '';
    });
    rows.push(stringRow);
  }

  if (rows.length === 0) {
    errors.push('No data rows found in this sheet.');
  }

  return { headers, rows, warnings, errors };
}

async function parseJSON(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const warnings: string[] = [];
    const errors: string[] = [];

    let arrayData: Record<string, unknown>[] = [];
    if (Array.isArray(data)) {
      arrayData = data;
    } else if (typeof data === 'object' && data !== null) {
      // Look for first array property
      const firstArrayProp = Object.values(data).find((val) => Array.isArray(val));
      if (firstArrayProp) {
        arrayData = firstArrayProp as Record<string, unknown>[];
      } else {
        arrayData = [data as Record<string, unknown>];
      }
    }

    if (arrayData.length === 0) {
      return {
        headers: [],
        rows: [],
        warnings: [],
        errors: ['JSON does not contain any array data rows.'],
      };
    }

    // Collect all keys
    const allKeys = new Set<string>();
    arrayData.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((k) => allKeys.add(k));
      }
    });

    const rawHeaders = Array.from(allKeys);
    const { headers, duplicateWarnings } = deduplicateHeaders(rawHeaders);
    warnings.push(...duplicateWarnings);

    const rows: RawRow[] = arrayData.map((item) => {
      const stringRow: RawRow = {};
      headers.forEach((h) => {
        const val = item[h];
        stringRow[h] = val !== undefined && val !== null ? String(val).trim() : '';
      });
      return stringRow;
    });

    return { headers, rows, warnings, errors };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      headers: [],
      rows: [],
      warnings: [],
      errors: [`JSON parse error: ${msg}`],
    };
  }
}
