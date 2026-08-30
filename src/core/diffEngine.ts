import { CoercionFlag, ColumnDiffGroup, DeclaredSchema } from '../types/schema';

export function buildColumnDiffs(
  coercionFlags: CoercionFlag[],
  schema: DeclaredSchema,
  existingDiffs?: Record<string, ColumnDiffGroup>
): Record<string, ColumnDiffGroup> {
  const groups: Record<string, ColumnDiffGroup> = {};

  coercionFlags.forEach((flag) => {
    if (!groups[flag.column]) {
      const priorStatus = existingDiffs?.[flag.column]?.status || 'accepted';
      groups[flag.column] = {
        column: flag.column,
        mappedField: schema.columnMap[flag.column],
        totalRepaired: 0,
        hasUnrecoverable: false,
        status: priorStatus,
        flags: [],
      };
    }

    groups[flag.column].totalRepaired++;
    if (flag.isUnrecoverable) {
      groups[flag.column].hasUnrecoverable = true;
    }
    groups[flag.column].flags.push(flag);
  });

  return groups;
}

/**
 * Produces final working dataset applying only ACCEPTED column repairs.
 */
export function getEffectiveDataset(
  originalRows: Record<string, string>[],
  repairedRows: Record<string, string>[],
  headers: string[],
  columnDiffs: Record<string, ColumnDiffGroup>
): Record<string, string>[] {
  // If a column is 'rejected', revert its values to original
  const rejectedColumns = new Set(
    Object.values(columnDiffs)
      .filter((g) => g.status === 'rejected')
      .map((g) => g.column)
  );

  if (rejectedColumns.size === 0) {
    return repairedRows;
  }

  return originalRows.map((origRow, rIdx) => {
    const repRow = repairedRows[rIdx] || origRow;
    const finalRow: Record<string, string> = { ...repRow };

    rejectedColumns.forEach((col) => {
      finalRow[col] = origRow[col] ?? '';
    });

    return finalRow;
  });
}
