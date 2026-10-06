/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { AcDatagridCellEditorElement } from "./ac-datagrid-cell-editor.element";
import { AcDatagridCellRendererElement } from "./ac-datagrid-cell-renderer.element";
import { AcDatagridFunctionalCellRenderer } from "./ac-datagrid-functional-cell-renderer";
import { AcDatagridFunctionalCellEditor } from "./ac-datagrid-functional-cell-editor";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { AC_DATAGRID_HOOK, IAcDatagridCell, IAcDatagridCellEditor, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellHookArgs, IAcDatagridCellRenderer, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumn } from "../_ac-datagrid.export";
import { AcElementBase } from "../../../core/ac-element-base";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { acResolveCellValue } from "../helpers/ac-datagrid-value-helper";

export class AcDatagridCellElement extends AcElementBase {
  private datagridApi?: AcDatagridApi;
  private datagridColumn?: IAcDatagridColumn;
  private datagridRow?: IAcDatagridRow;

  get containerWidth(): number {
    const rendererEl = this.cellRenderer?.getElement();
    return rendererEl ? rendererEl.getBoundingClientRect().width : 0;
  }

  cellEditor?: IAcDatagridCellEditor;
  cellRenderer!: IAcDatagridCellRenderer;
  activeComponent?: IAcDatagridCellRenderer | IAcDatagridCellEditor;
  datagridCell!: IAcDatagridCell;
  isEditing: boolean = false;
  swappingColumpPosition: boolean = false;
  private useEditorForRenderer: boolean = false;
  initialized: boolean = false;
  previousValue: any;
  private _reflectedClasses: Set<string> = new Set();
  private treeIndentElement?: HTMLElement;
  private treeToggleElement?: HTMLElement;
  private _eventHandlers: Map<string, any> = new Map();


  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCell, element: this });
    this.registerEventListeners();
  }

  override blur() {
    this.checkCellValueChange(false);
  }

  private checkCellValueChange(delayCheck: boolean = true) {
    const checkFunction: Function = () => {
      if (this.cellEditor && this.cellEditor.getValue() != this.previousValue) {
        this.datagridRow.data[this.datagridColumn.columnKey] = this.cellEditor.getValue();
      }
    };
    if (delayCheck) {
      this.delayedCallback.add({ callback: checkFunction, duration: 500, key: 'checkCellValue' });
    }
    else {
      checkFunction();
    }

  }

  override destroy(): void {
    if (this.cellRenderer && this.cellRenderer.destroy) {
      this.cellRenderer.destroy();
    }
    (this.cellRenderer as any) = null;
    if (this.cellEditor && this.cellEditor.destroy) {
      this.cellEditor.destroy();
    }
    (this.cellEditor as any) = null;
    this.activeComponent = undefined;
    if (this.treeIndentElement) {
      this.treeIndentElement.remove();
      this.treeIndentElement = undefined;
    }
    if (this.treeToggleElement) {
      this.treeToggleElement.remove();
      this.treeToggleElement = undefined;
    }

    this._reflectedClasses.clear();
    this.isInitialized = false;
    this.datagridCell = null!;
    this.previousValue = null;
    if (this._eventHandlers) {
      for (const [event, handler] of this._eventHandlers) {
        this.removeEventListener(event, handler);
      }
      this._eventHandlers.clear();
    }
    super.destroy();
  }

  isEditable(): boolean {
    if (!this.datagridColumn) return false;
    const colDef = this.datagridColumn.columnDefinition;
    const editableVal = colDef.editable !== undefined ? colDef.editable : colDef.allowEdit;

    if (typeof editableVal === 'function') {
      return !!editableVal({
        row: this.datagridRow,
        column: this.datagridColumn,
        datagridApi: this.datagridApi
      });
    }

    return editableVal === true;
  }

  startEdit() {
    if (!this.isEditable()) return;
    this.enterEditMode();
  }

  enterEditMode() {
    if (!this.isEditable() || this.isEditing || this.useEditorForRenderer) return;
    this.isEditing = true;
    this.initEditorElement();
    if (this.cellEditor) {
      // Hide renderer and tree controls, show editor
      const rendererEl = this.cellRenderer?.getElement();
      if (rendererEl) rendererEl.style.display = 'none';
      if (this.treeToggleElement) this.treeToggleElement.style.display = 'none';
      if (this.treeIndentElement) this.treeIndentElement.style.display = 'none';
      this.append(this.cellEditor.getElement());
      this.activeComponent = this.cellEditor;
    }
    this.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridCellEditing);
    this.previousValue = this.datagridRow.data[this.datagridColumn.columnKey];
  }

  exitEditMode() {
    if (this.isEditing && !this.useEditorForRenderer) {
      this.isEditing = false;
      this.classList.remove(AC_DATAGRID_CLASS_NAME.acDatagridCellEditing);
      if (this.cellEditor) {
        this.cellEditor.getElement().remove();
        const rendererEl = this.cellRenderer?.getElement();
        if (rendererEl) rendererEl.style.display = '';
        if (this.treeToggleElement) this.treeToggleElement.style.display = '';
        if (this.treeIndentElement) this.treeIndentElement.style.display = '';
        this.cellRenderer.refresh({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
        this.activeComponent = this.cellRenderer;
      }
    }
  }

  override focus() {
    if (this.isEditable()) {
      this.enterEditMode();
    }
    this.checkCellValueChange();
    if (this.activeComponent && this.activeComponent.focus) {
      this.activeComponent.focus();
    }
  }

  private initEditorElement() {
    if (this.cellEditor) return;
    const colDef = this.datagridColumn.columnDefinition;
    const { rawValue } = acResolveCellValue({
      row: this.datagridRow,
      column: this.datagridColumn,
      datagridApi: this.datagridApi
    });
    const cellElementArgs = {
      datagridApi: this.datagridApi,
      datagridCell: this.datagridCell,
      value: rawValue,
      rawValue,
      row: this.datagridRow,
      column: this.datagridColumn,
      params: colDef.cellEditorElementParams
    };

    if (colDef.cellEditorFunction) {
      // Functional editor: colDef.cellEditorFunction(args) => HTMLElement
      this.cellEditor = new AcDatagridFunctionalCellEditor();
      this.datagridApi.events.execute({
        event: AC_DATAGRID_EVENT.CellEditorElementInit,
        args: { datagridApi: this.datagridApi, datagridCell: this.datagridCell, cellEditorElementInstance: this.cellEditor }
      });
      this.cellEditor.init(cellElementArgs);
    } else if (colDef.cellEditorElement) {
      // Class-based custom editor
      this.cellEditor = new colDef.cellEditorElement();
      const elementInitEventArgs: IAcDatagridCellEditorElementInitEvent = {
        datagridApi: this.datagridApi,
        datagridCell: this.datagridCell,
        cellEditorElementInstance: this.cellEditor,
      };
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellEditorElementInit, args: elementInitEventArgs });
      this.cellEditor.init(cellElementArgs);
    } else if (colDef.cellInputElement) {
      // cellInputElement: class constructor or tag string
      const inputEl: HTMLElement = typeof colDef.cellInputElement === 'string'
        ? this.ownerDocument.createElement(colDef.cellInputElement)
        : new colDef.cellInputElement();
      // Apply attrs and params
      if (colDef.cellInputElementAttrs) {
        for (const [k, v] of Object.entries(colDef.cellInputElementAttrs)) {
          inputEl.setAttribute(k, String(v));
        }
      }
      if (rawValue !== undefined && rawValue !== null && 'value' in (inputEl as any)) {
        (inputEl as any).value = rawValue;
      }
      // Wrap in a minimal IAcDatagridCellEditor adapter
      this.cellEditor = {
        getElement: () => inputEl,
        getValue: () => 'value' in (inputEl as any) ? (inputEl as any).value : undefined,
        focus: () => inputEl.focus(),
        blur: () => inputEl.blur(),
        init: (_args: any) => { /* already initialized above */ },
        refresh: (_args: any) => {
          if ('value' in (inputEl as any)) {
            (inputEl as any).value = this.datagridRow.data[this.datagridColumn.columnKey] ?? '';
          }
        },
        destroy: () => { inputEl.remove(); }
      } as any;
    } else {
      // Default: plain AcDatagridCellEditorElement
      this.cellEditor = new AcDatagridCellEditorElement();
      this.cellEditor.init(cellElementArgs);
    }
  }

  refresh() {
    this.updateTreeControls();
    this.applyPinning();
    this.applyReflectedClasses();
    this.updateTooltipTitle();
    if (this.cellRenderer && this.cellRenderer.refresh) {
      const colDef = this.datagridColumn?.columnDefinition;
      const { rawValue, formattedValue } = acResolveCellValue({
        row: this.datagridRow,
        column: this.datagridColumn,
        datagridApi: this.datagridApi
      });
      this.cellRenderer.refresh({
        datagridApi: this.datagridApi,
        datagridCell: this.datagridCell,
        value: formattedValue,
        rawValue,
        row: this.datagridRow,
        column: this.datagridColumn,
        params: colDef?.cellRendererElementParams
      });
    }
  }

  updateTooltipTitle() {
    if (!this.title && this.datagridRow?.data && this.datagridColumn) {
      const { rawValue } = acResolveCellValue({
        row: this.datagridRow,
        column: this.datagridColumn,
        datagridApi: this.datagridApi
      });
      if (rawValue !== undefined && rawValue !== null && typeof rawValue !== 'object') {
        this.title = String(rawValue);
      }
    }
  }

  cancelEdit() {
    if (this.isEditing && !this.useEditorForRenderer) {
      if (this.cellEditor && this.previousValue !== undefined) {
        this.datagridRow.data[this.datagridColumn.columnKey] = this.previousValue;
      }
      this.classList.remove('invalid');
      this.title = '';
      this.exitEditMode();
    }
  }

  commitEdit(): boolean {
    if (this.isEditing && this.cellEditor) {
      const newVal = this.cellEditor.getValue();
      if (this.datagridColumn && this.datagridColumn.columnDefinition.validator) {
        const validation = this.datagridColumn.columnDefinition.validator(newVal, this.datagridRow, this.datagridColumn);
        if (validation === false || typeof validation === 'string') {
          this.classList.add('invalid');
          if (typeof validation === 'string') {
            this.title = validation;
          }
          return false;
        }
      }
      this.classList.remove('invalid');
      this.title = '';
      const oldVal = this.previousValue;
      this.datagridRow.data[this.datagridColumn.columnKey] = newVal;
      if (oldVal !== newVal && this.datagridApi) {
        this.datagridApi.events.execute({
          event: AC_DATAGRID_EVENT.CellValueChange,
          args: { datagridRow: this.datagridRow, datagridColumn: this.datagridColumn, oldValue: oldVal, newValue: newVal, datagridApi: this.datagridApi }
        });
        if ((this.datagridApi as any).notifyStateChange) {
          (this.datagridApi as any).notifyStateChange({ source: 'cellEdit', payload: { rowId: this.datagridRow.rowId, col: this.datagridColumn.columnKey } });
        }
        // Flash this cell on value change
        if ((this.datagridApi as any).flashCells) {
          (this.datagridApi as any).flashCells({
            rowIds: [this.datagridRow.rowId],
            columnKeys: [this.datagridColumn.columnKey],
            color: 'green'
          });
        }
      }
      this.exitEditMode();
      return true;
    }
    return true;
  }

  registerEventListeners() {
    const handleFocusOut = (e: FocusEvent) => {
      if (this.isEditing && !this.contains(e.relatedTarget as Node)) {
        this.commitEdit();
      }
    };
    this.addEventListener('focusout', handleFocusOut);
    this._eventHandlers.set('focusout', handleFocusOut);
  }

  private isParentColumn(): boolean {
    if (!this.datagridApi?.hasTreeOrGroup || !this.datagridColumn) return false;
    const colDef = this.datagridColumn.columnDefinition;
    if (colDef.isTreeColumn === true || (colDef as any).showTreeToggle === true) return true;
    const treeConfig = this.datagridApi.treeConfig as any;
    if (treeConfig?.treeColumn && this.datagridColumn.columnKey === treeConfig.treeColumn) return true;
    const treeExt = (this.datagridApi as any).treeTableExtension;
    if (treeExt?.treeDataDisplayKey && this.datagridColumn.columnKey === treeExt.treeDataDisplayKey) return true;
    // Fallback: first visible column
    const visibleCols = this.datagridApi.datagridColumns.filter(c => c.visible);
    return visibleCols[0]?.columnId === this.datagridColumn.columnId;
  }

  updateTreeControls() {
    // Remove existing tree controls
    if (this.treeIndentElement) {
      this.treeIndentElement.remove();
      this.treeIndentElement = undefined;
    }
    if (this.treeToggleElement) {
      this.treeToggleElement.remove();
      this.treeToggleElement = undefined;
    }

    if (!this.isParentColumn() || !this.datagridRow) return;

    const level = this.datagridRow.level || 0;
    const indentPx = level * 20;

    // Indent spacer
    if (indentPx > 0) {
      this.treeIndentElement = this.ownerDocument.createElement('span');
      this.treeIndentElement.className = 'ac-datagrid-cell-tree-indent';
      this.treeIndentElement.style.display = 'inline-block';
      this.treeIndentElement.style.width = `${indentPx}px`;
      this.treeIndentElement.style.flexShrink = '0';
    }

    // Toggle / spacer
    this.treeToggleElement = this.ownerDocument.createElement('span');
    const hasChildren = this.datagridRow.hasChildren || this.datagridRow.isGroupHeader;
    if (hasChildren) {
      this.treeToggleElement.className = 'ac-datagrid-cell-tree-toggle';
      if ((this.datagridApi as any).loadingRowIds?.has(this.datagridRow.rowId)) {
        this.treeToggleElement.textContent = '⏳';
      } else {
        this.treeToggleElement.textContent = this.datagridRow.isExpanded ? '▼' : '▶';
      }
      this.treeToggleElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.datagridApi?.toggleRow({ rowId: this.datagridRow.rowId });
      });
    } else {
      this.treeToggleElement.className = 'ac-datagrid-cell-tree-spacer';
    }

    // Prepend into the host element before the renderer
    const rendererEl = this.cellRenderer?.getElement();
    if (this.treeIndentElement) {
      this.insertBefore(this.treeIndentElement, rendererEl ?? null);
    }
    this.insertBefore(this.treeToggleElement, rendererEl ?? null);
  }

  applyReflectedClasses() {
    if (!this.datagridColumn) return;
    const colDef = this.datagridColumn.columnDefinition;
    const cellClass = colDef.cellClass;
    if (!cellClass) {
      for (const cls of this._reflectedClasses) {
        this.classList.remove(cls);
      }
      this._reflectedClasses.clear();
      return;
    }

    let newClasses: string[] = [];
    if (typeof cellClass === 'string') {
      newClasses = cellClass.split(/\s+/).filter(Boolean);
    } else if (Array.isArray(cellClass)) {
      newClasses = (cellClass as string[]).filter(Boolean);
    } else if (typeof cellClass === 'object') {
      newClasses = Object.entries(cellClass as Record<string, boolean>)
        .filter(([, v]) => v)
        .map(([k]) => k);
    } else if (typeof cellClass === 'function') {
      const result = (cellClass as Function)({
        row: this.datagridRow,
        column: this.datagridColumn,
        datagridApi: this.datagridApi
      });
      if (typeof result === 'string') {
        newClasses = result.split(/\s+/).filter(Boolean);
      } else if (Array.isArray(result)) {
        newClasses = result.filter(Boolean);
      } else if (result && typeof result === 'object') {
        newClasses = Object.entries(result as Record<string, boolean>)
          .filter(([, v]) => v)
          .map(([k]) => k);
      }
    }

    const newSet = new Set(newClasses);
    for (const cls of this._reflectedClasses) {
      if (!newSet.has(cls)) this.classList.remove(cls);
    }
    for (const cls of newSet) {
      if (!this._reflectedClasses.has(cls)) this.classList.add(cls);
    }
    this._reflectedClasses = newSet;
  }

  private initElement() {
    // Mount renderer directly on host (no intermediate container div)
    this.append(this.cellRenderer.getElement());
    this.setCellWidth();
    this.applyPinning();
    this.setCellFocusable();
    this.updateTreeControls();
    this.applyReflectedClasses();
    this.updateTooltipTitle();
  }

  setCellWidth() {
    if (this.datagridColumn) {
      const width = this.datagridColumn.width;
      this.style.width = `${width}px`;
      this.style.maxWidth = `${width}px`;
      this.style.minWidth = `${width}px`;
      this.style.boxSizing = 'border-box';
      this.style.flexShrink = '0';
      this.style.overflow = "hidden";
      this.applyPinning();
    }
  }

  applyPinning() {
    if (this.datagridColumn && this.datagridColumn.pinnedOn) {
      this.style.position = 'sticky';
      this.style.zIndex = '2';
      this.style.flexShrink = '0';
      if (this.datagridColumn.pinnedOn === 'LEFT') {
        const offset = this.datagridApi.getPinnedLeftOffset(this.datagridColumn);
        this.style.left = `${offset}px`;
        this.style.right = '';
        this.classList.add('ac-datagrid-pinned-left');
        this.classList.remove('ac-datagrid-pinned-right');
      } else if (this.datagridColumn.pinnedOn === 'RIGHT') {
        const offset = this.datagridApi.getPinnedRightOffset(this.datagridColumn);
        this.style.right = `${offset}px`;
        this.style.left = '';
        this.classList.add('ac-datagrid-pinned-right');
        this.classList.remove('ac-datagrid-pinned-left');
      }
    } else {
      this.style.position = '';
      this.style.left = '';
      this.style.right = '';
      this.style.zIndex = '';
      this.style.backgroundColor = '';
      this.classList.remove('ac-datagrid-pinned-left', 'ac-datagrid-pinned-right');
    }
  }

  setCellFocusable() {
    if (this.datagridColumn.allowFocus) {
      this.setAttribute('tabindex', "0");
    }
    else {
      this.removeAttribute('tabindex');
    }
  }

  private render() {
    const colDef = this.datagridColumn.columnDefinition;
    const { rawValue, formattedValue } = acResolveCellValue({
      row: this.datagridRow,
      column: this.datagridColumn,
      datagridApi: this.datagridApi
    });
    const cellElementArgs = {
      datagridApi: this.datagridApi,
      datagridCell: this.datagridCell,
      value: formattedValue,
      rawValue,
      row: this.datagridRow,
      column: this.datagridColumn,
      params: colDef.cellRendererElementParams
    };

    if (colDef.cellRendererFunction) {
      // Functional renderer
      this.cellRenderer = new AcDatagridFunctionalCellRenderer();
      const elementInitEventArgs: IAcDatagridCellRendererElementInitEvent = {
        datagridApi: this.datagridApi,
        datagridCell: this.datagridCell,
        cellRendererElementInstance: this.cellRenderer,
      };
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellRendererElementInit, args: elementInitEventArgs });
    } else if (colDef.cellRendererElement) {
      // Class-based custom renderer
      this.cellRenderer = new colDef.cellRendererElement();
      const elementInitEventArgs: IAcDatagridCellRendererElementInitEvent = {
        datagridApi: this.datagridApi,
        datagridCell: this.datagridCell,
        cellRendererElementInstance: this.cellRenderer,
      };
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellRendererElementInit, args: elementInitEventArgs });
    } else if (colDef.cellEditorElement && colDef.useCellEditorForRenderer === true) {
      this.initEditorElement();
      if (this.cellEditor) {
        this.cellRenderer = this.cellEditor;
        this.isEditing = true;
      }
    } else {
      this.cellRenderer = new AcDatagridCellRendererElement();
    }

    this.cellRenderer.init(cellElementArgs);

    // Apply cellRendererElementAttrs to the rendered element
    if (colDef.cellRendererElementAttrs && this.cellRenderer.getElement()) {
      for (const [k, v] of Object.entries(colDef.cellRendererElementAttrs)) {
        this.cellRenderer.getElement().setAttribute(k, String(v));
      }
    }

    this.activeComponent = this.cellRenderer;
    const cellCreatedHookArgs: IAcDatagridCellHookArgs = {
      datagridApi: this.datagridApi,
      datagridCell: this.datagridCell,
    };
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.DatagridCellCreate, args: cellCreatedHookArgs });
    this.initElement();
  }

  setCell({ datagridCell, datagridApi }: { datagridCell: IAcDatagridCell, datagridApi: AcDatagridApi }) {
    this.datagridCell = datagridCell;
    this.datagridApi = datagridApi;
    this.datagridRow = datagridCell.datagridRow;
    this.datagridColumn = datagridCell.datagridColumn;
    this.useEditorForRenderer = this.datagridColumn.columnDefinition.useCellEditorForRenderer;
    this.render();
    // this.innerHTML = this.datagridRow.data[this.datagridColumn.columnKey];
  }

}

acRegisterCustomElement({ tag: 'ac-datagrid-cell', type: AcDatagridCellElement });
