import { ValidationIssue } from '../types/schema';

export function checkDedupe(
  rows: Record<string, string>[],
  dedupeKey: string | null
): ValidationIssue[] {
  if (!dedupeKey) {
    return [];
  }

  const issues: ValidationIssue[] = [];
  const seenMap = new Map<string, number>(); // value -> firstRowIndex

  rows.forEach((row, idx) => {
    const val = (row[dedupeKey] || '').trim();
    if (!val) {
      return;
    }

    const key = val.toLowerCase();
    if (seenMap.has(key)) {
      const firstRow = (seenMap.get(key) || 0) + 1;
      issues.push({
        rowIndex: idx + 1,
        column: dedupeKey,
        rule: 'dedupe',
        severity: 'warning',
        message: `Duplicate of row ${firstRow}, kept first occurrence`,
      });
    } else {
      seenMap.set(key, idx);
    }
  });

  return issues;
}
