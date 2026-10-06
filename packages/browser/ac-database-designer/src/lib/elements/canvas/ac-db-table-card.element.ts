/**
 * <ac-db-table-card> — Draggable table node on the canvas.
 * Pure Custom Element, no framework.
 * Renders: header (color dot + name + collapse + delete buttons)
 *          + column rows with socket dots + badges.
 *
 * Attributes:
 *  table-id       — the AcDbTable.tableId
 *  table-name     — display name
 *  color          — hex color for the dot (optional)
 *  collapsed      — boolean attr; if present, hides body
 *  selected       — boolean attr; if present, shows selected ring
 */
import { AcDbColumn } from '../../models/ac-db-column.model';
import { AcEnumDbColumnType } from '../../enums/ac-enum-db-column-type';

const TAG = 'ac-db-table-card';

function badge(col: AcDbColumn): string {
  const parts: string[] = [];
  if (col.primaryKey)    parts.push('<span class="acd-col-badge pk">PK</span>');
  if (col.foreignKeyTableId) parts.push('<span class="acd-col-badge fk">FK</span>');
  if (col.autoIncrement) parts.push('<span class="acd-col-badge ai">AI</span>');
  return parts.join('');
}

function shortType(col: AcDbColumn): string {
  const map: Partial<Record<AcEnumDbColumnType, string>> = {
    [AcEnumDbColumnType.AutoIncrement]: 'INT',
    [AcEnumDbColumnType.AutoIndex]:     'INT',
    [AcEnumDbColumnType.AutoNumber]:    'AUTO',
    [AcEnumDbColumnType.String]:        col.length ? `VAR(${col.length})` : 'VAR',
    [AcEnumDbColumnType.Integer]:       'INT',
    [AcEnumDbColumnType.BigInteger]:    'BIGINT',
    [AcEnumDbColumnType.Double]:        'DBL',
    [AcEnumDbColumnType.Decimal]:       'DEC',
    [AcEnumDbColumnType.Float]:         'FLT',
    [AcEnumDbColumnType.Text]:          'TEXT',
    [AcEnumDbColumnType.Boolean]:       'BOOL',
    [AcEnumDbColumnType.YesNo]:         'BOOL',
    [AcEnumDbColumnType.Date]:          'DATE',
    [AcEnumDbColumnType.Datetime]:      'DT',
    [AcEnumDbColumnType.Timestamp]:     'TS',
    [AcEnumDbColumnType.Time]:          'TIME',
    [AcEnumDbColumnType.Uuid]:          'UUID',
    [AcEnumDbColumnType.Json]:          'JSON',
    [AcEnumDbColumnType.Jsonb]:         'JSONB',
    [AcEnumDbColumnType.Blob]:          'BLOB',
    [AcEnumDbColumnType.Encrypted]:     'ENC',
    [AcEnumDbColumnType.Password]:      'PWD',
    [AcEnumDbColumnType.Xml]:           'XML',
  };
  return map[col.columnType] ?? col.columnType ?? '?';
}

export class AcDbTableCardElement extends HTMLElement {
  static get observedAttributes() {
    return ['table-id', 'table-name', 'color', 'collapsed', 'selected'];
  }

  private _columns: AcDbColumn[] = [];

  connectedCallback(): void { this._render(); }

  attributeChangedCallback(): void { if (this.isConnected) this._render(); }

  setColumns(cols: AcDbColumn[]): void {
    this._columns = cols;
    if (this.isConnected) this._render();
  }

