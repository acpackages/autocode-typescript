/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement, acClearElement, acCloneEvent, acListenElementEvents, acRegisterCustomElement, acRemoveClassFromElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { AcDatagridCellEditorElement } from "./ac-datagrid-cell-editor.element";
import { AcDatagridCellRendererElement } from "./ac-datagrid-cell-renderer.element";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { IAcDatagridColumnResizeEvent } from "../interfaces/event-args/ac-datagrid-column-resize-event.interface";
import { AC_DATAGRID_HOOK, IAcDatagridCell, IAcDatagridCellEditor, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellHookArgs, IAcDatagridCellRenderer, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumn } from "../_ac-datagrid.export";
import { AcElementBase } from "../../../core/ac-element-base";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { Autocode } from "@autocode-ts/autocode";

export class AcDatagridCellElement extends AcElementBase {
  private datagridApi?: AcDatagridApi;
  private datagridColumn?: IAcDatagridColumn;
  private datagridRow?: IAcDatagridRow;

  get containerWidth(): number {
    let result: number = 0;
    if (this.container) {
      const firstChild = this.container.firstChild;
      if (firstChild) {
        result = (firstChild as HTMLElement).getBoundingClientRect().width;
      }
    }
    return result;
  }

  cellEditor?: AcDatagridCellEditorElement;
  cellRenderer!: IAcDatagridCellRenderer;
  activeComponent?: IAcDatagridCellRenderer | IAcDatagridCellEditor;
  datagridCell!: IAcDatagridCell;
  isEditing: boolean = false;
  swappingColumpPosition: boolean = false;
  private useEditorForRenderer: boolean = false;
  initialized: boolean = false;
  previousValue: any;
  container?: HTMLElement;
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
    if (this.container) {
      acClearElement({ element: this.container });
      if (this.container.parentNode) {
        this.container.remove();
      }
      this.container = null!;
    }
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

