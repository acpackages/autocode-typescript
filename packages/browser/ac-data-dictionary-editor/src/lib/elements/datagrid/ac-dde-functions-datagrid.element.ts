/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AC_DATAGRID_EVENT, acRegisterCustomElement, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumnDefinition, IAcDatagridRowEvent } from "@autocode-ts/ac-browser";
import { AcDDFunction } from "@autocode-ts/ac-data-dictionary";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";
import { AcDDEDatagridRowAction } from "../shared/ac-dde-datagrid-row-action.element";
import { arrayRemoveByKey } from "@autocode-ts/ac-extensions";
import { IAcDDEDatagridBeforeColumnsSetInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-before-columns-set-hook-args.interface";
import { IAcDDEFunction } from "../../interfaces/ac-dde-function.inteface";
import { AcDDEDatagridTextInput } from "../cell-editors/ac-dde-datagrid-text-input.element";
import { AcEnumDDEHook } from "../../enums/ac-enum-dde-hooks.enum";
import { AcEnumDDEFunction } from "../../enums/ac-enum-dde-storage-keys.enum";
import { IAcDDEDatagridCellInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-cell-init-hook-args.interface";
import { AcEnumDDEEntity } from "../../enums/ac-enum-dde-entity.enum";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { AC_DATA_MANAGER_EVENT, IAcContextEvent } from "@autocode-ts/autocode";
import { AC_DDE_TAG } from "../../_ac-data-dictionary-editor.export";

export class AcDDEFunctionsDatagridElement extends AcDDEDatagridElement{
  data: any[] = [];
  filterFunction: Function | undefined;

  applyFilter() {
    let data = this.data;
    if (this.filterFunction != undefined) {
      data = data.filter((item: IAcDDEFunction) => this.filterFunction!(item));
    }
    this.datagridApi.data = data;
  }

  override initDatagrid() {
    super.initDatagrid();

    const columnDefinitions: IAcDatagridColumnDefinition[] = [
      {
        'field': 'action', 'title': '', cellRendererElement: AcDDEDatagridRowAction, cellRendererElementParams: {
          editorApi: this.editorApi
        }, width: 35, allowEdit:false,allowFocus:false,allowFilter:false,allowSort:false
      },
      {
        'field': AcDDFunction.KeyFunctionName, 'title': 'Function Name',
        cellEditorElement: AcDDEDatagridTextInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, useCellEditorForRenderer: true,allowFilter:true
      },
      {
        'field': AcDDFunction.KeyFunctionCode, 'title': 'Function Code',
        cellEditorElement: AcDDEDatagridTextInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, useCellEditorForRenderer: true,allowFilter:true
      }
    ];
    const colSetHookArgs: IAcDDEDatagridBeforeColumnsSetInitHookArgs = {
      datagridApi: this.datagridApi,
      editorApi: this.editorApi,
      columnDefinitions: columnDefinitions,
      instance: this
    };
    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.FunctionsDatagridBeforeColumnsSet, args: colSetHookArgs });
    this.datagridApi.columnDefinitions = columnDefinitions;

    this.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.BeforeRowAdd, callback: (args: any) => {
        const row = this.editorApi.dataStorage.addFunction({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId, ...args.data });
        args.data = row;
        this.data.push(row);
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDelete, callback: (args: IAcDatagridRowEvent) => {
        this.editorApi.dataStorage.deleteFunction({ functionId: args.datagridRow.data[AcEnumDDEFunction.FunctionId] });
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.FunctionsDatagridCellEditorInit, args: hookArgs });
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.FunctionsDatagridCellRendererInit, args: hookArgs });
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.DataDictionarySet, callback: () => {
        this.setFunctionsData();
      }
    });
    this.editorApi.dataStorage.on('change', AcEnumDDEEntity.Function, (args: IAcContextEvent) => {
      if (args.event == 'delete') {
        arrayRemoveByKey(this.data, AcEnumDDEFunction.FunctionId, args.oldValue[AcEnumDDEFunction.FunctionId]);
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.ActiveDataDictionaryChange, callback: (args: IAcDDEActiveDataDictionaryChangeHookArgs) => {
        this.setFunctionsData();
      }
    });
    this.setFunctionsData();
  }

  setFunctionsData() {
    this.data = Object.values(this.editorApi.dataStorage.getFunctions({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId }));
    this.applyFilter();
  }
}

acRegisterCustomElement({ tag: AC_DDE_TAG.functionsDatagrid, type: AcDDEFunctionsDatagridElement });
