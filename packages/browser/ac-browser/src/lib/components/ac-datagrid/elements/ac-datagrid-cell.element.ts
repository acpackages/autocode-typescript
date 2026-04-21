/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement, acClearElement, acCloneEvent, acListenElementEvents, acRegisterCustomElement, acRemoveClassFromElement } from "../../../utils/ac-element-functions";
import { AcDatagridCssClassName } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { AcDatagridCellEditor } from "./ac-datagrid-cell-editor.element";
import { AcDatagridCellRendererElement } from "./ac-datagrid-cell-renderer.element";
import { AcDatagridAttributeName } from "../consts/ac-datagrid-attribute-name.const";
import { IAcDatagridColumnResizeEvent } from "../interfaces/event-args/ac-datagrid-column-resize-event.interface";
import { AC_DATAGRID_HOOK, IAcDatagridCell, IAcDatagridCellEditor, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellHookArgs, IAcDatagridCellRenderer, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumn } from "../_ac-datagrid.export";
import { AcElementBase } from "../../../core/ac-element-base";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { Autocode } from "@autocode-ts/autocode";

export class AcDatagridCellElement extends AcElementBase {
  private _datagridApi!: AcDatagridApi;
  get datagridApi(): AcDatagridApi {
    return this._datagridApi;
  }
  set datagridApi(value: AcDatagridApi) {
    this._datagridApi = value;
    this.initCell();
  }

  private _datagridColumn!: IAcDatagridColumn;
  get datagridColumn(): IAcDatagridColumn {
    return this._datagridColumn;
  }
  set datagridColumn(value: IAcDatagridColumn) {
    this._datagridColumn = value;
    // value.hooks.subscribe({
    //   hook: AC_DATAGRID_HOOK.ColumnWidthChange, callback: (event: IAcDatagridColumnResizeEvent) => {
    //     this.setCellWidth();
    //   }
    // });
    this.initCell();
  }

  private _datagridRow!: IAcDatagridRow;
  get datagridRow(): IAcDatagridRow {
    return this._datagridRow;
  }
  set datagridRow(value: IAcDatagridRow) {
    this._datagridRow = value;
    this.initCell();
  }

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

  container: HTMLElement = this.ownerDocument.createElement('div');
  cellEditor?: AcDatagridCellEditor;
  cellRenderer!: IAcDatagridCellRenderer;
  activeComponent?: IAcDatagridCellRenderer | IAcDatagridCellEditor;
  datagridCell!: IAcDatagridCell;
  isEditing: boolean = false;
  swappingColumpPosition: boolean = false;
  initialized: boolean = false;
  previousValue: any;
  private _eventHandlers: Map<string, any> = new Map();

  constructor() {
    super();
  }

