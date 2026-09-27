export interface IAcDatagridColumnState {
  field?: string;
  index?: number;
  width?: number;
  flexSize?: number;
  isVisible?: boolean;
  pinnedOn?: 'LEFT' | 'RIGHT';
  sortOrder?: any;
  sortPriority?: number;
}
