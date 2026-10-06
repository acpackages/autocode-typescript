/**
 * <ac-db-canvas> — The canvas host element.
 * Owns: viewport, drag manager, selection manager, connection manager.
 * Renders table cards + SVG overlay for relationships.
 * One delegated pointer listener on the canvas — not one per card/socket.
 */
import { AcDbStore } from '../store/ac-db-store';
import { AcDbEventBus } from '../store/ac-db-event-bus';
import { AcDbHistory } from '../store/ac-db-history';
import { AcDbSchema } from '../models/ac-db-schema.model';
import { AcDbLayout } from '../models/ac-db-layout.model';
import { AcDbViewport } from '../canvas/ac-db-viewport';
import { AcDbDragManager } from '../canvas/ac-db-drag-manager';
import { AcDbSelectionManager } from '../canvas/ac-db-selection-manager';
import { AcDbConnectionManager } from '../canvas/ac-db-connection-manager';
import { AcDbAutoLayout } from '../canvas/ac-db-auto-layout';
import { AcDbRelationSvgRenderer } from './canvas/ac-db-relation-svg.element';
import { AcDbTableCardElement, registerAcDbTableCardElement } from './canvas/ac-db-table-card.element';
import { MoveNodesCommand } from '../store/commands/move-nodes.command';
import { AddTableCommand } from '../store/commands/add-table.command';
import { DeleteTableCommand } from '../store/commands/delete-table.command';
import { AddRelationshipCommand } from '../store/commands/add-relationship.command';
import { AddColumnCommand } from '../store/commands/add-column.command';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';

const TAG = 'ac-db-canvas';

/** Card node height estimate per visible column row (28px) + header (36px) + footer (32px) */
const CARD_ROW_H = 28;
const CARD_HEADER_H = 36 + 32;
const CARD_W = 260;

function estimateCardH(colCount: number): number {
  return CARD_HEADER_H + colCount * CARD_ROW_H;
}

export class AcDbCanvasElement extends HTMLElement {
  private _store!: AcDbStore;
  private _bus!: AcDbEventBus;
  private _history!: AcDbHistory;
  private _schema!: AcDbSchema;
  private _layout!: AcDbLayout;

  private _viewport!: AcDbViewport;
  private _drag!: AcDbDragManager;
  private _selection!: AcDbSelectionManager;
  private _connection!: AcDbConnectionManager;
  private _svgRenderer!: AcDbRelationSvgRenderer;

  // DOM refs
  private _nodesEl!: HTMLDivElement;
  private _svgEl!: SVGSVGElement;
  private _rubberEl!: HTMLDivElement;
  private _zoomEl!: HTMLDivElement;
  private _minimapEl!: SVGSVGElement;

  // State
  private _isPanning = false;
  private _isRubberBanding = false;
  private _panStartX = 0;
  private _panStartY = 0;
  private _cards = new Map<string, AcDbTableCardElement>();
  private _socketPositions = new Map<string, { x: number; y: number }>();
  private _pendingRender = false;
  private _keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  /** Call once before or after connecting to DOM. */
  init(
    store: AcDbStore,
    bus: AcDbEventBus,
    history: AcDbHistory,
    schema: AcDbSchema,
    layout: AcDbLayout,
  ): void {
    this._store   = store;
    this._bus     = bus;
    this._history = history;
    this._schema  = schema;
    this._layout  = layout;
    registerAcDbTableCardElement();
    // If already connected (innerHTML set before init called), boot now
    if (this.isConnected && !this._initialized) {
      this._setup();
    }
  }

  private _initialized = false;

  connectedCallback(): void {
    // Only run setup after init() has been called (store/bus/etc. available)
    if (this._store && !this._initialized) {
      this._setup();
    }
    // else: init() will call _setup() when it runs after connectedCallback
  }

  private _setup(): void {
    this._initialized = true;
    this._build();
    this._initEngines();
    this._subscribeEvents();
    this._scheduleRender();
  }

  disconnectedCallback(): void {
    this._bus.off('table:added',         this._onTableChanged);
    this._bus.off('table:updated',       this._onTableChanged);
    this._bus.off('table:deleted',       this._onTableDeleted);
    this._bus.off('column:added',        this._onColumnChanged);
    this._bus.off('column:updated',      this._onColumnChanged);
    this._bus.off('column:deleted',      this._onColumnChanged);
    this._bus.off('relationship:added',  this._onRelChanged);
    this._bus.off('relationship:deleted',this._onRelChanged);
    this._bus.off('layout:changed',      this._onLayoutChanged);
    if (this._keydownHandler) {
      window.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }
  }

