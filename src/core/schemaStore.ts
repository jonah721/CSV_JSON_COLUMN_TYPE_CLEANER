import { DeclaredSchema } from '../types/schema';

const STORAGE_KEY_PREFIX = 'csv_cleaner_schema_';

export function getColumnSignature(columns: string[]): string {
  return [...columns].sort().join(',');
}

export function saveSchemaToStorage(platform: string, columns: string[], schema: DeclaredSchema): void {
  try {
    const signature = getColumnSignature(columns);
    const key = `${STORAGE_KEY_PREFIX}${platform}_${signature}`;
    localStorage.setItem(key, JSON.stringify(schema));
    // Also save as last used for this platform
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${platform}_last`, JSON.stringify(schema));
  } catch (err) {
    console.warn('Failed to save schema to localStorage:', err);
  }
}

export function loadSchemaFromStorage(platform: string, columns: string[]): DeclaredSchema | null {
  try {
    const signature = getColumnSignature(columns);
    const specificKey = `${STORAGE_KEY_PREFIX}${platform}_${signature}`;
    const specificData = localStorage.getItem(specificKey);
    if (specificData) {
      return JSON.parse(specificData) as DeclaredSchema;
    }

    const lastKey = `${STORAGE_KEY_PREFIX}${platform}_last`;
    const lastData = localStorage.getItem(lastKey);
    if (lastData) {
      return JSON.parse(lastData) as DeclaredSchema;
    }
  } catch (err) {
    console.warn('Failed to load schema from localStorage:', err);
  }
  return null;
}
