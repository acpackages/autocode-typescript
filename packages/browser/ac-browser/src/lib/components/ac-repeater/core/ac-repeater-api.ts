/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AC_DATA_MANAGER_EVENT, AcDataManager, AcEvents, AcHooks, AcSortOrder, IAcDataManagerDisplayedRowsChangeEvent } from "@autocode-ts/autocode";
import { AcPaginationElement } from "../../ac-pagination/_ac-pagination.export";
import { AcEnumRepeaterEvent } from "../enums/ac-enum-repeater-event.enum";
import { AcEnumRepeaterHook } from "../enums/ac-enum-repeater-hooks.enum";
import { IAcRepeaterState } from "../interfaces/ac-repeater-state.interface";
import { IAcRepeaterDisplayedRowsChangeEvent } from "../interfaces/event-args/ac-repeater-displayed-rows-change-event.interface";
import { IIAcRepeaterRowEvent } from "../interfaces/event-args/ac-repeater-row-event.interface";
import { IIAcRepeaterRowPositionChangeEvent } from "../interfaces/event-args/ac-repeater-row-position-change-event.interface";
import { IAcRepeaterTotalRowsChangeEvent } from "../interfaces/event-args/ac-repeater-total-rows-change-event.interface";
import { IAcRepeaterExtensionEnabledHookArgs } from "../interfaces/hook-args/ac-repeater-extension-enabled-hook-args.interface";
import { IIAcRepeaterRowDeleteHookArgs } from "../interfaces/hook-args/ac-repeater-row-delete-hook-args.interface";
import { IIAcRepeaterRowFocusHookArgs } from "../interfaces/hook-args/ac-repeater-row-focus-hook-args.interface";
import { IIAcRepeaterRowUpdateHookArgs } from "../interfaces/hook-args/ac-repeater-row-update-hook-args.interface";
import { IAcRepeaterUsePaginationChangeHookArgs } from "../interfaces/hook-args/ac-repeater-use-pagination-change-hook-args.interface";
import { IAcRepeaterRow } from "../interfaces/ac-repeater-row.interface";
import { IAcRepeaterField } from "../interfaces/ac-repeater-field.interface";
import { AcRepeaterExtension } from "./ac-repeater-extension";
import { AcRepeaterExtensionManager } from "./ac-repeater-extension-manager";
import { AcRepeaterState } from "./ac-repeater-state";
import { AcRepeaterEventHandler } from "./ac-repeater-event-handler";
import { AcRepeaterElement } from "../elements/ac-repeater.element";
import { AcEnumDataSourceType } from "../../../enums/ac-enum-data-source-type.enum";

export class AcRepeaterApi{

  get data(): any[] {
    return this.dataManager.data;
  }
  set data(value: any[]) {
    this.dataManager.data = value;
  }

  get repeaterRows(): IAcRepeaterRow[] {
    if (this.dataManager) {
      return this.dataManager.rows as any[];
    }
    return [];
  }

  get displayedRepeaterRows(): IAcRepeaterRow[] {
    if (this.dataManager) {
      return this.dataManager.displayedRows as any[];
    }
    return [];
  }

  private _showAddButton: boolean = false;
    get showAddButton(): boolean {
      return this._showAddButton;
    }
    set showAddButton(value: boolean) {
      if (this._showAddButton != value) {
        this._showAddButton = value;
        if(this.pagination){
          this.pagination.showAddButton = value;
        }
      }
    }

  private _usePagination: boolean = false;
  get usePagination(): boolean {
    return this._usePagination;
  }
  set usePagination(value: boolean) {
    const hookArgs: IAcRepeaterUsePaginationChangeHookArgs = {
      usePagination: value,
      repeaterApi: this,
      oldUsePagination: this._usePagination
    };
    this._usePagination = value;
    if (value == true) {
      this.pagination = new AcPaginationElement();
      this.pagination.bindDataManager({ dataManager: this.dataManager });
      this.pagination.showAddButton = this.showAddButton;
      this.pagination.addEventListener('add',()=>{
        this.events.execute({event:AcEnumRepeaterEvent.AddClick});
      });
    } else {
      this.pagination = undefined;
    }
    this.hooks.execute({ hook: AcEnumRepeaterHook.UsePaginationChange, args: hookArgs });
  }