  // ── Build DOM ───────────────────────────────────────────────────────────────

  private _build(): void {
    this.className = 'acd-canvas-host';
    this.innerHTML = `
      <div class="acd-canvas-nodes"></div>
      <svg class="acd-canvas-svg" xmlns="http://www.w3.org/2000/svg"></svg>
      <div class="acd-rubber-band"></div>
      <div class="acd-zoom-indicator">100%</div>
      <svg class="acd-minimap" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 110"></svg>
    `;
    this._nodesEl   = this.querySelector('.acd-canvas-nodes')!;
    this._svgEl     = this.querySelector('.acd-canvas-svg')!;
    this._rubberEl  = this.querySelector('.acd-rubber-band')!;
    this._zoomEl    = this.querySelector('.acd-zoom-indicator')!;
    this._minimapEl = this.querySelector('.acd-minimap')!;
  }

  private _initEngines(): void {
    const { width: w, height: h } = this.getBoundingClientRect();
    this._viewport   = new AcDbViewport(this._bus);
    this._viewport.setSize(w || 800, h || 600);
    this._viewport.fromLayout(this._layout);
    this._drag       = new AcDbDragManager(this._viewport, this._layout, this._bus);
    this._selection  = new AcDbSelectionManager();
    this._connection = new AcDbConnectionManager(this._viewport);
    this._svgRenderer = new AcDbRelationSvgRenderer(this._svgEl, this._viewport);
    this._svgRenderer.setStore(this._store);
    this._bindPointerEvents();
    this._bindWheelEvent();
    this._bindKeyboard();
    this._bindResize();
  }

  // ── Event subscriptions ─────────────────────────────────────────────────────

  private _subscribeEvents(): void {
    this._bus.on('table:added',          this._onTableChanged);
    this._bus.on('table:updated',        this._onTableChanged);
    this._bus.on('table:deleted',        this._onTableDeleted);
    this._bus.on('column:added',         this._onColumnChanged);
    this._bus.on('column:updated',       this._onColumnChanged);
    this._bus.on('column:deleted',       this._onColumnChanged);
    this._bus.on('relationship:added',   this._onRelChanged);
    this._bus.on('relationship:deleted', this._onRelChanged);
    this._bus.on('layout:changed',       this._onLayoutChanged);
  }

  private _onTableChanged  = () => this._scheduleRender();
  private _onTableDeleted  = (id: string) => { const c = this._cards.get(id); if (c) c.remove(); this._cards.delete(id); this._scheduleRender(); };
  private _onColumnChanged = () => this._scheduleRender();
  private _onRelChanged    = () => this._scheduleRender();
  private _onLayoutChanged = () => this._applyTransformOnly();

  // ── Pointer events (ONE delegated listener) ─────────────────────────────────

  private _bindPointerEvents(): void {
    this.addEventListener('pointerdown', this._onPointerDown, { passive: false });
    this.addEventListener('pointermove', this._onPointerMove, { passive: false });
    this.addEventListener('pointerup',   this._onPointerUp);
    this.addEventListener('pointercancel', () => {
      this._drag.cancelDrag();
      this._connection.cancelConnection();
      this._isPanning = false;
    });
    // Click on SVG paths to select relationships
    this._svgEl.addEventListener('click', (e) => {
      const path = (e.target as Element).closest('[data-rel-id]');
      const relId = path?.getAttribute('data-rel-id') ?? null;
      this._svgRenderer.selectRelationship(relId);
      this._scheduleRender();
    });

    // Handle card events
    this.addEventListener('acd:delete-table', (e: Event) => {
      const { tableId } = (e as CustomEvent).detail;
      const table = this._store.getTable(tableId);
      if (table) {
        this._history.execute(new DeleteTableCommand(tableId, table.tableName));
        this._selection.clearSelection();
        const c = this._cards.get(tableId);
        if (c) c.remove();
        this._cards.delete(tableId);
        this._scheduleRender();
      }
    });

    this.addEventListener('acd:toggle-table', (e: Event) => {
      const { tableId } = (e as CustomEvent).detail;
      const node = this._layout.nodes[tableId];
      if (node) {
        node.collapsed = !node.collapsed;
        this._scheduleRender();
      }
    });

    this.addEventListener('acd:add-column', (e: Event) => {
      const { tableId } = (e as CustomEvent).detail;
      this._handleAddColumn(tableId);
    });
  }

