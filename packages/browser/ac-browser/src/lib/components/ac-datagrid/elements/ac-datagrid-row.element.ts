/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridCellElement } from "./ac-datagrid-cell.element";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_CLASS_NAME, AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AC_DATAGRID_TAG, AcDatagridAttributeName, AC_DATAGRID_HOOK, IAcDatagridRow, IAcDatagridRowHookArgs, IAcDatagridCell } from "../_ac-datagrid.export";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATA_MANAGER_HOOK, Autocode } from "@autocode-ts/autocode";

export class AcDatagridRowElement extends AcElementBase {
  private datagridApi: AcDatagridApi;
  private datagridRow: IAcDatagridRow;
  private datagridCells: AcDatagridCellElement[] = [];
  private hookSubscriptionIds: string[] = [];
  private _eventHandlers: Map<string, any> = new Map();

  private clearRow() {
    for (let cell of this.datagridCells) {
      cell.remove();
      cell.destroy();
      (cell as any) = null;
    }
    acClearElement({ element: this });
    (this.datagridCells as any) = null;
    this.datagridCells = [];
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.render();

    // Focus events
    // const handleBlur = (e: FocusEvent) => {
    //   this.datagridApi.eventHandler.handleRowBlur({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('blur', handleBlur);
    // this._eventHandlers.set('blur', handleBlur);

    // const handleFocus = (e: FocusEvent) => {
    //   this.datagridApi.eventHandler.handleRowFocus({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('focus', handleFocus);
    // this._eventHandlers.set('focus', handleFocus);

    // // Keyboard events
    // const handleKeyDown = (e: KeyboardEvent) => {
    //   this.datagridApi.eventHandler.handleRowKeyDown({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('keydown', handleKeyDown);
    // this._eventHandlers.set('keydown', handleKeyDown);

    // const handleKeyPress = (e: KeyboardEvent) => {
    //   this.datagridApi.eventHandler.handleRowKeyPress({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('keypress', handleKeyPress);
    // this._eventHandlers.set('keypress', handleKeyPress);

    // const handleKeyUp = (e: KeyboardEvent) => {
    //   this.datagridApi.eventHandler.handleRowKeyDown({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('keyup', handleKeyUp);
    // this._eventHandlers.set('keyup', handleKeyUp);

    // // Mouse events
    // const handleClick = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowClick({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('click', handleClick);
    // this._eventHandlers.set('click', handleClick);

    // const handleDoubleClick = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowDoubleClick({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('dblclick', handleDoubleClick);
    // this._eventHandlers.set('dblclick', handleDoubleClick);

    // const handleMouseDown = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowMouseDown({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('mousedown', handleMouseDown);
    // this._eventHandlers.set('mousedown', handleMouseDown);

    // const handleMouseEnter = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowMouseEnter({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('mouseenter', handleMouseEnter);
    // this._eventHandlers.set('mouseenter', handleMouseEnter);

    // const handleMouseLeave = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowMouseLeave({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('mouseleave', handleMouseLeave);
    // this._eventHandlers.set('mouseleave', handleMouseLeave);

    // const handleMouseMove = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowMouseMove({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('mousemove', handleMouseMove);
    // this._eventHandlers.set('mousemove', handleMouseMove);

    // const handleMouseOver = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowMouseOver({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('mouseover', handleMouseOver);
    // this._eventHandlers.set('mouseover', handleMouseOver);

    // const handleMouseUp = (e: MouseEvent) => {
    //   this.datagridApi.eventHandler.handleRowMouseUp({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('mouseup', handleMouseUp);
    // this._eventHandlers.set('mouseup', handleMouseUp);

    // // Touch events
    // const handleTouchCancel = (e: TouchEvent) => {
    //   this.datagridApi.eventHandler.handleRowTouchCancel({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    // this._eventHandlers.set('touchcancel', handleTouchCancel);

    // const handleTouchEnd = (e: TouchEvent) => {
    //   this.datagridApi.eventHandler.handleRowTouchEnd({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('touchend', handleTouchEnd, { passive: true });
    // this._eventHandlers.set('touchend', handleTouchEnd);

    // const handleTouchMove = (e: TouchEvent) => {
    //   this.datagridApi.eventHandler.handleRowTouchMove({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('touchmove', handleTouchMove, { passive: true });
    // this._eventHandlers.set('touchmove', handleTouchMove);

    // const handleTouchStart = (e: TouchEvent) => {
    //   this.datagridApi.eventHandler.handleRowTouchStart({ datagridRow: this.datagridRow, event: e });
    // };
    // this.addEventListener('touchstart', handleTouchStart, { passive: true });
    // this._eventHandlers.set('touchstart', handleTouchStart);
  }

  override destroy(): void {
    this.clearRow();
    this.datagridRow.element = null;
    this.datagridApi.hooks.unsubscribe({ subscriptionIds: this.hookSubscriptionIds });
    super.destroy();
  }

  initElement() {
    this.setAttribute(AcDatagridAttributeName.acDatagridRowId, this.datagridRow.rowId);
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridRow, element: this });
    if (this.datagridRow.index == 0 || this.datagridRow.index % 2 == 0) {
      acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridRowEven, element: this });
    }
    else {
      acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridRowOdd, element: this });
    }
    this.render();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearRow();
    if (this._eventHandlers) {
      for (const [event, handler] of this._eventHandlers) {
        this.removeEventListener(event, handler);
      }
      this._eventHandlers.clear();
    }
  }


  refresh() {
    for (const cell of this.datagridCells) {
      cell.refresh();
    }
  }

  render() {
    this.clearRow();
    for (const column of this.datagridApi.datagridColumns) {
      if (column.visible) {
        const datagridCell = this.ownerDocument.createElement('ac-datagrid-cell') as AcDatagridCellElement;
        const cell: IAcDatagridCell = {
          cellId: Autocode.uuid(),
          datagridRow: this.datagridRow,
          datagridColumn: column,
          element: datagridCell
        };
        datagridCell.setCell({ datagridApi: this.datagridApi, datagridCell: cell })
        this.datagridCells.push(datagridCell);
        this.append(datagridCell);
      }

    }
  }

  setRow({ datagridApi, datagridRow, index }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow, index?: number }) {
    this.datagridApi = datagridApi;
    this.datagridRow = datagridRow;
    this.initElement();
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridRow, type: AcDatagridRowElement });
