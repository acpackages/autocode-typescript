/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @angular-eslint/no-output-on-prefix */
/* eslint-disable @angular-eslint/prefer-standalone */
import { ApplicationRef, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { acAddClassToElement, AcDatagridElement, AcDatagridApi, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AcDatagridRowSelectionExtension, AC_DATAGRID_EVENT, AC_DATAGRID_EXTENSION_NAME, IAcDatagridColumnDefinition } from '@autocode-ts/ac-browser';
import { AcRuntimeService } from '@autocode-ts/ac-ng-runtime';
import { AC_DATA_MANAGER_EVENT, AcDataManager, AcDelayedCallback, acNullifyInstanceProperties, IAcOnDemandRequestArgs } from '@autocode-ts/autocode';
import { IAcNgDatagridColumnDefinition } from '../../interfaces/ac-datagrid-column-definition.interface';
import { AcNgDatagridCellRenderer } from '../../elements/ac-ng-datagrid-cell-renderer.element';
import { AcNgDatagridCellEditor } from '../../elements/ac-ng-datagrid-cell-editor.element';

@Component({ selector: '', template: '' })
export class AcNgDatagridEvents {
  @Output() activeRowChange: EventEmitter<any> = new EventEmitter();
  @Output() cellBlur: EventEmitter<any> = new EventEmitter();
  @Output() cellClick: EventEmitter<any> = new EventEmitter();
  @Output() cellDoubleClick: EventEmitter<any> = new EventEmitter();
  @Output() cellDrag: EventEmitter<any> = new EventEmitter();
  @Output() cellDragEnd: EventEmitter<any> = new EventEmitter();
  @Output() cellDragEnter: EventEmitter<any> = new EventEmitter();
  @Output() cellDragLeave: EventEmitter<any> = new EventEmitter();
  @Output() cellDragOver: EventEmitter<any> = new EventEmitter();
  @Output() cellDragStart: EventEmitter<any> = new EventEmitter();
  @Output() cellDragDrop: EventEmitter<any> = new EventEmitter();
  @Output() cellEditorElementDestroy: EventEmitter<any> = new EventEmitter();
  @Output() cellEditorElementInit: EventEmitter<any> = new EventEmitter();
  @Output() cellEditingStart: EventEmitter<any> = new EventEmitter();
  @Output() cellEditingStop: EventEmitter<any> = new EventEmitter();
  @Output() cellFocus: EventEmitter<any> = new EventEmitter();
  @Output() cellHover: EventEmitter<any> = new EventEmitter();
  @Output() cellKeyDown: EventEmitter<any> = new EventEmitter();
  @Output() cellKeyPress: EventEmitter<any> = new EventEmitter();
  @Output() cellKeyUp: EventEmitter<any> = new EventEmitter();
  @Output() cellMouseDown: EventEmitter<any> = new EventEmitter();
  @Output() cellMouseEnter: EventEmitter<any> = new EventEmitter();
  @Output() cellMouseLeave: EventEmitter<any> = new EventEmitter();
  @Output() cellMouseMove: EventEmitter<any> = new EventEmitter();
  @Output() cellMouseOver: EventEmitter<any> = new EventEmitter();
  @Output() cellMouseUp: EventEmitter<any> = new EventEmitter();
  @Output() cellRendererElementDestroy: EventEmitter<any> = new EventEmitter();
  @Output() cellRendererElementInit: EventEmitter<any> = new EventEmitter();
  @Output() cellTouchCancel: EventEmitter<any> = new EventEmitter();
  @Output() cellTouchEnd: EventEmitter<any> = new EventEmitter();
  @Output() cellTouchMove: EventEmitter<any> = new EventEmitter();
  @Output() cellTouchStart: EventEmitter<any> = new EventEmitter();
  @Output() cellValueChange: EventEmitter<any> = new EventEmitter();
  @Output() columnDefinitionsSet: EventEmitter<any> = new EventEmitter();
  @Output() columnBlur: EventEmitter<any> = new EventEmitter();
  @Output() columnClick: EventEmitter<any> = new EventEmitter();
  @Output() columnDataChange: EventEmitter<any> = new EventEmitter();
  @Output() columnDoubleClick: EventEmitter<any> = new EventEmitter();
  @Output() columnDragEnd: EventEmitter<any> = new EventEmitter();
  @Output() columnDragEnter: EventEmitter<any> = new EventEmitter();
  @Output() columnDragLeave: EventEmitter<any> = new EventEmitter();
  @Output() columnDragOver: EventEmitter<any> = new EventEmitter();
  @Output() columnDragStart: EventEmitter<any> = new EventEmitter();
  @Output() columnDragDrop: EventEmitter<any> = new EventEmitter();
  @Output() columnFilterChange: EventEmitter<any> = new EventEmitter();
  @Output() columnFocus: EventEmitter<any> = new EventEmitter();
  @Output() columnHeaderClick: EventEmitter<any> = new EventEmitter();
  @Output() columnHover: EventEmitter<any> = new EventEmitter();
  @Output() columnKeyDown: EventEmitter<any> = new EventEmitter();
  @Output() columnKeyPress: EventEmitter<any> = new EventEmitter();
  @Output() columnKeyUp: EventEmitter<any> = new EventEmitter();
  @Output() columnMouseDown: EventEmitter<any> = new EventEmitter();
  @Output() columnMouseEnter: EventEmitter<any> = new EventEmitter();
  @Output() columnMouseLeave: EventEmitter<any> = new EventEmitter();
  @Output() columnMouseMove: EventEmitter<any> = new EventEmitter();
  @Output() columnMouseOver: EventEmitter<any> = new EventEmitter();
  @Output() columnMouseUp: EventEmitter<any> = new EventEmitter();
  @Output() columnResize: EventEmitter<any> = new EventEmitter();
  @Output() columnSortChange: EventEmitter<any> = new EventEmitter();
  @Output() columnTouchCancel: EventEmitter<any> = new EventEmitter();
  @Output() columnTouchEnd: EventEmitter<any> = new EventEmitter();
  @Output() columnTouchMove: EventEmitter<any> = new EventEmitter();
  @Output() columnTouchStart: EventEmitter<any> = new EventEmitter();
  @Output() columnPositionChange: EventEmitter<any> = new EventEmitter();
  @Output() columnVisibilityChange: EventEmitter<any> = new EventEmitter();
  @Output() displayedRowsChange: EventEmitter<any> = new EventEmitter();
  @Output() paginationChange: EventEmitter<any> = new EventEmitter();
  @Output() rowAdd: EventEmitter<any> = new EventEmitter();
  @Output() rowBlur: EventEmitter<any> = new EventEmitter();
  @Output() rowClick: EventEmitter<any> = new EventEmitter();
  @Output() rowDataChange: EventEmitter<any> = new EventEmitter();
  @Output() rowDelete: EventEmitter<any> = new EventEmitter();
  @Output() rowDoubleClick: EventEmitter<any> = new EventEmitter();
  @Output() rowDrag: EventEmitter<any> = new EventEmitter();
  @Output() rowDragCancel: EventEmitter<any> = new EventEmitter();
  @Output() rowDragDrop: EventEmitter<any> = new EventEmitter();
  @Output() rowDragEnd: EventEmitter<any> = new EventEmitter();
  @Output() rowDragEnter: EventEmitter<any> = new EventEmitter();
  @Output() rowDragLeave: EventEmitter<any> = new EventEmitter();
  @Output() rowDragOver: EventEmitter<any> = new EventEmitter();
  @Output() rowDragStart: EventEmitter<any> = new EventEmitter();
  @Output() rowEditingStart: EventEmitter<any> = new EventEmitter();
  @Output() rowEditingStop: EventEmitter<any> = new EventEmitter();
  @Output() rowFocus: EventEmitter<any> = new EventEmitter();
  @Output() rowHover: EventEmitter<any> = new EventEmitter();
  @Output() rowKeyDown: EventEmitter<any> = new EventEmitter();
  @Output() rowKeyPress: EventEmitter<any> = new EventEmitter();
  @Output() rowKeyUp: EventEmitter<any> = new EventEmitter();
  @Output() rowMouseDown: EventEmitter<any> = new EventEmitter();
  @Output() rowMouseEnter: EventEmitter<any> = new EventEmitter();
  @Output() rowMouseLeave: EventEmitter<any> = new EventEmitter();
  @Output() rowMouseMove: EventEmitter<any> = new EventEmitter();
  @Output() rowMouseOver: EventEmitter<any> = new EventEmitter();
  @Output() rowMouseUp: EventEmitter<any> = new EventEmitter();
  @Output() rowPositionChange: EventEmitter<any> = new EventEmitter();
  @Output() rowSelectionChange: EventEmitter<any> = new EventEmitter();
  @Output() rowTouchCancel: EventEmitter<any> = new EventEmitter();
  @Output() rowTouchEnd: EventEmitter<any> = new EventEmitter();
  @Output() rowTouchMove: EventEmitter<any> = new EventEmitter();
  @Output() rowTouchStart: EventEmitter<any> = new EventEmitter();
  @Output() rowUpdate: EventEmitter<any> = new EventEmitter();
  @Output() stateChange: EventEmitter<any> = new EventEmitter();
  @Output() sortOrderChange: EventEmitter<any> = new EventEmitter();
  @Output() totalRowsChange: EventEmitter<any> = new EventEmitter();
  @Output() datagridInit: EventEmitter<any> = new EventEmitter();

  protected registerListeners(datagridApi: AcDatagridApi) {
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ActiveRowChange, callback: (args: any) => {
        this.activeRowChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellBlur, callback: (args: any) => {
        this.cellBlur.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellClick, callback: (args: any) => {
        this.cellClick.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDoubleClick, callback: (args: any) => {
        this.cellDoubleClick.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDrag, callback: (args: any) => {
        this.cellDrag.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDragEnd, callback: (args: any) => {
        this.cellDragEnd.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDragEnter, callback: (args: any) => {
        this.cellDragEnter.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDragLeave, callback: (args: any) => {
        this.cellDragLeave.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDragOver, callback: (args: any) => {
        this.cellDragOver.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDragStart, callback: (args: any) => {
        this.cellDragStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellDragDrop, callback: (args: any) => {
        this.cellDragDrop.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellEditorElementDestroy, callback: (args: any) => {
        this.cellEditorElementDestroy.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellEditorElementInit, callback: (args: any) => {
        this.cellEditorElementInit.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellEditingStart, callback: (args: any) => {
        this.cellEditingStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellEditingStop, callback: (args: any) => {
        this.cellEditingStop.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellFocus, callback: (args: any) => {
        this.cellFocus.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellHover, callback: (args: any) => {
        this.cellHover.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellKeyDown, callback: (args: any) => {
        this.cellKeyDown.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellKeyPress, callback: (args: any) => {
        this.cellKeyPress.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellKeyUp, callback: (args: any) => {
        this.cellKeyUp.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellMouseDown, callback: (args: any) => {
        this.cellMouseDown.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellMouseEnter, callback: (args: any) => {
        this.cellMouseEnter.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellMouseLeave, callback: (args: any) => {
        this.cellMouseLeave.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellMouseMove, callback: (args: any) => {
        this.cellMouseMove.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellMouseOver, callback: (args: any) => {
        this.cellMouseOver.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellMouseUp, callback: (args: any) => {
        this.cellMouseUp.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellRendererElementDestroy, callback: (args: any) => {
        this.cellRendererElementDestroy.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellRendererElementInit, callback: (args: any) => {
        this.cellRendererElementInit.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellTouchCancel, callback: (args: any) => {
        this.cellTouchCancel.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellTouchEnd, callback: (args: any) => {
        this.cellTouchEnd.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellTouchMove, callback: (args: any) => {
        this.cellTouchMove.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellTouchStart, callback: (args: any) => {
        this.cellTouchStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.CellValueChange, callback: (args: any) => {
        this.cellValueChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDefinitionsSet, callback: (args: any) => {
        this.columnDefinitionsSet.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnBlur, callback: (args: any) => {
        this.columnBlur.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnClick, callback: (args: any) => {
        this.columnClick.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDataChange, callback: (args: any) => {
        this.columnDataChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDoubleClick, callback: (args: any) => {
        this.columnDoubleClick.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDragEnd, callback: (args: any) => {
        this.columnDragEnd.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDragEnter, callback: (args: any) => {
        this.columnDragEnter.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDragLeave, callback: (args: any) => {
        this.columnDragLeave.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDragOver, callback: (args: any) => {
        this.columnDragOver.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDragStart, callback: (args: any) => {
        this.columnDragStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnDragDrop, callback: (args: any) => {
        this.columnDragDrop.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnFilterChange, callback: (args: any) => {
        this.columnFilterChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnFocus, callback: (args: any) => {
        this.columnFocus.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnHeaderClick, callback: (args: any) => {
        this.columnHeaderClick.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnHover, callback: (args: any) => {
        this.columnHover.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnKeyDown, callback: (args: any) => {
        this.columnKeyDown.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnKeyPress, callback: (args: any) => {
        this.columnKeyPress.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnKeyUp, callback: (args: any) => {
        this.columnKeyUp.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnMouseDown, callback: (args: any) => {
        this.columnMouseDown.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnMouseEnter, callback: (args: any) => {
        this.columnMouseEnter.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnMouseLeave, callback: (args: any) => {
        this.columnMouseLeave.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnMouseMove, callback: (args: any) => {
        this.columnMouseMove.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnMouseOver, callback: (args: any) => {
        this.columnMouseOver.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnMouseUp, callback: (args: any) => {
        this.columnMouseUp.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnResize, callback: (args: any) => {
        this.columnResize.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnSortChange, callback: (args: any) => {
        this.columnSortChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnTouchCancel, callback: (args: any) => {
        this.columnTouchCancel.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnTouchEnd, callback: (args: any) => {
        this.columnTouchEnd.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnTouchMove, callback: (args: any) => {
        this.columnTouchMove.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnTouchStart, callback: (args: any) => {
        this.columnTouchStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnPositionChange, callback: (args: any) => {
        this.columnPositionChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.ColumnVisibilityChange, callback: (args: any) => {
        this.columnVisibilityChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.DisplayedRowsChange, callback: (args: any) => {
        this.displayedRowsChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.PaginationChange, callback: (args: any) => {
        this.paginationChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.RowAdd, callback: (args: any) => {
        this.rowAdd.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowBlur, callback: (args: any) => {
        this.rowBlur.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowClick, callback: (args: any) => {
        this.rowClick.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDataChange, callback: (args: any) => {
        this.rowDataChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDelete, callback: (args: any) => {
        this.rowDelete.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDoubleClick, callback: (args: any) => {
        this.rowDoubleClick.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDrag, callback: (args: any) => {
        this.rowDrag.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDragCancel, callback: (args: any) => {
        this.rowDragCancel.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDragDrop, callback: (args: any) => {
        this.rowDragDrop.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDragEnd, callback: (args: any) => {
        this.rowDragEnd.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDragEnter, callback: (args: any) => {
        this.rowDragEnter.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDragLeave, callback: (args: any) => {
        this.rowDragLeave.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDragOver, callback: (args: any) => {
        this.rowDragOver.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDragStart, callback: (args: any) => {
        this.rowDragStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowEditingStart, callback: (args: any) => {
        this.rowEditingStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowEditingStop, callback: (args: any) => {
        this.rowEditingStop.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowFocus, callback: (args: any) => {
        this.rowFocus.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowHover, callback: (args: any) => {
        this.rowHover.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowKeyDown, callback: (args: any) => {
        this.rowKeyDown.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowKeyPress, callback: (args: any) => {
        this.rowKeyPress.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowKeyUp, callback: (args: any) => {
        this.rowKeyUp.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowMouseDown, callback: (args: any) => {
        this.rowMouseDown.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowMouseEnter, callback: (args: any) => {
        this.rowMouseEnter.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowMouseLeave, callback: (args: any) => {
        this.rowMouseLeave.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowMouseMove, callback: (args: any) => {
        this.rowMouseMove.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowMouseOver, callback: (args: any) => {
        this.rowMouseOver.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowMouseUp, callback: (args: any) => {
        this.rowMouseUp.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowPositionChange, callback: (args: any) => {
        this.rowPositionChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowSelectionChange, callback: (args: any) => {
        this.rowSelectionChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowTouchCancel, callback: (args: any) => {
        this.rowTouchCancel.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowTouchEnd, callback: (args: any) => {
        this.rowTouchEnd.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowTouchMove, callback: (args: any) => {
        this.rowTouchMove.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowTouchStart, callback: (args: any) => {
        this.rowTouchStart.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.RowUpdate, callback: (args: any) => {
        this.rowUpdate.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: any) => {
        this.stateChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.SortOrderChange, callback: (args: any) => {
        this.sortOrderChange.emit(args);
      }
    });
    datagridApi.on({
      event: AC_DATAGRID_EVENT.TotalRowsChange, callback: (args: any) => {
        this.totalRowsChange.emit(args);
      }
    });
  }
}

@Component({
  selector: 'ac-ng-datagrid',
  templateUrl: './ac-ng-datagrid.component.html',
  styleUrl: './ac-ng-datagrid.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcNgDatagridComponent extends AcNgDatagridEvents implements OnChanges, OnDestroy, OnInit {
  @ViewChild('acDatagrid') acDatagridRef: ElementRef<AcDatagridElement>;
  @Input() datagridClass: string = '';
  @Input() columnDefinitions: IAcNgDatagridColumnDefinition[] = [];
  @Input() columnEditorTemplates: Record<string, TemplateRef<any>> = {};
  @Input() columnRendererTemplates: Record<string, TemplateRef<any>> = {};
  @Input() data?: any[];
  @Input() flexColumn: string = '';
  @Input() headerHeight: number = 30;
  @Input() rowHeight: number = 30;
  @Input() onDemandFunction?: ((args: IAcOnDemandRequestArgs) => void) | any;
  @Input() showAddButton: boolean = false;
  @Input() showSearchInput: boolean = true;
  @Input() usePagination: boolean = true;

  datagrid?: AcDatagridElement;
  datagridApi?: AcDatagridApi;

  columnDraggingExtension?: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension?: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension?: AcDatagridDataExportXlsxExtension;
  dataManager?: AcDataManager;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  rowDraggingExtension?: AcDatagridRowDraggingExtension;
  rowNumbersExtension?: AcDatagridRowNumbersExtension;
  rowSelectionExtension?: AcDatagridRowSelectionExtension;

  constructor(private runtimeService: AcRuntimeService, private appRef: ApplicationRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.datagrid && this.datagridApi) {
      if (changes['rowHeight']) {
        this.datagridApi.rowHeight = this.rowHeight;
      }
      else if (changes['headerHeight']) {
        this.datagridApi.headerHeight = this.headerHeight;
      }
      else if (changes['onDemandFunction']) {
        this.dataManager.onDemandFunction = this.onDemandFunction;
      }
      else if (changes['data']) {
        this.dataManager.data = this.data;
      }
      else if (changes['columnDefinitions'] || changes['columnEditorTemplates'] || changes['columnRendererTemplates'] || changes['flexColumn']) {
        this.setColumnDefinitions();
      }
      else if (changes['usePagination']) {
        this.datagridApi.usePagination = this.usePagination;
      }
      else if (changes['showAddButton']) {
        this.datagridApi.showAddButton = this.showAddButton;
      }
      else if (changes['showSearchInput']) {
        this.datagridApi.showSearchInput = this.showSearchInput;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.datagrid) {
      this.datagrid.destroy();
      this.datagrid.remove();
    }
    if(this.delayedCallback){
      this.delayedCallback.destroy();
    }
    acNullifyInstanceProperties({instance:this});
  }

  ngOnInit(): void {
    this.initDatagrid();
  }

  private async initDatagrid() {
    if (this.acDatagridRef) {
      this.datagrid = this.acDatagridRef.nativeElement;
      this.datagridApi = this.datagrid.datagridApi;
      this.dataManager = this.datagridApi.dataManager;

      this.datagridApi.usePagination = this.usePagination;
      this.datagridApi.headerHeight = this.headerHeight;
      this.datagridApi.rowHeight = this.rowHeight;
      this.datagridApi.showAddButton = this.showAddButton;
      this.datagridApi.showSearchInput = this.showSearchInput;


      if (this.datagridClass) {
        acAddClassToElement({ class_: this.datagridClass, element: this.datagrid });
      }
      this.setColumnDefinitions();

      this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
      this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
      this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
      this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
      this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
      this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;
      this.columnsCustomizerExtension.showColumnCustomizerPanel = true;
      this.registerListeners(this.datagridApi);
      if (this.data) {
        this.dataManager.data = this.data;
      }
      if (this.onDemandFunction) {
        this.dataManager.onDemandFunction = this.onDemandFunction;
      }
      this.datagridInit.emit();
    }
    else {
      this.delayedCallback.add({callback:() => {
        this.initDatagrid();
      }, duration:10});
    }
  }

  private setColumnDefinitions() {
    const columns: IAcDatagridColumnDefinition[] = [];
    for (const colDef of this.columnDefinitions) {
       if (this.columnRendererTemplates[colDef.field]) {
        colDef.cellRendererTemplateRef = this.columnRendererTemplates[colDef.field];
      }
      if (this.columnEditorTemplates[colDef.field]) {
        colDef.cellEditorTemplateRef = this.columnEditorTemplates[colDef.field];
      }
      if (colDef.cellEditorComponent || colDef.cellEditorTemplateRef) {
        colDef.cellEditorElement = AcNgDatagridCellEditor;
      if (!colDef.cellEditorElementParams) {
        colDef.cellEditorElementParams = {};
      }
      colDef.cellEditorElementParams['___appRef___'] = this.appRef;
      colDef.cellEditorElementParams['___runtimeService___'] = this.runtimeService;
      }
      if (colDef.cellRendererComponent || colDef.cellRendererTemplateRef) {
        colDef.cellRendererElement = AcNgDatagridCellRenderer;
        if (!colDef.cellRendererElementParams) {
          colDef.cellRendererElementParams = {};
        }
        colDef.cellRendererElementParams['___appRef___'] = this.appRef;
        colDef.cellRendererElementParams['___runtimeService___'] = this.runtimeService;
      }
      if (this.flexColumn == colDef.field) {
        colDef.flexSize = 1;
      }
      columns.push(colDef);
    }
    this.datagridApi.columnDefinitions = columns;
  }
}

