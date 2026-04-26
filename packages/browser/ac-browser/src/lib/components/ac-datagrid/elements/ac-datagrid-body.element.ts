/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagridRowElement } from "./ac-datagrid-row.element";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridDisplayedRowsChangeEvent } from "../interfaces/event-args/ac-datagrid-displayed-rows-change-event.interface";
import { AC_DATAGRID_HOOK } from "../consts/ac-datagrid-hook.const";
import { IAcDatagridBodyHookArgs } from "../interfaces/hook-args/ac-datagrid-body-hook-args.interface";
import { acAddClassToElement, acClearElement, acGetParentElementWithTag, acLinkElementScroll, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATAGRID_TAG, AcDatagridElement, AcScrollable } from "../../_components.export";

export class AcDatagridBody extends AcElementBase {
  private datagridApi?: AcDatagridApi;
  currentRows: AcDatagridRowElement[] = [];

  private autoBindDatagrid() {
    if (this.isConnected) {
      const datagrid = acGetParentElementWithTag({ element: this, tag: AC_DATAGRID_TAG.datagrid });
      if (datagrid) {
        this.datagridApi = (datagrid as AcDatagridElement).datagridApi;
        this.datagridApi.hooks.subscribe({
          hook: AC_DATAGRID_HOOK.DisplayedRowsChange,
          callback: (event: any) => {
            this.setDisplayedRows();
          }
        });
        // const hookArgs: any = {
        //   datagridApi: this.datagridApi,
        //   datagridBody: this
        // };
        // this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.DATAGRID_BODY_CREATE, args: hookArgs });
        const hookArgs: IAcDatagridBodyHookArgs = {
        datagridApi: this.datagridApi,
        datagridBody: this
      };
      this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.BodyInit, args: hookArgs });
      this.datagridApi.bodyWidth = this.getBoundingClientRect().width;
      }
    }
    else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindDatagrid();
        }, duration: 50, key: 'autoInit'
      });
    }
  }

  private clearBody() {
    for (const row of this.currentRows) {
      row.remove();
      row.destroy();
    }
    acClearElement({ element: this });
    this.currentRows = [];
  }

  override destroy(): void {
    this.clearBody();
    super.destroy();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // if (this.datagridApi && this.datagridApi.useVirtualScrolling && this.scrollable) {
    //   this.scrollable.pause();
    // }
    // this.clearDatagridRows();
  }

  override init() {
    super.init();
    this.style.height = '100%';
    this.style.border = '1px solid blue'; // Temporary for debugging
    this.registerListeners();
    this.autoBindDatagrid();
  }

  registerListeners() {
    // const datagrid = this.datagridApi?.datagrid;
    // const header = datagrid?.datagridHeader;
    // if (header) {
    //   // acLinkElementScroll({ source: this, destination: header });
    // }
  }

  setDisplayedRows() {

    this.clearBody();
    if (this.datagridApi) {
      for (const row of this.datagridApi.displayedDatagridRows) {
        const datagridRow = new AcDatagridRowElement();
        datagridRow.setRow({
          datagridApi: this.datagridApi,
          datagridRow: row
        })
        this.currentRows.push(datagridRow);
        this.append(datagridRow);
      }
    }
    console.dir(this);
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-body', type: AcDatagridBody });
