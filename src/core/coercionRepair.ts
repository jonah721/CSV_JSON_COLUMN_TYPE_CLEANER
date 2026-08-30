import { CoercionFlag, DeclaredSchema, RawRow, RulePack } from '../types/schema';

/**
 * Converts Excel 1900 date serial number to ISO YYYY-MM-DD string,
 * accounting for Excel's deliberate 1900 leap-year bug (Day 60 = 1900-02-29).
 */
export function excelSerialToDateString(serial: number): string | null {
  if (isNaN(serial) || serial < 1 || serial > 100000) {
    return null;
  }

  // Excel's 1900 leap year bug
  if (serial === 60) {
    return '1900-02-29';
  }

  // Days adjustment for the bug
  const adjustedSerial = serial > 60 ? serial - 1 : serial;

  // Base epoch: 1899-12-31 in UTC
  // 1899-12-31 is -2209075200000 ms from 1970-01-01 UTC
  const MS_PER_DAY = 86400000;
  const epoch = Date.UTC(1899, 11, 31);
  const targetUtc = epoch + (adjustedSerial - 1) * MS_PER_DAY;

  const date = new Date(targetUtc);
  if (isNaN(date.getTime())) {
    return null;
  }

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Reverses scientific notation strings safely without losing precision when possible.
 * Flags unrecoverable precision loss (e.g. 1.23E+15 with trailing zeros).
 */
export function reverseScientificNotation(raw: string): {
  repaired: string;
  isUnrecoverable: boolean;
  explanation?: string;
} {
  const match = raw.trim().match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  if (!match) {
    return { repaired: raw, isUnrecoverable: false };
  }

  const sign = match[1] === '-' ? '-' : '';
  const integerPart = match[2];
  const fractionPart = match[3] || '';
  const exponent = parseInt(match[4], 10);

  // If exponent is positive
  if (exponent > 0) {
    const combinedDigits = integerPart + fractionPart;
    const decimalShift = exponent - fractionPart.length;

    if (decimalShift >= 0) {
      const fullNumberStr = sign + combinedDigits + '0'.repeat(decimalShift);

      // Check if precision was likely lost (e.g. 1.23E+15 has only 3 significant digits for a 16-digit number)
      // If the original has fewer than 6 significant digits and exponent >= 11, precision was wiped by Excel
      if (combinedDigits.length <= 4 && exponent >= 11) {
        return {
          repaired: 'unrecoverable (flagged)',
          isUnrecoverable: true,
          explanation: `Precision lost by Excel export formatting (${raw}). Original trailing digits replaced by zeroes.`,
        };
      }

      return { repaired: fullNumberStr, isUnrecoverable: false };
    } else {
      // Decimal point still within digits
      const splitIndex = integerPart.length + exponent;
      const repaired = sign + combinedDigits.slice(0, splitIndex) + '.' + combinedDigits.slice(splitIndex);
      return { repaired, isUnrecoverable: false };
    }
  } else if (exponent < 0) {
    const absExp = Math.abs(exponent);
    const leadingZeros = '0'.repeat(absExp - 1);
    const repaired = `${sign}0.${leadingZeros}${integerPart}${fractionPart}`;
    return { repaired, isUnrecoverable: false };
  }

  return { repaired: raw, isUnrecoverable: false };
}

/**
 * Repairs a single cell value based on column role and rules.
 */
export function repairCell(
  column: string,
  val: string,
  rowIndex: number,
  schema: DeclaredSchema,
  rulePack?: RulePack
): {
  repairedValue: string;
  flag?: CoercionFlag;
} {
  const trimmed = val.trim();
  if (!trimmed) {
    return { repairedValue: '' };
  }

  const targetField = schema.columnMap[column] || '';
  const isIdentifier = schema.identifierColumns.includes(column);
  const ruleField = rulePack?.fields.find((f) => f.name === targetField);
  const format = ruleField?.format;

  // 1. Check for Scientific Notation in identifier or numeric columns
  if (/^[-+]?[0-9]*\.?[0-9]+[eE][-+]?[0-9]+$/i.test(trimmed)) {
    const { repaired, isUnrecoverable, explanation } = reverseScientificNotation(trimmed);
    return {
      repairedValue: isUnrecoverable ? trimmed : repaired,
      flag: {
        column,
        rowIndex,
        issue: 'scientific_notation',
        original: val,
        repaired: isUnrecoverable ? 'unrecoverable (flagged)' : repaired,
        isUnrecoverable,
        explanation: explanation || 'Scientific notation reversed to full string representation',
      },
    };
  }

  // 2. Check for Zip/Postal leading zero stripping (e.g. 501 -> 00501, 2801 -> 02801, 42 -> 00042)
  const isPostalField =
    format === 'postal' ||
    targetField.toLowerCase().includes('zip') ||
    targetField.toLowerCase().includes('postal') ||
    column.toLowerCase().includes('zip') ||
    column.toLowerCase().includes('postal');

  if (isPostalField && /^\d{1,4}$/.test(trimmed)) {
    const repaired = trimmed.padStart(5, '0');
    return {
      repairedValue: repaired,
      flag: {
        column,
        rowIndex,
        issue: 'leading_zero_stripped',
        original: val,
        repaired,
        explanation: 'Restored leading zeroes to 5-digit US postal code',
      },
    };
  }

  // 3. Check for Employee ID or custom identifier leading zero stripping
  if (isIdentifier && /^\d+$/.test(trimmed)) {
    // If target is employee_id or ID and has short digits like "42" -> "0042"
    if (
      (targetField === 'employee_id' || column.toLowerCase().includes('employee') || column.toLowerCase().includes('emp_id')) &&
      trimmed.length < 4
    ) {
      const repaired = trimmed.padStart(4, '0');
      return {
        repairedValue: repaired,
        flag: {
          column,
          rowIndex,
          issue: 'leading_zero_stripped',
          original: val,
          repaired,
          explanation: 'Restored leading zeroes for Employee ID format',
        },
      };
    }
  }

  // 4. Excel Serial Date de-coercion
  // Applies when field is mapped to a date field, or column name indicates a date
  const isDateField =
    format === 'date' ||
    targetField.toLowerCase().includes('date') ||
    column.toLowerCase().includes('date') ||
    column.toLowerCase().includes('hired') ||
    column.toLowerCase().includes('closed');

  if (isDateField && /^\d{4,5}$/.test(trimmed)) {
    const serial = parseInt(trimmed, 10);
    if (serial >= 1 && serial <= 70000) {
      const dateStr = excelSerialToDateString(serial);
      if (dateStr) {
        return {
          repairedValue: dateStr,
          flag: {
            column,
            rowIndex,
            issue: 'date_coercion',
            original: val,
            repaired: dateStr,
            explanation: `Excel serial date ${serial} de-coerced to ${dateStr} (1900 date system)`,
          },
        };
      }
    }
  }

  return { repairedValue: val };
}

/**
 * Repairs all rows in the dataset based on the declared schema and rule pack.
 */
export function applyCoercionRepairs(
  rows: RawRow[],
  headers: string[],
  schema: DeclaredSchema,
  rulePack?: RulePack
): {
  repairedRows: RawRow[];
  coercionFlags: CoercionFlag[];
} {
  const coercionFlags: CoercionFlag[] = [];
  const repairedRows: RawRow[] = [];

  for (let r = 0; r < rows.length; r++) {
    const originalRow = rows[r];
    const newRow: RawRow = {};

    for (let c = 0; c < headers.length; c++) {
      const col = headers[c];
      const val = originalRow[col] ?? '';
      const { repairedValue, flag } = repairCell(col, val, r, schema, rulePack);

      newRow[col] = repairedValue;
      if (flag) {
        coercionFlags.push(flag);
      }
    }

    repairedRows.push(newRow);
  }

  return { repairedRows, coercionFlags };
}
