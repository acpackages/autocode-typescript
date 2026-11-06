export interface IAcDatagridStateOptions {
  /** Save/restore column widths, positions, visibility and pinning (default: true) */
  includeColumns?: boolean;
  /** Save/restore column sort order (default: false) */
  includeSort?: boolean;
  /** Save/restore filter group (default: false) */
  includeFilter?: boolean;
  /** Save/restore pagination page and page size (default: false) */
  includePagination?: boolean;
  /** Save/restore extension states (default: false) */
  includeExtensionStates?: boolean;
  /** Save/restore groupBy fields (default: false) */
  includeGroupBy?: boolean;
  /** Save/restore pinned rows (default: false) */
  includePinnedRows?: boolean;
  /** Save/restore expanded row IDs (default: false) */
  includeExpandedRows?: boolean;
  /** Save/restore side panel open state (default: false) */
  includeSidePanel?: boolean;
  /** Save/restore search query (default: false) */
  includeSearchQuery?: boolean;
}