  activeRepeaterRow:IAcRepeaterRow | undefined;
  repeater!: AcRepeaterElement;
  repeaterState:AcRepeaterState;
  dataManager: AcDataManager = new AcDataManager();
  eventHandler!:AcRepeaterEventHandler;
  events: AcEvents = new AcEvents();
  extensions: Record<string, AcRepeaterExtension> = {};
  hooks: AcHooks = new AcHooks();
  hoverCellId?: string;
  hoverColumnId?: string;
  hoverRowId?: string;
  pagination?: AcPaginationElement;
  sortOrder: AcSortOrder = new AcSortOrder();
  rowRendererFunction?:any;
  fields: IAcRepeaterField[] = [];

  constructor({ repeater }: { repeater: AcRepeaterElement }) {
    AcRepeaterExtensionManager.registerBuiltInExtensions();
    this.repeater = repeater;
    this.repeaterState = new AcRepeaterState({ repeaterApi: this });
    this.eventHandler = new AcRepeaterEventHandler({ repeaterApi: this });
    this.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.DisplayedRowsChange,
      callback: (args: IAcDataManagerDisplayedRowsChangeEvent) => {
        const hookArgs: IAcRepeaterDisplayedRowsChangeEvent = {
          displayedRows: args.displayedRows as any[],
          repeaterApi: this
        };
        this.hooks.execute({ hook: AcEnumRepeaterHook.DisplayedRowsChange, args: hookArgs });
        this.events.execute({ event: AcEnumRepeaterEvent.DisplayedRowsChange, args: hookArgs });
      }
    });
    this.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.TotalRowsChange,
      callback: (args: any) => {
        const eventArgs: IAcRepeaterTotalRowsChangeEvent = {
          totalRows: args.totalRows ?? this.dataManager.totalRows,
          repeaterApi: this
        };
        this.hooks.execute({ hook: AcEnumRepeaterHook.TotalRowsChange, args: eventArgs });
        this.events.execute({ event: AcEnumRepeaterEvent.TotalRowsChange, args: eventArgs });
      }
    });
  }

  addRow({ data, append = true, highlightRow = false, index }: { data?: any, append?: boolean, highlightRow?: boolean, index?: number } = {}) {
    if (index === undefined) {
      index = append ? this.dataManager.totalRows : 0;
    }
    const dataRow = this.dataManager.addRow({ data, index });
    const repeaterRow = dataRow as IAcRepeaterRow;

    const hookArgs: IIAcRepeaterRowUpdateHookArgs = {
      repeaterApi: this,
      repeaterRow: repeaterRow,
      highlightRow: highlightRow
    };
    this.hooks.execute({ hook: AcEnumRepeaterHook.RowAdd, args: hookArgs });

    const eventArgs: IIAcRepeaterRowEvent = {
      repeaterApi: this,
      repeaterRow: repeaterRow
    };
    this.events.execute({ event: AcEnumRepeaterEvent.RowAdd, args: eventArgs });
    return repeaterRow;
  }

  deleteRow({ data, rowId, key, value, highlightRow = false }: { data?: any, rowId?: string, key?: string, value?: any, highlightRow?: boolean }) {
    const dataRow = this.dataManager.deleteRow({ data, rowId, key, value });
    if (dataRow) {
      const repeaterRow = dataRow as IAcRepeaterRow;
      const deleteHookArgs: IIAcRepeaterRowDeleteHookArgs = {
        repeaterApi: this,
        repeaterRow: repeaterRow,
        highlightRow: highlightRow
      };
      this.hooks.execute({ hook: AcEnumRepeaterHook.RowDelete, args: deleteHookArgs });

      const eventArgs: IIAcRepeaterRowEvent = {
        repeaterApi: this,
        repeaterRow: repeaterRow
      };
      this.events.execute({ event: AcEnumRepeaterEvent.RowDelete, args: eventArgs });
    }
  }

  enableExtension({ extensionName }: { extensionName: string }): AcRepeaterExtension | null {
    if (AcRepeaterExtensionManager.hasExtension({ extensionName: extensionName })) {
      const extensionInstance = AcRepeaterExtensionManager.createInstance({ extensionName: extensionName });
      if (extensionInstance) {
        extensionInstance.repeaterApi = this;
        const hookId: string = this.hooks.subscribeAllHooks({
          callback: (hook: string, args: any) => {
            extensionInstance.handleHook({ hook: hook, args: args });
          }
        });
        extensionInstance.hookId = hookId;
        extensionInstance.init();
        this.extensions[extensionName] = extensionInstance;
        const hookArgs: IAcRepeaterExtensionEnabledHookArgs = {
          extensionName: extensionName,
          repeaterApi: this,
        };
        this.hooks.execute({ hook: AcEnumRepeaterHook.ExtensionEnable, args: hookArgs });
        return extensionInstance;
      }
    }
    return null;
  }

  focusFirstRow({ highlightRow }: { highlightRow?: boolean } = {}) {
    this.focusRow({ index: 0, highlightRow: highlightRow });
  }

  focusLastRow({ highlightRow }: { highlightRow?: boolean } = {}) {
    this.focusRow({ index: this.dataManager.totalRows - 1, highlightRow: highlightRow });
  }

  focusRow({ index, highlightRow = false }: { index: number, highlightRow?: boolean }) {
    const hookArgs: IIAcRepeaterRowFocusHookArgs = {
      repeaterApi: this,
      repeaterRow: this.repeaterRows[index],
      index: index,
      highlightRow: highlightRow
    }
    this.hooks.execute({ hook: AcEnumRepeaterHook.RowFocus, args: hookArgs });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    return this.events.subscribe({ event: event, callback: callback });
  }

  getRowElement({ rowId, index }: { rowId?: string, index?: number }): HTMLElement | null {
    let row: IAcRepeaterRow | undefined;
    if (rowId) {
      row = this.getRowById({ rowId });
    } else if (index !== undefined) {
      row = this.getRowByIndex({ index });
    }
    return row?.instance?.element ?? null;
  }

  getRowById({ rowId }: { rowId: string }): IAcRepeaterRow | undefined {
    let result: IAcRepeaterRow | undefined;
    for (const row of this.repeaterRows) {
      if (row.rowId == rowId) {
        result = row;
        break;
      }
    }
    return result;
  }

  getRowByIndex({ index }: { index: number }): IAcRepeaterRow | undefined {
    let result: IAcRepeaterRow | undefined;
    for (const row of this.repeaterRows) {
      if (row.index == index) {
        result = row;
        break;
      }
    }
    if(result == undefined){
      console.error(`Cannot find row for index : ${index}`)
    }
    return result;
  }

  getRowByKeyValue({ key, value }: { key: string, value: any }): IAcRepeaterRow | undefined {
    let result: IAcRepeaterRow | undefined;
    for (const row of this.repeaterRows) {
      if (row.data && row.data[key] == value) {
        result = row;
        break;
      }
    }
    return result;
  }

  getState():IAcRepeaterState{
    this.repeaterState.refresh();
    return this.repeaterState.toJson();
  }

  setState({state}:{state:IAcRepeaterState}){
    this.repeaterState.apply(state);
  }


  updateRowPosition({ repeaterRow, oldRepeaterRow }: { repeaterRow: IAcRepeaterRow, oldRepeaterRow: IAcRepeaterRow }) {
    const eventArgs: IIAcRepeaterRowPositionChangeEvent = {
      // oldRepeaterRow: oldRepeaterRow,
      repeaterRow: repeaterRow,
      repeaterApi: this
    };
    this.events.execute({ event: AcEnumRepeaterEvent.RowPositionChange, args: eventArgs });
  }

  // PENDING
  updateRow({ data, value, key, rowId, highlightRow = true, addIfMissing = false }: { data: any, value?: any, key?: string, rowId?: string, highlightRow?: boolean, addIfMissing?: boolean }) {
    const dataRow = this.dataManager.updateRow({ data, value, key, rowId, addIfMissing });
    if (dataRow) {
      const repeaterRow = dataRow as IAcRepeaterRow;
      const updateHookArgs: IIAcRepeaterRowUpdateHookArgs = {
        repeaterApi: this,
        repeaterRow: repeaterRow,
        highlightRow: highlightRow
      };
      this.hooks.execute({ hook: AcEnumRepeaterHook.RowUpdate, args: updateHookArgs });
      const eventArgs: IIAcRepeaterRowEvent = {
        repeaterApi: this,
        repeaterRow: repeaterRow
      };
      this.events.execute({ event: AcEnumRepeaterEvent.RowUpdate, args: eventArgs });
    }
  }

  destroy() {
    this.dataManager.destroy();
    this.eventHandler.destroy();
    this.events.destroy();
    this.hooks.destroy();
    if (this.pagination) {
      this.pagination.destroy();
    }
    for (const ext of Object.values(this.extensions)) {
      ext.destroy();
    }
    this.extensions = {};
  }
}
