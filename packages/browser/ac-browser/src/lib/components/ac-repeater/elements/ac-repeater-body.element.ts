/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AcScrollable } from "../../ac-scrollable/_ac-scrollable.export";
import { acAddClassToElement, acClearElement, acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcRepeaterCssClassName } from "../consts/ac-repeater-css-class-name.const";
import { AcRepeaterApi } from "../core/ac-repeater-api";
import { AcEnumRepeaterHook } from "../enums/ac-enum-repeater-hooks.enum";
import { IAcRepeaterDisplayedRowsChangeEvent } from "../interfaces/event-args/ac-repeater-displayed-rows-change-event.interface";
import { IAcRepeaterBodyHookArgs } from "../interfaces/hook-args/ac-repeater-body-hook-args.interface";
import { AcRepeaterRowElement } from "./ac-repeater-row.element";
import { AcElementBase } from "../../../core/_core.export";
import { AcRepeaterElement } from "./ac-repeater.element";
import { AC_REPEATER_TAG } from "../consts/ac-repeater-tag.const";

export class AcRepeaterBodyElement extends AcElementBase {
  private repeater: AcRepeaterElement;
  private repeaterApi: AcRepeaterApi;
  private currentRows: AcRepeaterRowElement[] = [];
  // PERF FIX (3.1): Key-based row reconciliation — avoids full DOM teardown on every render
  private _renderedRowMap: Map<string, AcRepeaterRowElement> = new Map();

  private autoBindRepeater() {
    if (this.isConnected) {
      const repeater = acGetParentElementWithTag({ element: this, tag: AC_REPEATER_TAG.repeater });
      if (repeater) {
        this.repeater = repeater as any;
        this.repeaterApi = this.repeater.repeaterApi;
        this.repeaterApi.hooks.subscribe({
          hook: AcEnumRepeaterHook.DisplayedRowsChange,
          callback: (event: IAcRepeaterDisplayedRowsChangeEvent) => {
            this.setDisplayedRows();
          }
        });
        // PERF FIX (2.1): Single delegated RowUpdate subscription instead of N per-row subscriptions.
        // This eliminates the accumulation of dangling subscriptions when rows are destroyed and recreated.
        this.repeaterApi.hooks.subscribe({
          hook: AcEnumRepeaterHook.RowUpdate,
          callback: (args: any) => {
            const rowId = args?.repeaterRow?.rowId;
            if (rowId) {
              const rowEl = this._renderedRowMap.get(rowId);
              rowEl?.refresh();
            }
          }
        });
        const hookArgs: IAcRepeaterBodyHookArgs = {
          repeaterApi: this.repeaterApi,
          datagridBody: this
        };
        this.repeaterApi.hooks.execute({ hook: AcEnumRepeaterHook.BodyCreate, args: hookArgs });
      }
    }
    else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindRepeater();
        }, duration: 50, key: 'autoInit'
      });
    }
  }

  private clearBody() {
    for (const row of this.currentRows) {
      row.remove();
      row.destroy();
    }
    this._renderedRowMap.clear();
    acClearElement({ element: this });
    this.currentRows = [];
  }

  override destroy(): void {
    this.clearBody();
    super.destroy();
  }

  handleElementScroll(event: any) {
    // event.preventDefault();
    // // if (event.target && this.repeaterApi && this.repeaterApi.repeater && this.repeaterApi.repeater.repeaterHeader && this.repeaterApi.repeater.repeaterHeader.element) {
    // //   this.repeaterApi.repeater.repeaterHeader.element.scrollLeft = event.target.scrollLeft;
    // // }
  }

  override init() {
    super.init();
    acAddClassToElement({ class_: AcRepeaterCssClassName.acRepeaterBody, element: this });
    this.style.flex = '1';
    this.style.overflow = 'auto';
    // this.style.overflowX = 'hidden';
    // this.style.position = 'relative';

    this.autoBindRepeater();
    // this.scrollable = new AcScrollable({
    //   element: this,
    //   options: {
    //     itemTemplate: (row: IAcRepeaterRow, index: number) => {
    //       const repeaterRow = new AcRepeaterRowElement();
    //       repeaterRow.setRow({
    //         repeaterApi: this.repeaterApi,
    //         repeaterRow: row,index
    //       })
    //       return repeaterRow;
    //     }
    //   }
    // });
    // this.registerListeners();
  }

  registerListeners() {
    this.addEventListener('scroll', (e: any) => {
      this.handleElementScroll(e);
    });
  }

  setDisplayedRows() {
    // PERF FIX (3.1): Key-based reconciliation — reuse existing row elements instead of full teardown.
    // At 200 rows this reduces element destructions+creations from 200 to only the delta (adds/removes).
    const newRows = this.repeaterApi.displayedRepeaterRows;
    const newIds = new Set(newRows.map(r => r.rowId));

    // Step 1: Remove rows no longer in the displayed set
    for (const [rowId, el] of this._renderedRowMap) {
      if (!newIds.has(rowId)) {
        el.remove();
        el.destroy();
        this._renderedRowMap.delete(rowId);
      }
    }

    // Step 2: Add new rows via DocumentFragment, refresh existing rows in-place
    const fragment = document.createDocumentFragment();
    const newCurrentRows: AcRepeaterRowElement[] = [];
    for (const row of newRows) {
      let el = this._renderedRowMap.get(row.rowId);
      if (!el) {
        el = new AcRepeaterRowElement();
        el.setRow({ repeaterApi: this.repeaterApi, repeaterRow: row });
        this._renderedRowMap.set(row.rowId, el);
        fragment.appendChild(el);
      } else {
        el.refresh();
      }
      newCurrentRows.push(el);
    }

    if (fragment.childNodes.length > 0) {
      this.appendChild(fragment);
    }
    this.currentRows = newCurrentRows;
  }
}

acRegisterCustomElement({ tag: AC_REPEATER_TAG.repeaterBody, type: AcRepeaterBodyElement });
