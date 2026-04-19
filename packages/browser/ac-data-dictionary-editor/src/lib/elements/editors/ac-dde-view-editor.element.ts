/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { acAddClassToElement, AC_DATAGRID_EVENT, AcResizablePanels, IAcDatagridActiveRowChangeEvent, IAcDatagridRowEvent, IAcDatagridStateChangeEvent, IAcResizablePanelResizeEvent } from '@autocode-ts/ac-browser';
import { IAcDDETable } from '../../interfaces/ac-dde-table.inteface';
import { AcDDEApi } from '../../core/ac-dde-api';
import { AcEnumDDEHook } from '../../enums/ac-enum-dde-hooks.enum';
import { AcEnumDDETableColumn, AcEnumDDEViewColumn } from '../../enums/ac-enum-dde-storage-keys.enum';
import { AcEnumDDEEvent } from '../../enums/ac-enum-dde-event.enum';
import { AcDDECssClassName } from '../../consts/ac-dde-css-class-name.const';
import { AcDDEViewColumnsDatagrid, AcDDEViewsDatagrid, IAcDDEView, IAcDDEViewColumn, IAcDDEViewEditorState } from '../../_ac-data-dictionary-editor.export';
import { AcDDEViewMaster } from '../masters/ac-dde-view-master.element';
import { AC_DATA_MANAGER_EVENT, AcDelayedCallback } from '@autocode-ts/autocode';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class AcDDEViewEditor {
  activeView?: IAcDDEView;
  editorApi!: AcDDEApi;

  headerElement: HTMLElement = document.createElement('div');
  element: HTMLElement = document.createElement('div');

  viewColumnsDatagrid!: AcDDEViewColumnsDatagrid;
  viewsDatagrid!: AcDDEViewsDatagrid;
  viewMaster: AcDDEViewMaster;

  editorPanels: AcResizablePanels = new AcResizablePanels();
  detailPanels: AcResizablePanels = new AcResizablePanels();

  state: IAcDDEViewEditorState = {};

  editorInitialized: boolean = false;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  constructor({ editorApi }: { editorApi: AcDDEApi }) {
    this.editorApi = editorApi;

    this.viewsDatagrid = new AcDDEViewsDatagrid({ editorApi: this.editorApi });
    this.viewsDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.ActiveRowChange, callback: (args: IAcDatagridActiveRowChangeEvent) => {
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.TableEditorActiveTableChange });
        this.activeView = this.viewsDatagrid.datagridApi!.activeDatagridRow!.data;
        this.viewColumnsDatagrid.applyFilter();
        this.viewMaster.view = this.activeView!;
      }
    });
    this.viewsDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: IAcDatagridStateChangeEvent) => {
        this.updateEditorState();
      }
    });
    this.viewsDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.CellValueChange, callback: (args: IAcDatagridStateChangeEvent) => {
        this.viewMaster.view = this.activeView!;
      }
    });

    this.viewMaster = new AcDDEViewMaster();
    this.viewMaster.editorApi = this.editorApi;
    this.viewMaster.on({
      event: "change", callback: (args: any) => {
        if (this.viewsDatagrid.datagridApi.activeDatagridRow) {
          this.viewsDatagrid.datagridApi!.updateRow({ rowId: this.viewsDatagrid.datagridApi.activeDatagridRow!.rowId, data: args.view });
        }
      }
    });
    this.viewMaster.on({
      event: "viewColumnsChange", callback: (args: any) => {
        this.viewColumnsDatagrid.setColumnsData();
      }
    });

    this.viewColumnsDatagrid = new AcDDEViewColumnsDatagrid({ editorApi: this.editorApi });
    this.viewColumnsDatagrid.filterFunction = (row: IAcDDEViewColumn) => {
      let viewId: any = undefined;
      if (this.viewsDatagrid && this.viewsDatagrid.datagridApi && this.viewsDatagrid.datagridApi.activeDatagridRow) {
        const activeRow: IAcDDETable = this.viewsDatagrid.datagridApi.activeDatagridRow.data;
        viewId = activeRow.viewId;
      }
      return row.viewId == viewId;
    };
    this.viewColumnsDatagrid.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.RowAdd, callback: (args: IAcDatagridRowEvent) => {
        args.datagridRow.data[AcEnumDDEViewColumn.ViewId] = this.activeView!.viewId;
      }
    });

    this.viewColumnsDatagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: IAcDatagridStateChangeEvent) => {
        this.updateEditorState();
      }
    });

    this.viewColumnsDatagrid.applyFilter();

    this.initElement();

    this.editorApi.on({
      event: AcEnumDDEEvent.StateChange, callback: () => {
        this.refreshEditorState();
      }
    })
  }

  private initElement() {
    acAddClassToElement({ class_: AcDDECssClassName.acDataDictionaryEditor, element: this.element });
    acAddClassToElement({ class_: AcDDECssClassName.acDDEDatagridWrapper, element: this.element });

    this.element.innerHTML = `<ac-resizable-panels class="editor-resizable-panels">
      <ac-resizable-panel ac-dde-views-wrapper></ac-resizable-panel>
      <ac-resizable-panel>
        <ac-resizable-panels class="detail-resizable-panels" direction="vertical">
          <ac-resizable-panel ac-dde-view-details-wrapper></ac-resizable-panel>
          <ac-resizable-panel ac-dde-view-columns-wrapper></ac-resizable-panel>
        </ac-resizable-panels>
      </ac-resizable-panel>
    </ac-resizable-panels>`;
    this.editorPanels = this.element.querySelector('.editor-resizable-panels') as AcResizablePanels;

    this.detailPanels = this.element.querySelector('.detail-resizable-panels') as AcResizablePanels;
    this.delayedCallback.add({callback:() => {
      this.editorPanels.setPanelSizes({
        panelSizes: [
          { size: 30, index: 0 },
          { size: 70, index: 1 }
        ]
      });
      this.detailPanels.setPanelSizes({
        panelSizes: [
          { size: 30, index: 0 },
          { size: 70, index: 1 }
        ]
      });
    }, duration:50});


    const viewsWrapper = this.element.querySelector('[ac-dde-views-wrapper]') as HTMLElement;
    viewsWrapper.append(this.viewsDatagrid.element);

    const masterWrapper = this.element.querySelector('[ac-dde-view-details-wrapper]') as HTMLElement;
    masterWrapper.append(this.viewMaster.element);

    const columnsWrapper = this.element.querySelector('[ac-dde-view-columns-wrapper]') as HTMLElement;
    columnsWrapper.append(this.viewColumnsDatagrid.element);

    this.refreshEditorState();
    this.delayedCallback.add({callback:() => {
      this.editorInitialized = true;
    }, duration:500});
  }


  refreshEditorState() {
    const state = this.editorApi.editorState.viewEditorState;
    if (state) {
      if (state.detailPanels) {
        this.detailPanels.setPanelSizes({ panelSizes: state.detailPanels });
      }
      if (state.editorPanels) {
        this.editorPanels.setPanelSizes({ panelSizes: state.editorPanels });
      }
      if (state.viewsDatagrid) {
        this.viewsDatagrid.datagridApi.setState({ state: state.viewsDatagrid });
      }
      if (state.viewColumnsDatagrid) {
        this.viewColumnsDatagrid.datagridApi.setState({ state: state.viewColumnsDatagrid });
      }
    }
  }

  updateEditorState() {
    if (this.editorInitialized) {
      this.state.viewsDatagrid = this.viewsDatagrid.datagridApi.getState();
      this.state.viewColumnsDatagrid = this.viewColumnsDatagrid.datagridApi.getState();
      this.state.detailPanels = this.detailPanels.getPanelSizes();
      this.state.editorPanels = this.editorPanels.getPanelSizes();
      this.editorApi.editorState.tableEditorState = { ...this.state };
    }
  }
}
