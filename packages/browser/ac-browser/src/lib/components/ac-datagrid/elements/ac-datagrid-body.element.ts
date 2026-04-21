/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagridRowElement } from "./ac-datagrid-row.element";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridDisplayedRowsChangeEvent } from "../interfaces/event-args/ac-datagrid-displayed-rows-change-event.interface";
import { AC_DATAGRID_HOOK } from "../consts/ac-datagrid-hook.const";
import { IAcDatagridBodyHookArgs } from "../interfaces/hook-args/ac-datagrid-body-hook-args.interface";
import { acClearElement, acLinkElementScroll, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcElementBase } from "../../../core/ac-element-base";
import { AcScrollable } from "../../_components.export";

export class AcDatagridBody extends AcElementBase {
  private _datagridApi?: AcDatagridApi;
  get datagridApi(): AcDatagridApi|undefined {
    return this._datagridApi;
  }
  set datagridApi(value: AcDatagridApi) {
    this._datagridApi = value;
    this.datagridApi!.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.DisplayedRowsChange,
      callback: (event: IAcDatagridDisplayedRowsChangeEvent) => {
        if (!this.isRendering) {
          this.delayedCallback.add({callback:() => {
            this.setDisplayRows();
          }, duration:1});
        }
      }
    });
  }
  scrollable?: AcScrollable;
  isRendering: boolean = false;
  datagridRows: AcDatagridRowElement[] = [];

  constructor() {
    super();
    this.style.height = '-webkit-fill-available';
  }

  clearDatagridRows() {
    for (let row of (this.datagridRows) as any[]) {
      row.destroy();
      row = null;
    }
    acClearElement({element:this});
    this.datagridRows.length = 0; // Truncate array
    this.datagridRows = [];
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.datagridApi && this.datagridApi.useVirtualScrolling && this.scrollable) {
      this.scrollable.resume();
    }
    this.setDisplayRows();
  }

  override destroy(): void {
    this.isRendering = true;
    if (this._datagridApi?.hooks) {
      this._datagridApi.hooks.unsubscribe({
        hook: AC_DATAGRID_HOOK.DisplayedRowsChange,
        callback: this.setDisplayRows.bind(this)
      });
    }
    if (this.datagridApi && this.datagridApi.useVirtualScrolling) {
      if (this.scrollable) {
        this.scrollable.pause();
        this.scrollable.clearAll();
        this.scrollable = null!;
      }
    }
    const header = this.datagridApi?.datagrid?.datagridHeader;
    if (header && this.isConnected) {
      // Remove scroll listener from header (reverse of acLinkElementScroll)
      const handler = (this as any)._acScrollLinkHandler;
      if (handler) {
        this.removeEventListener('scroll', handler);
        header.removeEventListener('scroll', handler);
        delete (this as any)._acScrollLinkHandler;
      }
    }
    this._datagridApi = null!;
    if (this.parentNode) {
      this.remove();
    }
    super.destroy();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.datagridApi && this.datagridApi.useVirtualScrolling && this.scrollable) {
      this.scrollable.pause();
    }
    this.clearDatagridRows();
  }

  override init() {
    super.init();
    this.registerListeners();
    this.setDisplayRows();
    if(this.datagridApi){
      const hookArgs: IAcDatagridBodyHookArgs = {
      datagridApi: this.datagridApi,
      datagridBody: this
    };
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.BodyInit, args: hookArgs });
    this.datagridApi.bodyWidth = this.getBoundingClientRect().width;
    }
  }

  registerListeners() {
    const datagrid = this.datagridApi?.datagrid;
    const header = datagrid?.datagridHeader;
    if(header){
      acLinkElementScroll({ source: this, destination: header });
    }
  }

  setDisplayRows() {
    if (!this.isRendering && this.isConnected) {
      if (this.datagridApi) {
        this.isRendering = true;
        this.clearDatagridRows();
        if (this.datagridApi.useVirtualScrolling && this.scrollable) {
          this.scrollable.pause();
          this.scrollable.clearAll();
        }
        for (const row of this.datagridApi.displayedDatagridRows) {
          const datagridRow = new AcDatagridRowElement();
          datagridRow.datagridApi = this.datagridApi;
          datagridRow.datagridRow = row;
          this.datagridRows.push(datagridRow);
          this.append(row.element!);
        }
        if (this.datagridApi.useVirtualScrolling && this.scrollable) {
          this.scrollable.resume();
          this.scrollable.autoRegister();
        }
        this.isRendering = false;
      }
    }
  }

  setVirtualScrolling() {
    if (this.datagridApi && this.datagridApi.useVirtualScrolling) {
      this.scrollable = new AcScrollable({ element: this, options: { bufferCount: 10 } });
    }
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-body', type: AcDatagridBody });
