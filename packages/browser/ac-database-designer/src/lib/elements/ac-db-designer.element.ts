/**
 * <ac-database-designer> — Root custom element.
 * Layout: toolbar + (sidebar | canvas + bottom-panel) + properties-panel.
 * Owns the entire designer lifecycle:
 *   - AcDbStore, AcDbEventBus, AcDbHistory, AcDbSchema
 *   - AcDbStorage (auto-save)
 *   - AcDbValidator (debounced)
 *   - AcDbCanvasElement (visual canvas)
 *
 * Attributes:
 *   schema-id     — UUID of the schema to load on connect (optional)
 *   theme         — 'light' (default) | 'dark'
 *   read-only     — disables all mutations if present
 */
// CSS is imported here so Vite includes it in the bundle when this module is loaded
import '../css/ac-database-designer.css';
import { AcDbStore } from '../store/ac-db-store';
import { AcDbEventBus } from '../store/ac-db-event-bus';
import { AcDbHistory } from '../store/ac-db-history';
import { AcDbSchema, createSchema } from '../models/ac-db-schema.model';
import { AcDbLayout, createLayout } from '../models/ac-db-layout.model';
import { AcDbValidationIssue } from '../models/ac-db-validation.model';
import { AcDbValidator } from '../validation/ac-db-validator';
import { AcDbStorage } from '../storage/ac-db-storage';
import { AcDbCanvasElement, registerAcDbCanvasElement } from './ac-db-canvas.element';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcEnumDbFkAction } from '../enums/ac-enum-db-fk-action';
import { AcEnumDbTriggerTiming } from '../enums/ac-enum-db-trigger-timing';
import { AcEnumDbTriggerEvent } from '../enums/ac-enum-db-trigger-event';
import { AddTableCommand } from '../store/commands/add-table.command';
import { DeleteTableCommand } from '../store/commands/delete-table.command';
import { AddColumnCommand } from '../store/commands/add-column.command';
import { DeleteColumnCommand } from '../store/commands/delete-column.command';
import { UpdateTableCommand } from '../store/commands/update-table.command';
import { UpdateColumnCommand } from '../store/commands/update-column.command';
import { DeleteRelationshipCommand } from '../store/commands/delete-relationship.command';
import { getSqlGenerator } from '../sql/ac-db-sql-factory';
import { importFromJson } from '../io/ac-db-import-json';
import { exportToJson } from '../io/ac-db-export-json';
import { importSqlDdl } from '../import/ac-db-sql-import';

const TAG = 'ac-database-designer';

type Tab = 'sql' | 'validation' | 'history' | 'views' | 'triggers' | 'routines';

export class AcDatabaseDesignerElement extends HTMLElement {
  static get observedAttributes() {
    return ['schema-id', 'theme', 'read-only'];
  }

  // Core engine
  private _bus!: AcDbEventBus;
  private _store!: AcDbStore;
  private _history!: AcDbHistory;
  private _schema!: AcDbSchema;
  private _layout!: AcDbLayout;
  private _validator!: AcDbValidator;
  private _storage!: AcDbStorage;

  // DOM refs
  private _canvas!: AcDbCanvasElement;
  private _sidebarEl!: HTMLElement;
  private _propsEl!: HTMLElement;
  private _bottomContentEl!: HTMLElement;
  private _bottomTabsEl!: HTMLElement;
  private _ddSelect!: HTMLSelectElement;
  private _undoBtn!: HTMLButtonElement;
  private _redoBtn!: HTMLButtonElement;
  private _dirtyDot!: HTMLSpanElement;
  private _sidebarListEl!: HTMLElement;
  private _searchInput!: HTMLInputElement;

  // State
  private _activeTab: Tab = 'sql';
  private _validationIssues: AcDbValidationIssue[] = [];
  private _isDirty = false;
  private _initialized = false;
  private _selectedTableId: string | null = null;
  private _selectedColumnId: string | null = null;
  private _keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private _hideContextMenuBound = () => this._hideContextMenu();

  connectedCallback(): void {
    if (this._initialized) return;
    this._initialized = true;
    this._initCore();
    this._buildDOM();
    this._subscribeEvents();
    this._initStorage();
  }

  attributeChangedCallback(name: string, _old: string, val: string): void {
    if (name === 'theme') {
      this.dataset['theme'] = val;
    }
  }

  disconnectedCallback(): void {
    if (this._keydownHandler) {
      window.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }
    document.removeEventListener('click', this._hideContextMenuBound);
    this._validator?.destroy();
  }

  // ── Core init ───────────────────────────────────────────────────────────────

  private _initCore(): void {
    this._bus       = new AcDbEventBus();
    this._store     = new AcDbStore(this._bus);
    this._history   = new AcDbHistory(this._store, this._bus);
    this._layout    = createLayout();
    this._schema    = createSchema({
      schemaId:   crypto.randomUUID(),
      schemaName: 'New Schema',
      dialect:    AcEnumDbDialect.MySQL,
    });
    this._validator = new AcDbValidator(this._store, this._bus);
    this._storage   = new AcDbStorage(this._bus);
    registerAcDbCanvasElement();
  }

  private async _initStorage(): Promise<void> {
    await this._storage.init();
    if (this._storage.isInitialized) {
      try {
        const summaries = await this._storage.listSchemas();
        const items = summaries.map(s => ({ id: s.schemaId, name: s.schemaName }));
        if (!items.find(i => i.id === this._schema.schemaId)) {
          items.unshift({ id: this._schema.schemaId, name: this._schema.schemaName });
        }
        this.setDataDictionaries(items, this._schema.schemaId);
      } catch {}
    }
    const schemaId = this.getAttribute('schema-id');
    if (schemaId && this._storage.isInitialized) {
      await this.loadSchema(schemaId);
    }
  }

  // ── DOM build ───────────────────────────────────────────────────────────────

