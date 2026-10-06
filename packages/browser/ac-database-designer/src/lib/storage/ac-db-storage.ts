/**
 * Built-in SQLite browser storage for ac-database-designer.
 * Uses @autocode-ts/ac-sqlite-dao-browser — same approach as the legacy
 * AcDDEBrowserStorageExtension but embedded directly in the package.
 *
 * Provides:
 *  - init()             — initialise IndexedDB-backed SQLite database
 *  - saveSchema()       — upsert full schema (debounced internally)
 *  - loadSchema()       — load schema + all entities into the store
 *  - listSchemas()      — list saved schema summaries
 *  - deleteSchema()     — delete a schema and all its entities
 *  - downloadDatabase() — download raw SQLite file for debugging
 *
 * NOTE: This class only works in a browser environment (needs IndexedDB + WASM).
 * It is not instantiated in unit tests.
 */
import { AcDbStore } from '../store/ac-db-store';
import { AcDbEventBus } from '../store/ac-db-event-bus';
import { AcDbSchema } from '../models/ac-db-schema.model';
import { AcDbLayout } from '../models/ac-db-layout.model';
import { exportToJson } from '../io/ac-db-export-json';
import { importFromJson } from '../io/ac-db-import-json';
import { AcDbStorageTables, AC_DB_STORAGE_DD_NAME } from './ac-db-storage-tables';

// Dynamically imported to avoid SSR/node issues
type SqliteDao = {
  exec(sql: string, params?: unknown[]): unknown[];
  saveRow(tableName: string, row: Record<string, unknown>): Promise<{ isSuccess(): boolean }>;
  getRows(tableName: string, where?: string, params?: unknown[]): Promise<{ isSuccess(): boolean; rows: unknown[] }>;
  deleteRows(tableName: string, where: string, params: unknown[]): Promise<{ isSuccess(): boolean }>;
  downloadDatabaseFile?(): void;
};

export interface AcDbSchemaSummary {
  schemaId: string;
  schemaName: string;
  dialect: string;
  updatedAt: string;
  tableCount: number;
}

/**
 * Debounce helper — returns a function that delays execution by `ms`.
 * Cancels any pending call on each new invocation.
 */
function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; fn(...args); }, ms);
  };
}

export class AcDbStorage {
  private _initialized = false;
  private _dao: SqliteDao | null = null;

  // Two-tier debounced saves
  private _debouncedSaveData: ((schema: AcDbSchema, store: AcDbStore) => void);
  private _debouncedSaveLayout: ((schemaId: string, layout: AcDbLayout) => void);

  constructor(private readonly bus: AcDbEventBus) {
    this._debouncedSaveData   = debounce(this._doSaveSchema.bind(this), 1000);
    this._debouncedSaveLayout = debounce(this._doSaveLayout.bind(this),  300);
  }

  get isInitialized(): boolean { return this._initialized; }

  /**
   * Initialise the SQLite database via IndexedDB.
   * Must be called once before any other method.
   * Only works in a browser — returns false in Node/test environments.
   */
  async init(): Promise<boolean> {
    if (this._initialized) return true;
    try {
      // Dynamic imports so tree-shaking works in non-browser builds
      const { initSqliteBrowserDao, AcSqliteDao } = await import('@autocode-ts/ac-sqlite-dao-browser');
      const { AcDataDictionary }                  = await import('@autocode-ts/ac-data-dictionary');
      const { AcSqlConnection, AcSqlDatabase, AcSqlDbSchemaManager } = await import('@autocode-ts/ac-sql');
      const { AcEnumSqlDatabaseType }             = await import('@autocode-ts/autocode');

      initSqliteBrowserDao();
      AcDataDictionary.registerDataDictionary({
        jsonData: this._buildInternalDataDictionary(),
        dataDictionaryName: AC_DB_STORAGE_DD_NAME,
      });
      AcSqlDatabase.databaseType = AcEnumSqlDatabaseType.Sqlite;
      AcSqlDatabase.sqlConnection = AcSqlConnection.instanceFromJson({
        jsonData: { connectionDatabase: AC_DB_STORAGE_DD_NAME },
      });
      const mgr = new AcSqlDbSchemaManager({ dataDictionaryName: AC_DB_STORAGE_DD_NAME });
      mgr.logger.logMessages = false;
      const res = await mgr.initDatabase();
      if (res.isSuccess()) {
        this._dao = mgr.dao as unknown as SqliteDao;
        this._initialized = true;
      } else {
        console.error('[AcDbStorage] init failed', res);
      }
    } catch (e) {
      // Node/test environment — silently skip
      console.warn('[AcDbStorage] SQLite not available (non-browser env?)', e);
    }
    return this._initialized;
  }