  override blur() {
    this.checkCellValueChange(false);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.initCell();
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
    // if (this._datagridColumn?.hooks) {
    //   this._datagridColumn.hooks.unsubscribe({
    //     hook: AC_DATAGRID_HOOK.ColumnWidthChange,
    //     callback: this.setCellWidth.bind(this)
    //   });
    // }
    if (this.container) {
      acClearElement({element:this.container});
      if (this.container.parentNode) {
        this.container.remove();
      }
      this.container = null!;
    }
    this.isInitialized = false;
    this._datagridApi = null!;
    this._datagridColumn = null!;
    this._datagridRow = null!;
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

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  enterEditMode() {
    this.initEditorElement();
    if (this.cellEditor) {
      acClearElement({element:this.container});
      this.container.append(this.cellEditor.getElement());
      this.activeComponent = this.cellEditor;
    }
    acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridCellEditing, element: this });
    this.classList.add(AcDatagridCssClassName.acDatagridCellEditing);
    this.previousValue = this.datagridRow.data[this.datagridColumn.columnKey];
    this.isEditing = true;
  }

  exitEditMode() {
    this.isEditing = false;
    acRemoveClassFromElement({ class_: AcDatagridCssClassName.acDatagridCellEditing, element: this });
    if (this.cellEditor) {
      acClearElement({element:this.container});
      this.cellRenderer.refresh({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
      this.activeComponent = this.cellRenderer;
      this.container.append(this.cellRenderer.getElement());
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

  override init(): void {
    super.init();
    this.style.overflow = 'hidden';
  }

  private initCell() {
    requestAnimationFrame(() => {
      if (!this.datagridCell && this.datagridColumn && this.datagridRow && this.datagridApi && !this.initialized) {
        this.initialized = true;
        this.datagridCell = {
          datagridColumn: this.datagridColumn,
          datagridRow: this.datagridRow,
          element: this,
          cellId: Autocode.uuid(),
          isActive: false,
        };
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
    });
  }

  initEditorElement() {
    if (this.cellEditor == undefined) {
      if (this.datagridColumn.columnDefinition.cellEditorElement) {
        this.cellEditor = new this.datagridColumn.columnDefinition.cellEditorElement();
      }
      else {
        this.cellEditor = new AcDatagridCellEditor();
      }
      if (this.cellEditor) {
        this.cellEditor.init({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
        const inputElement = this.cellEditor.getElement();
        acListenElementEvents({
          element: inputElement, callback: ({ name, event }: { name: string, event: Event }) => {
            // this.dispatchEvent(acCloneEvent(event));
          }, mouse: true, keyboard: true, pointer: true, focus: true, form: true, touch: true, viewport: true
        });
        inputElement.addEventListener('change', () => {
          this.datagridRow.data[this.datagridColumn.columnKey] = this.cellEditor?.getValue();
        });
        inputElement.addEventListener('input', () => {
          this.datagridRow.data[this.datagridColumn.columnKey] = this.cellEditor?.getValue();
        });
        const editorInitEventArgs: IAcDatagridCellEditorElementInitEvent = {
          datagridApi: this.datagridApi,
          datagridCell: this.datagridCell,
          cellEditorElementInstance: this.cellEditor,
        }
        this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellEditorElementInit, args: editorInitEventArgs });
      }
    }
  }

  initElement() {
    this.setAttribute(AcDatagridAttributeName.acDatagridCellId, this.datagridCell.cellId);
    this.setAttribute(AcDatagridAttributeName.acDatagridColumnId, this.datagridColumn.columnId);
    this.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridRow.rowId);
    this.setAttribute('tabindex', "0");
    acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridCellContainer, element: this.container });
    this.append(this.container);
    this.container.setAttribute('style', 'display:contents');
    this.container.append(this.cellRenderer.getElement());
    this.setCellWidth();
    this.setCellFocusable();
  }

  refresh() {
    this.cellRenderer.refresh({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
    if (this.cellEditor) {
      this.cellEditor.refresh({ datagridApi: this.datagridApi, datagridCell: this.datagridCell });
    }
  }

  // registerEventListeners(){
  //   const handleFocusOut = (e: FocusEvent) => {
  //     this.datagridApi.eventHandler.handleCellBlur({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('focusout', handleFocusOut);
  //   this._eventHandlers.set('focusout', handleFocusOut);

  //   const handleFocusIn = (e: FocusEvent) => {
  //     this.datagridApi.eventHandler.handleCellFocus({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('focusin', handleFocusIn);
  //   this._eventHandlers.set('focusin', handleFocusIn);

  //   // Keyboard events
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     this.datagridApi.eventHandler.handleCellKeyDown({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('keydown', handleKeyDown);
  //   this._eventHandlers.set('keydown', handleKeyDown);

  //   const handleKeyPress = (e: KeyboardEvent) => {
  //     this.datagridApi.eventHandler.handleCellKeyPress({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('keypress', handleKeyPress);
  //   this._eventHandlers.set('keypress', handleKeyPress);

  //   const handleKeyUp = (e: KeyboardEvent) => {
  //     this.datagridApi.eventHandler.handleCellKeyUp({ datagridCell: this.datagridCell, event: e });
  //     this.checkCellValueChange();
  //   };
  //   this.addEventListener('keyup', handleKeyUp);
  //   this._eventHandlers.set('keyup', handleKeyUp);

  //   // Mouse events
  //   const handleClick = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellClick({ datagridCell: this.datagridCell, event: e });
  //     this.checkCellValueChange();
  //   };
  //   this.addEventListener('click', handleClick);
  //   this._eventHandlers.set('click', handleClick);

  //   const handleDoubleClick = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellDoubleClick({ datagridCell: this.datagridCell, event: e });
  //     this.checkCellValueChange();
  //   };
  //   this.addEventListener('dblclick', handleDoubleClick);
  //   this._eventHandlers.set('dblclick', handleDoubleClick);

  //   const handleMouseDown = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellMouseDown({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('mousedown', handleMouseDown);
  //   this._eventHandlers.set('mousedown', handleMouseDown);

  //   const handleMouseEnter = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellMouseEnter({ datagridCell: this.datagridCell, event: e });
  //     this.datagridApi.hoverCellId = this.datagridCell.cellId;
  //     this.datagridApi.hoverColumnId = this.datagridCell.datagridColumn.columnId;
  //     this.datagridApi.hoverRowId = this.datagridCell.datagridRow.rowId;
  //   };
  //   this.addEventListener('mouseenter', handleMouseEnter);
  //   this._eventHandlers.set('mouseenter', handleMouseEnter);

  //   const handleMouseLeave = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellMouseLeave({ datagridCell: this.datagridCell, event: e });
  //     if (this.datagridApi.hoverCellId == this.datagridCell.cellId) {
  //       this.datagridApi.hoverCellId = undefined;
  //       this.datagridApi.hoverColumnId = undefined;
  //       this.datagridApi.hoverRowId = undefined;
  //     }
  //   };
  //   this.addEventListener('mouseleave', handleMouseLeave);
  //   this._eventHandlers.set('mouseleave', handleMouseLeave);

  //   const handleMouseMove = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellMouseMove({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('mousemove', handleMouseMove);
  //   this._eventHandlers.set('mousemove', handleMouseMove);

  //   const handleMouseOver = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellMouseOver({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('mouseover', handleMouseOver);
  //   this._eventHandlers.set('mouseover', handleMouseOver);

  //   const handleMouseUp = (e: MouseEvent) => {
  //     this.datagridApi.eventHandler.handleCellMouseUp({ datagridCell: this.datagridCell, event: e });
  //     this.checkCellValueChange();
  //   };
  //   this.addEventListener('mouseup', handleMouseUp);
  //   this._eventHandlers.set('mouseup', handleMouseUp);

  //   // Touch events
  //   const handleTouchCancel = (e: TouchEvent) => {
  //     this.datagridApi.eventHandler.handleCellTouchCancel({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('touchcancel', handleTouchCancel, { passive: true });
  //   this._eventHandlers.set('touchcancel', handleTouchCancel);

  //   const handleTouchEnd = (e: TouchEvent) => {
  //     this.datagridApi.eventHandler.handleCellTouchEnd({ datagridCell: this.datagridCell, event: e });
  //     this.checkCellValueChange();
  //   };
  //   this.addEventListener('touchend', handleTouchEnd, { passive: true });
  //   this._eventHandlers.set('touchend', handleTouchEnd);

  //   const handleTouchMove = (e: TouchEvent) => {
  //     this.datagridApi.eventHandler.handleCellTouchMove({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('touchmove', handleTouchMove, { passive: true });
  //   this._eventHandlers.set('touchmove', handleTouchMove);

  //   const handleTouchStart = (e: TouchEvent) => {
  //     this.datagridApi.eventHandler.handleCellTouchStart({ datagridCell: this.datagridCell, event: e });
  //   };
  //   this.addEventListener('touchstart', handleTouchStart, { passive: true });
  //   this._eventHandlers.set('touchstart', handleTouchStart);
  // }

  setCellWidth() {
    if (this.datagridColumn) {
      const width = this.datagridColumn.width;
      // if (this.datagridApi.isTreeData && this.datagridColumn.index == 0) {
      //   // width = width - (AcDatagridDefaultRowConfig.treeChildPadding * this.datagridRow.treeDepth);
      // }
      this.style.width = `${width}px`;
      this.style.maxWidth = `${width}px`;
      this.style.minWidth = `${width}px`;
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

  private checkCellValueChange(delayCheck: boolean = true) {
    const checkFunction: Function = () => {
      if (this.cellEditor && this.cellEditor.getValue() != this.previousValue) {
        this.datagridRow.data[this.datagridColumn.columnKey] = this.cellEditor.getValue();
      }
    };
    if (delayCheck) {
      this.delayedCallback.add({callback:checkFunction, duration:500,key:'checkCellValue'});
    }
    else {
      checkFunction();
    }

  }

}

acRegisterCustomElement({ tag: 'ac-datagrid-cell', type: AcDatagridCellElement });