  private _onPointerDown = (e: PointerEvent): void => {
    const target = e.target as HTMLElement;

    // Notes and areas have their own event handlers — don't interfere
    if (target.closest('.acd-note') || target.closest('.acd-area')) return;

    // Socket drag → start FK connection from right (out) socket only
    if (target.dataset['socket'] === 'right') {
      e.stopPropagation();
      const tableId  = target.dataset['tableId']!;
      const columnId = target.dataset['colId']!;
      const rect = target.getBoundingClientRect();
      const cr   = this.getBoundingClientRect();
      const screenX = rect.left + rect.width  / 2 - cr.left;
      const screenY = rect.top  + rect.height / 2 - cr.top;
      this._connection.startConnection({ tableId, columnId, screenX, screenY });
      this.setPointerCapture(e.pointerId);
      this.classList.add('connecting');
      return;
    }

    // Action buttons (add-column, toggle, delete) — MUST come before header drag
    const btn = target.closest('[data-action]') as HTMLElement | null;
    if (btn) {
      this._handleCardAction(btn.dataset['action']!, btn);
      return;
    }

    // Column row click → select column in properties panel
    const colRow = target.closest('.acd-col-row') as HTMLElement | null;
    if (colRow) {
      const colId = colRow.dataset['colId'];
      if (colId) {
        this.dispatchEvent(new CustomEvent('acd:select-column', {
          bubbles: true, detail: { columnId: colId },
        }));
      }
      return;
    }

    // Card header drag
    const header = target.closest('[data-drag-handle]') as HTMLElement | null;
    if (header) {
      e.stopPropagation();
      const tableId = header.dataset['tableId']!;
      if (!this._selection.isSelected(tableId)) {
        this._selection.select(tableId, e.ctrlKey || e.metaKey);
      }
      this.dispatchEvent(new CustomEvent('acd:select-table', {
        bubbles: true, detail: { tableId },
      }));
      const toMove = this._selection.selected.size > 0
        ? Array.from(this._selection.selected)
        : [tableId];
      const cr = this.getBoundingClientRect();
      this._drag.startDrag(toMove, e.clientX - cr.left, e.clientY - cr.top);
      this.setPointerCapture(e.pointerId);
      return;
    }

    // Card click (not on header, not on button, not on column) — select table
    const card = target.closest('.acd-table-card') as HTMLElement | null;
    if (card && !this._drag.isDragging) {
      const tableId = card.dataset['tableId']!;
      this._selection.select(tableId, e.ctrlKey || e.metaKey);
      this.dispatchEvent(new CustomEvent('acd:select-table', {
        bubbles: true, detail: { tableId },
      }));
      this._scheduleRender();
      return;
    }

    // Canvas background — Shift+drag = rubber-band select, normal drag = pan
    if (e.shiftKey) {
      // Start rubber-band selection
      const cr = this.getBoundingClientRect();
      const wx = this._viewport.screenToWorld(e.clientX - cr.left, e.clientY - cr.top);
      this._isRubberBanding = true;
      this._selection.startRubberBand(wx.x, wx.y);
      this._panStartX = e.clientX;
      this._panStartY = e.clientY;
      this.setPointerCapture(e.pointerId);
      this._rubberEl.classList.add('visible');
      this._scheduleRender();
    } else {
      this._selection.clearSelection();
      this._isPanning = true;
      this._panStartX = e.clientX;
      this._panStartY = e.clientY;
      this.setPointerCapture(e.pointerId);
      this.classList.add('panning');
      this._scheduleRender();
    }
  };

