import { AcDbTable, createTable } from '../models/ac-db-table.model';
import { AcDbColumn, createColumn } from '../models/ac-db-column.model';
import { AcDbIndex, createIndex } from '../models/ac-db-index.model';
import { AcDbRelationship, createRelationship } from '../models/ac-db-relationship.model';
import { AcDbView, AcDbViewColumn } from '../models/ac-db-view.model';
import { AcDbTrigger } from '../models/ac-db-trigger.model';
import { AcDbStoredProcedure } from '../models/ac-db-stored-procedure.model';
import { AcDbFunction } from '../models/ac-db-function.model';
import { AcDbNote, createNote } from '../models/ac-db-note.model';
import { AcDbArea, createArea } from '../models/ac-db-area.model';
import { AcDbEventBus } from './ac-db-event-bus';

/**
 * O(1) indexed in-memory store.
 * Plain Maps — no Proxy, no decorators, no reactive wrappers.
 * All writes fire typed events via AcDbEventBus.
 */
export class AcDbStore {
  // ── Primary maps ──────────────────────────────────────────────────────────
  private _tables           = new Map<string, AcDbTable>();
  private _columns          = new Map<string, AcDbColumn>();
  private _indexes          = new Map<string, AcDbIndex>();
  private _relationships    = new Map<string, AcDbRelationship>();
  private _views            = new Map<string, AcDbView>();
  private _viewColumns      = new Map<string, AcDbViewColumn>();
  private _triggers         = new Map<string, AcDbTrigger>();
  private _storedProcedures = new Map<string, AcDbStoredProcedure>();
  private _functions        = new Map<string, AcDbFunction>();
  private _notes            = new Map<string, AcDbNote>();
  private _areas            = new Map<string, AcDbArea>();

  // ── Secondary indexes (O(1) child lookups) ────────────────────────────────
  private _colsByTable  = new Map<string, Set<string>>();  // tableId → columnId[]
  private _idxByTable   = new Map<string, Set<string>>();  // tableId → indexId[]
  private _relsByTable  = new Map<string, Set<string>>();  // tableId → relId[] (both sides)
  private _trigByTable  = new Map<string, Set<string>>();  // tableId → triggerId[]
  private _vcByView     = new Map<string, Set<string>>();  // viewId  → viewColumnId[]

  constructor(private readonly bus: AcDbEventBus) {}

  // ── TABLES ─────────────────────────────────────────────────────────────────

  addTable(partial: Parameters<typeof createTable>[0]): AcDbTable {
    const table = createTable(partial);
    this._tables.set(table.tableId, table);
    this._colsByTable.set(table.tableId, new Set());
    this._idxByTable.set(table.tableId, new Set());
    this._relsByTable.set(table.tableId, new Set());
    this._trigByTable.set(table.tableId, new Set());
    this.bus.emit('table:added', table);
    return table;
  }

  updateTable(tableId: string, patch: Partial<AcDbTable>): AcDbTable | undefined {
    const existing = this._tables.get(tableId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, tableId };
    this._tables.set(tableId, updated);
    this.bus.emit('table:updated', updated);
    return updated;
  }

  /** Cascade-deletes all columns, indexes, triggers, and relationships for this table. */
  deleteTable(tableId: string, silent = false): boolean {
    if (!this._tables.has(tableId)) return false;
    // Cascade: columns
    for (const colId of this._colsByTable.get(tableId) ?? []) {
      this._columns.delete(colId);
    }
    this._colsByTable.delete(tableId);
    // Cascade: indexes
    for (const idxId of this._idxByTable.get(tableId) ?? []) {
      this._indexes.delete(idxId);
    }
    this._idxByTable.delete(tableId);
    // Cascade: triggers
    for (const trgId of this._trigByTable.get(tableId) ?? []) {
      this._triggers.delete(trgId);
    }
    this._trigByTable.delete(tableId);
    // Cascade: relationships (both sides)
    for (const relId of this._relsByTable.get(tableId) ?? []) {
      const rel = this._relationships.get(relId);
      if (rel) {
        const otherId = rel.fromTableId === tableId ? rel.toTableId : rel.fromTableId;
        this._relsByTable.get(otherId)?.delete(relId);
      }
      this._relationships.delete(relId);
    }
    this._relsByTable.delete(tableId);
    this._tables.delete(tableId);
    if (!silent) this.bus.emit('table:deleted', tableId);
    return true;
  }

