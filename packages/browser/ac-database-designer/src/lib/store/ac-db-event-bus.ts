import type { AcDbSchema } from '../models/ac-db-schema.model';
import type { AcDbTable } from '../models/ac-db-table.model';
import type { AcDbColumn } from '../models/ac-db-column.model';
import type { AcDbRelationship } from '../models/ac-db-relationship.model';
import type { AcDbLayout } from '../models/ac-db-layout.model';
import type { AcDbValidationIssue } from '../models/ac-db-validation.model';

export interface AcDbEventMap {
  'table:added':         AcDbTable;
  'table:updated':       AcDbTable;
  'table:deleted':       string;          // tableId
  'column:added':        AcDbColumn;
  'column:updated':      AcDbColumn;
  'column:deleted':      { columnId: string; tableId: string };
  'relationship:added':  AcDbRelationship;
  'relationship:deleted': string;         // relationshipId
  'layout:changed':      AcDbLayout;
  'schema:changed':      AcDbSchema;
  'schema:loaded':       AcDbSchema;
  'validation:updated':  AcDbValidationIssue[];
  'history:changed':     { canUndo: boolean; canRedo: boolean; label: string };
  'storage:saved':       void;
  'storage:error':       string;
}

type Listener<T> = (data: T) => void;

export class AcDbEventBus {
  private _listeners = new Map<string, Set<Listener<unknown>>>();

  on<K extends keyof AcDbEventMap>(event: K, fn: Listener<AcDbEventMap[K]>): void {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event)!.add(fn as Listener<unknown>);
  }

  off<K extends keyof AcDbEventMap>(event: K, fn: Listener<AcDbEventMap[K]>): void {
    this._listeners.get(event)?.delete(fn as Listener<unknown>);
  }

  emit<K extends keyof AcDbEventMap>(event: K, data: AcDbEventMap[K]): void {
    this._listeners.get(event)?.forEach(fn => fn(data));
  }

  clear(): void {
    this._listeners.clear();
  }
}
