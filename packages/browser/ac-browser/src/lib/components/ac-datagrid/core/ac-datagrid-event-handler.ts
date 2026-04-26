/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDelayedCallback, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AC_DATAGRID_ATTRIBUTE, IAcDatagridColumn, AC_DATAGRID_HOOK, IAcDatagridCellHookArgs, IAcDatagridColumnEvent, IAcDatagridPaginationChangeEvent, IAcDatagridSortOrderChangeEvent, IAcDatagridCell } from "../_ac-datagrid.export";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { IAcDatagridCellEvent } from "../interfaces/event-args/ac-datagrid-cell-event.interface";
import { IAcDatagridRowEvent } from "../interfaces/event-args/ac-datagrid-row-event.interface";
import { IAcDatagridStateChangeEvent } from "../interfaces/event-args/ac-datagrid-state-change-event.interface";
import { AcDatagridApi } from "./ac-datagrid-api";

export class AcDatagridEventHandler {
  columnResizeTimeouts: any = {};
  datagridApi?: AcDatagridApi;
  previousNotifiedState: any = {};
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  destroy() {
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({ instance: this });
  }

  handleCellBlur({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (this.datagridApi && datagridCell.isActive) {
      if (datagridCell.element) {
        datagridCell.element.blur();
      }
      const eventArgs: IAcDatagridCellEvent = {
        datagridApi: this.datagridApi,
        datagridCell: datagridCell,
        event: event
      };
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellBlur, args: eventArgs });
    }
  }

  handleCellClick({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellClick, args: eventArgs });
  }

  handleCellDoubleClick({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellDoubleClick, args: eventArgs });
  }

  handleCellEditingStart({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellEditingStart, args: eventArgs });
  }

  handleCellEditingStop({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellEditingStop, args: eventArgs });
  }

  handleCellFocus({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    if (!datagridCell.isActive) {
      this.datagridApi.setActiveCell({ datagridCell });
      const eventArgs: IAcDatagridCellEvent = {
        datagridApi: this.datagridApi,
        datagridCell: datagridCell,
        event: event
      };
      this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.CellFocus, args: eventArgs });
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellFocus, args: eventArgs });
    }
  }

  handleCellKeyDown({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.CellKeyDown, args: eventArgs });
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellKeyDown, args: eventArgs });
  }

  handleCellKeyPress({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.CellKeyPress, args: eventArgs });
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellKeyPress, args: eventArgs });
  }

  handleCellKeyUp({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellKeyUp, args: eventArgs });
  }

  handleCellMouseDown({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellMouseDown, args: eventArgs });
  }

  handleCellMouseEnter({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellMouseEnter, args: eventArgs });
    const hoverEventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    if (datagridCell.element) {
      datagridCell.element.setAttribute(AC_DATAGRID_ATTRIBUTE.acDatagridCellHover, 'true');
    }
    if (datagridCell.datagridColumn.headerCellElement) {
      datagridCell.datagridColumn.headerCellElement.setAttribute(AC_DATAGRID_ATTRIBUTE.acDatagridColumnHover, 'true');
    }
    if (datagridCell.datagridRow.element) {
      datagridCell.datagridRow.element.setAttribute(AC_DATAGRID_ATTRIBUTE.acDatagridRowHover, 'true');
    }
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellHover, args: hoverEventArgs });
  }

  handleCellMouseLeave({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    if (datagridCell.element) {
      datagridCell.element.removeAttribute(AC_DATAGRID_ATTRIBUTE.acDatagridCellHover);
    }
    if (datagridCell.datagridColumn.headerCellElement) {
      datagridCell.datagridColumn.headerCellElement.removeAttribute(AC_DATAGRID_ATTRIBUTE.acDatagridColumnHover);
    }
    if (datagridCell.datagridRow.element) {
      datagridCell.datagridRow.element.removeAttribute(AC_DATAGRID_ATTRIBUTE.acDatagridRowHover);
    }
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellMouseLeave, args: eventArgs });
  }

  handleCellMouseMove({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellMouseMove, args: eventArgs });
  }

  handleCellMouseOver({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellMouseOver, args: eventArgs });
  }

  handleCellMouseUp({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellMouseUp, args: eventArgs });
  }

  handleCellTouchCancel({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellTouchCancel, args: eventArgs });
  }

  handleCellTouchEnd({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellTouchEnd, args: eventArgs });
  }

  handleCellTouchMove({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellTouchMove, args: eventArgs });
  }

  handleCellTouchStart({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellTouchStart, args: eventArgs });
  }

  handleCellValueChange({ datagridCell, event }: { datagridCell: IAcDatagridCell, event?: any }) {
    if (!this.datagridApi) return;
    const hookArgs: IAcDatagridCellHookArgs = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.CellValueChange, args: hookArgs });
    const eventArgs: IAcDatagridCellEvent = {
      datagridApi: this.datagridApi,
      datagridCell: datagridCell,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.CellValueChange, args: eventArgs });
  }

  handleColumnHeaderClick({ datagridColumn, event }: { datagridColumn: IAcDatagridColumn, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridColumnEvent = {
      datagridApi: this.datagridApi,
      datagridColumn: datagridColumn,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.ColumnHeaderClick, args: eventArgs });
  }

  handleColumnPositionChange({ datagridColumn, event }: { datagridColumn: IAcDatagridColumn, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridColumnEvent = {
      datagridApi: this.datagridApi,
      datagridColumn: datagridColumn,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.ColumnPositionChange, args: eventArgs });
    this.notifyStateChange();
  }

  handleColumnResize({ datagridColumn, event }: { datagridColumn: IAcDatagridColumn, event?: any }) {
    if (!this.datagridApi) return;

    if (this.columnResizeTimeouts[datagridColumn.columnId]) {
      clearTimeout(this.columnResizeTimeouts[datagridColumn.columnId]);
    }
    this.columnResizeTimeouts[datagridColumn.columnId] = this.delayedCallback.add({callback:() => {
      const eventArgs: IAcDatagridColumnEvent = {
        datagridApi: this.datagridApi!,
        datagridColumn: datagridColumn,
        event: event
      };
      this.datagridApi!.events.execute({ event: AC_DATAGRID_EVENT.ColumnResize, args: eventArgs });
      delete this.columnResizeTimeouts[datagridColumn.columnId];
      this.notifyStateChange();
    }, duration:300});
  }

  handleColumnDataChange({ datagridColumn, event }: { datagridColumn: IAcDatagridColumn, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridColumnEvent = {
      datagridApi: this.datagridApi,
      datagridColumn: datagridColumn,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.ColumnDataChange, args: eventArgs });
  }

  handleColumnVisibilityChange({ datagridColumn, event }: { datagridColumn: IAcDatagridColumn, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridColumnEvent = {
      datagridApi: this.datagridApi,
      datagridColumn: datagridColumn,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.ColumnVisibilityChange, args: eventArgs });
    this.notifyStateChange();
  }

  handlePaginationChange() {
    if (!this.datagridApi || !this.datagridApi.pagination) return;
    const eventArgs: IAcDatagridPaginationChangeEvent = {
      datagridApi: this.datagridApi,
      pagination: this.datagridApi.pagination,
      event: undefined
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.PaginationChange, args: eventArgs });
  }

  handleRowBlur({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowBlur, args: eventArgs });
  }

  handleRowClick({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowClick, args: eventArgs });
  }

  handleRowDataChange({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDataChange, args: eventArgs });
  }

  handleRowDoubleClick({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDoubleClick, args: eventArgs });
  }

  handleRowEditingStart({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowEditingStart, args: eventArgs });
  }

  handleRowEditingStop({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowEditingStop, args: eventArgs });
  }

  handleRowFocus({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowFocus, args: eventArgs });
  }

  handleRowKeyDown({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowKeyDown, args: eventArgs });
  }

  handleRowKeyPress({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowKeyPress, args: eventArgs });
  }

  handleRowKeyUp({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.RowKeyUp, args: eventArgs });
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowKeyUp, args: eventArgs });
  }

  handleRowMouseDown({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowMouseDown, args: eventArgs });
  }

  handleRowMouseEnter({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowMouseEnter, args: eventArgs });
    const hoverEventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowHover, args: hoverEventArgs });
  }

  handleRowMouseLeave({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowMouseLeave, args: eventArgs });
  }

  handleRowMouseMove({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowMouseMove, args: eventArgs });
  }

  handleRowMouseOver({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowMouseOver, args: eventArgs });
  }

  handleRowMouseUp({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowMouseUp, args: eventArgs });
  }

  handleRowSelectionChange({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowSelectionChange, args: eventArgs });
  }

  handleRowTouchCancel({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowTouchCancel, args: eventArgs });
  }

  handleRowTouchEnd({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowTouchEnd, args: eventArgs });
  }

  handleRowTouchMove({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowTouchMove, args: eventArgs });
  }

  handleRowTouchStart({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    if (!this.datagridApi) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowTouchStart, args: eventArgs });
  }

  handleSortOrderChange() {
    if (!this.datagridApi || !this.datagridApi.dataManager) return;
    const eventArgs: IAcDatagridSortOrderChangeEvent = {
      datagridApi: this.datagridApi,
      sortOrder: this.datagridApi.dataManager.sortOrder!,
      event: undefined
    };
    this.datagridApi.dataManager.refreshRows();
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.SortOrderChange, args: eventArgs });
  }

  init({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
  }

  private notifyRowDataChange() {
    if (!this.datagridApi || !this.datagridApi.activeDatagridRow) return;
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: this.datagridApi.activeDatagridRow,
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDataChange, args: eventArgs });
  }

  private notifyStateChange() {
    if (!this.datagridApi) return;
    this.datagridApi.datagridState.refresh();
    const currentState = this.datagridApi.datagridState.toJson();
    if (JSON.stringify(currentState) != JSON.stringify(this.previousNotifiedState)) {
      this.previousNotifiedState = currentState;
      const eventArgs: IAcDatagridStateChangeEvent = {
        datagridApi: this.datagridApi,
        datagridState: currentState,
        event: undefined
      };
      this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.StateChange, args: eventArgs });
    }
  }
}