  getTable(tableId: string): AcDbTable | undefined {
    return this._tables.get(tableId);
  }

  getAllTables(): AcDbTable[] {
    return Array.from(this._tables.values());
  }

  // ── COLUMNS ────────────────────────────────────────────────────────────────

  addColumn(partial: Parameters<typeof createColumn>[0]): AcDbColumn {
    const column = createColumn(partial);
    this._columns.set(column.columnId, column);
    if (!this._colsByTable.has(column.tableId)) {
      this._colsByTable.set(column.tableId, new Set());
    }
    this._colsByTable.get(column.tableId)!.add(column.columnId);
    this.bus.emit('column:added', column);
    return column;
  }

  updateColumn(columnId: string, patch: Partial<AcDbColumn>): AcDbColumn | undefined {
    const existing = this._columns.get(columnId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, columnId };
    this._columns.set(columnId, updated);
    this.bus.emit('column:updated', updated);
    return updated;
  }

  deleteColumn(columnId: string): boolean {
    const col = this._columns.get(columnId);
    if (!col) return false;
    this._colsByTable.get(col.tableId)?.delete(columnId);
    this._columns.delete(columnId);
    this.bus.emit('column:deleted', { columnId, tableId: col.tableId });
    return true;
  }

  getColumn(columnId: string): AcDbColumn | undefined {
    return this._columns.get(columnId);
  }

