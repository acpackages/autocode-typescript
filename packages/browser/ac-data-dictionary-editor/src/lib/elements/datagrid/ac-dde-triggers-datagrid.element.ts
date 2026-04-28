/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { acAddClassToElement, AcDatagridApi, AC_DATAGRID_EVENT, AcResizablePanels, IAcDatagridActiveRowChangeEvent, IAcDatagridCellEditorElementInitEvent, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumnDefinition, IAcDatagridRowEvent, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AcDDTrigger, AcEnumDDRowOperation } from "@autocode-ts/ac-data-dictionary";
import { AC_DATA_MANAGER_EVENT, AcDelayedCallback, AcHooks, IAcContextEvent } from "@autocode-ts/autocode";
import { AcDDEDatagridTextInput } from "../cell-editors/ac-dde-datagrid-text-input.element";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";
import { AcDDEDatagridRowAction } from "../shared/ac-dde-datagrid-row-action.element";
import { arrayRemoveByKey } from "@autocode-ts/ac-extensions";
import { IAcDDEDatagridBeforeColumnsSetInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-before-columns-set-hook-args.interface";
import { AcDDEDatagridSelectInput } from "../cell-editors/ac-dde-datagrid-select-input.element";
import { AcDDEDatagridSelectTableInput } from "../cell-editors/ac-dde-datagrid-select-table-input.element";
import { AcEnumDDEHook } from "../../enums/ac-enum-dde-hooks.enum";
import { AcEnumDDETrigger } from "../../enums/ac-enum-dde-storage-keys.enum";
import { IAcDDEDatagridCellInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-cell-init-hook-args.interface";
import { AcEnumDDEEntity } from "../../enums/ac-enum-dde-entity.enum";
import { IAcDDETrigger } from "../../interfaces/ac-dde-trigger.inteface";
import { AcDDECssClassName } from "../../consts/ac-dde-css-class-name.const";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { AcDDETriggerMaster } from "../masters/ac-dde-trigger-master.element";
import { AcDDETableRenderer } from "../cell-renderers/ac-dde-table-renderer";
import { AC_DDE_TAG } from "../../_ac-data-dictionary-editor.export";

export class AcDDETriggersDatagridElement extends AcDDEDatagridElement{
  activeTrigger?: IAcDDETrigger;
  element: HTMLElement = document.createElement('div');
  filterFunction: Function | undefined;
  // triggerMaster: AcDDETriggerMaster;
  hooks: AcHooks = new AcHooks();
  data: any[] = [];

  editorPanels: AcResizablePanels = new AcResizablePanels();

  // constructor({ editorApi }: { editorApi: AcDDEApi }) {
  //   this.ddeDatagrid = new AcDDEDatagrid({ editorApi: editorApi });
  //   this.ddeDatagrid.datagridApi.on({
  //     event: AC_DATAGRID_EVENT.ActiveRowChange, callback: (args: IAcDatagridActiveRowChangeEvent) => {
  //       this.delayedCallback.add({callback:() => {
  //         this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TableEditorActiveTableChange });
  //         this.activeTrigger = this.ddeDatagrid.datagridApi!.activeDatagridRow!.data;
  //         this.triggerMaster.trigger = this.activeTrigger!;
  //       }, duration:10});
  //     }
  //   });
  //   this.ddeDatagrid.datagridApi.on({
  //     event: AC_DATAGRID_EVENT.CellValueChange, callback: (args: any) => {
  //       this.triggerMaster.trigger = this.activeTrigger!;
  //     }
  //   });

  //   this.triggerMaster = new AcDDETriggerMaster({ editorApi });
  //   this.triggerMaster.on({
  //     event: "change", callback: (args: any) => {
  //       if (this.ddeDatagrid.datagridApi.activeDatagridRow) {
  //         this.ddeDatagrid.datagridApi!.updateRow({ rowId: this.ddeDatagrid.datagridApi.activeDatagridRow!.rowId, data: args.trigger });
  //       }
  //     }
  //   });

  //   this.editorApi = editorApi;
  //   this.initDatagrid();
  //   this.initElement();
  // }

  override initDatagrid() {
    super.initDatagrid();

    const columnDefinitions: IAcDatagridColumnDefinition[] = [
      {
        'field': 'action', 'title': '', cellRendererElement: AcDDEDatagridRowAction, cellRendererElementParams: {
          editorApi: this.editorApi
        }, width: 35, allowEdit:false,allowFocus:false,allowFilter:false,allowSort:false
      },
      {
        'field': AcDDTrigger.KeyTriggerExecution, 'title': 'Execution',
        cellEditorElement: AcDDEDatagridSelectInput, cellEditorElementParams: {
          editorApi: this.editorApi, options: [
            { label: 'AFTER', value: 'AFTER' },
            { label: 'BEFORE', value: 'BEFORE' }
          ]
        }, useCellEditorForRenderer: true, allowFilter: true
      },
      {
        'field': AcDDTrigger.KeyRowOperation, 'title': 'Operation',
        cellEditorElement: AcDDEDatagridSelectInput, cellEditorElementParams: {
          editorApi: this.editorApi,
          options: [
            { label: 'INSERT', value: AcEnumDDRowOperation.Insert },
            { label: 'UPDATE', value: AcEnumDDRowOperation.Update },
            { label: 'DELETE', value: AcEnumDDRowOperation.Delete }
          ]
        }, useCellEditorForRenderer: true, allowFilter: true
      },
      {
        'field': 'tableId', 'title': 'Table',
        cellEditorElement: AcDDEDatagridSelectTableInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, cellRendererElement:AcDDETableRenderer,cellRendererElementParams: {
                  editorApi: this.editorApi
                }, allowFilter: true
      },
      {
        'field': AcDDTrigger.KeyTriggerName, 'title': 'Trigger Name',
        cellEditorElement: AcDDEDatagridTextInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, useCellEditorForRenderer: true, allowFilter: true
      },
      {
        'field': AcDDTrigger.KeyTriggerCode, 'title': 'Trigger Code',
        cellEditorElement: AcDDEDatagridTextInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, useCellEditorForRenderer: true, allowFilter: true
      }
    ];
    const colSetHookArgs: IAcDDEDatagridBeforeColumnsSetInitHookArgs = {
      datagridApi: this.datagridApi,
      editorApi: this.editorApi,
      columnDefinitions: columnDefinitions,
      instance: this
    };
    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TriggersDatagridBeforeColumnsSet, args: colSetHookArgs });
    this.datagridApi.columnDefinitions = columnDefinitions;

    this.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.BeforeRowAdd, callback: (args: any) => {
        const row = this.editorApi.dataStorage.addTrigger({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId, ...args.data });
        args.data = row;
        this.data.push(row);
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDelete, callback: (args: IAcDatagridRowEvent) => {
        this.editorApi.dataStorage.deleteTrigger({ triggerId: args.datagridRow.data[AcEnumDDETrigger.TriggerId] });
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TriggersDatagridCellEditorInit, args: hookArgs });
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
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TriggersDatagridCellRendererInit, args: hookArgs });
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.DataDictionarySet, callback: () => {
        this.setTriggersData();
      }
    });
    this.editorApi.dataStorage.on('change', AcEnumDDEEntity.Trigger, (args: IAcContextEvent) => {
      if (args.event == 'delete') {
        arrayRemoveByKey(this.data, AcEnumDDETrigger.TriggerId, args.oldValue[AcEnumDDETrigger.TriggerId]);
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.ActiveDataDictionaryChange, callback: (args: IAcDDEActiveDataDictionaryChangeHookArgs) => {
        this.setTriggersData();
      }
    });

    this.setTriggersData();
  }

  applyFilter() {
    let data = this.data;
    if (this.filterFunction != undefined) {
      data = data.filter((item: IAcDDETrigger) => this.filterFunction!(item));
    }
    this.datagridApi.data = data;
  }

  // initElement() {
  //   acAddClassToElement({ class_: AcDDECssClassName.acDDEListMasterContainer, element: this.element });

  //   this.element.innerHTML = `<ac-resizable-panels class="editor-resizable-panels">
  //     <ac-resizable-panel ac-dde-triggers-wrapper></ac-resizable-panel>
  //     <ac-resizable-panel ac-dde-trigger-details-wrapper></ac-resizable-panel>
  //   </ac-resizable-panels>`;
  //   this.editorPanels = this.element.querySelector('.editor-resizable-panels') as AcResizablePanels;

  //   this.delayedCallback.add({callback:() => {
  //     this.editorPanels.setPanelSizes({
  //       panelSizes: [
  //         { size: 60, index: 0 },
  //         { size: 40, index: 1 }
  //       ]
  //     });
  //   }, duration:50});

  //   const datagridWrapper = this.element.querySelector('[ac-dde-triggers-wrapper]') as HTMLElement;
  //   datagridWrapper.append(this.ddeDatagrid.element);

  //   const detailsWrapper = this.element.querySelector('[ac-dde-trigger-details-wrapper]') as HTMLElement;
  //   detailsWrapper.append(this.triggerMaster.element);

  // }

  setTriggersData() {
    this.data = Object.values(this.editorApi.dataStorage.getTriggers({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId }));
    this.applyFilter();
  }

}


acRegisterCustomElement({ tag: AC_DDE_TAG.triggersDatagrid, type: AcDDETriggersDatagridElement });
