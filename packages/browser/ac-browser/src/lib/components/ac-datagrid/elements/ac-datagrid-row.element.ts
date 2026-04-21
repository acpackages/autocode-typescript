/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridCellElement } from "./ac-datagrid-cell.element";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_CLASS_NAME, AcDatagridCssClassName } from "../consts/ac-datagrid-css-class-name.const";
import { AC_DATAGRID_TAG, AcDatagridAttributeName, AC_DATAGRID_HOOK, IAcDatagridRow, IAcDatagridRowHookArgs } from "../_ac-datagrid.export";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATA_MANAGER_HOOK } from "@autocode-ts/autocode";

export class AcDatagridRowElement extends AcElementBase {
  private _datagridApi!: AcDatagridApi;
  get datagridApi(): AcDatagridApi {
    return this._datagridApi;
  }
  set datagridApi(value: AcDatagridApi) {
    this._datagridApi = value;
    this.initRow();
    // value.on({
    //   event: AC_DATAGRID_EVENT.RowPositionChange, callback: (event: IAcDatagridRowPositionChangeEvent) => {
    //     if (event.datagridRow.rowId == this.datagridRow.rowId && !this.swappingRowPosition) {
    //       if (event.datagridRow.instance && event.oldDatagridRow.instance) {
    //         this.swappingRowPosition = true;
    //         acSwapElementsWithAnimation({ element1: event.datagridRow.instance.rowWrapper, element2: event.oldDatagridRow.instance.rowWrapper, duration: 300 });
    //         this.delayedCallback.add({callback:() => {
    //           this.swappingRowPosition = false;
    //         }, duration:500});
    //       }
    //     }
    //   }
    // });
  }

  private _datagridRow!: IAcDatagridRow;
  get datagridRow(): IAcDatagridRow {
    return this._datagridRow;
  }
  set datagridRow(value: IAcDatagridRow) {
    value.element = this;
    this._datagridRow = value;
    this.initRow();
  }

  datagridCells: AcDatagridCellElement[] = [];
  swappingRowPosition: boolean = false;
  container: HTMLElement = this.ownerDocument.createElement('div');
  initialized: boolean = false;
  isRendering: boolean = false;
  private _eventHandlers: Map<string, any> = new Map();

