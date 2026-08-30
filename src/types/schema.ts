export type RawRow = Record<string, string>;

export type Step = 'upload' | 'schema' | 'review' | 'validate' | 'export';

export type PlatformId = 'hubspot' | 'salesforce' | 'pipedrive' | 'attio';

export interface DeclaredSchema {
  platform: PlatformId;
  columnMap: Record<string, string>; // sourceCol -> targetField
  identifierColumns: string[]; // columns marked as keep exact format / identifier
  dedupeKey: string | null;
  requiredFields: Record<string, boolean>;
}

export type InferredType =
  | 'string'
  | 'number'
  | 'date'
  | 'identifier'
  | 'phone'
  | 'postal'
  | 'unknown';

export interface InferredColumn {
  name: string;
  inferredType: InferredType;
  confidence: number; // 0..1
  sampleBefore: string[];
  sampleAfter: string[];
}

export type CoercionIssue =
  | 'leading_zero_stripped'
  | 'date_coercion'
  | 'scientific_notation'
  | 'type_mismatch';

export interface CoercionFlag {
  column: string;
  rowIndex: number;
  issue: CoercionIssue;
  original: string;
  repaired: string;
  isUnrecoverable?: boolean;
  explanation?: string;
}

export interface ColumnDiffGroup {
  column: string;
  mappedField?: string;
  totalRepaired: number;
  hasUnrecoverable: boolean;
  status: 'accepted' | 'rejected';
  flags: CoercionFlag[];
}

export interface ValidationIssue {
  rowIndex: number;
  column: string;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationReport {
  totalRows: number;
  passCount: number;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
}

export interface RulePackField {
  name: string;
  label: string;
  required: boolean;
  type: string;
  format?: 'phone' | 'postal' | 'date' | 'email' | 'picklist' | 'text' | 'number';
  picklist?: string[];
  description?: string;
}

export interface RulePack {
  platform: string;
  object: string; // e.g. 'contacts' or 'companies'
  fields: RulePackField[];
  version: string;
  lastUpdated: string;
  sourceUrls: string[];
}

export interface AppState {
  step: Step;
  rawFile: File | null;
  fileName: string;
  fileSize: number;
  parsedRows: RawRow[];
  headers: string[];
  declaredSchema: DeclaredSchema;
  inferredSchema: InferredColumn[];
  columnDiffs: Record<string, ColumnDiffGroup>;
  repairedRows: RawRow[];
  coercionFlags: CoercionFlag[];
  validationReport: ValidationReport | null;
}
