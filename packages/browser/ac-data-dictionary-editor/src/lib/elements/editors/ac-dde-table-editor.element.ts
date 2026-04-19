/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { acAddClassToElement, AC_DATAGRID_EVENT, AcEnumResizableEvent, AcResizableAttributeName, AcResizablePanels, IAcDatagridActiveRowChangeEvent, IAcDatagridRowEvent, IAcDatagridStateChangeEvent, IAcResizablePanelResizeEvent } from '@autocode-ts/ac-browser';
import { IAcDDETable } from '../../interfaces/ac-dde-table.inteface';
import { AcDDEApi } from '../../core/ac-dde-api';
import { AcDDETableColumnsDatagrid } from '../datagrid/ac-dde-table-columns-datagrid.element';
import { AcDDERelationshipsDatagrid } from '../datagrid/ac-dde-relationships-datagrid.element';
import { AcDDETriggersDatagrid } from '../datagrid/ac-dde-triggers-datagrid.element';
import { AcDDETablesDatagrid } from '../datagrid/ac-dde-tables-datagrid.element';
import { AcEnumDDEHook } from '../../enums/ac-enum-dde-hooks.enum';
import { IAcDDETableColumn } from '../../interfaces/ac-dde-table-column.inteface';
import { AcEnumDDERelationship, AcEnumDDETableColumn, AcEnumDDETrigger } from '../../enums/ac-enum-dde-storage-keys.enum';
import { IAcDDERelationship } from '../../interfaces/ac-dde-relationship.inteface';
import { IAcDDETrigger } from '../../interfaces/ac-dde-trigger.inteface';
import { AcEnumDDEEvent } from '../../enums/ac-enum-dde-event.enum';
import { AcDDECssClassName } from '../../consts/ac-dde-css-class-name.const';
import { IAcDDETableEditorState } from '../../interfaces/ac-dde-table-editor-state.interface';
import { AC_DATA_MANAGER_EVENT, AcDelayedCallback } from '@autocode-ts/autocode';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class AcDDETableEditor {
  activeTable?: IAcDDETable;
  editorApi!: AcDDEApi;

  element: HTMLElement = document.createElement('div');

  tableColumnsDatagrid!: AcDDETableColumnsDatagrid;
  tableRelationshipsDatagrid!: AcDDERelationshipsDatagrid;
  tablesDatagrid!: AcDDETablesDatagrid;
  tableTriggersDatagrid!: AcDDETriggersDatagrid;

  editorPanels!: AcResizablePanels;
  detailPanels!: AcResizablePanels;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  state: IAcDDETableEditorState = {};

  editorInitialized: boolean = false;


  constructor({ editorApi }: { editorApi: AcDDEApi }) {
    this.editorApi = editorApi;

    this.tablesDatagrid = new AcDDETablesDatagrid({ editorApi: this.editorApi });
    this.tablesDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.ActiveRowChange, callback: (args: IAcDatagridActiveRowChangeEvent) => {
          this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TableEditorActiveTableChange });
          this.activeTable = this.tablesDatagrid.datagridApi!.activeDatagridRow!.data;
          this.tableColumnsDatagrid.applyFilter();
          this.tableRelationshipsDatagrid.applyFilter();
          this.tableTriggersDatagrid.applyFilter();
      }
    });
    this.tablesDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: IAcDatagridStateChangeEvent) => {
        this.updateEditorState();
      }
    });

    this.tableColumnsDatagrid = new AcDDETableColumnsDatagrid({ editorApi: this.editorApi });
    this.tableColumnsDatagrid.filterFunction = (row: IAcDDETableColumn) => {
      let tableId: any = undefined;
      if (this.tablesDatagrid && this.tablesDatagrid.datagridApi && this.tablesDatagrid.datagridApi.activeDatagridRow) {
        const activeRow: IAcDDETable = this.tablesDatagrid.datagridApi.activeDatagridRow.data;
        tableId = activeRow.tableId;
      }
      return row.tableId == tableId;
    };
    this.tableColumnsDatagrid.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.RowAdd, callback: (args: IAcDatagridRowEvent) => {
        args.datagridRow.data[AcEnumDDETableColumn.TableId] = this.activeTable!.tableId;
      }
    });
    this.tableColumnsDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: IAcDatagridStateChangeEvent) => {
        this.updateEditorState();
      }
    });

    this.tableRelationshipsDatagrid = new AcDDERelationshipsDatagrid({ editorApi: this.editorApi });
    this.tableRelationshipsDatagrid.filterFunction = (row: IAcDDERelationship) => {
      let tableId: any = undefined;
      if (this.tablesDatagrid && this.tablesDatagrid.datagridApi && this.tablesDatagrid.datagridApi.activeDatagridRow) {
        const activeRow: IAcDDETable = this.tablesDatagrid.datagridApi.activeDatagridRow.data;
        tableId = activeRow.tableId;
      }
      return row.destinationTableId == tableId;
    };
    this.tableRelationshipsDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: IAcDatagridStateChangeEvent) => {
        this.updateEditorState();
      }
    });
    this.tableRelationshipsDatagrid.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.RowAdd, callback: (args: IAcDatagridRowEvent) => {
        args.datagridRow.data[AcEnumDDERelationship.DestinationTableId] = this.activeTable!.tableId;
      }
    });

    this.tableTriggersDatagrid = new AcDDETriggersDatagrid({ editorApi: this.editorApi });
    this.tableTriggersDatagrid.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.RowAdd, callback: (args: IAcDatagridRowEvent) => {
        args.datagridRow.data[AcEnumDDETrigger.TableId] = this.activeTable!.tableId;
      }
    });
    this.tableTriggersDatagrid.filterFunction = (row: IAcDDETrigger) => {
      let tableId: any = undefined;
      if (this.tablesDatagrid && this.tablesDatagrid.datagridApi && this.tablesDatagrid.datagridApi.activeDatagridRow) {
        const activeRow: IAcDDETable = this.tablesDatagrid.datagridApi.activeDatagridRow.data;
        tableId = activeRow.tableId;
      }
      return row.tableId == tableId;
    };
    this.tableTriggersDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: IAcDatagridStateChangeEvent) => {
        this.updateEditorState();
      }
    });

    this.tableColumnsDatagrid.applyFilter();
    this.tableRelationshipsDatagrid.applyFilter();
    this.tableTriggersDatagrid.applyFilter();

    this.initElement();

    this.editorApi.on({
      event: AcEnumDDEEvent.StateChange, callback: () => {
        this.refreshEditorState();
      }
    })
  }

  private initElement() {
    this.element.innerHTML = `<ac-resizable-panels class="editor-resizable-panels">
      <ac-resizable-panel>
        <div ac-dde-tables-wrapper class="${AcDDECssClassName.acDDETablesContainer}"></div>
      </ac-resizable-panel>
      <ac-resizable-panel>
        <ac-resizable-panels class="detail-resizable-panels" direction="vertical">
          <ac-resizable-panel ac-dde-tables-columns-wrapper></ac-resizable-panel>
          <ac-resizable-panel ac-dde-tables-relationships-wrapper></ac-resizable-panel>
          <ac-resizable-panel ac-dde-tables-triggers-wrapper></ac-resizable-panel>
        </ac-resizable-panels>
      </ac-resizable-panel>
    </ac-resizable-panels>`;
    acAddClassToElement({ class_: AcDDECssClassName.acDataDictionaryEditor, element: this.element });
    acAddClassToElement({ class_: AcDDECssClassName.acDDEDatagridWrapper, element: this.element });

    this.editorPanels = this.element.querySelector('.editor-resizable-panels') as AcResizablePanels;

    this.detailPanels = this.element.querySelector('.detail-resizable-panels') as AcResizablePanels;
    this.delayedCallback.add({callback:() => {
      this.editorPanels.setPanelSizes({
        panelSizes: [
          { size: 35, index: 0 },
          { size: 65, index: 1 }
        ]
      });
      this.detailPanels.setPanelSizes({
      panelSizes: [
        { size: 60, index: 0 },
        { size: 20, index: 1 },
        { size: 20, index: 1 }
      ]
    });
    }, duration:5});


    const tablesWrapper = this.element.querySelector('[ac-dde-tables-wrapper]') as HTMLElement;
    tablesWrapper.append(this.tablesDatagrid.element);

    const columnsWrapper = this.element.querySelector('[ac-dde-tables-columns-wrapper]') as HTMLElement;
    columnsWrapper.append(this.tableColumnsDatagrid.element);

    const relationshipsWrapper = this.element.querySelector('[ac-dde-tables-relationships-wrapper]') as HTMLElement;
    relationshipsWrapper.append(this.tableRelationshipsDatagrid.element);

    const triggersWrapper = this.element.querySelector('[ac-dde-tables-triggers-wrapper]') as HTMLElement;
    triggersWrapper.append(this.tableTriggersDatagrid.element);

    this.refreshEditorState();
    this.delayedCallback.add({callback:() => {
      this.editorInitialized = true;
    }, duration:50});
  }

  refreshEditorState() {
    const state = this.editorApi.editorState.tableEditorState;
    if (state) {
      if (state.detailPanels) {
        this.detailPanels.setPanelSizes({ panelSizes: state.detailPanels });
      }
      if (state.editorPanels) {
        this.editorPanels.setPanelSizes({ panelSizes: state.editorPanels });
      }
      if (state.tablesDatagrid) {
        this.tablesDatagrid.datagridApi.setState({ state: state.tablesDatagrid });
      }
      if (state.tableColumnsDatagrid) {
        this.tableColumnsDatagrid.datagridApi.setState({ state: state.tableColumnsDatagrid });
      }
      if (state.tableRelationshipsDatagrid) {
        this.tableRelationshipsDatagrid.datagridApi.setState({ state: state.tableRelationshipsDatagrid });
      }
      if (state.tableTriggersDatagrid) {
        this.tableTriggersDatagrid.datagridApi.setState({ state: state.tableTriggersDatagrid });
      }
    }
  }

  updateEditorState() {
    if (this.editorInitialized) {
      this.state.tablesDatagrid = this.tablesDatagrid.datagridApi.getState();
      this.state.tableColumnsDatagrid = this.tableColumnsDatagrid.datagridApi.getState();
      this.state.tableRelationshipsDatagrid = this.tableRelationshipsDatagrid.datagridApi.getState();
      this.state.tableTriggersDatagrid = this.tableTriggersDatagrid.datagridApi.getState();
      this.state.detailPanels = this.detailPanels.getPanelSizes();
      this.state.editorPanels = this.editorPanels.getPanelSizes();
      this.editorApi.editorState.tableEditorState = { ...this.state };
    }
  }
}
