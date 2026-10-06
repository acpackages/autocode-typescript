export type AcDbValidationSeverity = 'error' | 'warning' | 'info';

export interface AcDbValidationIssue {
  id: string;
  severity: AcDbValidationSeverity;
  message: string;
  tableId?: string;
  columnId?: string;
  relationshipId?: string;
  indexId?: string;
}
