import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { DeclaredSchema, RawRow, RulePack, ValidationIssue, ValidationReport } from '../types/schema';
import iso3166Data from '../data/iso3166.json';
import postalData from '../data/geonames-postal-subset.json';
import { checkDedupe } from './dedupe';

const countryAliases: Record<string, string> = iso3166Data.countryAliases;
const stateAliases: Record<string, string> = iso3166Data.stateAliases;
const postalPatterns: Record<string, string> = postalData.patterns;

export function normalizeCountry(raw: string): string {
  const trimmed = raw.trim();
  if (countryAliases[trimmed]) {
    return countryAliases[trimmed];
  }
  const upper = trimmed.toUpperCase();
  if (countryAliases[upper]) {
    return countryAliases[upper];
  }
  return trimmed;
}

export function normalizeState(raw: string): string {
  const trimmed = raw.trim();
  if (stateAliases[trimmed]) {
    return stateAliases[trimmed];
  }
  const titleCase = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  if (stateAliases[titleCase]) {
    return stateAliases[titleCase];
  }
  return trimmed.toUpperCase();
}

export function validateDataset(
  rows: RawRow[],
  headers: string[],
  schema: DeclaredSchema,
  rulePack: RulePack
): ValidationReport {
  const issues: ValidationIssue[] = [];

  // Create reverse lookup: mappedField -> sourceCol
  const fieldToCol: Record<string, string> = {};
  Object.entries(schema.columnMap).forEach(([srcCol, targetField]) => {
    if (targetField) {
      fieldToCol[targetField] = srcCol;
    }
  });

  // Identify Country and State columns if present for contextual checks
  const countryCol = fieldToCol['country'] || fieldToCol['Country'] || headers.find((h) => h.toLowerCase().includes('country'));
  const stateCol = fieldToCol['state'] || fieldToCol['State'] || headers.find((h) => h.toLowerCase().includes('state'));

  rows.forEach((row, rIdx) => {
    const rowNumber = rIdx + 1;
    const rowCountry = countryCol ? normalizeCountry(row[countryCol] || '') || 'US' : 'US';

    // 1. Required field checks from RulePack & DeclaredSchema
    rulePack.fields.forEach((field) => {
      const isFieldRequired = field.required || schema.requiredFields[field.name];
      if (isFieldRequired) {
        const srcCol = fieldToCol[field.name];
        if (srcCol) {
          const val = (row[srcCol] || '').trim();
          if (!val) {
            issues.push({
              rowIndex: rowNumber,
              column: srcCol,
              rule: 'required_field',
              severity: 'error',
              message: 'Required field is empty',
            });
          }
        }
      }
    });

    // 2. Validate columns according to mapped target formats
    headers.forEach((col) => {
      const targetFieldName = schema.columnMap[col];
      const val = (row[col] || '').trim();
      if (!val) {
        return; // Empty values handled by required-field check
      }

      const ruleField = rulePack.fields.find((f) => f.name === targetFieldName);
      const format = ruleField?.format;
      const colLower = col.toLowerCase();

      // A. Phone validation (libphonenumber-js)
      if (format === 'phone' || colLower.includes('phone')) {
        try {
          const defaultRegion = (rowCountry.length === 2 ? rowCountry : 'US') as any;
          const parsedPhone = parsePhoneNumberFromString(val, defaultRegion);

          if (!parsedPhone) {
            if (!val.startsWith('+')) {
              issues.push({
                rowIndex: rowNumber,
                column: col,
                rule: 'phone_format',
                severity: 'warning',
                message: "Missing country code, can't validate",
              });
            } else {
              issues.push({
                rowIndex: rowNumber,
                column: col,
                rule: 'phone_format',
                severity: 'error',
                message: 'Invalid phone number structure',
              });
            }
          } else if (!parsedPhone.isValid()) {
            issues.push({
              rowIndex: rowNumber,
              column: col,
              rule: 'phone_format',
              severity: 'warning',
              message: 'Phone number format is suspicious or incomplete',
            });
          }
        } catch {
          issues.push({
            rowIndex: rowNumber,
            column: col,
            rule: 'phone_format',
            severity: 'warning',
            message: "Missing country code, can't validate",
          });
        }
      }

      // B. Postal code format validation
      if (format === 'postal' || colLower.includes('zip') || colLower.includes('postal')) {
        const patternStr = postalPatterns[rowCountry] || postalPatterns['US'];
        if (patternStr) {
          const regex = new RegExp(patternStr);
          if (!regex.test(val)) {
            if (rowCountry !== 'US') {
              issues.push({
                rowIndex: rowNumber,
                column: col,
                rule: 'postal_format',
                severity: 'warning',
                message: `5-digit format not confirmed for ${rowCountry} rows`,
              });
            } else {
              issues.push({
                rowIndex: rowNumber,
                column: col,
                rule: 'postal_format',
                severity: 'warning',
                message: 'Postal code does not match standard 5-digit US pattern',
              });
            }
          }
        }
      }

      // C. State & Country picklist matching & normalization
      if (format === 'picklist' && ruleField?.picklist && ruleField.picklist.length > 0) {
        const picklist = ruleField.picklist;
        const normalized = colLower.includes('state') ? normalizeState(val) : normalizeCountry(val);

        if (!picklist.includes(normalized) && !picklist.includes(val)) {
          // Check if it's close or alias
          issues.push({
            rowIndex: rowNumber,
            column: col,
            rule: 'picklist_match',
            severity: 'error',
            message: `Value "${val}" is not in the allowed picklist for ${ruleField.label || ruleField.name}`,
          });
        } else if (normalized !== val && picklist.includes(normalized)) {
          // Normalization warning
          issues.push({
            rowIndex: rowNumber,
            column: col,
            rule: 'picklist_match',
            severity: 'warning',
            message: `"${val}" normalized to "${normalized}" (please confirm)`,
          });
        }
      }

      // D. Email format check
      if (format === 'email' || targetFieldName === 'email' || colLower.includes('email')) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          issues.push({
            rowIndex: rowNumber,
            column: col,
            rule: 'email_format',
            severity: 'error',
            message: `Invalid email address format: "${val}"`,
          });
        }
      }
    });
  });

  // 3. Dedupe validation
  const dedupeIssues = checkDedupe(rows, schema.dedupeKey);
  issues.push(...dedupeIssues);

  // Count errors vs warnings vs passed
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const rowsWithErrorsOrWarnings = new Set(issues.map((i) => i.rowIndex));
  const passCount = Math.max(0, rows.length - rowsWithErrorsOrWarnings.size);

  return {
    totalRows: rows.length,
    passCount,
    errorCount,
    warningCount,
    issues,
  };
}
