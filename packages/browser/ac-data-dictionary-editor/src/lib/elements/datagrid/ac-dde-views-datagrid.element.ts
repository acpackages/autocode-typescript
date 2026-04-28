/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { acAddClassToElement, AcDatagridApi, AC_DATAGRID_EVENT, IAcDatagridActiveRowChangeEvent, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumnDefinition, IAcDatagridRowEvent, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AcDDView } from "@autocode-ts/ac-data-dictionary";
import { AC_DATA_MANAGER_EVENT, AcDelayedCallback, AcHooks,IAcContextEvent } from "@autocode-ts/autocode";
import { AcDDEDatagridTextInput } from "../cell-editors/ac-dde-datagrid-text-input.element";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";
import { AcDDEDatagridRowAction } from "../shared/ac-dde-datagrid-row-action.element";
import { arrayRemoveByKey } from "@autocode-ts/ac-extensions";
import { IAcDDEDatagridBeforeColumnsSetInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-before-columns-set-hook-args.interface";
import { AcEnumDDEHook } from "../../enums/ac-enum-dde-hooks.enum";
import { AcEnumDDEView } from "../../enums/ac-enum-dde-storage-keys.enum";
import { IAcDDEDatagridCellInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-cell-init-hook-args.interface";
import { AcEnumDDEEntity } from "../../enums/ac-enum-dde-entity.enum";
import { IAcDDEView } from "../../interfaces/ac-dde-view.inteface";
import { AcDDECssClassName } from "../../consts/ac-dde-css-class-name.const";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { AC_DDE_TAG } from "../../_ac-data-dictionary-editor.export";

export class AcDDEViewsDatagridElement extends AcDDEDatagridElement{
  filterFunction: Function | undefined;
  data: any[] = [];

  override initDatagrid() {
    super.initDatagrid();

    const columnDefinitions: IAcDatagridColumnDefinition[] = [
      {
        'field': 'action', 'title': '', cellRendererElement: AcDDEDatagridRowAction, cellRendererElementParams: {
          editorApi: this.editorApi
        }, width: 35, allowEdit:false,allowFocus:false,allowFilter:false,allowSort:false
      },
      {
        'field': AcDDView.KeyViewName, 'title': 'View Name',
        cellEditorElement: AcDDEDatagridTextInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, useCellEditorForRenderer: true,allowFilter:true
      },
      {
        'field': AcDDView.KeyViewQuery, 'title': 'View Query',
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
    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.ViewsDatagridBeforeColumnsSet, args: colSetHookArgs });
    this.datagridApi.columnDefinitions = columnDefinitions;

    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.ActiveRowChange, callback: (args: IAcDatagridActiveRowChangeEvent) => {
        this.delayedCallback.add({callback:() => {
          // this.hooks.execute({ hook: AcEnumDDEHook.DatagridActiveTableChange });
        }, duration:100});

      }
    });
    this.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.BeforeRowAdd, callback: (args: any) => {
        const row = this.editorApi.dataStorage.addView({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId, ...args.data });
        args.data = row;
        this.data.push(row);
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDelete, callback: (args: IAcDatagridRowEvent) => {
        this.editorApi.dataStorage.deleteView({ viewId: args.datagridRow.data[AcEnumDDEView.ViewId] });
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.ViewsDatagridCellEditorInit, args: hookArgs });
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.ViewsDatagridCellRendererInit, args: hookArgs });
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.DataDictionarySet, callback: () => {
        this.setViewsData();
      }
    });
    this.editorApi.dataStorage.on('change', AcEnumDDEEntity.View, (args: IAcContextEvent) => {
      if (args.event == 'delete') {
        arrayRemoveByKey(this.data, AcEnumDDEView.ViewId, args.oldValue[AcEnumDDEView.ViewId]);
      }
      else if (args.event == 'add') {
        this.data.push(args.value);
      }
    });

    this.editorApi.hooks.subscribe({
          hook: AcEnumDDEHook.ActiveDataDictionaryChange, callback: (args: IAcDDEActiveDataDictionaryChangeHookArgs) => {
            this.setViewsData();
          }
        });

    this.setViewsData();
  }

  applyFilter() {
    let data = this.data;
    if (this.filterFunction) {
      data = data.filter((item: IAcDDEView) => this.filterFunction!(item));
    }
    this.datagridApi.data = data;
  }

  setViewsData() {
    this.data = Object.values(this.editorApi.dataStorage.getViews({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId }));
    this.applyFilter();
  }

}

acRegisterCustomElement({ tag: AC_DDE_TAG.viewsDatagrid, type: AcDDEViewsDatagridElement });
