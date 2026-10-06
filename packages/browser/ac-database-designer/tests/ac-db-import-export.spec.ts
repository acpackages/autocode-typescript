import { describe, it, expect, beforeEach } from 'vitest';
import { AcDbStore } from '../src/lib/store/ac-db-store';
import { AcDbEventBus } from '../src/lib/store/ac-db-event-bus';
import { importFromJson } from '../src/lib/io/ac-db-import-json';
import { exportToJson } from '../src/lib/io/ac-db-export-json';

const sampleDD = {
  name: 'TestDB',
  version: 1,
  config: {
    insertTimestampColumnKey: 'created_at',
    updateTimestampColumnKey: 'updated_at',
    deleteTimestampColumnKey: '',
  },
  tables: {
    users: {
      tableName: 'users',
      tableColumns: {
        id: {
          columnName: 'id', columnType: 'AUTO_INCREMENT',
          columnProperties: {
            PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true },
            NOT_NULL:    { propertyName: 'NOT_NULL',    propertyValue: true },
          },
        },
        email: {
          columnName: 'email', columnType: 'STRING',
          columnProperties: {
            NOT_NULL:   { propertyName: 'NOT_NULL',   propertyValue: true },
            UNIQUE_KEY: { propertyName: 'UNIQUE_KEY', propertyValue: true },
            SIZE:       { propertyName: 'SIZE',       propertyValue: 255 },
          },
        },
      },
      tableProperties: {
        SINGULAR_NAME: { propertyName: 'SINGULAR_NAME', propertyValue: 'user' },
        PLURAL_NAME:   { propertyName: 'PLURAL_NAME',   propertyValue: 'users' },
      },
    },
    orders: {
      tableName: 'orders',
      tableColumns: {
        id:      { columnName: 'id',      columnType: 'AUTO_INCREMENT', columnProperties: { PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true } } },
        user_id: { columnName: 'user_id', columnType: 'INTEGER',        columnProperties: {} },
        total:   { columnName: 'total',   columnType: 'DOUBLE',         columnProperties: {} },
      },
      tableProperties: {},
    },
  },
  relationships: [
    {
      sourceTable: 'users', sourceColumn: 'id',
      destinationTable: 'orders', destinationColumn: 'user_id',
      cascadeDeleteDestination: true, cascadeDeleteSource: false,
    },
  ],
  views: {},
  triggers: {},
  storedProcedures: {},
  functions: {},
};

describe('Import/Export JSON round-trip', () => {
  let bus: AcDbEventBus;
  let store: AcDbStore;

  beforeEach(() => {
    bus = new AcDbEventBus();
    store = new AcDbStore(bus);
  });

  it('imports correct number of tables', () => {
    importFromJson(sampleDD, store);
    expect(store.getAllTables()).toHaveLength(2);
  });

  it('imports table metadata correctly', () => {
    importFromJson(sampleDD, store);
    const users = store.getAllTables().find(t => t.tableName === 'users');
    expect(users).toBeDefined();
    expect(users?.singularName).toBe('user');
    expect(users?.pluralName).toBe('users');
  });

  it('imports columns with correct properties', () => {
    importFromJson(sampleDD, store);
    const users = store.getAllTables().find(t => t.tableName === 'users')!;
    const cols = store.getTableColumns(users.tableId);
    expect(cols).toHaveLength(2);
    const id = cols.find(c => c.columnName === 'id');
    expect(id?.primaryKey).toBe(true);
    expect(id?.nullable).toBe(false);
    const email = cols.find(c => c.columnName === 'email');
    expect(email?.unique).toBe(true);
    expect(email?.length).toBe(255);
  });

  it('imports relationship correctly', () => {
    importFromJson(sampleDD, store);
    const rels = store.getAllRelationships();
    expect(rels).toHaveLength(1);
    const fromTable = store.getTable(rels[0].fromTableId);
    const toTable   = store.getTable(rels[0].toTableId);
    expect(fromTable?.tableName).toBe('orders');
    expect(toTable?.tableName).toBe('users');
  });

  it('exports schema name correctly', () => {
    const { schema } = importFromJson(sampleDD, store, 'sid');
    const out = exportToJson(schema, store);
    expect(out['name']).toBe('TestDB');
  });

  it('exports both tables', () => {
    const { schema } = importFromJson(sampleDD, store, 'sid');
    const out = exportToJson(schema, store);
    expect(Object.keys(out['tables'])).toContain('users');
    expect(Object.keys(out['tables'])).toContain('orders');
  });

  it('exports relationships array with one entry', () => {
    const { schema } = importFromJson(sampleDD, store, 'sid');
    const out = exportToJson(schema, store);
    expect(Array.isArray(out['relationships'])).toBe(true);
    expect(out['relationships']).toHaveLength(1);
  });

  it('round-trip preserves table count', () => {
    const { schema } = importFromJson(sampleDD, store, 'sid');
    const exported = exportToJson(schema, store);

    const store2 = new AcDbStore(new AcDbEventBus());
    importFromJson(exported, store2);
    expect(store2.getAllTables()).toHaveLength(2);
  });

  it('round-trip preserves relationship count', () => {
    const { schema } = importFromJson(sampleDD, store, 'sid');
    const exported = exportToJson(schema, store);

    const store2 = new AcDbStore(new AcDbEventBus());
    importFromJson(exported, store2);
    expect(store2.getAllRelationships()).toHaveLength(1);
  });

  it('produces no import warnings for valid JSON', () => {
    const { warnings } = importFromJson(sampleDD, store);
    expect(warnings).toHaveLength(0);
  });
});
