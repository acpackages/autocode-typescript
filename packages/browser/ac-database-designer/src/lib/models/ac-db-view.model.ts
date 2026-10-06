export interface AcDbView {
  viewId: string;
  schemaId: string;
  viewName: string;
  viewQuery: string;
  description: string;
}

export interface AcDbViewColumn {
  viewColumnId: string;
  viewId: string;
  columnName: string;
  columnSource: string;
  columnSourceName: string;
  columnType: string;
  description: string;
}