  private _onPointerMove = (e: PointerEvent): void => {
    const cr = this.getBoundingClientRect();
    const lx = e.clientX - cr.left;
    const ly = e.clientY - cr.top;

    if (this._connection.isDrawing) {
      this._connection.updateConnection(lx, ly);
      this._scheduleRender();
      return;
    }

    if (this._drag.isDragging) {
      this._drag.onPointerMove(lx, ly);
      this._updateCardPositions();
      this._updateSocketPositions();
      this._renderSvg();
      return;
    }

    if (this._isPanning) {
      const dx = e.clientX - this._panStartX;
      const dy = e.clientY - this._panStartY;
      this._panStartX = e.clientX;
      this._panStartY = e.clientY;
      this._viewport.pan(dx, dy);
      this._applyTransformOnly();
    }

    if (this._isRubberBanding) {
      const wx = this._viewport.screenToWorld(lx, ly);
      this._selection.updateRubberBand(wx.x, wx.y);
      const rect = this._selection.getRubberBandRect();
      // Convert world-space rect to screen-space for the overlay div
      const tl = this._viewport.worldToScreen(rect.left, rect.top);
      const br = this._viewport.worldToScreen(rect.left + rect.width, rect.top + rect.height);
      this._rubberEl.style.left   = `${tl.x}px`;
      this._rubberEl.style.top    = `${tl.y}px`;
      this._rubberEl.style.width  = `${br.x - tl.x}px`;
      this._rubberEl.style.height = `${br.y - tl.y}px`;
    }
  };

  private _onPointerUp = (e: PointerEvent): void => {
    const cr = this.getBoundingClientRect();

    // Finish connection draw
    if (this._connection.isDrawing) {
      if (this.hasPointerCapture(e.pointerId)) {
        try { this.releasePointerCapture(e.pointerId); } catch {}
      }
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      // Try exact socket hit first (left or right)
      let socketEl = el?.closest('[data-socket]') as HTMLElement | null;
      if (!socketEl) {
        // Dropped on column row — find socket in that row (prefer left in socket)
        const colRow = el?.closest('.acd-col-row') as HTMLElement | null;
        if (colRow) {
          socketEl = colRow.querySelector('[data-socket="left"]') ?? colRow.querySelector('[data-socket]');
        }
      }
      if (!socketEl) {
        // Dropped on target table card — find first input socket or PK column's socket
        const card = el?.closest('.acd-table-card') as HTMLElement | null;
        if (card) {
          socketEl = card.querySelector('[data-socket="left"]') ?? card.querySelector('[data-socket]');
        }
      }
      if (socketEl && socketEl.dataset['tableId'] !== this._connection.pending?.from.tableId) {
        const result = this._connection.finishConnection({
          tableId:  socketEl.dataset['tableId']!,
          columnId: socketEl.dataset['colId']!,
          screenX: 0, screenY: 0,
        });
        if (result) {
          // result.from = Source (drag start, parent/PK table)
          // result.to   = Destination (drag end, child/FK table)
          // In AcDbRelationship: fromTableId = Destination (table with FK), toTableId = Source (referenced PK table)
          this._history.execute(new AddRelationshipCommand({
            schemaId:      this._schema.schemaId,
            fromTableId:   result.to.tableId,
            fromColumnId:  result.to.columnId,
            toTableId:     result.from.tableId,
            toColumnId:    result.from.columnId,
          }));
          this._store.updateColumn(result.to.columnId, {
            foreignKeyTableId: result.from.tableId,
            foreignKeyColumnId: result.from.columnId,
          });
        }
      } else {
        this._connection.cancelConnection();
      }
      this.classList.remove('connecting');
      this._scheduleRender();
      return;
    }

    // Finish drag — commit to history as MoveNodesCommand
    if (this._drag.isDragging) {
      const lx = e.clientX - cr.left;
      const ly = e.clientY - cr.top;
      const moves = this._drag.endDrag(lx, ly);
      const significant = moves.filter(m => Math.abs(m.toX - m.fromX) > 2 || Math.abs(m.toY - m.fromY) > 2);
      if (significant.length) {
        // Positions already moved by drag — push to history for undo without re-executing
        this._history.pushAlreadyExecuted(new MoveNodesCommand(significant, this._layout));
      }
      this._scheduleRender();
      return;
    }

    // Finish rubber-band selection
    if (this._isRubberBanding) {
      this._isRubberBanding = false;
      this._rubberEl.classList.remove('visible');
      this._rubberEl.style.width = '0';
      this._rubberEl.style.height = '0';
      // Build bounding boxes for endRubberBand
      const bboxes: Record<string, { x: number; y: number; w: number; h: number }> = {};
      for (const [id] of this._cards) {
        const n = this._layout.nodes[id];
        if (n) bboxes[id] = { x: n.x, y: n.y, w: CARD_W, h: estimateCardH(this._store.getTableColumns(id).length) };
      }
      this._selection.endRubberBand(bboxes, e.ctrlKey || e.metaKey);
      this._scheduleRender();
      return;
    }

    if (this._isPanning) {
      this._isPanning = false;
      this.classList.remove('panning');
      this._viewport.toLayout(this._layout);
    }
  };