  private _render(): void {
    const tableId   = this.getAttribute('table-id')   ?? '';
    const tableName = this.getAttribute('table-name') ?? 'Table';
    const color     = this.getAttribute('color')      ?? '#339af0';
    const collapsed = this.hasAttribute('collapsed');
    const selected  = this.hasAttribute('selected');

    this.className = `acd-table-card${selected ? ' selected' : ''}`;
    this.dataset['tableId'] = tableId;

    const colRows = this._columns.map((col, idx) => `
      <div class="acd-col-row" data-col-id="${col.columnId}" data-col-idx="${idx}">
        <span class="acd-col-grip" draggable="true" title="Drag to reorder" style="cursor:grab;color:#adb5bd;font-size:10px;padding:0 2px;flex-shrink:0">⠿</span>
        <div class="acd-socket left"
             data-socket="left"
             data-table-id="${tableId}"
             data-col-id="${col.columnId}"
             title="Draw connection from ${col.columnName}"></div>
        ${badge(col)}
        <span class="acd-col-name" data-col-name-id="${col.columnId}" title="${col.columnName}">${col.columnName}</span>
        <span class="acd-col-type">${shortType(col)}</span>
        <div class="acd-socket right"
             data-socket="right"
             data-table-id="${tableId}"
             data-col-id="${col.columnId}"
             title="Draw connection from ${col.columnName}"></div>
      </div>
    `).join('');

    this.innerHTML = `
      <div class="acd-card-header" data-drag-handle data-table-id="${tableId}">
        <span class="acd-card-color-dot" style="background:${color}"></span>
        <span class="acd-card-title" data-editable-title title="${tableName}">${tableName}</span>
        <div class="acd-card-actions">
          <button class="acd-card-btn" data-action="toggle" title="Collapse/Expand">${collapsed ? '▸' : '▾'}</button>
          <button class="acd-card-btn" data-action="delete" title="Delete table">✕</button>
        </div>
      </div>
      <div class="acd-card-body" style="${collapsed ? 'display:none' : ''}">
        ${colRows}
        <div class="acd-card-footer">
          <button class="acd-add-col-btn" data-action="add-column" data-table-id="${tableId}">+ Add Column</button>
        </div>
      </div>
    `;

    // Action buttons inside card (delete, toggle, add-column)
    this.querySelectorAll('.acd-card-btn[data-action="delete"]').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('acd:delete-table', {
          bubbles: true,
          detail: { tableId }
        }));
      });
    });

    this.querySelectorAll('.acd-card-btn[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('acd:toggle-table', {
          bubbles: true,
          detail: { tableId }
        }));
      });
    });

    this.querySelectorAll('.acd-add-col-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('acd:add-column', {
          bubbles: true,
          detail: { tableId }
        }));
      });
    });

    // Column click → select column
    this.querySelectorAll('.acd-col-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.dataset['socket'] || target.classList.contains('acd-col-grip') || target.contentEditable === 'true') return;
        const colId = (row as HTMLElement).dataset['colId'];
        if (colId) {
          e.stopPropagation();
          this.dispatchEvent(new CustomEvent('acd:select-column', {
            bubbles: true,
            detail: { columnId: colId }
          }));
        }
      });
    });

    // UI-2: Double-click to inline-edit table name
    const titleEl = this.querySelector('[data-editable-title]') as HTMLElement;
    titleEl?.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      titleEl.contentEditable = 'true';
      titleEl.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(titleEl);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const commit = () => {
        titleEl.contentEditable = 'false';
        const newName = (titleEl.textContent || '').trim();
        if (newName && newName !== tableName) {
          this.dispatchEvent(new CustomEvent('table-renamed', {
            bubbles: true, detail: { tableId, newName }
          }));
        }
      };
      titleEl.addEventListener('blur', commit, { once: true });
      titleEl.addEventListener('keydown', (ke: KeyboardEvent) => {
        if (ke.key === 'Enter') { ke.preventDefault(); titleEl.blur(); }
        if (ke.key === 'Escape') { titleEl.textContent = tableName; titleEl.blur(); }
      });
    });

    // UI-1: Double-click to inline-edit column name
    this.querySelectorAll('[data-col-name-id]').forEach(colEl => {
      colEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const el = colEl as HTMLElement;
        const colId = el.dataset['colNameId']!;
        const origName = el.textContent || '';
        el.contentEditable = 'true';
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        const commitCol = () => {
          el.contentEditable = 'false';
          const newName = (el.textContent || '').trim();
          if (newName && newName !== origName) {
            this.dispatchEvent(new CustomEvent('column-renamed', {
              bubbles: true, detail: { columnId: colId, newName }
            }));
          }
        };
        el.addEventListener('blur', commitCol, { once: true });
        el.addEventListener('keydown', (ke: KeyboardEvent) => {
          if (ke.key === 'Enter') { ke.preventDefault(); el.blur(); }
          if (ke.key === 'Escape') { el.textContent = origName; el.blur(); }
        });
      });
    });

    // UI-3: Column drag-to-reorder
    let dragColId: string | null = null;

    // Drag source: grip handles
    this.querySelectorAll('.acd-col-grip[draggable]').forEach(grip => {
      grip.addEventListener('dragstart', (e) => {
        const row = (grip as HTMLElement).closest('.acd-col-row') as HTMLElement;
        dragColId = row?.dataset['colId'] ?? null;
        (e as DragEvent).dataTransfer!.effectAllowed = 'move';
        if (row) row.style.opacity = '0.4';
      });
      grip.addEventListener('dragend', () => {
        const row = (grip as HTMLElement).closest('.acd-col-row') as HTMLElement;
        if (row) row.style.opacity = '';
        dragColId = null;
        this.querySelectorAll('.acd-col-row').forEach(r => (r as HTMLElement).style.borderTop = '');
      });
    });

    // Drop targets: row divs
    this.querySelectorAll('.acd-col-row').forEach(row => {
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        (e as DragEvent).dataTransfer!.dropEffect = 'move';
        (row as HTMLElement).style.borderTop = '2px solid var(--acd-card-selected, #339af0)';
      });
      row.addEventListener('dragleave', () => {
        (row as HTMLElement).style.borderTop = '';
      });
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        (row as HTMLElement).style.borderTop = '';
        const targetIdx = parseInt((row as HTMLElement).dataset['colIdx'] ?? '0', 10);
        if (dragColId) {
          this.dispatchEvent(new CustomEvent('column-reorder', {
            bubbles: true, detail: { columnId: dragColId, newIndex: targetIdx }
          }));
        }
      });
    });
  }

  /** Position this card at world coordinates (used by canvas). */
  setPosition(x: number, y: number): void {
    this.style.left = `${x}px`;
    this.style.top  = `${y}px`;
  }
}

export function registerAcDbTableCardElement(): void {
  if (!customElements.get(TAG)) customElements.define(TAG, AcDbTableCardElement);
}