  override init() {
    super.init();
    this.initRow();
    this.style.display = 'block';
    this.style.width = 'max-content';
    this.style.height = 'max-content';
    this.container.style.display = 'flex';
    this.container.classList.add(AC_DATAGRID_CLASS_NAME.acDatagridRowContainer);
    this.append(this.container);
    this.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridRow.rowId);
    if (this.datagridRow.index == 0 || this.datagridRow.index % 2 == 0) {
      acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridRowEven, element: this });
    }
    else {
      acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridRowOdd, element: this });
    }
  }

  clearDatagridCells(){
    for(let cell of (this.datagridCells) as any[]){
      cell.destroy();
      cell = null;
    }
    this.datagridCells.length = 0; // Truncate array
    this.datagridCells = [];
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.setDatagridCells();

    // Focus events
    const handleBlur = (e: FocusEvent) => {
      this.datagridApi.eventHandler.handleRowBlur({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('blur', handleBlur);
    this._eventHandlers.set('blur', handleBlur);

    const handleFocus = (e: FocusEvent) => {
      this.datagridApi.eventHandler.handleRowFocus({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('focus', handleFocus);
    this._eventHandlers.set('focus', handleFocus);

    // Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      this.datagridApi.eventHandler.handleRowKeyDown({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('keydown', handleKeyDown);
    this._eventHandlers.set('keydown', handleKeyDown);

    const handleKeyPress = (e: KeyboardEvent) => {
      this.datagridApi.eventHandler.handleRowKeyPress({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('keypress', handleKeyPress);
    this._eventHandlers.set('keypress', handleKeyPress);

    const handleKeyUp = (e: KeyboardEvent) => {
      this.datagridApi.eventHandler.handleRowKeyDown({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('keyup', handleKeyUp);
    this._eventHandlers.set('keyup', handleKeyUp);

    // Mouse events
    const handleClick = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowClick({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('click', handleClick);
    this._eventHandlers.set('click', handleClick);

    const handleDoubleClick = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowDoubleClick({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('dblclick', handleDoubleClick);
    this._eventHandlers.set('dblclick', handleDoubleClick);

    const handleMouseDown = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowMouseDown({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('mousedown', handleMouseDown);
    this._eventHandlers.set('mousedown', handleMouseDown);

    const handleMouseEnter = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowMouseEnter({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('mouseenter', handleMouseEnter);
    this._eventHandlers.set('mouseenter', handleMouseEnter);

    const handleMouseLeave = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowMouseLeave({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('mouseleave', handleMouseLeave);
    this._eventHandlers.set('mouseleave', handleMouseLeave);

    const handleMouseMove = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowMouseMove({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('mousemove', handleMouseMove);
    this._eventHandlers.set('mousemove', handleMouseMove);

    const handleMouseOver = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowMouseOver({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('mouseover', handleMouseOver);
    this._eventHandlers.set('mouseover', handleMouseOver);

    const handleMouseUp = (e: MouseEvent) => {
      this.datagridApi.eventHandler.handleRowMouseUp({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('mouseup', handleMouseUp);
    this._eventHandlers.set('mouseup', handleMouseUp);

    // Touch events
    const handleTouchCancel = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleRowTouchCancel({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    this._eventHandlers.set('touchcancel', handleTouchCancel);

    const handleTouchEnd = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleRowTouchEnd({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('touchend', handleTouchEnd, { passive: true });
    this._eventHandlers.set('touchend', handleTouchEnd);

    const handleTouchMove = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleRowTouchMove({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('touchmove', handleTouchMove, { passive: true });
    this._eventHandlers.set('touchmove', handleTouchMove);

    const handleTouchStart = (e: TouchEvent) => {
      this.datagridApi.eventHandler.handleRowTouchStart({ datagridRow: this.datagridRow, event: e });
    };
    this.addEventListener('touchstart', handleTouchStart, { passive: true });
    this._eventHandlers.set('touchstart', handleTouchStart);
  }

  override destroy(): void {
    this.clearDatagridCells();
    super.destroy();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearDatagridCells();
    if (this._eventHandlers) {
      for (const [event, handler] of this._eventHandlers) {
        this.removeEventListener(event, handler);
      }
      this._eventHandlers.clear();
    }
  }

  initRow() {
    if (this.datagridApi && this.datagridRow && !this.initialized && this.isConnected) {
      this.initialized = true;

    }
  }

  refreshCells() {
    for (const cell of this.datagridCells) {
      cell.refresh();
    }
  }

  render() {
    if (!this.isRendering) {
      this.isRendering = true;
      acClearElement({element:this.container});
      for (const cell of this.datagridCells) {
        if (cell.datagridColumn.visible) {
          this.container.append(cell);
        }
      }
      this.isRendering = false;
    }
  }

  setDatagridCells(){
    if (this.datagridApi && this.datagridRow && this.initialized && this.isConnected) {
this.datagridCells = [];
      const hookArgs: IAcDatagridRowHookArgs = {
        datagridRow: this.datagridRow,
        datagridApi: this.datagridApi
      };
      this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.BeforeRowCellsCreate, args: hookArgs });
      for (const column of this.datagridApi.datagridColumns) {
        const datagridCell = new AcDatagridCellElement();
        datagridCell.datagridApi = this.datagridApi;
        datagridCell.datagridColumn = column;
        datagridCell.datagridRow = this.datagridRow;
        this.datagridCells.push(datagridCell);
      }
      this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.RowCellsCreate, args: hookArgs });
      this.render();
      // this.datagridRow.hooks.subscribe({
      //   hook: AC_DATA_MANAGER_HOOK.DataChange, callback: (args: any) => {
      //     this.refreshCells();
      //   }
      // });
    }

  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridRow, type: AcDatagridRowElement });
