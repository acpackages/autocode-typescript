/**
 * Internal SQLite storage table/column name constants.
 * Mirrors the pattern from ac-dde-browser-storage.
 */
export const AC_DB_STORAGE_DD_NAME = 'ac_database_designer';

export class AcDbStorageTables {
  static readonly Schemas          = 'acd_schemas';
  static readonly Tables           = 'acd_tables';
  static readonly Columns          = 'acd_columns';
  static readonly Indexes          = 'acd_indexes';
  static readonly Relationships    = 'acd_relationships';
  static readonly Views            = 'acd_views';
  static readonly ViewColumns      = 'acd_view_columns';
  static readonly Triggers         = 'acd_triggers';
  static readonly StoredProcedures = 'acd_stored_procedures';
  static readonly Functions        = 'acd_functions';
  static readonly Layout           = 'acd_layout';
}
