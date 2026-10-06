export interface IAcDatagridSizeColumnsToFitOptions {
  defaultMinWidth?: number;
  defaultMaxWidth?: number;
  columnLimits?: Record<string, { minWidth?: number; maxWidth?: number }>;
}
