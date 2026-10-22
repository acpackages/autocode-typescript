export interface IAcDataRow {
  rowId: string;
  data: any;
  /**
   * Load-order position at creation time.
   * Optional: omitted in offline mode (where allRows insertion order is sufficient).
   * Set in ondemand mode to track the server-side page position.
   */
  originalIndex?: number;
  index: number;
  /**
   * Lazy storage for per-row extension data used by UI components (e.g. grid row state).
   * Optional: not allocated until first write. Consumers must use: (row.extensionData ??= {})['key'] = val
   */
  extensionData?: Record<string, any>;
  isPlaceholder?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}