  /** Debounced data save (1000ms). Call after every schema mutation. */
  scheduleSave(schema: AcDbSchema, store: AcDbStore): void {
    if (!this._initialized) return;
    this._debouncedSaveData(schema, store);
  }

  /** Debounced layout save (300ms). Call after canvas pan/zoom/drag. */
  scheduleLayoutSave(schemaId: string, layout: AcDbLayout): void {
    if (!this._initialized) return;
    this._debouncedSaveLayout(schemaId, layout);
  }

  /** Force-save immediately (e.g. Ctrl+S). */
  async saveSchema(schema: AcDbSchema, store: AcDbStore): Promise<void> {
    await this._doSaveSchema(schema, store);
  }

  async listSchemas(): Promise<AcDbSchemaSummary[]> {
    if (!this._initialized || !this._dao) return [];
    try {
      const res = await this._dao.getRows(AcDbStorageTables.Schemas);
      if (!res.isSuccess()) return [];
      return (res.rows as Record<string, string>[]).map(row => ({
        schemaId:   row['schema_id'],
        schemaName: row['schema_name'],
        dialect:    row['dialect'],
        updatedAt:  row['updated_at'],
        tableCount: Number(row['table_count'] ?? 0),
      }));
    } catch { return []; }
  }

  async loadSchema(schemaId: string, store: AcDbStore): Promise<AcDbSchema | null> {
    if (!this._initialized || !this._dao) return null;
    try {
      const res = await this._dao.getRows(AcDbStorageTables.Schemas, 'schema_id = ?', [schemaId]);
      if (!res.isSuccess() || !(res.rows as unknown[]).length) return null;
      const row = (res.rows as Record<string, string>[])[0];
      const jsonData = JSON.parse(row['json_data'] ?? '{}');
      const { schema } = importFromJson(jsonData, store, schemaId);
      return schema;
    } catch { return null; }
  }

  async deleteSchema(schemaId: string): Promise<void> {
    if (!this._initialized || !this._dao) return;
    await this._dao.deleteRows(AcDbStorageTables.Schemas, 'schema_id = ?', [schemaId]);
  }

  downloadDatabase(): void {
    if (this._dao && (this._dao as any).downloadDatabaseFile) {
      (this._dao as any).downloadDatabaseFile();
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async _doSaveSchema(schema: AcDbSchema, store: AcDbStore): Promise<void> {
    if (!this._initialized || !this._dao) return;
    try {
      const jsonData = exportToJson(schema, store);
      const tables = store.getAllTables();
      const row = {
        schema_id:   schema.schemaId,
        schema_name: schema.schemaName,
        dialect:     schema.dialect,
        updated_at:  new Date().toISOString(),
        table_count: tables.length,
        json_data:   JSON.stringify(jsonData),
      };
      await this._dao.saveRow(AcDbStorageTables.Schemas, row);
      this.bus.emit('storage:saved', undefined);
    } catch (e) {
      this.bus.emit('storage:error', String(e));
    }
  }

  private async _doSaveLayout(schemaId: string, layout: AcDbLayout): Promise<void> {
    if (!this._initialized || !this._dao) return;
    try {
      await this._dao.saveRow(AcDbStorageTables.Layout, {
        schema_id:   schemaId,
        layout_data: JSON.stringify(layout),
        updated_at:  new Date().toISOString(),
      });
    } catch { /* silent */ }
  }

  /**
   * Minimal internal data dictionary for the storage tables.
   * Uses plain JSON (not the AcDataDictionary class API).
   */
  private _buildInternalDataDictionary(): Record<string, unknown> {
    const col = (name: string, type: string, pk = false) => ({
      columnName: name,
      columnType: type,
      columnProperties: pk ? { PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true } } : {},
    });
    const table = (tableName: string, columns: Record<string, unknown>) => ({ tableName, tableColumns: columns, tableProperties: {} });

    return {
      name: AC_DB_STORAGE_DD_NAME,
      version: 1,
      tables: {
        [AcDbStorageTables.Schemas]: table(AcDbStorageTables.Schemas, {
          schema_id:   col('schema_id',   'UUID',    true),
          schema_name: col('schema_name', 'STRING'),
          dialect:     col('dialect',     'STRING'),
          updated_at:  col('updated_at',  'STRING'),
          table_count: col('table_count', 'INTEGER'),
          json_data:   col('json_data',   'TEXT'),
        }),
        [AcDbStorageTables.Layout]: table(AcDbStorageTables.Layout, {
          schema_id:   col('schema_id',   'UUID', true),
          layout_data: col('layout_data', 'TEXT'),
          updated_at:  col('updated_at',  'STRING'),
        }),
      },
      views: {}, relationships: [], triggers: {}, storedProcedures: {}, functions: {},
    };
  }
}
