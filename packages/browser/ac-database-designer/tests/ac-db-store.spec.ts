import { describe, it, expect, beforeEach } from 'vitest';
import { AcDbStore } from '../src/lib/store/ac-db-store';
import { AcDbEventBus } from '../src/lib/store/ac-db-event-bus';
import { AcEnumDbColumnType } from '../src/lib/enums/ac-enum-db-column-type';

describe('AcDbStore', () => {
  let store: AcDbStore;
  let bus: AcDbEventBus;

  beforeEach(() => {
    bus = new AcDbEventBus();
    store = new AcDbStore(bus);
  });

  it('adds and retrieves a table', () => {
    const table = store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    expect(table.tableName).toBe('users');
    expect(store.getTable('t1')).toBeDefined();
    expect(store.getAllTables()).toHaveLength(1);
  });

  it('updates a table', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    const updated = store.updateTable('t1', { tableName: 'customers' });
    expect(updated?.tableName).toBe('customers');
    expect(store.getTable('t1')?.tableName).toBe('customers');
  });

  it('adds and retrieves columns in ordinal order', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'id', columnType: AcEnumDbColumnType.AutoIncrement, ordinalPosition: 0 } as any);
    store.addColumn({ columnId: 'c2', tableId: 't1', columnName: 'email', columnType: AcEnumDbColumnType.String, ordinalPosition: 1 } as any);
    const cols = store.getTableColumns('t1');
    expect(cols).toHaveLength(2);
    expect(cols[0].columnName).toBe('id');
    expect(cols[1].columnName).toBe('email');
  });

  it('cascade-deletes columns and relationships when table is deleted', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addTable({ tableId: 't2', schemaId: 's1', tableName: 'orders' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'id' } as any);
    store.addColumn({ columnId: 'c2', tableId: 't2', columnName: 'user_id' } as any);
    store.addRelationship({
      relationshipId: 'r1', schemaId: 's1', label: '', type: 'one-to-many' as any,
      fromTableId: 't2', fromColumnId: 'c2', toTableId: 't1', toColumnId: 'c1',
      onDelete: 'NO ACTION' as any, onUpdate: 'NO ACTION' as any,
    });
    expect(store.getAllRelationships()).toHaveLength(1);
    store.deleteTable('t1');
    expect(store.getTable('t1')).toBeUndefined();
    expect(store.getColumn('c1')).toBeUndefined();
    expect(store.getAllRelationships()).toHaveLength(0);
  });

  it('emits table:added event', () => {
    const events: string[] = [];
    bus.on('table:added', t => events.push(t.tableName));
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    expect(events).toContain('users');
  });

  it('emits table:deleted event', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    const deleted: string[] = [];
    bus.on('table:deleted', id => deleted.push(id));
    store.deleteTable('t1');
    expect(deleted).toContain('t1');
  });

  it('getColumnSnapshot returns only requested fields', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'email', columnType: AcEnumDbColumnType.String, nullable: false } as any);
    const snap = store.getColumnSnapshot('c1', ['columnName', 'nullable']);
    expect(snap.columnName).toBe('email');
    expect(snap.nullable).toBe(false);
    expect(Object.keys(snap)).toHaveLength(2);
  });

  it('clearSilent wipes all data without emitting events', () => {
    const events: string[] = [];
    bus.on('table:deleted', id => events.push(id));
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.clearSilent();
    expect(store.getAllTables()).toHaveLength(0);
    expect(events).toHaveLength(0); // no events on silent clear
  });

  it('addRelationship indexes both sides', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addTable({ tableId: 't2', schemaId: 's1', tableName: 'orders' });
    store.addRelationship({
      relationshipId: 'r1', schemaId: 's1', label: '', type: 'one-to-many' as any,
      fromTableId: 't2', fromColumnId: 'c2', toTableId: 't1', toColumnId: 'c1',
      onDelete: 'NO ACTION' as any, onUpdate: 'NO ACTION' as any,
    });
    expect(store.getTableRelationships('t1')).toHaveLength(1);
    expect(store.getTableRelationships('t2')).toHaveLength(1);
  });
});
