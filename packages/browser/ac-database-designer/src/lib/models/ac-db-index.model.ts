import { AcEnumDbIndexType } from '../enums/ac-enum-db-index-type';

export interface AcDbIndex {
  indexId: string;
  tableId: string;
  indexName: string;
  unique: boolean;
  columnIds: string[];
  type: AcEnumDbIndexType;
}

export function createIndex(partial: Partial<AcDbIndex> & { indexId: string; tableId: string; indexName: string }): AcDbIndex {
  return {
    indexId: partial.indexId,
    tableId: partial.tableId,
    indexName: partial.indexName,
    unique: partial.unique ?? false,
    columnIds: partial.columnIds ?? [],
    type: partial.type ?? AcEnumDbIndexType.BTree,
  };
}
