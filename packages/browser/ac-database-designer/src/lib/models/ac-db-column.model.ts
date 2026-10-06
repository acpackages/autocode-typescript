import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';

export interface AcDbColumn {
  columnId: string;
  tableId: string;
  columnName: string;
  columnType: AcEnumDbColumnType;
  customType: string;
  length: number | null;
  precision: number | null;
  scale: number | null;
  primaryKey: boolean;
  autoIncrement: boolean;
  autoIndex: boolean;
  nullable: boolean;
  unique: boolean;
  defaultValue: string | null;
  description: string;
  tags: string[];
  ordinalPosition: number;
  foreignKeyTableId: string | null;
  foreignKeyColumnId: string | null;
  /** Values for ENUM column type (e.g. ['active','inactive']) */
  enumValues: string[];
}

export function createColumn(partial: Partial<AcDbColumn> & { columnId: string; tableId: string; columnName: string }): AcDbColumn {
  return {
    columnId: partial.columnId,
    tableId: partial.tableId,
    columnName: partial.columnName,
    columnType: partial.columnType ?? AcEnumDbColumnType.String,
    customType: partial.customType ?? '',
    length: partial.length ?? null,
    precision: partial.precision ?? null,
    scale: partial.scale ?? null,
    primaryKey: partial.primaryKey ?? false,
    autoIncrement: partial.autoIncrement ?? false,
    autoIndex: partial.autoIndex ?? false,
    nullable: partial.nullable ?? true,
    unique: partial.unique ?? false,
    defaultValue: partial.defaultValue ?? null,
    description: partial.description ?? '',
    tags: partial.tags ?? [],
    ordinalPosition: partial.ordinalPosition ?? 0,
    foreignKeyTableId: partial.foreignKeyTableId ?? null,
    foreignKeyColumnId: partial.foreignKeyColumnId ?? null,
    enumValues: partial.enumValues ?? [],
  };
}