  // ── Wheel zoom ──────────────────────────────────────────────────────────────

  private _bindWheelEvent(): void {
    this.addEventListener('wheel', (e) => {
      e.preventDefault();
      const cr = this.getBoundingClientRect();
      this._viewport.zoom(
        e.deltaY < 0 ? 1 : -1,
        e.clientX - cr.left,
        e.clientY - cr.top,
      );
      this._applyTransformOnly();
      this._updateZoomIndicator();
    }, { passive: false });
  }

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  private _bindKeyboard(): void {
    this._keydownHandler = (e: KeyboardEvent) => {
      if (!this.isConnected) return;
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
      if (isEditing) return; // Don't intercept when user is typing in form fields

      if (e.key === 'Delete' || e.key === 'Backspace') {
        for (const tableId of this._selection.selected) {
          const table = this._store.getTable(tableId);
          if (table) this._history.execute(new DeleteTableCommand(tableId, table.tableName));
        }
        this._selection.clearSelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const all = this._store.getAllTables().map(t => t.tableId);
        this._selection.selectMany(all);
        this._scheduleRender();
      }
      if (e.key === 'Escape') {
        this._selection.clearSelection();
        this._connection.cancelConnection();
        this._isRubberBanding = false;
        this._scheduleRender();
      }
    };
    window.addEventListener('keydown', this._keydownHandler);
  }

  // ── Resize observer ─────────────────────────────────────────────────────────

