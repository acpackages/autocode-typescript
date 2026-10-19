export interface IAcDatagridAutoSaveRowData {
  status: 'NOT_CHANGED' | 'CHANGED' | 'SAVING' | 'SAVED' | 'ERROR';
  lastChangeTime?: Date;
  isSaving?: boolean;
  pendingDirtyKeys?: Set<string>;
  inFlightKeys?: Set<string>;
}
