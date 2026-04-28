/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDDEApi } from "../../core/ac-dde-api";
import { acAddClassToElement, AcDatagridApi, AC_DATAGRID_EVENT, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellEvent, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumnDefinition, IAcDatagridRowEvent, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDViewColumn, AcEnumDDColumnProperty } from "@autocode-ts/ac-data-dictionary";
import { AcDDEDatagridSelectColumnTypeInput } from "../cell-editors/ac-dde-datagrid-select-column-type-input.element";
import { AcDDEDatagridTextInput } from "../cell-editors/ac-dde-datagrid-text-input.element";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";
import { AcDDEDatagridRowAction } from "../shared/ac-dde-datagrid-row-action.element";
import { AC_DATA_MANAGER_EVENT, IAcContextEvent } from "@autocode-ts/autocode";
import { arrayRemoveByKey } from "@autocode-ts/ac-extensions";
import { IAcDDEDatagridBeforeColumnsSetInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-before-columns-set-hook-args.interface";
import { AcEnumDDEHook } from "../../enums/ac-enum-dde-hooks.enum";
import { AcEnumDDEViewColumn } from "../../enums/ac-enum-dde-storage-keys.enum";
import { IAcDDEDatagridCellInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-cell-init-hook-args.interface";
import { AcEnumDDEEntity } from "../../enums/ac-enum-dde-entity.enum";
import { IAcDDETableColumn } from "../../interfaces/ac-dde-table-column.inteface";
import { AcDDECssClassName } from "../../consts/ac-dde-css-class-name.const";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { AcDDEDatagridYesNoInput } from "../cell-editors/ac-dde-datagrid-yes-no-input.element";
import { AcDDEDatagridSelectViewInput } from "../cell-editors/ac-dde-datagrid-select-view-input.element";
import { AcDDEViewRenderer } from "../cell-renderers/ac-dde-view-renderer";
import { AC_DDE_TAG } from "../../consts/ac-dde-tag.const";

export class AcDDEViewColumnsDatagridElement extends AcDDEDatagridElement{
  data: any[] = [];
  filterFunction: Function | undefined;

  override initDatagrid() {
    super.initDatagrid();

    const columnDefinitions: IAcDatagridColumnDefinition[] = [
      {
        'field': 'action', 'title': '', cellRendererElement: AcDDEDatagridRowAction, cellRendererElementParams: {
          editorApi: this.editorApi
        }, width: 35, allowEdit:false,allowFocus:false,allowFilter:false,allowSort:false
      },
      { 'field': AcDDViewColumn.KeyColumnName, 'title': 'Column Name', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcDDViewColumn.KeyColumnType, 'title': 'Column Type', cellEditorElement: AcDDEDatagridSelectColumnTypeInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcDDViewColumn.KeyColumnSource, 'title': 'Column Source', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcDDViewColumn.KeyColumnSourceName, 'title': 'Source Name', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcDDViewColumn.KeyColumnSourceOriginalColumn, 'title': 'Original Column Name', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.ColumnTitle, 'title': 'Column Title', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.UseForRowLikeFilter, 'title': 'In Search Query', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.IsSelectDistinct, 'title': 'Is Select Distinct?', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      {
              'field': AcEnumDDEViewColumn.ViewId, 'title': 'View', cellEditorElement: AcDDEDatagridSelectViewInput, cellEditorElementParams: {
                editorApi: this.editorApi
              }, cellRendererElement: AcDDEViewRenderer, cellRendererElementParams: {
                editorApi: this.editorApi
              }, allowFilter: true
            },
      // { 'field': AcDDViewColumn.KeyColumnSource, 'title': 'Original Column Name', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true,allowFilter:true },
    ];
    const colSetHookArgs: IAcDDEDatagridBeforeColumnsSetInitHookArgs = {
      datagridApi: this.datagridApi,
      editorApi: this.editorApi,
      columnDefinitions: columnDefinitions,
      instance: this
    };
    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.ViewColumnsDatagridBeforeColumnsSet, args: colSetHookArgs });
    this.datagridApi.columnDefinitions = columnDefinitions;

    this.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.BeforeRowAdd, callback: (args: any) => {
        const row = this.editorApi.dataStorage.addViewColumn({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId, ...args.data });
        args.data = row;
        this.data.push(row);
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDelete, callback: (args: IAcDatagridRowEvent) => {
        this.editorApi.dataStorage.deleteViewColumn({ columnId: args.datagridRow.data[AcEnumDDEViewColumn.ColumnId] });
      }
    });
    this.datagridApi.on({event: AC_DATAGRID_EVENT.CellValueChange, callback: (args: IAcDatagridCellEvent) => {
        this.editorApi.dataStorage.setViewColumnProperties(args.datagridCell.datagridRow.data);
      }
    });

    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.CellEditorElementInit, callback: (args: IAcDatagridCellEditorElementInitEvent) => {
        const hookArgs: IAcDDEDatagridCellInitHookArgs = {
          datagridApi: this.datagridApi,
          editorApi: this.editorApi,
          datagridCell: args.datagridCell,
          eventArgs: args,
          instance: this
        };
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.ViewColumnsDatagridCellEditorInit, args: hookArgs });
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.CellRendererElementInit, callback: (args: IAcDatagridCellRendererElementInitEvent) => {
        const hookArgs: IAcDDEDatagridCellInitHookArgs = {
          datagridApi: this.datagridApi,
          editorApi: this.editorApi,
          datagridCell: args.datagridCell,
          eventArgs: args,
          instance: this
        };
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.ViewColumnsDatagridCellRendererInit, args: hookArgs });
      }
    });
    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.DataDictionarySet, callback: () => {
        this.setColumnsData();
      }
    });
    this.editorApi.dataStorage.on('change', AcEnumDDEEntity.ViewColumn, (args: IAcContextEvent) => {
      if (args.event == 'delete') {
        arrayRemoveByKey(this.data, AcEnumDDEViewColumn.ColumnId, args.oldValue[AcEnumDDEViewColumn.ColumnId]);
      }
    });


    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.ActiveDataDictionaryChange, callback: (args: IAcDDEActiveDataDictionaryChangeHookArgs) => {
        this.setColumnsData();
      }
    });

    this.setColumnsData();

  }

  applyFilter() {
    let data = this.data;
    if (this.filterFunction != undefined) {
      data = data.filter((item: IAcDDETableColumn) => this.filterFunction!(item));
    }
    this.datagridApi.data = data;
  }

  setColumnsData() {
    if (this.editorApi.activeDataDictionary) {
      this.data = Object.values(this.editorApi.dataStorage.getViewColumns({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId }));
      this.applyFilter();
    }
  }


}


acRegisterCustomElement({ tag: AC_DDE_TAG.viewColumnsDatagrid, type: AcDDEViewColumnsDatagridElement });
