/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { acAddClassToElement, AC_DATAGRID_EVENT, AcEnumResizableEvent, AcResizableAttributeName, AcResizablePanels, IAcDatagridActiveRowChangeEvent, IAcDatagridRowEvent, IAcDatagridStateChangeEvent, IAcResizablePanelResizeEvent, acRegisterCustomElement } from '@autocode-ts/ac-browser';
import { IAcDDETable } from '../../interfaces/ac-dde-table.inteface';
import { AcDDEApi } from '../../core/ac-dde-api';
import { AcDDETableColumnsDatagridElement } from '../datagrid/ac-dde-table-columns-datagrid.element';
import { AcDDERelationshipsDatagridElement } from '../datagrid/ac-dde-relationships-datagrid.element';
import { AcDDETriggersDatagridElement } from '../datagrid/ac-dde-triggers-datagrid.element';
import { AcDDETablesDatagridElement } from '../datagrid/ac-dde-tables-datagrid.element';
import { AcEnumDDEHook } from '../../enums/ac-enum-dde-hooks.enum';
import { IAcDDETableColumn } from '../../interfaces/ac-dde-table-column.inteface';
import { AcEnumDDERelationship, AcEnumDDETableColumn, AcEnumDDETrigger } from '../../enums/ac-enum-dde-storage-keys.enum';
import { IAcDDERelationship } from '../../interfaces/ac-dde-relationship.inteface';
import { IAcDDETrigger } from '../../interfaces/ac-dde-trigger.inteface';
import { AcEnumDDEEvent } from '../../enums/ac-enum-dde-event.enum';
import { AcDDECssClassName } from '../../consts/ac-dde-css-class-name.const';
import { IAcDDETableEditorState } from '../../interfaces/ac-dde-table-editor-state.interface';
import { AC_DATA_MANAGER_EVENT, AcDelayedCallback } from '@autocode-ts/autocode';
import { AcDDEElementBase } from '../core/ac-dde-element-base.element';
import { AC_DDE_TAG } from '../../consts/ac-dde-tag.const';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class AcDDETableEditorElement extends AcDDEElementBase{
  activeTable?: IAcDDETable;

  tableColumnsDatagrid!: AcDDETableColumnsDatagridElement;
  tableRelationshipsDatagrid!: AcDDERelationshipsDatagridElement;
  tablesDatagrid!: AcDDETablesDatagridElement;
  tableTriggersDatagrid!: AcDDETriggersDatagridElement;

  editorPanels!: AcResizablePanels;
  detailPanels!: AcResizablePanels;

  state: IAcDDETableEditorState = {};

  editorInitialized: boolean = false;


  override init() {
    super.init();

    this.initElement();

    this.editorApi.on({
      event: AcEnumDDEEvent.StateChange, callback: () => {
        this.refreshEditorState();
      }
    })
  }

  private initElement() {
    this.innerHTML = `<ac-resizable-panels class="editor-resizable-panels">
      <ac-resizable-panel>
        <div ac-dde-tables-wrapper class="${AcDDECssClassName.acDDETablesContainer}">
          <${AC_DDE_TAG.tablesDatagrid}></${AC_DDE_TAG.tablesDatagrid}>
        </div>
      </ac-resizable-panel>
      <ac-resizable-panel>
        <ac-resizable-panels class="detail-resizable-panels" direction="vertical">
          <ac-resizable-panel ac-dde-tables-columns-wrapper>
            <${AC_DDE_TAG.tableColumnsDatagrid}></${AC_DDE_TAG.tableColumnsDatagrid}>
          </ac-resizable-panel>
          <ac-resizable-panel ac-dde-tables-relationships-wrapper>
            <${AC_DDE_TAG.relationshipsDatagrid}></${AC_DDE_TAG.relationshipsDatagrid}>
          </ac-resizable-panel>
          <ac-resizable-panel ac-dde-tables-triggers-wrapper>
            <${AC_DDE_TAG.triggersDatagrid}></${AC_DDE_TAG.triggersDatagrid}>
          </ac-resizable-panel>
        </ac-resizable-panels>
      </ac-resizable-panel>
    </ac-resizable-panels>`;
    acAddClassToElement({ class_: AcDDECssClassName.acDataDictionaryEditor, element: this });
    acAddClassToElement({ class_: AcDDECssClassName.acDDEDatagridWrapper, element: this });

    this.editorPanels = this.querySelector('.editor-resizable-panels') as AcResizablePanels;

    this.detailPanels = this.querySelector('.detail-resizable-panels') as AcResizablePanels;
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

    this.tablesDatagrid =  this.querySelector(AC_DDE_TAG.tablesDatagrid) as AcDDETablesDatagridElement;
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

    this.tableColumnsDatagrid = this.querySelector(AC_DDE_TAG.tableColumnsDatagrid) as  AcDDETableColumnsDatagridElement;
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

    this.tableRelationshipsDatagrid = this.querySelector(AC_DDE_TAG.relationshipsDatagrid) as AcDDERelationshipsDatagridElement;
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

    this.tableTriggersDatagrid = this.querySelector(AC_DDE_TAG.triggersDatagrid) as AcDDETriggersDatagridElement;
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

acRegisterCustomElement({ tag: AC_DDE_TAG.tableEditor, type: AcDDETableEditorElement });
