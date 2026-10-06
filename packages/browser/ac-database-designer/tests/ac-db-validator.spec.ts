import { describe, it, expect, beforeEach } from 'vitest';
import { AcDbStore } from '../src/lib/store/ac-db-store';
import { AcDbEventBus } from '../src/lib/store/ac-db-event-bus';
import { AcDbValidator } from '../src/lib/validation/ac-db-validator';
import { AcEnumDbColumnType } from '../src/lib/enums/ac-enum-db-column-type';

describe('AcDbValidator', () => {
  let bus: AcDbEventBus;
  let store: AcDbStore;
  let validator: AcDbValidator;

  beforeEach(() => {
    bus = new AcDbEventBus();
    store = new AcDbStore(bus);
    validator = new AcDbValidator(store, bus);
  });

  it('no issues for a valid schema', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'id',
      columnType: AcEnumDbColumnType.AutoIncrement, primaryKey: true, nullable: false } as any);
    const issues = validator.validate();
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  it('warning for table with no primary key', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'name',
      columnType: AcEnumDbColumnType.String, primaryKey: false } as any);
    const issues = validator.validate();
    expect(issues.some(i => i.id.startsWith('no-pk'))).toBe(true);
  });

  it('error for duplicate table name', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addTable({ tableId: 't2', schemaId: 's1', tableName: 'users' }); // duplicate
    const issues = validator.validate();
    expect(issues.some(i => i.id.startsWith('dup-table'))).toBe(true);
    expect(issues.find(i => i.id.startsWith('dup-table'))?.severity).toBe('error');
  });

  it('error for duplicate column name in same table', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'users' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'email', columnType: AcEnumDbColumnType.String } as any);
    store.addColumn({ columnId: 'c2', tableId: 't1', columnName: 'email', columnType: AcEnumDbColumnType.String } as any);
    const issues = validator.validate();
    expect(issues.some(i => i.id.startsWith('dup-col'))).toBe(true);
  });

  it('warning for reserved SQL keyword as table name', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'select' });
    const issues = validator.validate();
    expect(issues.some(i => i.id.startsWith('reserved-tbl'))).toBe(true);
  });

  it('warning for reserved SQL keyword as column name', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'products' });
    store.addColumn({ columnId: 'c1', tableId: 't1', columnName: 'order', columnType: AcEnumDbColumnType.String } as any);
    const issues = validator.validate();
    expect(issues.some(i => i.id.startsWith('reserved-col'))).toBe(true);
  });

  it('error for broken FK (non-existent to-table)', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'orders' });
    store.addRelationship({
      relationshipId: 'r1', schemaId: 's1', label: '', type: 'one-to-many' as any,
      fromTableId: 't1', fromColumnId: 'c1',
      toTableId: 'nonexistent', toColumnId: 'c_none',
      onDelete: 'NO ACTION' as any, onUpdate: 'NO ACTION' as any,
    });
    const issues = validator.validate();
    expect(issues.some(i => i.severity === 'error' && i.relationshipId === 'r1')).toBe(true);
  });

  it('warning for table with no columns', () => {
    store.addTable({ tableId: 't1', schemaId: 's1', tableName: 'empty_table' });
    const issues = validator.validate();
    expect(issues.some(i => i.id.startsWith('no-cols'))).toBe(true);
  });

  it('empty store produces no issues', () => {
    const issues = validator.validate();
    expect(issues).toHaveLength(0);
  });
});
