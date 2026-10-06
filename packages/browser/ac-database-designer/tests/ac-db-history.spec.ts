import { describe, it, expect, beforeEach } from 'vitest';
import { AcDbStore } from '../src/lib/store/ac-db-store';
import { AcDbEventBus } from '../src/lib/store/ac-db-event-bus';
import { AcDbHistory } from '../src/lib/store/ac-db-history';
import { AddTableCommand } from '../src/lib/store/commands/add-table.command';
import { DeleteTableCommand } from '../src/lib/store/commands/delete-table.command';
import { UpdateTableCommand } from '../src/lib/store/commands/update-table.command';
import { AddColumnCommand } from '../src/lib/store/commands/add-column.command';
import { AcEnumDbColumnType } from '../src/lib/enums/ac-enum-db-column-type';

describe('AcDbHistory', () => {
  let bus: AcDbEventBus;
  let store: AcDbStore;
  let history: AcDbHistory;

  beforeEach(() => {
    bus = new AcDbEventBus();
    store = new AcDbStore(bus);
    history = new AcDbHistory(store, bus);
  });

  it('executes a command and can undo it', () => {
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'users' }));
    expect(store.getAllTables()).toHaveLength(1);
    history.undo();
    expect(store.getAllTables()).toHaveLength(0);
  });

  it('redo re-applies an undone command', () => {
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'users' }));
    history.undo();
    history.redo();
    expect(store.getAllTables()).toHaveLength(1);
  });

  it('redo branch is discarded after new command', () => {
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'users' }));
    history.undo();
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'products' }));
    expect(history.canRedo).toBe(false);
    expect(store.getAllTables()[0].tableName).toBe('products');
  });

  it('UpdateTableCommand uses minimal diff — only changed fields for undo', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    history.execute(new UpdateTableCommand('t1', { tableName: 'customers' }, 'Rename table'));
    expect(store.getTable('t1')?.tableName).toBe('customers');
    history.undo();
    expect(store.getTable('t1')?.tableName).toBe('users');
  });

  it('DeleteTableCommand restores table on undo', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    history.execute(new DeleteTableCommand('t1', 'users'));
    expect(store.getTable('t1')).toBeUndefined();
    history.undo();
    expect(store.getTable('t1')).toBeDefined();
    expect(store.getTable('t1')?.tableName).toBe('users');
  });

  it('DeleteTableCommand restores columns on undo', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'id', columnType: AcEnumDbColumnType.AutoIncrement, ordinalPosition: 0 } as any);
    history.execute(new DeleteTableCommand('t1', 'users'));
    expect(store.getColumn('c1')).toBeUndefined();
    history.undo();
    expect(store.getColumn('c1')).toBeDefined();
  });

  it('canUndo and canRedo state is correct', () => {
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'a' }));
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
    history.undo();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);
  });

  it('emits history:changed events on execute/undo/redo', () => {
    const events: boolean[] = [];
    bus.on('history:changed', e => events.push(e.canUndo));
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'x' }));
    history.undo();
    history.redo();
    expect(events).toEqual([true, false, true]);
  });

  it('AddColumnCommand undo removes column', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    history.execute(new AddColumnCommand({ tableId: 't1', columnName: 'email', columnType: AcEnumDbColumnType.String } as any));
    expect(store.getTableColumns('t1')).toHaveLength(1);
    history.undo();
    expect(store.getTableColumns('t1')).toHaveLength(0);
  });

  it('getSummary returns correct labels', () => {
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'users' }));
    history.execute(new AddTableCommand({ schemaId: 's1', tableName: 'orders' }));
    const summary = history.getSummary();
    expect(summary).toHaveLength(2);
    expect(summary[0].label).toBe('Add table "users"');
    expect(summary[1].isCurrent).toBe(true);
  });
});
