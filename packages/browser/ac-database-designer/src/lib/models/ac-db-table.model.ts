export interface AcDbTable {
  tableId: string;
  schemaId: string;
  tableName: string;
  singularName: string;
  pluralName: string;
  description: string;
  tags: string[];
  color: string | null;
  /** CHECK constraint expressions (e.g. "price > 0", "status IN ('active','inactive')") */
  checks: string[];
}

export function createTable(partial: Partial<AcDbTable> & { tableId: string; schemaId: string; tableName: string }): AcDbTable {
  return {
    tableId: partial.tableId,
    schemaId: partial.schemaId,
    tableName: partial.tableName,
    singularName: partial.singularName ?? partial.tableName,
    pluralName: partial.pluralName ?? partial.tableName,
    description: partial.description ?? '',
    tags: partial.tags ?? [],
    color: partial.color ?? null,
    checks: partial.checks ?? [],
  };
}
