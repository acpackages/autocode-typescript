import { IAcDatagridColumnState } from "./ac-datagrid-column-state.interface";

export interface IAcDatagridState {
  version?: number;
  columns?: IAcDatagridColumnState[];
  extensionStates?: Record<string, any>;
  pagination?: any;
  sortOrder?: any;
  groupBy?: string[];
  filterGroup?: any;
  searchQuery?: string;
  pinnedRows?: {
    top?: string[];
    bottom?: string[];
  };
  expandedRowIds?: string[];
  sidePanelOpen?: boolean;
}