  enterEditMode() {
    if (!this.isEditing && !this.useEditorForRenderer) {
      this.isEditing = true;
      this.initEditorElement();
      if (this.cellEditor) {
        acClearElement({ element: this.container });
        this.container.append(this.cellEditor.getElement());
        this.activeComponent = this.cellEditor;
      }
      acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCellEditing, element: this });
      this.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridCellEditing);
      this.previousValue = this.datagridRow.data[this.datagridColumn.columnKey];
    }


  }

  exitEditMode() {
    if (this.isEditing && !this.useEditorForRenderer) {
      this.isEditing = false;
      acRemoveClassFromElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridCellEditing, element: this });
      if (this.cellEditor) {
        acClearElement({ element: this.container });
        this.cellRenderer.refresh({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
        this.activeComponent = this.cellRenderer;
        this.container.append(this.cellRenderer.getElement());
      }
    }
  }

  override focus() {
    if (this.datagridColumn && this.datagridColumn.allowEdit) {
      this.enterEditMode();
    }
    this.checkCellValueChange();
    if (this.activeComponent && this.activeComponent.focus) {
      this.activeComponent.focus();
    }
  }

  private initEditorElement() {
    if (!this.cellEditor && this.datagridColumn.columnDefinition.cellEditorElement) {
      this.cellEditor = new this.datagridColumn.columnDefinition.cellEditorElement();
      const elementInitEventArgs: IAcDatagridCellEditorElementInitEvent = {
        datagridApi: this.datagridApi,
        datagridCell: this.datagridCell,
        cellEditorElementInstance: this.cellEditor,
      }
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellEditorElementInit, args: elementInitEventArgs });
      this.cellEditor.init({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
    }
    else if (!this.cellEditor) {
      this.cellEditor = new AcDatagridCellEditorElement();
      this.cellEditor.init({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
    }
  }

  refresh() {
    if (this.cellRenderer && this.cellRenderer.refresh) {
      this.cellRenderer.refresh({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
    }
  }

  registerEventListeners() {
    const handleFocusOut = (e: FocusEvent) => {
      this.datagridApi.eventHandler.handleCellBlur({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('focusout', handleFocusOut);
    this._eventHandlers.set('focusout', handleFocusOut);

    const handleFocusIn = (e: FocusEvent) => {
      this.datagridApi.eventHandler.handleCellFocus({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('focusin', handleFocusIn);
    this._eventHandlers.set('focusin', handleFocusIn);

    // Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      this.datagridApi.eventHandler.handleCellKeyDown({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('keydown', handleKeyDown);
    this._eventHandlers.set('keydown', handleKeyDown);

    const handleKeyPress = (e: KeyboardEvent) => {
      this.datagridApi.eventHandler.handleCellKeyPress({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('keypress', handleKeyPress);
    this._eventHandlers.set('keypress', handleKeyPress);

    const handleKeyUp = (e: KeyboardEvent) => {
      this.datagridApi.eventHandler.handleCellKeyUp({ datagridCell: this.datagridCell, event: e });
      this.checkCellValueChange();
    };
    this.addEventListener('keyup', handleKeyUp);
    this._eventHandlers.set('keyup', handleKeyUp);

    // Mouse events
    const handleClick = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellClick({ datagridCell: this.datagridCell, event: e });
      this.checkCellValueChange();
    };
    this.addEventListener('click', handleClick);
    this._eventHandlers.set('click', handleClick);

    const handleDoubleClick = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellDoubleClick({ datagridCell: this.datagridCell, event: e });
      this.checkCellValueChange();
    };
    this.addEventListener('dblclick', handleDoubleClick);
    this._eventHandlers.set('dblclick', handleDoubleClick);

    const handleMouseDown = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellMouseDown({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('mousedown', handleMouseDown);
    this._eventHandlers.set('mousedown', handleMouseDown);

    const handleMouseEnter = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellMouseEnter({ datagridCell: this.datagridCell, event: e });
      this.datagridApi.hoverCellId = this.datagridCell.cellId;
      this.datagridApi.hoverColumnId = this.datagridCell.datagridColumn.columnId;
      this.datagridApi.hoverRowId = this.datagridCell.datagridRow.rowId;
    };
    this.addEventListener('mouseenter', handleMouseEnter);
    this._eventHandlers.set('mouseenter', handleMouseEnter);

    const handleMouseLeave = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellMouseLeave({ datagridCell: this.datagridCell, event: e });
      if (this.datagridApi.hoverCellId == this.datagridCell.cellId) {
        this.datagridApi.hoverCellId = undefined;
        this.datagridApi.hoverColumnId = undefined;
        this.datagridApi.hoverRowId = undefined;
      }
    };
    this.addEventListener('mouseleave', handleMouseLeave);
    this._eventHandlers.set('mouseleave', handleMouseLeave);

    const handleMouseMove = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellMouseMove({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('mousemove', handleMouseMove);
    this._eventHandlers.set('mousemove', handleMouseMove);

    const handleMouseOver = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellMouseOver({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('mouseover', handleMouseOver);
    this._eventHandlers.set('mouseover', handleMouseOver);

    const handleMouseUp = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleCellMouseUp({ datagridCell: this.datagridCell, event: e });
      this.checkCellValueChange();
    };
    this.addEventListener('mouseup', handleMouseUp);
    this._eventHandlers.set('mouseup', handleMouseUp);

    // Touch events
    const handleTouchCancel = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleCellTouchCancel({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    this._eventHandlers.set('touchcancel', handleTouchCancel);

    const handleTouchEnd = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleCellTouchEnd({ datagridCell: this.datagridCell, event: e });
      this.checkCellValueChange();
    };
    this.addEventListener('touchend', handleTouchEnd, { passive: true });
    this._eventHandlers.set('touchend', handleTouchEnd);

    const handleTouchMove = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleCellTouchMove({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('touchmove', handleTouchMove, { passive: true });
    this._eventHandlers.set('touchmove', handleTouchMove);

    const handleTouchStart = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleCellTouchStart({ datagridCell: this.datagridCell, event: e });
    };
    this.addEventListener('touchstart', handleTouchStart, { passive: true });
    this._eventHandlers.set('touchstart', handleTouchStart);
  }

  private initElement() {
    this.append(this.container);
    this.container.setAttribute('style', 'display:contents');
    this.container.append(this.cellRenderer.getElement());
    this.setCellWidth();
    this.applyPinning();
    this.setCellFocusable();
  }

  setCellWidth() {
    if (this.datagridColumn) {
      const width = this.datagridColumn.width;
      this.style.width = `${width}px`;
      this.style.maxWidth = `${width}px`;
      this.style.minWidth = `${width}px`;
      this.style.overflow = "hidden";
      this.applyPinning();
    }
  }

  applyPinning() {
    if (this.datagridColumn && this.datagridColumn.pinnedOn) {
      this.style.position = 'sticky';
      this.style.zIndex = '2';
      if (this.datagridColumn.pinnedOn === 'LEFT') {
        const offset = this.datagridApi.getPinnedLeftOffset(this.datagridColumn);
        this.style.left = `${offset}px`;
        this.style.right = '';
      } else if (this.datagridColumn.pinnedOn === 'RIGHT') {
        const offset = this.datagridApi.getPinnedRightOffset(this.datagridColumn);
        this.style.right = `${offset}px`;
        this.style.left = '';
      }
    } else {
      this.style.position = '';
      this.style.left = '';
      this.style.right = '';
      this.style.zIndex = '';
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
    if (!this.container) {
      this.container = this.ownerDocument.createElement('div');
    }
    if (this.datagridColumn.columnDefinition.cellRendererElement) {
      this.cellRenderer = new this.datagridColumn.columnDefinition.cellRendererElement();
      const elementInitEventArgs: IAcDatagridCellRendererElementInitEvent = {
        datagridApi: this.datagridApi,
        datagridCell: this.datagridCell,
        cellRendererElementInstance: this.cellRenderer,
      }
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellRendererElementInit, args: elementInitEventArgs });
    }
    else if (this.datagridColumn.columnDefinition.cellEditorElement && this.datagridColumn.columnDefinition.useCellEditorForRenderer == true) {
      this.initEditorElement();
      if (this.cellEditor) {
        this.cellRenderer = this.cellEditor;
        this.isEditing = true;
      }
    }
    else {
      this.cellRenderer = new AcDatagridCellRendererElement();
    }
    this.cellRenderer.init({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
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