  getTableColumns(tableId: string): AcDbColumn[] {
    const ids = this._colsByTable.get(tableId);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this._columns.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.ordinalPosition - b.ordinalPosition);
  }

  /** Move column to a new ordinal position within its table. */
  reorderColumn(columnId: string, newPosition: number): void {
    const col = this._columns.get(columnId);
    if (!col) return;
    const cols = this.getTableColumns(col.tableId);
    const oldIdx = cols.findIndex(c => c.columnId === columnId);
    if (oldIdx < 0) return;
    // Remove and re-insert
    cols.splice(oldIdx, 1);
    const insertIdx = Math.max(0, Math.min(cols.length, newPosition));
    cols.splice(insertIdx, 0, col);
    // Update ordinals
    cols.forEach((c, i) => {
      const existing = this._columns.get(c.columnId);
      if (existing) existing.ordinalPosition = i;
    });
  }

  /** Returns a snapshot of specific fields of a column (used by EditColumnCommand for undo). */
  getColumnSnapshot(columnId: string, fields: (keyof AcDbColumn)[]): Partial<AcDbColumn> {
    const col = this._columns.get(columnId);
    if (!col) return {};
    const snap: Partial<AcDbColumn> = {};
    for (const f of fields) {
      (snap as Record<string, unknown>)[f] = (col as Record<string, unknown>)[f];
    }
    return snap;
  }

  // ── INDEXES ────────────────────────────────────────────────────────────────

  addIndex(partial: Parameters<typeof createIndex>[0]): AcDbIndex {
    const index = createIndex(partial);
    this._indexes.set(index.indexId, index);
    if (!this._idxByTable.has(index.tableId)) {
      this._idxByTable.set(index.tableId, new Set());
    }
    this._idxByTable.get(index.tableId)!.add(index.indexId);
    return index;
  }

  updateIndex(indexId: string, patch: Partial<AcDbIndex>): AcDbIndex | undefined {
    const existing = this._indexes.get(indexId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, indexId };
    this._indexes.set(indexId, updated);
    return updated;
  }

  deleteIndex(indexId: string): boolean {
    const idx = this._indexes.get(indexId);
    if (!idx) return false;
    this._idxByTable.get(idx.tableId)?.delete(indexId);
    this._indexes.delete(indexId);
    return true;
  }

  getTableIndexes(tableId: string): AcDbIndex[] {
    const ids = this._idxByTable.get(tableId);
    if (!ids) return [];
    return Array.from(ids).map(id => this._indexes.get(id)!).filter(Boolean);
  }

  // ── RELATIONSHIPS ──────────────────────────────────────────────────────────

  addRelationship(partial: Parameters<typeof createRelationship>[0]): AcDbRelationship {
    const rel = createRelationship(partial);
    this._relationships.set(rel.relationshipId, rel);
    if (!this._relsByTable.has(rel.fromTableId)) this._relsByTable.set(rel.fromTableId, new Set());
    if (!this._relsByTable.has(rel.toTableId))   this._relsByTable.set(rel.toTableId,   new Set());
    this._relsByTable.get(rel.fromTableId)!.add(rel.relationshipId);
    this._relsByTable.get(rel.toTableId)!.add(rel.relationshipId);
    this.bus.emit('relationship:added', rel);
    return rel;
  }

  updateRelationship(relId: string, patch: Partial<AcDbRelationship>): AcDbRelationship | undefined {
    const existing = this._relationships.get(relId);
    if (!existing) return undefined;
    // If FK endpoints changed, re-index
    if (patch.fromTableId && patch.fromTableId !== existing.fromTableId) {
      this._relsByTable.get(existing.fromTableId)?.delete(relId);
      if (!this._relsByTable.has(patch.fromTableId)) this._relsByTable.set(patch.fromTableId, new Set());
      this._relsByTable.get(patch.fromTableId)!.add(relId);
    }
    if (patch.toTableId && patch.toTableId !== existing.toTableId) {
      this._relsByTable.get(existing.toTableId)?.delete(relId);
      if (!this._relsByTable.has(patch.toTableId)) this._relsByTable.set(patch.toTableId, new Set());
      this._relsByTable.get(patch.toTableId)!.add(relId);
    }
    const updated = { ...existing, ...patch, relationshipId: relId };
    this._relationships.set(relId, updated);
    return updated;
  }

  deleteRelationship(relId: string): boolean {
    const rel = this._relationships.get(relId);
    if (!rel) return false;
    this._relsByTable.get(rel.fromTableId)?.delete(relId);
    this._relsByTable.get(rel.toTableId)?.delete(relId);
    this._relationships.delete(relId);
    this.bus.emit('relationship:deleted', relId);
    return true;
  }

  getRelationship(relId: string): AcDbRelationship | undefined {
    return this._relationships.get(relId);
  }

  getAllRelationships(): AcDbRelationship[] {
    return Array.from(this._relationships.values());
  }

  getTableRelationships(tableId: string): AcDbRelationship[] {
    const ids = this._relsByTable.get(tableId);
    if (!ids) return [];
    return Array.from(ids).map(id => this._relationships.get(id)!).filter(Boolean);
  }

  // ── VIEWS ──────────────────────────────────────────────────────────────────

  addView(view: AcDbView): void {
    this._views.set(view.viewId, view);
    this._vcByView.set(view.viewId, new Set());
  }

  updateView(viewId: string, patch: Partial<AcDbView>): AcDbView | undefined {
    const existing = this._views.get(viewId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, viewId };
    this._views.set(viewId, updated);
    return updated;
  }

  deleteView(viewId: string): boolean {
    if (!this._views.has(viewId)) return false;
    for (const vcId of this._vcByView.get(viewId) ?? []) this._viewColumns.delete(vcId);
    this._vcByView.delete(viewId);
    this._views.delete(viewId);
    return true;
  }

  getAllViews(): AcDbView[] {
    return Array.from(this._views.values());
  }

  addViewColumn(vc: AcDbViewColumn): void {
    this._viewColumns.set(vc.viewColumnId, vc);
    if (!this._vcByView.has(vc.viewId)) this._vcByView.set(vc.viewId, new Set());
    this._vcByView.get(vc.viewId)!.add(vc.viewColumnId);
  }

  getViewColumns(viewId: string): AcDbViewColumn[] {
    const ids = this._vcByView.get(viewId);
    if (!ids) return [];
    return Array.from(ids).map(id => this._viewColumns.get(id)!).filter(Boolean);
  }

  // ── TRIGGERS ───────────────────────────────────────────────────────────────

  addTrigger(trigger: AcDbTrigger): void {
    this._triggers.set(trigger.triggerId, trigger);
    if (!this._trigByTable.has(trigger.tableId)) this._trigByTable.set(trigger.tableId, new Set());
    this._trigByTable.get(trigger.tableId)!.add(trigger.triggerId);
  }

  updateTrigger(triggerId: string, patch: Partial<AcDbTrigger>): AcDbTrigger | undefined {
    const existing = this._triggers.get(triggerId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, triggerId };
    this._triggers.set(triggerId, updated);
    return updated;
  }

  deleteTrigger(triggerId: string): boolean {
    const trg = this._triggers.get(triggerId);
    if (!trg) return false;
    this._trigByTable.get(trg.tableId)?.delete(triggerId);
    this._triggers.delete(triggerId);
    return true;
  }

  getAllTriggers(): AcDbTrigger[] { return Array.from(this._triggers.values()); }
  getTableTriggers(tableId: string): AcDbTrigger[] {
    const ids = this._trigByTable.get(tableId);
    if (!ids) return [];
    return Array.from(ids).map(id => this._triggers.get(id)!).filter(Boolean);
  }

  // ── STORED PROCEDURES ─────────────────────────────────────────────────────

  addStoredProcedure(sp: AcDbStoredProcedure): void { this._storedProcedures.set(sp.spId, sp); }
  updateStoredProcedure(spId: string, patch: Partial<AcDbStoredProcedure>): AcDbStoredProcedure | undefined {
    const existing = this._storedProcedures.get(spId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, spId };
    this._storedProcedures.set(spId, updated);
    return updated;
  }
  deleteStoredProcedure(spId: string): boolean {
    return this._storedProcedures.delete(spId);
  }
  getAllStoredProcedures(): AcDbStoredProcedure[] { return Array.from(this._storedProcedures.values()); }

  // ── FUNCTIONS ──────────────────────────────────────────────────────────────

  addFunction(fn: AcDbFunction): void { this._functions.set(fn.functionId, fn); }
  updateFunction(fnId: string, patch: Partial<AcDbFunction>): AcDbFunction | undefined {
    const existing = this._functions.get(fnId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, functionId: fnId };
    this._functions.set(fnId, updated);
    return updated;
  }
  deleteFunction(fnId: string): boolean { return this._functions.delete(fnId); }
  getAllFunctions(): AcDbFunction[] { return Array.from(this._functions.values()); }

  // ── NOTES ──────────────────────────────────────────────────────────────────

  addNote(partial: Partial<AcDbNote> & { noteId: string }): AcDbNote {
    const note = createNote(partial);
    this._notes.set(note.noteId, note);
    return note;
  }
  getNote(noteId: string): AcDbNote | undefined { return this._notes.get(noteId); }
  updateNote(noteId: string, patch: Partial<AcDbNote>): AcDbNote | undefined {
    const existing = this._notes.get(noteId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, noteId };
    this._notes.set(noteId, updated);
    return updated;
  }
  deleteNote(noteId: string): boolean { return this._notes.delete(noteId); }
  getAllNotes(): AcDbNote[] { return Array.from(this._notes.values()); }

  // ── AREAS ──────────────────────────────────────────────────────────────────
  addArea(partial: Partial<AcDbArea> & { areaId: string }): AcDbArea {
    const area = createArea(partial);
    this._areas.set(area.areaId, area);
    return area;
  }
  getArea(areaId: string): AcDbArea | undefined { return this._areas.get(areaId); }
  updateArea(areaId: string, changes: Partial<AcDbArea>): void {
    const existing = this._areas.get(areaId);
    if (!existing) return;
    const updated = { ...existing, ...changes, areaId };
    this._areas.set(areaId, updated);
  }
  deleteArea(areaId: string): boolean { return this._areas.delete(areaId); }
  getAllAreas(): AcDbArea[] { return Array.from(this._areas.values()); }

  // ── CLEAR ──────────────────────────────────────────────────────────────────

  /** Wipes all data without firing events. Used for bulk load. */
  clearSilent(): void {
    this._tables.clear();
    this._columns.clear();
    this._indexes.clear();
    this._relationships.clear();
    this._views.clear();
    this._viewColumns.clear();
    this._triggers.clear();
    this._storedProcedures.clear();
    this._functions.clear();
    this._notes.clear();
    this._areas.clear();
    this._colsByTable.clear();
    this._idxByTable.clear();
    this._relsByTable.clear();
    this._trigByTable.clear();
    this._vcByView.clear();
  }
}
