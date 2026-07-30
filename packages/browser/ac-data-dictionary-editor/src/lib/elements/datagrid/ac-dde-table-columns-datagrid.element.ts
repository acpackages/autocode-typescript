/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDDEApi } from "../../core/ac-dde-api";
import { acAddClassToElement, AcDatagridApi, AC_DATAGRID_EVENT, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellEvent, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumnDefinition, IAcDatagridRowEvent, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDTableColumn, AcEnumDDColumnProperty } from "@autocode-ts/ac-data-dictionary";
import { AcDDEDatagridSelectColumnTypeInput } from "../cell-editors/ac-dde-datagrid-select-column-type-input.element";
import { AcDDEDatagridTextInput } from "../cell-editors/ac-dde-datagrid-text-input.element";
import { AcDDEDatagridYesNoInput } from "../cell-editors/ac-dde-datagrid-yes-no-input.element";
import { AcDDEDatagridNumberInput } from "../cell-editors/ac-dde-datagrid-number-input.element";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";
import { AcDDEDatagridSelectFormatInput } from "../cell-editors/ac-dde-datagrid-select-format-input.elemen";
import { AcDDEDatagridRowAction } from "../shared/ac-dde-datagrid-row-action.element";
import { arrayRemoveByKey } from "@autocode-ts/ac-extensions";
import { IAcDDEDatagridBeforeColumnsSetInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-before-columns-set-hook-args.interface";
import { AcEnumDDEHook } from "../../enums/ac-enum-dde-hooks.enum";
import { AcEnumDDETableColumn } from "../../enums/ac-enum-dde-storage-keys.enum";
import { IAcDDEDatagridCellInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-cell-init-hook-args.interface";
import { AcEnumDDEEntity } from "../../enums/ac-enum-dde-entity.enum";
import { IAcDDETableColumn } from "../../interfaces/ac-dde-table-column.inteface";
import { AcDDECssClassName } from "../../consts/ac-dde-css-class-name.const";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { AcDDEDatagridValueOptionsInput } from "../cell-editors/ac-dde-datagrid-values-options-input.element";
import { AcDDEDatagridSelectTableInput } from "../cell-editors/ac-dde-datagrid-select-table-input.element";
import { AC_DATA_MANAGER_EVENT, IAcContextEvent } from "@autocode-ts/autocode";
import { AcDDEColumnValueOptionsRenderer } from "../cell-renderers/ac-dde-column-value-options-renderer";
import { AcDDETableRenderer } from "../cell-renderers/ac-dde-table-renderer";
import { AC_DDE_TAG } from "../../_ac-data-dictionary-editor.export";

export class AcDDETableColumnsDatagridElement extends AcDDEDatagridElement{
  data: any[] = [];
  filterFunction: Function | undefined;

  override initDatagrid() {
    super.initDatagrid();
    const columnDefinitions: IAcDatagridColumnDefinition[] = [
      {
        'field': 'action', 'title': '', cellRendererElement: AcDDEDatagridRowAction, cellRendererElementParams: {
          editorApi: this.editorApi
        }, width: 35, allowEdit: false, allowFocus: false, allowFilter: false, allowSort: false
      },

      { 'field': AcDDTableColumn.KeyColumnName, 'title': 'Column Name', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcDDTableColumn.KeyColumnType, 'title': 'Column Type', cellEditorElement: AcDDEDatagridSelectColumnTypeInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.PrimaryKey, 'title': 'Primary Key', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true, allowFocus: false },
      { 'field': AcEnumDDColumnProperty.ColumnTitle, 'title': 'Column Title', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.Required, 'title': 'Required', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      {
        'field': AcEnumDDColumnProperty.ValueOptions, 'title': 'Values', cellRendererElement: AcDDEColumnValueOptionsRenderer, cellRendererElementParams: {
          editorApi: this.editorApi
        }, cellEditorElement: AcDDEDatagridValueOptionsInput, allowFilter: true
      },
      { 'field': AcEnumDDColumnProperty.UniqueKey, 'title': 'Unique Key', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true }, { 'field': AcEnumDDColumnProperty.NotNull, 'title': 'Not Null', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.Format, 'title': 'Format', useCellEditorForRenderer: true, cellEditorElement: AcDDEDatagridSelectFormatInput, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.DefaultValue, 'title': 'Default Value', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.UseForRowLikeFilter, 'title': 'In Search Query', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.SetNullBeforeDelete, 'title': 'Set Null Before Delete?', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.IsSelectDistinct, 'title': 'Is Select Distinct?', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },

      { 'field': AcEnumDDColumnProperty.Tags, 'title': 'Tags', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.AutoNumberLength, 'title': 'AutoNumber Length', cellEditorElement: AcDDEDatagridNumberInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.AutoNumberPrefix, 'title': 'AutoNumber Prefix', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.CheckInAutoNumber, 'title': 'Check in AutoNumber?', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.CheckInModify, 'title': 'Check in Modify?', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.CheckInSave, 'title': 'Check in Save?', cellEditorElement: AcDDEDatagridYesNoInput, useCellEditorForRenderer: true, allowFilter: true },
      // { 'field': AcEnumDDColumnProperty.ForeignKey, 'title': 'Foreign Key' },
      { 'field': AcEnumDDColumnProperty.Remarks, 'title': 'Remarks', cellEditorElement: AcDDEDatagridTextInput, useCellEditorForRenderer: true, allowFilter: true },
      { 'field': AcEnumDDColumnProperty.Size, 'title': 'Size', cellEditorElement: AcDDEDatagridNumberInput, useCellEditorForRenderer: true, allowFilter: true },
      {
        'field': AcEnumDDETableColumn.TableId, 'title': 'Table', cellEditorElement: AcDDEDatagridSelectTableInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, cellRendererElement: AcDDETableRenderer, cellRendererElementParams: {
          editorApi: this.editorApi
        }, allowFilter: true
      },
    ];
    const colSetHookArgs: IAcDDEDatagridBeforeColumnsSetInitHookArgs = {
      datagridApi: this.datagridApi,
      editorApi: this.editorApi,
      columnDefinitions: columnDefinitions,
      instance: this
    };
    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TableColumnsDatagridBeforeColumnsSet, args: colSetHookArgs });
    this.datagridApi.columnDefinitions = columnDefinitions;

    this.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.BeforeRowAdd, callback: (args: any) => {
        args.data[AcEnumDDETableColumn.DataDictionaryId] = this.editorApi.activeDataDictionary?.dataDictionaryId;
        const row = this.editorApi.dataStorage.addTableColumn(args.data);
        args.data = row;
        this.data.push(row);
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDelete, callback: (args: IAcDatagridRowEvent) => {
        this.editorApi.dataStorage.deleteTableColumn({ columnId: args.datagridRow.data[AcEnumDDETableColumn.ColumnId] });
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.CellValueChange, callback: (args: IAcDatagridCellEvent) => {
        this.editorApi.dataStorage.setTableColumnProperties(args.datagridCell.datagridRow.data);
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TableColumnsDatagridCellEditorInit, args: hookArgs });
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TableColumnsDatagridCellRendererInit, args: hookArgs });
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.ActiveDataDictionaryChange, callback: () => {
        this.setColumnsData();
      }
    });
    this.editorApi.dataStorage.on('change', AcEnumDDEEntity.TableColumn, (args: IAcContextEvent) => {
      if (args.event == 'delete') {
        arrayRemoveByKey(this.data, AcEnumDDETableColumn.ColumnId, args.oldValue[AcEnumDDETableColumn.ColumnId]);
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
    let data = [...this.data];
    if (this.filterFunction != undefined) {
      data = data.filter((item: IAcDDETableColumn) => this.filterFunction!(item));
    }
    this.datagridApi.data = data;
  }

  setColumnsData() {
    if (this.editorApi.activeDataDictionary) {
      this.data = Object.values(this.editorApi.dataStorage.getTableColumns({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId }));
      this.applyFilter();
    }
  }

}

acRegisterCustomElement({ tag: AC_DDE_TAG.tableColumnsDatagrid, type: AcDDETableColumnsDatagridElement });