  private _bindResize(): void {
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      this._viewport.setSize(width, height);
      this._applyTransformOnly();
    });
    ro.observe(this);
  }

  // ── Card action handler (add-column, toggle, delete) ─────────────────────────

  private _handleCardAction(action: string, btn: HTMLElement): void {
    const card     = btn.closest('.acd-table-card') as HTMLElement;
    const tableId  = card?.dataset['tableId'] ?? btn.closest('[data-table-id]')?.getAttribute('data-table-id') ?? '';
    const table    = this._store.getTable(tableId);
    if (!table) return;
    switch (action) {
      case 'delete': {
        this._history.execute(new DeleteTableCommand(tableId, table.tableName));
        this._selection.clearSelection();
        const c = this._cards.get(tableId);
        if (c) c.remove();
        this._cards.delete(tableId);
        this._scheduleRender();
        break;
      }
      case 'toggle': {
        const node = this._layout.nodes[tableId];
        if (node) node.collapsed = !node.collapsed;
        this._scheduleRender();
        break;
      }
      case 'add-column':
        this._handleAddColumn(tableId);
        break;
    }
  }

  private _handleAddColumn(tableId: string): void {
    const table = this._store.getTable(tableId);
    if (!table) return;
    const cols = this._store.getTableColumns(tableId);
    const colNum = cols.length + 1;
    const newColName = `column_${colNum}`;
    this._history.execute(new AddColumnCommand({
      tableId,
      columnName: newColName,
      columnType: AcEnumDbColumnType.VarChar,
      length: 255,
      primaryKey: false,
      nullable: true,
      autoIncrement: false,
      unique: false,
      ordinalPosition: cols.length,
    } as any));
    this._scheduleRender();
    const updatedCols = this._store.getTableColumns(tableId);
    const added = updatedCols.find(c => c.columnName === newColName);
    if (added) {
      this.dispatchEvent(new CustomEvent('acd:select-column', {
        bubbles: true,
        detail: { columnId: added.columnId },
      }));
    }
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  /** Batched via requestAnimationFrame to avoid redundant redraws. */
  private _scheduleRender(): void {
    if (this._pendingRender) return;
    this._pendingRender = true;
    requestAnimationFrame(() => {
      this._pendingRender = false;
      this._fullRender();
    });
  }

  private _fullRender(): void {
    this._syncCards();
    this._updateCardPositions();
    this._applyTransformOnly();
    this._updateSocketPositions();
    this._renderSvg();
    this._renderMinimap();
    this._updateZoomIndicator();
  }

  /** Create/remove card elements to match store state. */
  private _syncCards(): void {
    const tables  = this._store.getAllTables();
    const storeIds = new Set(tables.map(t => t.tableId));

    // Remove cards no longer in store
    for (const [id, card] of this._cards) {
      if (!storeIds.has(id)) {
        card.remove();
        this._cards.delete(id);
      }
    }

    // Add/update cards
    for (const table of tables) {
      let card = this._cards.get(table.tableId);
      if (!card) {
        card = document.createElement('ac-db-table-card') as AcDbTableCardElement;
        this._nodesEl.appendChild(card);
        this._cards.set(table.tableId, card);
        // Ensure node layout entry exists
        if (!this._layout.nodes[table.tableId]) {
          this._layout.nodes[table.tableId] = { x: 40, y: 40, collapsed: false };
        }
      }
      const node = this._layout.nodes[table.tableId];
      card.setAttribute('table-id',   table.tableId);
      card.setAttribute('table-name', table.tableName);
      if (table.color) card.setAttribute('color', table.color);
      else             card.removeAttribute('color');
      if (node?.collapsed) card.setAttribute('collapsed', '');
      else                 card.removeAttribute('collapsed');
      if (this._selection.isSelected(table.tableId)) card.setAttribute('selected', '');
      else                                           card.removeAttribute('selected');
      card.setColumns(this._store.getTableColumns(table.tableId));
    }
  }

  /** Move card elements to their layout positions. */
  private _updateCardPositions(): void {
    for (const [tableId, card] of this._cards) {
      const node = this._layout.nodes[tableId];
      if (node) card.setPosition(node.x, node.y);
    }
  }

  /** Apply viewport CSS transform to nodes layer only (not SVG). */
  private _applyTransformOnly(): void {
    this._nodesEl.style.transform = this._viewport.transform;
    // SVG paths are drawn in screen space — need to know transform for coords
    this._updateSocketPositions();
    this._renderSvg();
  }

  /** Compute screen-space socket positions for all visible cards. */
  private _updateSocketPositions(): void {
    this._socketPositions.clear();
    const cr = this.getBoundingClientRect();
    for (const [tableId, card] of this._cards) {
      const sockets = card.querySelectorAll('[data-socket]') as NodeListOf<HTMLElement>;
      for (const socket of sockets) {
        const colId = socket.dataset['colId']!;
        const side  = socket.dataset['socket']!;
        const sr    = socket.getBoundingClientRect();
        const key   = `${tableId}:${colId}:${side}`;
        this._socketPositions.set(key, {
          x: sr.left + sr.width  / 2 - cr.left,
          y: sr.top  + sr.height / 2 - cr.top,
        });
        // Also store by tableId:columnId (dominant side for the relationship)
        const domKey = `${tableId}:${colId}`;
        if (side === 'right' || !this._socketPositions.has(domKey)) {
          this._socketPositions.set(domKey, {
            x: sr.left + sr.width  / 2 - cr.left,
            y: sr.top  + sr.height / 2 - cr.top,
          });
        }
      }
    }
  }

  private _renderSvg(): void {
    const rels = this._store.getAllRelationships();
    const rubber = this._connection.isDrawing ? this._connection.getRubberLinePath() : undefined;
    this._svgRenderer.render(rels, this._socketPositions, rubber);
  }

  private _renderMinimap(): void {
    const tables = this._store.getAllTables();
    if (!tables.length) { this._minimapEl.innerHTML = ''; return; }

    // Compute bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of tables) {
      const n = this._layout.nodes[t.tableId];
      if (!n) continue;
      const cols = this._store.getTableColumns(t.tableId).length;
      const h    = estimateCardH(cols);
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + CARD_W);
      maxY = Math.max(maxY, n.y + h);
    }
    if (!isFinite(minX)) return;

    const scW  = 160, scH = 110;
    const scaleX = scW / (maxX - minX || 1);
    const scaleY = scH / (maxY - minY || 1);
    const sc     = Math.min(scaleX, scaleY, 1) * 0.85;

    const rects: string[] = [];
    for (const t of tables) {
      const n = this._layout.nodes[t.tableId];
      if (!n) continue;
      const x = (n.x - minX) * sc;
      const y = (n.y - minY) * sc;
      rects.push(`<rect class="acd-minimap-node" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(CARD_W * sc).toFixed(1)}" height="10" rx="1"/>`);
    }

    // Viewport rect in minimap coords
    const vpAabb = this._viewport.getWorldAABB();
    const vpX = (vpAabb.left  - minX) * sc;
    const vpY = (vpAabb.top   - minY) * sc;
    const vpW = (vpAabb.right - vpAabb.left)  * sc;
    const vpH = (vpAabb.bottom - vpAabb.top)  * sc;
    rects.push(`<rect class="acd-minimap-viewport-rect" x="${vpX.toFixed(1)}" y="${vpY.toFixed(1)}" width="${vpW.toFixed(1)}" height="${vpH.toFixed(1)}"/>`);

    this._minimapEl.innerHTML = rects.join('\n');
  }

  private _updateZoomIndicator(): void {
    this._zoomEl.textContent = `${Math.round(this._viewport.scale * 100)}%`;
  }

  // ── Public API (called by parent designer element) ───────────────────────────

  /** Auto-layout all tables using layered algorithm. */
  autoLayout(): void {
    const tables = this._store.getAllTables().map(t => t.tableId);
    const rels   = this._store.getAllRelationships();
    const pos    = AcDbAutoLayout.layered(tables, rels);
    AcDbAutoLayout.applyPositions(pos, this._layout);
    this._viewport.fitAll(this._layout.nodes);
    this._scheduleRender();
  }

  fitAll(): void {
    this._viewport.fitAll(this._layout.nodes);
    this._scheduleRender();
  }

  /** Pan the viewport to center a specific table node. */
  panToNode(tableId: string): void {
    const node = this._layout.nodes[tableId];
    if (!node) return;
    const { width, height } = this.getBoundingClientRect();
    const sc = this._viewport.scale;
    // Center the table (260×~200 approx) in the viewport
    const nodeCenterX = node.x + CARD_W / 2;
    const nodeCenterY = node.y + estimateCardH(this._store.getTableColumns(tableId).length) / 2;
    this._viewport['_x'] = width  / 2 - nodeCenterX * sc;
    this._viewport['_y'] = height / 2 - nodeCenterY * sc;
    this._applyTransformOnly();
    this._renderMinimap();
    this._updateZoomIndicator();
  }

  zoomIn():  void { this._viewport.zoomIn();  this._applyTransformOnly(); this._updateZoomIndicator(); }
  zoomOut(): void { this._viewport.zoomOut(); this._applyTransformOnly(); this._updateZoomIndicator(); }

  get isDragging(): boolean { return this._drag.isDragging; }

  getSelectedTableIds(): string[] { return Array.from(this._selection.selected); }

  /** Render note sticky-notes on the canvas. */
  renderAreas(): void {
    // Remove existing areas
    this._nodesEl.querySelectorAll('.acd-area').forEach(el => el.remove());
    const areas = this._store.getAllAreas();
    for (const area of areas) {
      const div = document.createElement('div');
      div.className = 'acd-area';
      div.dataset['areaId'] = area.areaId;
      div.style.cssText = `position:absolute;left:${area.x}px;top:${area.y}px;width:${area.width}px;height:${area.height}px;background:${area.color};border:2px dashed rgba(51,154,240,0.3);border-radius:8px;z-index:0;pointer-events:auto;`;
      div.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px">
          <span contenteditable="true" data-area-name="${area.areaId}" style="font-size:11px;font-weight:700;color:rgba(51,154,240,0.7);outline:none;cursor:text">${area.name.replace(/</g, '&lt;')}</span>
          <button data-del-area="${area.areaId}" style="border:none;background:none;cursor:pointer;font-size:13px;color:#868e96" title="Delete area">&times;</button>
        </div>
        <div data-area-resize="${area.areaId}" style="position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize;background:linear-gradient(135deg,transparent 50%,rgba(51,154,240,0.3) 50%);border-radius:0 0 6px 0"></div>
      `;
      // Delete handler
      const delAreaBtn = div.querySelector(`[data-del-area]`);
      const doDeleteArea = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this._store.deleteArea(area.areaId);
        div.remove();
      };
      delAreaBtn?.addEventListener('pointerdown', doDeleteArea);
      delAreaBtn?.addEventListener('click', doDeleteArea);
      // Save name on blur
      const nameEl = div.querySelector(`[data-area-name]`) as HTMLElement;
      nameEl?.addEventListener('blur', () => {
        this._store.updateArea(area.areaId, { name: nameEl.textContent || 'Area' });
      });
      // Drag area
      div.addEventListener('pointerdown', (e: PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.contentEditable === 'true' || target.tagName === 'BUTTON' || target.dataset['areaResize']) return;
        e.stopPropagation();
        const startX = e.clientX, startY = e.clientY, origX = area.x, origY = area.y;
        const onMove = (ev: PointerEvent) => {
          const dx = (ev.clientX - startX) / this._viewport.scale;
          const dy = (ev.clientY - startY) / this._viewport.scale;
          area.x = origX + dx; area.y = origY + dy;
          div.style.left = `${area.x}px`; div.style.top = `${area.y}px`;
        };
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          this._store.updateArea(area.areaId, { x: area.x, y: area.y });
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
      // Resize handle
      const resizeEl = div.querySelector(`[data-area-resize]`) as HTMLElement;
      resizeEl?.addEventListener('pointerdown', (e: PointerEvent) => {
        e.stopPropagation();
        const startX = e.clientX, startY = e.clientY, origW = area.width, origH = area.height;
        const onMove = (ev: PointerEvent) => {
          area.width = Math.max(100, origW + (ev.clientX - startX) / this._viewport.scale);
          area.height = Math.max(60, origH + (ev.clientY - startY) / this._viewport.scale);
          div.style.width = `${area.width}px`; div.style.height = `${area.height}px`;
        };
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          this._store.updateArea(area.areaId, { width: area.width, height: area.height });
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
      // Insert at beginning so areas are behind table cards
      this._nodesEl.insertBefore(div, this._nodesEl.firstChild);
    }
  }

  renderNotes(): void {
    // Remove existing notes
    this._nodesEl.querySelectorAll('.acd-note').forEach(el => el.remove());
    const notes = this._store.getAllNotes();
    for (const note of notes) {
      const div = document.createElement('div');
      div.className = 'acd-note';
      div.dataset['noteId'] = note.noteId;
      div.style.cssText = `position:absolute;left:${note.x}px;top:${note.y}px;width:${note.width}px;min-height:${note.height}px;background:${note.color};border:1px solid #e9ecef;border-radius:6px;padding:8px;font-size:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);cursor:move;`;
      div.innerHTML = `
        <div style="display:flex;justify-content:flex-end;margin-bottom:4px">
          <button data-del-note="${note.noteId}" style="border:none;background:none;cursor:pointer;font-size:13px;color:#868e96" title="Delete note">&times;</button>
        </div>
        <div contenteditable="true" data-note-text="${note.noteId}" style="outline:none;min-height:40px;font-size:12px;line-height:1.4;white-space:pre-wrap">${note.text.replace(/</g, '&lt;')}</div>
      `;
      // Delete handler
      const delNoteBtn = div.querySelector(`[data-del-note]`);
      const doDeleteNote = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this._store.deleteNote(note.noteId);
        div.remove();
      };
      delNoteBtn?.addEventListener('pointerdown', doDeleteNote);
      delNoteBtn?.addEventListener('click', doDeleteNote);
      // Save text on blur
      const textEl = div.querySelector(`[data-note-text]`) as HTMLElement;
      textEl?.addEventListener('blur', () => {
        this._store.updateNote(note.noteId, { text: textEl.textContent || '' });
      });
      // Simple drag for notes
      let startX = 0, startY = 0, origX = note.x, origY = note.y;
      div.addEventListener('pointerdown', (e: PointerEvent) => {
        if ((e.target as HTMLElement).contentEditable === 'true' || (e.target as HTMLElement).tagName === 'BUTTON') return;
        e.stopPropagation();
        startX = e.clientX; startY = e.clientY; origX = note.x; origY = note.y;
        const onMove = (ev: PointerEvent) => {
          const dx = (ev.clientX - startX) / this._viewport.scale;
          const dy = (ev.clientY - startY) / this._viewport.scale;
          note.x = origX + dx; note.y = origY + dy;
          div.style.left = `${note.x}px`; div.style.top = `${note.y}px`;
        };
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          this._store.updateNote(note.noteId, { x: note.x, y: note.y });
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
      this._nodesEl.appendChild(div);
    }
  }
}

export function registerAcDbCanvasElement(): void {
  if (!customElements.get(TAG)) customElements.define(TAG, AcDbCanvasElement);
}
