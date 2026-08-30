import { InferredColumn, InferredType, RawRow, RulePack } from '../types/schema';

export function inferColumnTypes(
  headers: string[],
  rows: RawRow[],
  rulePack?: RulePack
): {
  inferredColumns: InferredColumn[];
  suggestedMapping: Record<string, string>;
  suggestedIdentifiers: string[];
  suggestedDedupeKey: string | null;
} {
  const sampleSize = Math.min(rows.length, 1000);
  const sampleRows = rows.slice(0, sampleSize);

  const inferredColumns: InferredColumn[] = [];
  const suggestedMapping: Record<string, string> = {};
  const suggestedIdentifiers: string[] = [];
  let suggestedDedupeKey: string | null = null;

  // Available rule pack fields
  const availableFields = rulePack?.fields || [];

  headers.forEach((col) => {
    const colLower = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const values = sampleRows
      .map((r) => r[col])
      .filter((v) => v !== undefined && v !== null && v !== '');

    let inferredType: InferredType = 'string';
    let confidence = 0.5;

    // Detect identifiers
    const isIdByName =
      colLower.includes('id') ||
      colLower.includes('sku') ||
      colLower.includes('account') ||
      colLower.includes('number') ||
      colLower.includes('code') ||
      colLower.includes('ssn') ||
      colLower.includes('tin') ||
      colLower.includes('key');

    // Detect postal / zip
    const isZipByName = colLower.includes('zip') || colLower.includes('postal');

    // Detect date
    const isDateByName =
      colLower.includes('date') ||
      colLower.includes('time') ||
      colLower.includes('created') ||
      colLower.includes('updated') ||
      colLower.includes('closed') ||
      colLower.includes('hired');

    // Detect phone
    const isPhoneByName = colLower.includes('phone') || colLower.includes('mobile') || colLower.includes('cell') || colLower.includes('fax');

    // Detect email
    const isEmailByName = colLower.includes('email') || colLower.includes('mail');

    // Analyze value patterns
    let digitCount = 0;
    let serialDateCount = 0;
    let sciCount = 0;
    let phoneCount = 0;
    let emailCount = 0;
    let zipLikeCount = 0;

    values.forEach((val) => {
      const trimmed = val.trim();
      // Leading zero / digit string
      if (/^\d+$/.test(trimmed)) {
        digitCount++;
        const numVal = parseInt(trimmed, 10);
        // Excel serial date range: between 1 and 60000 (roughly 1900 to 2064)
        if (numVal >= 1 && numVal <= 65000 && !isZipByName) {
          serialDateCount++;
        }
        if (trimmed.length <= 5 && numVal > 0 && numVal <= 99999) {
          zipLikeCount++;
        }
      }

      // Scientific notation (e.g. 1.23E+15 or 4.51032E+11)
      if (/^[-+]?[0-9]*\.?[0-9]+[eE][-+]?[0-9]+$/.test(trimmed)) {
        sciCount++;
      }

      // Phone
      if (/^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\s.-]{5,14}$/.test(trimmed)) {
        phoneCount++;
      }

      // Email
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        emailCount++;
      }
    });

    const total = values.length || 1;

    if (isEmailByName || emailCount / total > 0.6) {
      inferredType = 'string';
      confidence = 0.95;
    } else if (isPhoneByName || phoneCount / total > 0.6) {
      inferredType = 'phone';
      confidence = 0.9;
    } else if (isZipByName || (zipLikeCount / total > 0.6 && isIdByName)) {
      inferredType = 'postal';
      confidence = 0.85;
      suggestedIdentifiers.push(col);
    } else if (isDateByName || (serialDateCount / total > 0.7 && !isIdByName)) {
      inferredType = 'date';
      confidence = 0.8;
    } else if (isIdByName || sciCount > 0 || (digitCount / total > 0.7 && isIdByName)) {
      inferredType = 'identifier';
      confidence = 0.85;
      suggestedIdentifiers.push(col);
    } else if (digitCount / total > 0.9) {
      inferredType = 'number';
      confidence = 0.8;
    }

    inferredColumns.push({
      name: col,
      inferredType,
      confidence,
      sampleBefore: values.slice(0, 3),
      sampleAfter: values.slice(0, 3),
    });

    // Suggest mapping to CRM rule pack fields
    let bestMatchField = '';
    for (const field of availableFields) {
      const fieldName = field.name.toLowerCase();
      const fieldLabel = (field.label || '').toLowerCase();

      // Direct exact match
      if (colLower === fieldName || colLower === fieldLabel.replace(/[^a-z0-9]/g, '_')) {
        bestMatchField = field.name;
        break;
      }
      // Common aliases
      if (
        (colLower === 'zip_code' || colLower === 'zipcode' || colLower === 'postal_code' || colLower === 'postal') &&
        (fieldName === 'zip' || fieldName === 'postal_code' || fieldName === 'mailingpostalcode')
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'employee_id' || colLower === 'empid' || colLower === 'staff_id') &&
        fieldName === 'employee_id'
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'account_number' || colLower === 'account_id' || colLower === 'acc_num') &&
        fieldName === 'account_number'
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'close_date' || colLower === 'closedate') &&
        fieldName === 'close_date'
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'hire_date' || colLower === 'hiredate' || colLower === 'hired_at') &&
        fieldName === 'hire_date'
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'first_name' || colLower === 'fname' || colLower === 'given_name') &&
        (fieldName === 'firstname' || fieldName === 'firstname')
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'last_name' || colLower === 'lname' || colLower === 'surname') &&
        (fieldName === 'lastname' || fieldName === 'lastname')
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'state' || colLower === 'province' || colLower === 'region') &&
        (fieldName === 'state' || fieldName === 'mailingstate')
      ) {
        bestMatchField = field.name;
        break;
      }
      if (
        (colLower === 'phone' || colLower === 'phone_number' || colLower === 'tel') &&
        (fieldName === 'phone' || fieldName === 'phonenumbers')
      ) {
        bestMatchField = field.name;
        break;
      }
    }

    if (bestMatchField) {
      suggestedMapping[col] = bestMatchField;
    }

    // Identify suggested dedupe key
    if (!suggestedDedupeKey) {
      if (colLower === 'account_number' || colLower === 'account_id') {
        suggestedDedupeKey = col;
      } else if (colLower === 'email' || colLower === 'mail') {
        suggestedDedupeKey = col;
      }
    }
  });

  return {
    inferredColumns,
    suggestedMapping,
    suggestedIdentifiers,
    suggestedDedupeKey,
  };
}