  private _buildDOM(): void {
    this.setAttribute('data-theme', this.getAttribute('theme') ?? 'light');
    this.innerHTML = `
      <div class="acd-toolbar">
        <button class="acd-toolbar-btn" data-action="new-table" title="Add Table (N)">+ Table</button>
        <button class="acd-toolbar-btn" data-action="new-note" title="Add Note">📝 Note</button>
        <button class="acd-toolbar-btn" data-action="new-area" title="Add Subject Area">▢ Area</button>
        <div class="acd-toolbar-sep"></div>
        <button class="acd-toolbar-btn" data-action="undo" title="Undo (Ctrl+Z)">↩ Undo</button>
        <button class="acd-toolbar-btn" data-action="redo" title="Redo (Ctrl+Shift+Z)">↪ Redo</button>
        <div class="acd-toolbar-sep"></div>
        <button class="acd-toolbar-btn" data-action="auto-layout" title="Auto-layout tables">⚡ Layout</button>
        <button class="acd-toolbar-btn" data-action="fit" title="Fit all">⊡ Fit</button>
        <button class="acd-toolbar-btn" data-action="zoom-in"  title="Zoom In (+)">+</button>
        <button class="acd-toolbar-btn" data-action="zoom-out" title="Zoom Out (-)">−</button>
        <div class="acd-toolbar-sep"></div>
        <select class="acd-toolbar-btn" data-action="dialect" title="SQL Dialect" style="padding:0 4px">
          <option value="mysql">MySQL</option>
          <option value="postgres">PostgreSQL</option>
          <option value="sqlite">SQLite</option>
          <option value="mssql">MSSQL</option>
          <option value="oracle">Oracle</option>
        </select>
        <div class="acd-toolbar-sep"></div>
        <button class="acd-toolbar-btn" data-action="import" title="Import JSON">⬆ Import</button>
        <button class="acd-toolbar-btn" data-action="export" title="Export JSON">⬇ Export</button>
        <button class="acd-toolbar-btn" data-action="import-sql" title="Import SQL DDL">📥 Import SQL</button>
        <button class="acd-toolbar-btn" data-action="copy-sql" title="Copy SQL to clipboard">⧉ Copy SQL</button>
        <button class="acd-toolbar-btn" data-action="export-svg" title="Export as SVG">🖼 SVG</button>
        <button class="acd-toolbar-btn" data-action="export-png" title="Export as PNG">📸 PNG</button>
        <button class="acd-toolbar-btn" data-action="present" title="Presentation Mode">🖥 Present</button>
        <button class="acd-toolbar-btn" data-action="save" title="Save (Ctrl+S)">💾 Save</button>
        <span class="acd-dirty" style="display:none" title="Unsaved changes">●</span>
      </div>
      <div class="acd-main">
        <div class="acd-sidebar">
          <div class="acd-sidebar-dd" style="padding:6px 8px;border-bottom:1px solid var(--acd-border, #dee2e6)">
            <select class="acd-dd-select" style="width:100%;padding:4px 6px;border:1px solid var(--acd-border, #dee2e6);border-radius:4px;font-size:12px;background:var(--acd-bg, #fff);color:inherit;cursor:pointer" title="Select Data Dictionary">
              <option value="">— Select Data Dictionary —</option>
            </select>
          </div>
          <div class="acd-sidebar-search">
            <input type="search" placeholder="Search tables…" class="acd-sidebar-search-input"/>
          </div>
          <div class="acd-sidebar-section">
            <div class="acd-sidebar-section-header" data-toggle-section="tables" style="cursor:pointer;user-select:none">
              <span>▾</span> Tables <span class="acd-table-count" style="font-size:11px;color:#868e96"></span>
              <button style="background:none;border:none;cursor:pointer;font-size:18px;color:inherit;margin-left:auto" data-action="new-table" title="Add table">+</button>
            </div>
            <div class="acd-sidebar-list" data-section="tables"></div>
          </div>
          <div class="acd-sidebar-section">
            <div class="acd-sidebar-section-header" data-toggle-section="relationships" style="cursor:pointer;user-select:none">
              <span>▾</span> Relationships <span class="acd-rel-count" style="font-size:11px;color:#868e96"></span>
            </div>
            <div class="acd-sidebar-rel-list" data-section="relationships" style="font-size:12px;padding:0 8px"></div>
          </div>
        </div>
        <div class="acd-splitter" title="Drag to resize"></div>
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative">
          <ac-db-canvas style="flex:1"></ac-db-canvas>
          <div class="acd-bottom">
            <div class="acd-bottom-tabs">
              <button class="acd-bottom-tab active" data-tab="sql">SQL Preview</button>
              <button class="acd-bottom-tab" data-tab="validation">Validation</button>
              <button class="acd-bottom-tab" data-tab="history">History</button>
              <button class="acd-bottom-tab" data-tab="views">Views</button>
              <button class="acd-bottom-tab" data-tab="triggers">Triggers</button>
              <button class="acd-bottom-tab" data-tab="routines">Routines</button>
              <button class="acd-bottom-toggle" data-action="toggle-bottom" title="Toggle panel" style="margin-left:auto;border:none;background:none;cursor:pointer;font-size:12px;color:var(--acd-col-type-color);padding:0 6px">▾</button>
            </div>
            <div class="acd-bottom-content"></div>
          </div>
        </div>
        <div class="acd-props"></div>
      </div>
      <div class="acd-context-menu" style="display:none;position:fixed;z-index:9999"></div>
    `;

    this._undoBtn         = this.querySelector('[data-action="undo"]')!;
    this._redoBtn         = this.querySelector('[data-action="redo"]')!;
    this._dirtyDot        = this.querySelector('.acd-dirty')!;
    this._sidebarEl       = this.querySelector('.acd-sidebar')!;
    this._sidebarListEl   = this.querySelector('.acd-sidebar-list')!;
    this._searchInput     = this.querySelector('.acd-sidebar-search-input')!;
    this._propsEl         = this.querySelector('.acd-props')!;
    this._bottomContentEl = this.querySelector('.acd-bottom-content')!;
    this._bottomTabsEl    = this.querySelector('.acd-bottom-tabs')!;
    this._ddSelect        = this.querySelector('.acd-dd-select') as HTMLSelectElement;

    // Init canvas
    this._canvas = this.querySelector('ac-db-canvas')!;
    this._canvas.init(this._store, this._bus, this._history, this._schema, this._layout);

    // Wire toolbar actions (delegated)
    this.addEventListener('click', this._onToolbarClick);
    this._bottomTabsEl.addEventListener('click', this._onTabClick);
    this._searchInput.addEventListener('input', () => this._renderSidebar());
    this.addEventListener('change', this._onFormChange);

    // UI-4: Collapsible sidebar sections
    this.querySelectorAll('[data-toggle-section]').forEach(header => {
      header.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('[data-action]')) return; // don't collapse when clicking +
        const sectionName = (header as HTMLElement).dataset['toggleSection']!;
        const list = this.querySelector(`[data-section="${sectionName}"]`) as HTMLElement;
        if (!list) return;
        const isHidden = list.style.display === 'none';
        list.style.display = isHidden ? '' : 'none';
        const arrow = header.querySelector('span');
        if (arrow) arrow.textContent = isHidden ? '▾' : '▸';
      });
    });

    // UI-5: Resizable sidebar via splitter drag
    const splitter = this.querySelector('.acd-splitter') as HTMLElement;
    if (splitter) {
      splitter.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        splitter.classList.add('active');
        const startX = e.clientX;
        const startW = this._sidebarEl.offsetWidth;
        const onMove = (ev: PointerEvent) => {
          const newW = Math.max(120, Math.min(500, startW + (ev.clientX - startX)));
          this._sidebarEl.style.width = `${newW}px`;
        };
        const onUp = () => {
          splitter.classList.remove('active');
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
    }

    // Right-click context menu on canvas cards
    this._canvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      const card = (e.target as Element).closest('.acd-table-card') as HTMLElement | null;
      const tableId = card?.dataset['tableId'];
      if (tableId) this._showContextMenu(e.clientX, e.clientY, tableId);
    });

    // Select table in properties panel when clicking card on canvas
    this.addEventListener('acd:select-table', (e: Event) => {
      const tableId = (e as CustomEvent).detail.tableId;
      if (tableId) this._selectTable(tableId);
    });

    // Select column in properties panel when clicking column row on canvas
    this.addEventListener('acd:select-column', (e: Event) => {
      const columnId = (e as CustomEvent).detail.columnId;
      if (columnId) this._selectColumn(columnId);
    });

    // UI-2: Inline table name edit from canvas card
    this.addEventListener('table-renamed', (e: Event) => {
      const { tableId, newName } = (e as CustomEvent).detail;
      if (tableId && newName) {
        this._history.execute(new UpdateTableCommand(tableId, { tableName: newName }));
        this._renderSidebar();
      }
    });

    // UI-1: Inline column name edit from canvas card
    this.addEventListener('column-renamed', (e: Event) => {
      const { columnId, newName } = (e as CustomEvent).detail;
      if (columnId && newName) {
        this._history.execute(new UpdateColumnCommand(columnId, { columnName: newName }));
      }
    });

    // UI-3: Column drag-to-reorder from canvas card
    this.addEventListener('column-reorder', (e: Event) => {
      const { columnId, newIndex } = (e as CustomEvent).detail;
      if (columnId !== undefined && newIndex !== undefined) {
        this._store.reorderColumn(columnId, newIndex);
        this._canvas['_scheduleRender']();
      }
    });

    // Keyboard shortcuts (consolidated — canvas only handles Delete/Ctrl+A/Escape)
    this._keydownHandler = (e: KeyboardEvent) => {
      if (!this.isConnected) return;
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';

      // Ctrl+S always active
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); this._save(); return; }

      // Skip remaining when editing text
      if (isEditing) return;

      // Undo/redo (consolidated here, removed from canvas)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) this._history.redo();
        else this._history.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); this._history.redo(); return; }

      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); this._addTable(); return; }
      if (e.key === 'f' || e.key === 'F') { this._canvas.fitAll(); return; }
      if (e.key === 'Escape' && this._presenting) { this._togglePresentationMode(); return; }
      if (e.key === 'p' || e.key === 'P') { this._togglePresentationMode(); return; }
    };
    window.addEventListener('keydown', this._keydownHandler);

    // Close context menu on click elsewhere
    document.addEventListener('click', this._hideContextMenuBound);

    // Show schema settings in props panel by default
    this._renderPropsEmpty();
  }

  // ── Event subscriptions ─────────────────────────────────────────────────────

  private _subscribeEvents(): void {
    this._bus.on('table:added',          () => this._onSchemaChanged());
    this._bus.on('table:updated',        () => this._onSchemaChanged());
    this._bus.on('table:deleted',        () => this._onSchemaChanged());
    this._bus.on('column:added',         () => this._onSchemaChanged());
    this._bus.on('column:updated',       () => this._onSchemaChanged());
    this._bus.on('column:deleted',       () => this._onSchemaChanged());
    this._bus.on('relationship:added',   () => this._onSchemaChanged());
    this._bus.on('relationship:deleted', () => this._onSchemaChanged());
    this._bus.on('history:changed',      (e) => this._onHistoryChanged(e));
    this._bus.on('validation:updated',   (issues) => {
      this._validationIssues = issues;
      if (this._activeTab === 'validation') this._renderBottomPanel();
    });
    this._bus.on('storage:saved',        () => {
      this._isDirty = false;
      this._dirtyDot.style.display = 'none';
    });
  }

  private _onSchemaChanged(): void {
    this._isDirty = true;
    this._dirtyDot.style.display = '';
    this._renderSidebar();
    this._renderBottomPanel();
    this._validator.scheduleValidation();
    this._storage.scheduleSave(this._schema, this._store);
  }

  private _onHistoryChanged(e: { canUndo: boolean; canRedo: boolean }): void {
    this._undoBtn.disabled = !e.canUndo;
    this._redoBtn.disabled = !e.canRedo;
    // Clear properties panel if selected table was deleted
    if (this._selectedTableId && !this._store.getTable(this._selectedTableId)) {
      this._selectedTableId = null;
      this._selectedColumnId = null;
      this._renderPropsEmpty();
    }
    // Re-render canvas and sidebar after any store mutation (add/delete/update)
    this._canvas['_scheduleRender']();
    this._renderSidebar();
  }

  // ── Toolbar actions ──────────────────────────────────────────────────────────

  private _onToolbarClick = (e: MouseEvent): void => {
    const btn = (e.target as Element).closest('[data-action]') as HTMLElement;
    if (!btn) return;
    const action = btn.dataset['action']!;
    switch (action) {
      case 'new-table':   this._addTable(); break;
      case 'new-note':    this._addNote(); break;
      case 'new-area':    this._addArea(); break;
      case 'undo':        this._history.undo(); break;
      case 'redo':        this._history.redo(); break;
      case 'auto-layout': this._canvas.autoLayout(); break;
      case 'fit':         this._canvas.fitAll(); break;
      case 'zoom-in':     this._canvas.zoomIn(); break;
      case 'zoom-out':    this._canvas.zoomOut(); break;
      case 'import':      this._openImportDialog(); break;
      case 'import-sql':  this._openImportSqlDialog(); break;
      case 'export':      this._triggerExport(); break;
      case 'save':        this._save(); break;
      case 'copy-sql':    this._copySqlToClipboard(); break;
      case 'export-svg':  this._exportSvg(); break;
      case 'export-png':  this._exportPng(); break;
      case 'toggle-bottom': this._toggleBottomPanel(); break;
      case 'present':       this._togglePresentationMode(); break;
    }
  };

  private _onTabClick = (e: MouseEvent): void => {
    const tab = (e.target as Element).closest('[data-tab]') as HTMLElement;
    if (!tab) return;
    this._activeTab = tab.dataset['tab'] as Tab;
    this._bottomTabsEl.querySelectorAll('.acd-bottom-tab').forEach(t =>
      t.classList.toggle('active', (t as HTMLElement).dataset['tab'] === this._activeTab)
    );
    this._renderBottomPanel();
  };

  private _onFormChange = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-action="dialect"]')) {
      this._schema.dialect = (target as HTMLSelectElement).value as AcEnumDbDialect;
      this._renderBottomPanel();
    }
  };

  // ── Schema operations ────────────────────────────────────────────────────────

  private _addTable(): void {
    this._renderPropsNewTable();
  }

  private _renderPropsNewTable(): void {
    this._selectedTableId = null;
    this._selectedColumnId = null;
    this._propsEl.innerHTML = `
      <div class="acd-props-title">+ New Table</div>
      <div class="acd-form-group">
        <label class="acd-form-label">Table Name</label>
        <input class="acd-form-input" id="acd-new-tbl-name" placeholder="table_name" autofocus/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Description</label>
        <input class="acd-form-input" id="acd-new-tbl-desc" placeholder="Optional description"/>
      </div>
      <div style="margin-top:12px;display:flex;gap:6px">
        <button class="acd-btn acd-btn-primary" id="acd-new-tbl-save" style="flex:1">Create Table</button>
        <button class="acd-btn acd-btn-secondary" id="acd-new-tbl-cancel">Cancel</button>
      </div>
    `;
    const nameEl = this._propsEl.querySelector('#acd-new-tbl-name') as HTMLInputElement;
    nameEl?.focus();
    // Save on Enter
    nameEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._commitNewTable(); });
    this._propsEl.querySelector('#acd-new-tbl-save')?.addEventListener('click', () => this._commitNewTable());
    this._propsEl.querySelector('#acd-new-tbl-cancel')?.addEventListener('click', () => this._renderPropsEmpty());
  }

  private _commitNewTable(): void {
    const name = (this._propsEl.querySelector('#acd-new-tbl-name') as HTMLInputElement)?.value?.trim();
    if (!name) { (this._propsEl.querySelector('#acd-new-tbl-name') as HTMLInputElement)?.focus(); return; }
    const desc = (this._propsEl.querySelector('#acd-new-tbl-desc') as HTMLInputElement)?.value?.trim() ?? '';
    // Generate a unique ID we can use to select it after creation
    const tableId = crypto.randomUUID();
    this._history.execute({
      label: `Add table "${name}"`,
      execute: (store: AcDbStore) => {
        store.addTable({ tableId, schemaId: this._schema.schemaId, tableName: name, description: desc });
      },
      undo: (store: AcDbStore) => store.deleteTable(tableId),
    } as any);
    // Select the new table in the props panel
    setTimeout(() => this._selectTable(tableId), 50);
  }

  private _copySqlToClipboard(): void {
    const gen = getSqlGenerator(this._schema.dialect);
    const sql = gen.generateFullScript(this._schema, this._store);
    navigator.clipboard.writeText(sql).then(() => {
      this._showToast('SQL copied to clipboard!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = sql;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this._showToast('SQL copied!');
    });
  }

  private _showToast(msg: string): void {
    const toast = document.createElement('div');
    toast.className = 'acd-toast';
    toast.textContent = msg;
    this.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 300); }, 2200);
  }

  private _addNote(): void {
    const noteId = crypto.randomUUID();
    this._store.addNote({ noteId, text: 'New note', x: 100, y: 100 });
    this._canvas.renderNotes();
  }

  private _addArea(): void {
    const areaId = crypto.randomUUID();
    this._store.addArea({ areaId, name: `Area ${this._store.getAllAreas().length + 1}` });
    this._canvas.renderAreas();
  }

  private _duplicateTable(tableId: string): void {
    const src = this._store.getTable(tableId);
    if (!src) return;
    const newId   = crypto.randomUUID();
    const newName = `${src.tableName}_copy`;
    const srcCols = this._store.getTableColumns(tableId);
    const colIdMap = new Map<string, string>();
    this._history.execute({
      label: `Duplicate table "${src.tableName}"`,
      execute: (store: AcDbStore) => {
        store.addTable({ ...src, tableId: newId, tableName: newName });
        for (const c of srcCols) {
          const newColId = crypto.randomUUID();
          colIdMap.set(c.columnId, newColId);
          store.addColumn({ ...c, columnId: newColId, tableId: newId, foreignKeyTableId: null, foreignKeyColumnId: null });
        }
        // Offset position
        const node = this._layout.nodes[tableId];
        if (node) this._layout.nodes[newId] = { x: node.x + 280, y: node.y + 40, collapsed: false };
      },
      undo: (store: AcDbStore) => store.deleteTable(newId),
    } as any);
    setTimeout(() => this._selectTable(newId), 50);
  }

  private async _save(): Promise<void> {
    await this._storage.saveSchema(this._schema, this._store);
  }

  private _triggerExport(): void {
    const json   = exportToJson(this._schema, this._store);
    const blob   = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = `${this._schema.schemaName.replace(/\s+/g, '_')}_data_dictionary.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private _exportSvg(): void {
    const tables = this._store.getAllTables();
    if (!tables.length) { this._showToast('No tables to export'); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of tables) {
      const n = this._layout.nodes[t.tableId];
      if (!n) continue;
      const colCount = this._store.getTableColumns(t.tableId).length;
      minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + 260); maxY = Math.max(maxY, n.y + 50 + colCount * 28);
    }
    const pad = 40, w = maxX - minX + pad * 2, h = maxY - minY + pad * 2;
    const svg: string[] = [];
    svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${minX - pad} ${minY - pad} ${w} ${h}">`);
    svg.push(`<style>.t{fill:#fff;stroke:#dee2e6;rx:6}.h{fill:#f8f9fa}.n{font:bold 13px sans-serif;fill:#212529}.c{font:12px sans-serif;fill:#495057}.ct{font:11px monospace;fill:#868e96}.r{fill:none;stroke:#339af0;stroke-width:1.5}</style>`);
    for (const t of tables) {
      const n = this._layout.nodes[t.tableId]; if (!n) continue;
      const tc = this._store.getTableColumns(t.tableId);
      const ch = 50 + tc.length * 28;
      svg.push(`<rect class="t" x="${n.x}" y="${n.y}" width="260" height="${ch}"/>`);
      svg.push(`<rect class="h" x="${n.x}" y="${n.y}" width="260" height="36" rx="6"/>`);
      svg.push(`<text class="n" x="${n.x + 10}" y="${n.y + 23}">${this._escHtml(t.tableName)}</text>`);
      tc.forEach((c, i) => {
        const cy = n.y + 48 + i * 28;
        const b = [c.primaryKey ? 'PK' : '', c.foreignKeyTableId ? 'FK' : ''].filter(Boolean).join(' ');
        svg.push(`<text class="c" x="${n.x + 10}" y="${cy}">${b ? b + ' ' : ''}${this._escHtml(c.columnName)}</text>`);
        svg.push(`<text class="ct" x="${n.x + 245}" y="${cy}" text-anchor="end">${String(c.columnType)}</text>`);
      });
    }
    for (const rel of this._store.getAllRelationships()) {
      const sn = this._layout.nodes[rel.toTableId], dn = this._layout.nodes[rel.fromTableId];
      if (!sn || !dn) continue;
      const si = this._store.getTableColumns(rel.toTableId).findIndex(c => c.columnId === rel.toColumnId);
      const di = this._store.getTableColumns(rel.fromTableId).findIndex(c => c.columnId === rel.fromColumnId);
      const x1 = sn.x + 260, y1 = sn.y + 48 + si * 28 - 4, x2 = dn.x, y2 = dn.y + 48 + di * 28 - 4;
      const dx = Math.abs(x2 - x1) * 0.5;
      svg.push(`<path class="r" d="M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}"/>`);
    }
    svg.push(`</svg>`);
    const blob = new Blob([svg.join('\n')], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${this._schema.schemaName.replace(/\s+/g, '_')}_diagram.svg`;
    a.click(); URL.revokeObjectURL(url);
    this._showToast('SVG exported!');
  }

  private _exportPng(): void {
    const tables = this._store.getAllTables();
    if (!tables.length) { this._showToast('No tables to export'); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of tables) {
      const n = this._layout.nodes[t.tableId]; if (!n) continue;
      const colCount = this._store.getTableColumns(t.tableId).length;
      minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + 260); maxY = Math.max(maxY, n.y + 50 + colCount * 28);
    }
    const pad = 40, w = maxX - minX + pad * 2, h = maxY - minY + pad * 2, s = 2;
    const c = document.createElement('canvas'); c.width = w * s; c.height = h * s;
    const ctx = c.getContext('2d')!; ctx.scale(s, s); ctx.translate(-minX + pad, -minY + pad);
    ctx.fillStyle = '#fff'; ctx.fillRect(minX - pad, minY - pad, w, h);
    for (const t of tables) {
      const n = this._layout.nodes[t.tableId]; if (!n) continue;
      const tc = this._store.getTableColumns(t.tableId);
      const ch = 50 + tc.length * 28;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#dee2e6'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(n.x, n.y, 260, ch, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f8f9fa'; ctx.beginPath(); ctx.roundRect(n.x, n.y, 260, 36, [6, 6, 0, 0]); ctx.fill();
      ctx.fillStyle = '#212529'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(t.tableName, n.x + 10, n.y + 23);
      tc.forEach((col, i) => {
        const cy = n.y + 48 + i * 28;
        ctx.fillStyle = '#495057'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(col.columnName, n.x + 10, cy);
        ctx.fillStyle = '#868e96'; ctx.font = '11px monospace'; ctx.textAlign = 'right';
        ctx.fillText(String(col.columnType), n.x + 250, cy); ctx.textAlign = 'left';
      });
    }
    ctx.strokeStyle = '#339af0'; ctx.lineWidth = 1.5;
    for (const rel of this._store.getAllRelationships()) {
      const sn = this._layout.nodes[rel.toTableId], dn = this._layout.nodes[rel.fromTableId];
      if (!sn || !dn) continue;
      const si = this._store.getTableColumns(rel.toTableId).findIndex(x => x.columnId === rel.toColumnId);
      const di = this._store.getTableColumns(rel.fromTableId).findIndex(x => x.columnId === rel.fromColumnId);
      const x1 = sn.x + 260, y1 = sn.y + 48 + si * 28 - 4, x2 = dn.x, y2 = dn.y + 48 + di * 28 - 4;
      const dx = Math.abs(x2 - x1) * 0.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2); ctx.stroke();
    }
    c.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = `${this._schema.schemaName.replace(/\s+/g, '_')}_diagram.png`;
      a.click(); URL.revokeObjectURL(url); this._showToast('PNG exported!');
    }, 'image/png');
  }

  private _openImportDialog(): void {
    const input     = document.createElement('input');
    input.type      = 'file';
    input.accept    = '.json';
    input.onchange  = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        importFromJson(json, this._store, this._schema.schemaId);
        this._canvas.autoLayout();
        this._canvas.renderAreas();
        this._canvas.renderNotes();
        this._renderSidebar();
      } catch (err) {
        alert(`Import failed: ${err}`);
      }
    };
    input.click();
  }

  private _openImportSqlDialog(): void {
    const input     = document.createElement('input');
    input.type      = 'file';
    input.accept    = '.sql,.ddl,.txt';
    input.onchange  = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const result = importSqlDdl(text, this._store, this._schema.schemaId);
        this._canvas.autoLayout();
        this._canvas.renderAreas();
        this._canvas.renderNotes();
        this._renderSidebar();
        const msg = `Imported ${result.tables} tables, ${result.columns} columns, ${result.relationships} relationships, ${result.indexes} indexes.`;
        if (result.errors.length) {
          alert(`${msg}\n\nWarnings:\n${result.errors.join('\n')}`);
        } else {
          this._showToast(msg);
        }
      } catch (err) {
        alert(`SQL import failed: ${err}`);
      }
    };
    input.click();
  }

  private _openAddColumnDialog(tableId: string): void {
    this._selectedTableId = tableId;
    this._selectedColumnId = null;
    this._renderPropsAddColumn(tableId);
  }

  // ── Properties panel ─────────────────────────────────────────────────────────

  private _selectTable(tableId: string): void {
    this._selectedTableId = tableId;
    this._selectedColumnId = null;
    this._renderPropsTable(tableId);
  }

  private _selectColumn(columnId: string): void {
    const col = this._store.getColumn(columnId);
    if (!col) return;
    this._selectedTableId = col.tableId;
    this._selectedColumnId = columnId;
    this._renderPropsColumn(columnId);
  }

  private _renderPropsTable(tableId: string): void {
    const table = this._store.getTable(tableId);
    if (!table) return;
    const cols = this._store.getTableColumns(tableId);
    const rels  = this._store.getTableRelationships(tableId);
    const e = this._escHtml.bind(this);

    const colRows = cols.map(c => `
      <div class="acd-props-col-row" data-col-id="${c.columnId}" style="display:flex;align-items:center;gap:4px;padding:3px 4px;border-radius:4px;cursor:pointer;font-size:12px;">
        ${c.primaryKey ? '<span class="acd-col-badge pk">PK</span>' : ''}
        ${c.foreignKeyTableId ? '<span class="acd-col-badge fk">FK</span>' : ''}
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e(c.columnName)}</span>
        <span style="font-size:10px;color:var(--acd-col-type-color);font-family:monospace">${String(c.columnType).replace('AUTO_INCREMENT','AI')}</span>
        <button data-del-col="${c.columnId}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;padding:0 2px;font-size:13px" title="Delete column">&times;</button>
      </div>
    `).join('');

    const relRows = rels.map(r => {
      const other = r.fromTableId === tableId
        ? this._store.getTable(r.toTableId)
        : this._store.getTable(r.fromTableId);
      const side = r.fromTableId === tableId ? '&larr;' : '&rarr;';
      return `<div style="display:flex;align-items:center;gap:4px;padding:3px 4px;font-size:12px;">
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${side} ${e(other?.tableName ?? '?')}</span>
        <button data-del-rel="${r.relationshipId}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;padding:0 2px;font-size:13px" title="Delete">&times;</button>
      </div>`;
    }).join('');

    const indexes = this._store.getTableIndexes(tableId);
    const idxRows = indexes.map(idx => {
      const colNames = idx.columnIds
        .map(cid => this._store.getColumn(cid)?.columnName ?? '?')
        .join(', ');
      return `<div style="display:flex;align-items:center;gap:4px;padding:3px 4px;font-size:12px;">
        ${idx.unique ? '<span class="acd-col-badge pk">UQ</span>' : ''}
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${e(idx.indexName)}">${e(idx.indexName)}</span>
        <span style="font-size:10px;color:var(--acd-col-type-color);font-family:monospace">${colNames}</span>
        <button data-del-idx="${idx.indexId}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;padding:0 2px;font-size:13px" title="Delete index">&times;</button>
      </div>`;
    }).join('');

    this._propsEl.innerHTML = `
      <div class="acd-props-title">&#128203; Table</div>
      <div class="acd-form-group">
        <label class="acd-form-label">Name</label>
        <input class="acd-form-input" data-prop="tableName" value="${e(table.tableName)}"/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Description</label>
        <input class="acd-form-input" data-prop="description" value="${e(table.description)}"/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Color</label>
        <input type="color" class="acd-form-input" data-prop="color" value="${table.color ?? '#339af0'}" style="height:32px;padding:2px 4px;cursor:pointer"/>
      </div>
      <div style="margin-top:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span class="acd-form-label">Columns (${cols.length})</span>
          <button class="acd-btn acd-btn-primary" data-add-col="${tableId}" style="padding:2px 8px;font-size:11px">+ Add</button>
        </div>
        <div style="border:1px solid var(--acd-col-border);border-radius:4px;overflow:hidden">
          ${colRows || '<div style="padding:6px;font-size:11px;color:#868e96">No columns yet</div>'}
        </div>
      </div>
      ${rels.length ? `<div style="margin-top:8px">
        <div class="acd-form-label" style="margin-bottom:4px">Relationships (${rels.length})</div>
        <div style="border:1px solid var(--acd-col-border);border-radius:4px;overflow:hidden">${relRows}</div>
      </div>` : ''}
      <div style="margin-top:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span class="acd-form-label">Indexes (${indexes.length})</span>
          <button class="acd-btn acd-btn-primary" data-add-idx="${tableId}" style="padding:2px 8px;font-size:11px">+ Add</button>
        </div>
        <div style="border:1px solid var(--acd-col-border);border-radius:4px;overflow:hidden">
          ${idxRows || '<div style="padding:6px;font-size:11px;color:#868e96">No indexes</div>'}
        </div>
      </div>
      <div style="margin-top:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span class="acd-form-label">Checks (${(table.checks || []).length})</span>
          <button class="acd-btn acd-btn-primary" data-add-check="${tableId}" style="padding:2px 8px;font-size:11px">+ Add</button>
        </div>
        <div style="border:1px solid var(--acd-col-border);border-radius:4px;overflow:hidden">
          ${(table.checks || []).length ? (table.checks || []).map((chk: string, i: number) => `
            <div style="display:flex;align-items:center;gap:4px;padding:3px 4px;font-size:12px;">
              <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;font-size:11px" title="${e(chk)}">${e(chk)}</span>
              <button data-del-check="${i}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;padding:0 2px;font-size:13px" title="Delete check">&times;</button>
            </div>
          `).join('') : '<div style="padding:6px;font-size:11px;color:#868e96">No checks</div>'}
        </div>
      </div>
      <div style="margin-top:12px;display:flex;gap:6px">
        <button class="acd-btn acd-btn-secondary" data-dup-table="${tableId}" style="flex:1;font-size:12px">⧉ Duplicate</button>
        <button class="acd-btn acd-btn-danger" data-del-table="${tableId}" style="flex:1;font-size:12px">✕ Delete</button>
      </div>
    `;

    this._propsEl.querySelectorAll('[data-prop]').forEach(el =>
      el.addEventListener('change', () => {
        const key = (el as HTMLElement).dataset['prop']!;
        const val = (el as HTMLInputElement).value;
        this._history.execute(new UpdateTableCommand(tableId, { [key]: val } as any));
      })
    );
    this._propsEl.querySelectorAll('.acd-props-col-row').forEach(row => {
      (row as HTMLElement).addEventListener('click', ev => {
        if ((ev.target as HTMLElement).dataset['delCol']) return;
        this._selectColumn((row as HTMLElement).dataset['colId']!);
      });
      (row as HTMLElement).addEventListener('mouseover', () => (row as HTMLElement).style.background = 'var(--acd-col-hover-bg)');
      (row as HTMLElement).addEventListener('mouseout',  () => (row as HTMLElement).style.background = '');
    });
    this._propsEl.querySelectorAll('[data-del-col]').forEach(btn =>
      btn.addEventListener('click', ev => {
        ev.stopPropagation();
        const colId = (btn as HTMLElement).dataset['delCol']!;
        const col = this._store.getColumn(colId);
        if (col) this._history.execute(new DeleteColumnCommand(colId, col.columnName));
        this._renderPropsTable(tableId);
      })
    );
    this._propsEl.querySelectorAll('[data-del-rel]').forEach(btn =>
      btn.addEventListener('click', () => {
        this._history.execute(new DeleteRelationshipCommand((btn as HTMLElement).dataset['delRel']!));
        this._renderPropsTable(tableId);
      })
    );
    this._propsEl.querySelectorAll('[data-add-idx]').forEach(btn =>
      btn.addEventListener('click', () => {
        const tableCols = this._store.getTableColumns(tableId);
        const existingIndexes = this._store.getTableIndexes(tableId);
        const idxName = `idx_${table.tableName}_${existingIndexes.length + 1}`;
        this._store.addIndex({
          indexId: crypto.randomUUID(),
          tableId,
          indexName: idxName,
          unique: false,
          columnIds: tableCols.length ? [tableCols[0].columnId] : [],
        });
        this._renderPropsTable(tableId);
      })
    );
    this._propsEl.querySelectorAll('[data-del-idx]').forEach(btn =>
      btn.addEventListener('click', () => {
        this._store.deleteIndex((btn as HTMLElement).dataset['delIdx']!);
        this._renderPropsTable(tableId);
      })
    );
    this._propsEl.querySelectorAll(`[data-add-col]`).forEach(btn =>
      btn.addEventListener('click', () => this._renderPropsAddColumn(tableId))
    );
    this._propsEl.querySelectorAll('[data-add-check]').forEach(btn =>
      btn.addEventListener('click', () => {
        const expr = prompt('Enter CHECK expression (e.g. price > 0):');
        if (!expr?.trim()) return;
        const currentChecks = [...(table.checks || [])];
        currentChecks.push(expr.trim());
        this._history.execute(new UpdateTableCommand(tableId, { checks: currentChecks } as any));
        this._renderPropsTable(tableId);
      })
    );
    this._propsEl.querySelectorAll('[data-del-check]').forEach(btn =>
      btn.addEventListener('click', () => {
        const idx = parseInt((btn as HTMLElement).dataset['delCheck']!, 10);
        const currentChecks = [...(table.checks || [])];
        currentChecks.splice(idx, 1);
        this._history.execute(new UpdateTableCommand(tableId, { checks: currentChecks } as any));
        this._renderPropsTable(tableId);
      })
    );
    this._propsEl.querySelectorAll('[data-dup-table]').forEach(btn =>
      btn.addEventListener('click', () => this._duplicateTable(tableId))
    );
    this._propsEl.querySelectorAll('[data-del-table]').forEach(btn =>
      btn.addEventListener('click', () => {
        const table = this._store.getTable(tableId);
        if (!table) return;
        this._history.execute(new DeleteTableCommand(tableId, table.tableName));
        this._selectedTableId = null;
        this._renderPropsEmpty();
        this._renderSidebar();
      })
    );
  }

  // ── Context menu ─────────────────────────────────────────────────────────────

  private _showContextMenu(x: number, y: number, tableId: string): void {
    const menu = this.querySelector('.acd-context-menu') as HTMLElement;
    if (!menu) return;
    const table = this._store.getTable(tableId);
    if (!table) return;
    menu.innerHTML = `
      <div class="acd-ctx-item" data-ctx="props">&#128203; Properties</div>
      <div class="acd-ctx-item" data-ctx="add-col">+ Add Column</div>
      <div class="acd-ctx-sep"></div>
      <div class="acd-ctx-item" data-ctx="dup">⧉ Duplicate</div>
      <div class="acd-ctx-item" data-ctx="layout">⚡ Auto-layout</div>
      <div class="acd-ctx-sep"></div>
      <div class="acd-ctx-item acd-ctx-danger" data-ctx="delete">✕ Delete Table</div>
    `;
    menu.style.display = 'block';
    // Position so it doesn't overflow the viewport
    const vw = window.innerWidth, vh = window.innerHeight;
    const mw = 160, mh = 200;
    menu.style.left = `${Math.min(x, vw - mw - 8)}px`;
    menu.style.top  = `${Math.min(y, vh - mh - 8)}px`;

    menu.querySelectorAll('[data-ctx]').forEach(item =>
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const ctx = (item as HTMLElement).dataset['ctx']!;
        this._hideContextMenu();
        switch (ctx) {
          case 'props':    this._selectTable(tableId); break;
          case 'add-col':  this._openAddColumnDialog(tableId); break;
          case 'dup':      this._duplicateTable(tableId); break;
          case 'layout':   this._canvas.autoLayout(); break;
          case 'delete': {
            this._history.execute(new DeleteTableCommand(tableId, table.tableName));
            this._selectedTableId = null;
            this._renderPropsEmpty();
            this._renderSidebar();
            break;
          }
        }
      })
    );
  }

  private _hideContextMenu(): void {
    const menu = this.querySelector('.acd-context-menu') as HTMLElement;
    if (menu) menu.style.display = 'none';
  }

  private _renderPropsColumn(columnId: string): void {
    const col = this._store.getColumn(columnId);
    if (!col) return;
    const e = this._escHtml.bind(this);
    const allTables = this._store.getAllTables().filter(t => t.tableId !== col.tableId);
    const fkCols    = col.foreignKeyTableId ? this._store.getTableColumns(col.foreignKeyTableId) : [];
    const typeOpts  = Object.values(AcEnumDbColumnType).map(v =>
      `<option value="${v}" ${col.columnType === v ? 'selected' : ''}>${v}</option>`).join('');
    const fkTblOpts = `<option value="">— None —</option>` +
      allTables.map(t => `<option value="${t.tableId}" ${col.foreignKeyTableId === t.tableId ? 'selected' : ''}>${e(t.tableName)}</option>`).join('');
    const fkColOpts = `<option value="">— None —</option>` +
      fkCols.map(c => `<option value="${c.columnId}" ${col.foreignKeyColumnId === c.columnId ? 'selected' : ''}>${e(c.columnName)}</option>`).join('');
    const chk = (v: boolean) => v ? 'checked' : '';

    const isEnum = col.columnType === AcEnumDbColumnType.Enum;
    const isDecimal = col.columnType === AcEnumDbColumnType.Decimal;

    this._propsEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <button class="acd-btn acd-btn-secondary" data-back-table="${col.tableId}" style="padding:2px 8px;font-size:11px">&#8592; Table</button>
        <span class="acd-props-title" style="margin:0">&#9642; Column</span>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Name</label>
        <input class="acd-form-input" data-col-prop="columnName" value="${e(col.columnName)}"/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Type</label>
        <select class="acd-form-select" data-col-prop="columnType">${typeOpts}</select>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Length</label>
        <input class="acd-form-input" type="number" min="0" data-col-prop="length" value="${col.length ?? ''}"/>
      </div>
      ${isDecimal ? `
      <div class="acd-form-group">
        <label class="acd-form-label">Precision</label>
        <input class="acd-form-input" type="number" min="0" data-col-prop="precision" value="${col.precision ?? ''}"/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Scale</label>
        <input class="acd-form-input" type="number" min="0" data-col-prop="scale" value="${col.scale ?? ''}"/>
      </div>` : ''}
      ${isEnum ? `
      <div class="acd-form-group">
        <label class="acd-form-label">Enum Values (comma-separated)</label>
        <input class="acd-form-input" data-col-prop="enumValues" value="${e((col.enumValues || []).join(', '))}" placeholder="active, inactive, pending"/>
      </div>` : ''}
      <div class="acd-form-group">
        <label class="acd-form-label">Default</label>
        <input class="acd-form-input" data-col-prop="defaultValue" value="${e(col.defaultValue ?? '')}"/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Description</label>
        <input class="acd-form-input" data-col-prop="description" value="${e(col.description)}"/>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;font-size:12px">
        <label class="acd-form-checkbox"><input type="checkbox" data-col-bool="primaryKey" ${chk(col.primaryKey)}/> Primary Key</label>
        <label class="acd-form-checkbox"><input type="checkbox" data-col-bool="autoIncrement" ${chk(col.autoIncrement)}/> Auto-Increment</label>
        <label class="acd-form-checkbox"><input type="checkbox" data-col-bool="nullable" ${chk(col.nullable)}/> Nullable</label>
        <label class="acd-form-checkbox"><input type="checkbox" data-col-bool="unique" ${chk(col.unique)}/> Unique</label>
      </div>
      <div class="acd-form-group" style="margin-top:8px">
        <label class="acd-form-label">FK Table</label>
        <select class="acd-form-select" data-col-prop="foreignKeyTableId">${fkTblOpts}</select>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">FK Column</label>
        <select class="acd-form-select" data-col-prop="foreignKeyColumnId">${fkColOpts}</select>
      </div>
      <div style="margin-top:12px">
        <button class="acd-btn acd-btn-danger" data-del-col-btn="${columnId}" style="width:100%;font-size:12px">Delete Column</button>
      </div>
    `;

    this._propsEl.querySelectorAll('[data-col-prop]').forEach(el =>
      el.addEventListener('change', () => {
        const key = (el as HTMLElement).dataset['colProp']!;
        let val: any = (el as HTMLInputElement).value;
        if (key === 'length' || key === 'precision' || key === 'scale') val = val ? parseInt(val) : null;
        if (key === 'enumValues') val = val ? (val as string).split(',').map((v: string) => v.trim()).filter(Boolean) : [];
        if ((key === 'foreignKeyTableId' || key === 'foreignKeyColumnId') && !val) val = null;
        this._history.execute(new UpdateColumnCommand(columnId, { [key]: val } as any));
        if (key === 'foreignKeyTableId' || key === 'columnType') this._renderPropsColumn(columnId);
      })
    );
    this._propsEl.querySelectorAll('[data-col-bool]').forEach(el =>
      el.addEventListener('change', () => {
        const key = (el as HTMLElement).dataset['colBool']!;
        const val = (el as HTMLInputElement).checked;
        this._history.execute(new UpdateColumnCommand(columnId, { [key]: val } as any));
      })
    );
    this._propsEl.querySelectorAll('[data-del-col-btn]').forEach(btn =>
      btn.addEventListener('click', () => {
        this._history.execute(new DeleteColumnCommand(columnId, col.columnName));
        this._selectedColumnId = null;
        this._renderPropsTable(col.tableId);
      })
    );
    this._propsEl.querySelectorAll('[data-back-table]').forEach(btn =>
      btn.addEventListener('click', () => this._renderPropsTable((btn as HTMLElement).dataset['backTable']!))
    );
  }

  private _renderPropsAddColumn(tableId: string): void {
    const typeOpts = Object.values(AcEnumDbColumnType)
      .map(v => `<option value="${v}" ${v === AcEnumDbColumnType.String ? 'selected' : ''}>${v}</option>`).join('');

    this._propsEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <button class="acd-btn acd-btn-secondary" data-back-table="${tableId}" style="padding:2px 8px;font-size:11px">&#8592; Back</button>
        <span class="acd-props-title" style="margin:0">+ Add Column</span>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Column Name</label>
        <input class="acd-form-input" id="acd-new-col-name" placeholder="column_name"/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Type</label>
        <select class="acd-form-select" id="acd-new-col-type">${typeOpts}</select>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;font-size:12px">
        <label class="acd-form-checkbox"><input type="checkbox" id="acd-new-col-pk"/> Primary Key</label>
        <label class="acd-form-checkbox"><input type="checkbox" id="acd-new-col-nn" checked/> Not Null</label>
        <label class="acd-form-checkbox"><input type="checkbox" id="acd-new-col-ai"/> Auto-Increment</label>
        <label class="acd-form-checkbox"><input type="checkbox" id="acd-new-col-uq"/> Unique</label>
      </div>
      <div style="margin-top:12px;display:flex;gap:6px">
        <button class="acd-btn acd-btn-primary" id="acd-new-col-save" style="flex:1">Add Column</button>
        <button class="acd-btn acd-btn-secondary" data-back-table="${tableId}">Cancel</button>
      </div>
    `;
    (this._propsEl.querySelector('#acd-new-col-name') as HTMLInputElement)?.focus();
    this._propsEl.querySelectorAll('[data-back-table]').forEach(btn =>
      btn.addEventListener('click', () => this._renderPropsTable(tableId))
    );
    this._propsEl.querySelector('#acd-new-col-save')?.addEventListener('click', () => {
      const name = (this._propsEl.querySelector('#acd-new-col-name') as HTMLInputElement).value.trim();
      if (!name) { (this._propsEl.querySelector('#acd-new-col-name') as HTMLInputElement).focus(); return; }
      const type = (this._propsEl.querySelector('#acd-new-col-type') as HTMLSelectElement).value as AcEnumDbColumnType;
      const isPK = (this._propsEl.querySelector('#acd-new-col-pk')   as HTMLInputElement).checked;
      const isNN = (this._propsEl.querySelector('#acd-new-col-nn')   as HTMLInputElement).checked;
      const isAI = (this._propsEl.querySelector('#acd-new-col-ai')   as HTMLInputElement).checked;
      const isUQ = (this._propsEl.querySelector('#acd-new-col-uq')   as HTMLInputElement).checked;
      this._history.execute(new AddColumnCommand({
        tableId, columnName: name, columnType: type,
        primaryKey: isPK, nullable: !isNN && !isPK, autoIncrement: isAI, unique: isUQ,
        ordinalPosition: this._store.getTableColumns(tableId).length,
      } as any));
      this._renderPropsTable(tableId);
    });
  }

  private _renderPropsEmpty(): void {
    this._propsEl.innerHTML = `
      <div class="acd-props-title">Properties</div>
      <div style="color:#868e96;font-size:12px;padding:4px 0 12px">Click a table card to edit it.</div>
      <div class="acd-form-label" style="margin-bottom:6px">Schema Settings</div>
      <div class="acd-form-group">
        <label class="acd-form-label">Name</label>
        <input class="acd-form-input" data-schema-prop="schemaName" value="${this._escHtml(this._schema.schemaName)}"/>
      </div>
      <div class="acd-form-group">
        <label class="acd-form-label">Dialect</label>
        <select class="acd-form-select" data-schema-prop="dialect">
          ${Object.values(AcEnumDbDialect).map(d =>
            `<option value="${d}" ${this._schema.dialect === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
    `;
    this._propsEl.querySelectorAll('[data-schema-prop]').forEach(el =>
      el.addEventListener('change', () => {
        const key = (el as HTMLElement).dataset['schemaProp']!;
        (this._schema as any)[key] = (el as HTMLInputElement).value;
        if (key === 'dialect') this._renderBottomPanel();
      })
    );
  }

  // ── Sidebar rendering ────────────────────────────────────────────────────────

  private _renderSidebar(): void {
    const search = this._searchInput.value.toLowerCase();
    const tables = this._store.getAllTables()
      .filter(t => !search || t.tableName.toLowerCase().includes(search))
      .sort((a, b) => a.tableName.localeCompare(b.tableName));

    this._sidebarListEl.innerHTML = tables.map(t => {
      const cols = this._store.getTableColumns(t.tableId);
      const colCount = cols.length;
      const isActive = t.tableId === this._selectedTableId;
      const colList = cols.map(c =>
        `<div style="display:flex;align-items:center;gap:4px;padding:1px 0 1px 20px;font-size:10px;color:#495057">
          <span style="font-size:9px;color:${c.primaryKey ? '#e67700' : '#868e96'}">${c.primaryKey ? '🔑' : '·'}</span>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.columnName}</span>
          <span style="color:#868e96;font-size:9px">${c.columnType}</span>
        </div>`
      ).join('');
      return `
        <div class="acd-sidebar-item${isActive ? ' selected' : ''}" data-table-id="${t.tableId}">
          <span class="acd-sidebar-expand" data-expand="${t.tableId}" style="cursor:pointer;font-size:10px;color:#868e96;flex-shrink:0;width:14px;text-align:center">▸</span>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.tableName}</span>
          <span style="font-size:11px;color:#868e96">${colCount}</span>
        </div>
        <div class="acd-sidebar-cols" data-cols-for="${t.tableId}" style="display:none">${colList}</div>
      `;
    }).join('');

    // Update the tables count in the section header
    const header = this.querySelector('.acd-sidebar-section-header');
    if (header) {
      const countSpan = header.querySelector('.acd-table-count');
      if (countSpan) countSpan.textContent = `(${tables.length})`;
    }

    // Click → select in props panel, dblclick → pan to table
    this._sidebarListEl.querySelectorAll('.acd-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        this._selectTable((item as HTMLElement).dataset['tableId']!);
        this._renderSidebar(); // refresh active highlight
      });
      item.addEventListener('dblclick', () => {
        this._scrollToTable((item as HTMLElement).dataset['tableId']!);
      });
    });

    // UI-7: Expandable sidebar items
    this._sidebarListEl.querySelectorAll('[data-expand]').forEach(arrow => {
      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        const tid = (arrow as HTMLElement).dataset['expand']!;
        const colsDiv = this._sidebarListEl.querySelector(`[data-cols-for="${tid}"]`) as HTMLElement;
        if (!colsDiv) return;
        const isHidden = colsDiv.style.display === 'none';
        colsDiv.style.display = isHidden ? '' : 'none';
        (arrow as HTMLElement).textContent = isHidden ? '▾' : '▸';
      });
    });

    this._renderRelationshipsList();
  }

  private _scrollToTable(tableId: string): void {
    const node = this._layout.nodes[tableId];
    if (!node) return;
    this._canvas.panToNode(tableId);
  }

  private _renderRelationshipsList(): void {
    const relListEl = this.querySelector('.acd-sidebar-rel-list') as HTMLElement;
    if (!relListEl) return;
    const rels = this._store.getAllRelationships();
    const countEl = this.querySelector('.acd-rel-count');
    if (countEl) countEl.textContent = `(${rels.length})`;

    if (!rels.length) {
      relListEl.innerHTML = '<div style="padding:6px;font-size:11px;color:#868e96">No relationships</div>';
      return;
    }
    relListEl.innerHTML = rels.map(r => {
      const srcTable = this._store.getTable(r.toTableId);
      const dstTable = this._store.getTable(r.fromTableId);
      const srcCol = this._store.getColumn(r.toColumnId);
      const dstCol = this._store.getColumn(r.fromColumnId);
      return `<div style="padding:3px 0;border-bottom:1px solid var(--acd-col-border);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${srcTable?.tableName}.${srcCol?.columnName} → ${dstTable?.tableName}.${dstCol?.columnName}">
        <span style="color:var(--acd-header-bg)">${srcTable?.tableName ?? '?'}</span>.<span>${srcCol?.columnName ?? '?'}</span>
        → <span style="color:var(--acd-header-bg)">${dstTable?.tableName ?? '?'}</span>.<span>${dstCol?.columnName ?? '?'}</span>
      </div>`;
    }).join('');
  }

  // ── Bottom panel rendering ───────────────────────────────────────────────────

  private _bottomCollapsed = false;

  private _toggleBottomPanel(): void {
    this._bottomCollapsed = !this._bottomCollapsed;
    this._bottomContentEl.style.display = this._bottomCollapsed ? 'none' : '';
    const toggle = this.querySelector('.acd-bottom-toggle');
    if (toggle) toggle.textContent = this._bottomCollapsed ? '▸' : '▾';
  }

  private _presenting = false;

  private _togglePresentationMode(): void {
    this._presenting = !this._presenting;
    const toolbar = this.querySelector('.acd-toolbar') as HTMLElement;
    const sidebar = this.querySelector('.acd-sidebar') as HTMLElement;
    const bottom = this.querySelector('.acd-bottom') as HTMLElement;
    const props = this._propsEl;

    if (this._presenting) {
      // Enter presentation mode
      toolbar.style.display = 'none';
      sidebar.style.display = 'none';
      bottom.style.display = 'none';
      props.style.display = 'none';

      // Add exit button overlay
      const exitBtn = document.createElement('button');
      exitBtn.className = 'acd-present-exit';
      exitBtn.textContent = '✕ Exit';
      exitBtn.style.cssText = 'position:absolute;top:12px;right:12px;z-index:9999;background:rgba(0,0,0,.6);color:white;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:13px;';
      exitBtn.addEventListener('click', () => this._togglePresentationMode());
      this.appendChild(exitBtn);

      this._canvas.fitAll();
    } else {
      // Exit presentation mode
      toolbar.style.display = '';
      sidebar.style.display = '';
      bottom.style.display = '';
      props.style.display = '';

      const exitBtn = this.querySelector('.acd-present-exit');
      exitBtn?.remove();
    }
  }

  private _renderBottomPanel(): void {
    switch (this._activeTab) {
      case 'sql':        this._renderSqlPreview(); break;
      case 'validation': this._renderValidation(); break;
      case 'history':    this._renderHistory(); break;
      case 'views':      this._renderViewsPanel(); break;
      case 'triggers':   this._renderTriggersPanel(); break;
      case 'routines':   this._renderRoutinesPanel(); break;
    }
  }

  private _renderSqlPreview(): void {
    const gen = getSqlGenerator(this._schema.dialect);
    const sql = gen.generateFullScript(this._schema, this._store);
    this._bottomContentEl.innerHTML = `<pre class="acd-sql-preview">${this._escHtml(sql)}</pre>`;
  }

  private _renderValidation(): void {
    if (!this._validationIssues.length) {
      this._bottomContentEl.innerHTML = '<span style="color:#51cf66;font-size:12px">✓ No issues found</span>';
      return;
    }
    const icons: Record<string, string> = { error: '✖', warning: '⚠', info: 'ℹ' };
    this._bottomContentEl.innerHTML = this._validationIssues.map(i => `
      <div class="acd-validation-item">
        <span class="acd-validation-icon acd-validation-${i.severity}">${icons[i.severity]}</span>
        <span>${this._escHtml(i.message)}</span>
      </div>
    `).join('');
  }

  private _renderHistory(): void {
    const summary = this._history.getSummary();
    if (!summary.length) {
      this._bottomContentEl.innerHTML = '<span style="color:#868e96;font-size:12px">No history yet.</span>';
      return;
    }
    this._bottomContentEl.innerHTML = [...summary].reverse().map((s, i) => `
      <div style="padding:2px 4px;font-size:12px;${s.isCurrent ? 'font-weight:600;color:var(--acd-card-selected)' : 'color:#868e96'}">
        ${s.isCurrent ? '► ' : ''}${this._escHtml(s.label)}
      </div>
    `).join('');
  }

  private _renderViewsPanel(): void {
    const views = this._store.getAllViews();
    const e = this._escHtml.bind(this);
    this._bottomContentEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;margin-bottom:4px">
        <span style="font-weight:600;font-size:12px">Views (${views.length})</span>
        <button class="acd-btn acd-btn-primary" data-add-view style="padding:2px 8px;font-size:11px">+ Add View</button>
      </div>
      ${views.length ? views.map(v => `
        <div style="display:flex;align-items:start;gap:6px;padding:4px;border:1px solid var(--acd-col-border);border-radius:4px;margin-bottom:4px">
          <div style="flex:1">
            <input class="acd-form-input" data-view-name="${v.viewId}" value="${e(v.viewName)}" style="font-weight:600;font-size:12px;margin-bottom:2px" placeholder="View name"/>
            <textarea class="acd-form-input" data-view-query="${v.viewId}" rows="2" style="font-size:11px;font-family:monospace;resize:vertical" placeholder="SELECT ...">${e(v.viewQuery)}</textarea>
          </div>
          <button data-del-view="${v.viewId}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;font-size:14px" title="Delete">&times;</button>
        </div>
      `).join('') : '<div style="font-size:11px;color:#868e96;padding:4px">No views defined</div>'}
    `;
    this._bottomContentEl.querySelector('[data-add-view]')?.addEventListener('click', () => {
      this._store.addView({ viewId: crypto.randomUUID(), schemaId: this._schema.schemaId, viewName: `view_${views.length + 1}`, viewQuery: 'SELECT 1', description: '' });
      this._renderViewsPanel();
    });
    this._bottomContentEl.querySelectorAll('[data-view-name]').forEach(el =>
      el.addEventListener('change', () => {
        this._store.updateView((el as HTMLElement).dataset['viewName']!, { viewName: (el as HTMLInputElement).value });
      })
    );
    this._bottomContentEl.querySelectorAll('[data-view-query]').forEach(el =>
      el.addEventListener('change', () => {
        this._store.updateView((el as HTMLElement).dataset['viewQuery']!, { viewQuery: (el as HTMLTextAreaElement).value });
      })
    );
    this._bottomContentEl.querySelectorAll('[data-del-view]').forEach(el =>
      el.addEventListener('click', () => {
        this._store.deleteView((el as HTMLElement).dataset['delView']!);
        this._renderViewsPanel();
      })
    );
  }

  private _renderTriggersPanel(): void {
    const triggers = this._store.getAllTriggers();
    const tables = this._store.getAllTables();
    const e = this._escHtml.bind(this);
    const tableOpts = tables.map(t => `<option value="${t.tableId}">${e(t.tableName)}</option>`).join('');
    this._bottomContentEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;margin-bottom:4px">
        <span style="font-weight:600;font-size:12px">Triggers (${triggers.length})</span>
        <button class="acd-btn acd-btn-primary" data-add-trigger style="padding:2px 8px;font-size:11px">+ Add Trigger</button>
      </div>
      ${triggers.length ? triggers.map(tr => {
        const tbl = this._store.getTable(tr.tableId);
        return `<div style="display:flex;align-items:start;gap:6px;padding:4px;border:1px solid var(--acd-col-border);border-radius:4px;margin-bottom:4px">
          <div style="flex:1">
            <input class="acd-form-input" data-trig-name="${tr.triggerId}" value="${e(tr.triggerName)}" style="font-weight:600;font-size:12px;margin-bottom:2px" placeholder="Trigger name"/>
            <div style="display:flex;gap:4px;font-size:11px;margin-bottom:2px">
              <span style="color:#868e96">${tr.timing} ${tr.event}</span>
              <span style="color:#868e96">ON ${tbl?.tableName ?? '?'}</span>
            </div>
            <textarea class="acd-form-input" data-trig-body="${tr.triggerId}" rows="2" style="font-size:11px;font-family:monospace;resize:vertical" placeholder="Trigger body...">${e(tr.triggerCode)}</textarea>
          </div>
          <button data-del-trig="${tr.triggerId}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;font-size:14px" title="Delete">&times;</button>
        </div>`;
      }).join('') : '<div style="font-size:11px;color:#868e96;padding:4px">No triggers defined</div>'}
    `;
    this._bottomContentEl.querySelector('[data-add-trigger]')?.addEventListener('click', () => {
      const firstTable = tables[0];
      if (!firstTable) { this._showToast('Create a table first'); return; }
      this._store.addTrigger({
        triggerId: crypto.randomUUID(), schemaId: this._schema.schemaId, tableId: firstTable.tableId,
        triggerName: `trigger_${triggers.length + 1}`, timing: AcEnumDbTriggerTiming.Before, event: AcEnumDbTriggerEvent.Insert, triggerCode: '-- trigger body', description: '',
      });
      this._renderTriggersPanel();
    });
    this._bottomContentEl.querySelectorAll('[data-trig-name]').forEach(el =>
      el.addEventListener('change', () => { this._store.updateTrigger((el as HTMLElement).dataset['trigName']!, { triggerName: (el as HTMLInputElement).value }); })
    );
    this._bottomContentEl.querySelectorAll('[data-trig-body]').forEach(el =>
      el.addEventListener('change', () => { this._store.updateTrigger((el as HTMLElement).dataset['trigBody']!, { triggerCode: (el as HTMLTextAreaElement).value }); })
    );
    this._bottomContentEl.querySelectorAll('[data-del-trig]').forEach(el =>
      el.addEventListener('click', () => { this._store.deleteTrigger((el as HTMLElement).dataset['delTrig']!); this._renderTriggersPanel(); })
    );
  }

  private _renderRoutinesPanel(): void {
    const sps = this._store.getAllStoredProcedures();
    const fns = this._store.getAllFunctions();
    const e = this._escHtml.bind(this);
    this._bottomContentEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;margin-bottom:4px">
        <span style="font-weight:600;font-size:12px">Stored Procedures (${sps.length})</span>
        <button class="acd-btn acd-btn-primary" data-add-sp style="padding:2px 8px;font-size:11px">+ Add SP</button>
        <span style="font-weight:600;font-size:12px;margin-left:12px">Functions (${fns.length})</span>
        <button class="acd-btn acd-btn-primary" data-add-fn style="padding:2px 8px;font-size:11px">+ Add Function</button>
      </div>
      ${sps.map(sp => `
        <div style="display:flex;align-items:start;gap:6px;padding:4px;border:1px solid var(--acd-col-border);border-radius:4px;margin-bottom:4px">
          <div style="flex:1">
            <div style="font-size:10px;color:#339af0;font-weight:600">PROCEDURE</div>
            <input class="acd-form-input" data-sp-name="${sp.spId}" value="${e(sp.spName)}" style="font-weight:600;font-size:12px;margin-bottom:2px"/>
            <textarea class="acd-form-input" data-sp-body="${sp.spId}" rows="2" style="font-size:11px;font-family:monospace;resize:vertical">${e(sp.spCode)}</textarea>
          </div>
          <button data-del-sp="${sp.spId}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;font-size:14px">&times;</button>
        </div>
      `).join('')}
      ${fns.map(fn => `
        <div style="display:flex;align-items:start;gap:6px;padding:4px;border:1px solid var(--acd-col-border);border-radius:4px;margin-bottom:4px">
          <div style="flex:1">
            <div style="font-size:10px;color:#ae3ec9;font-weight:600">FUNCTION → ${e(fn.returnsType || 'VOID')}</div>
            <input class="acd-form-input" data-fn-name="${fn.functionId}" value="${e(fn.functionName)}" style="font-weight:600;font-size:12px;margin-bottom:2px"/>
            <textarea class="acd-form-input" data-fn-body="${fn.functionId}" rows="2" style="font-size:11px;font-family:monospace;resize:vertical">${e(fn.functionCode)}</textarea>
          </div>
          <button data-del-fn="${fn.functionId}" style="border:none;background:none;color:var(--acd-col-type-color);cursor:pointer;font-size:14px">&times;</button>
        </div>
      `).join('')}
      ${!sps.length && !fns.length ? '<div style="font-size:11px;color:#868e96;padding:4px">No routines defined</div>' : ''}
    `;
    this._bottomContentEl.querySelector('[data-add-sp]')?.addEventListener('click', () => {
      this._store.addStoredProcedure({ spId: crypto.randomUUID(), schemaId: this._schema.schemaId, spName: `sp_${sps.length + 1}`, spCode: '-- procedure body', description: '' });
      this._renderRoutinesPanel();
    });
    this._bottomContentEl.querySelector('[data-add-fn]')?.addEventListener('click', () => {
      this._store.addFunction({ functionId: crypto.randomUUID(), schemaId: this._schema.schemaId, functionName: `fn_${fns.length + 1}`, functionCode: '-- function body', returnsType: 'VARCHAR', description: '' });
      this._renderRoutinesPanel();
    });
    this._bottomContentEl.querySelectorAll('[data-sp-name]').forEach(el =>
      el.addEventListener('change', () => { this._store.updateStoredProcedure((el as HTMLElement).dataset['spName']!, { spName: (el as HTMLInputElement).value }); })
    );
    this._bottomContentEl.querySelectorAll('[data-sp-body]').forEach(el =>
      el.addEventListener('change', () => { this._store.updateStoredProcedure((el as HTMLElement).dataset['spBody']!, { spCode: (el as HTMLTextAreaElement).value }); })
    );
    this._bottomContentEl.querySelectorAll('[data-fn-name]').forEach(el =>
      el.addEventListener('change', () => { this._store.updateFunction((el as HTMLElement).dataset['fnName']!, { functionName: (el as HTMLInputElement).value }); })
    );
    this._bottomContentEl.querySelectorAll('[data-fn-body]').forEach(el =>
      el.addEventListener('change', () => { this._store.updateFunction((el as HTMLElement).dataset['fnBody']!, { functionCode: (el as HTMLTextAreaElement).value }); })
    );
    this._bottomContentEl.querySelectorAll('[data-del-sp]').forEach(el =>
      el.addEventListener('click', () => { this._store.deleteStoredProcedure((el as HTMLElement).dataset['delSp']!); this._renderRoutinesPanel(); })
    );
    this._bottomContentEl.querySelectorAll('[data-del-fn]').forEach(el =>
      el.addEventListener('click', () => { this._store.deleteFunction((el as HTMLElement).dataset['delFn']!); this._renderRoutinesPanel(); })
    );
  }

  private _escHtml(s: string): string {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /** Load a data_dictionary.json object directly (e.g., from a server). */
  loadFromJson(json: Record<string, unknown>): void {
    const { schema } = importFromJson(json, this._store, this._schema.schemaId);
    this._schema = schema;
    this._renderSidebar();
    this._renderBottomPanel();
    // Let canvas render one frame before fitting the layout
    requestAnimationFrame(() => {
      this._canvas.autoLayout();
      this._canvas.renderAreas();
      this._canvas.renderNotes();
      this._canvas.fitAll();
    });
  }

  /** Export to data_dictionary.json object. */
  toJson(): Record<string, unknown> {
    return exportToJson(this._schema, this._store) as Record<string, unknown>;
  }

  get schema(): AcDbSchema { return this._schema; }
  get store():  AcDbStore  { return this._store; }

  /** Load a schema by its ID from storage, switching the canvas view. */
  async loadSchema(schemaId: string): Promise<boolean> {
    const loaded = await this._storage.loadSchema(schemaId, this._store);
    if (loaded) {
      this._schema = loaded;
      this._selectedTableId = null;
      this._selectedColumnId = null;
      this._renderPropsEmpty();
      this._renderSidebar();
      this._renderBottomPanel();
      this._canvas.autoLayout();
      this._canvas.renderAreas();
      this._canvas.renderNotes();
      this._canvas.fitAll();
      if (this._ddSelect) this._ddSelect.value = schemaId;
      return true;
    }
    return false;
  }

  /** Populate the data dictionary dropdown. */
  setDataDictionaries(items: { id: string; name: string }[], selectedId?: string): void {
    if (!this._ddSelect) return;
    this._ddSelect.innerHTML = '<option value="">— Select Data Dictionary —</option>' +
      items.map(dd => `<option value="${dd.id}"${dd.id === selectedId ? ' selected' : ''}>${dd.name}</option>`).join('');
    // Wire change event (only once)
    if (!this._ddSelect.dataset['wired']) {
      this._ddSelect.dataset['wired'] = '1';
      this._ddSelect.addEventListener('change', async () => {
        const val = this._ddSelect.value;
        if (val) {
          await this.loadSchema(val);
          this.dispatchEvent(new CustomEvent('acd:dd-changed', {
            bubbles: true, detail: { dataDictionaryId: val },
          }));
        }
      });
    }
  }
}

export function registerAcDatabaseDesignerElement(): void {
  if (!customElements.get(TAG)) customElements.define(TAG, AcDatabaseDesignerElement);
}
