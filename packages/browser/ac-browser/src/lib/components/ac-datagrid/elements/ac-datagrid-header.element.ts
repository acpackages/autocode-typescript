/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { acClearElement, acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_TAG, AcDatagridElement, AcDatagridInternalHeaderCellElement, IAcDatagridColumn } from "../_ac-datagrid.export";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AC_DATAGRID_HOOK } from "../consts/ac-datagrid-hook.const";
import { IAcDatagridHeaderHookArgs } from "../interfaces/hook-args/ac-datagrid-header-hook-args.interface";
import { AcDatagridHeaderCellElement } from "./ac-datagrid-header-cell.element";

export class AcDatagridHeaderElement extends AcElementBase {
  datagridHeaderCells: AcDatagridHeaderCellElement[] = [];
  datagridApi?: AcDatagridApi;
  private hookSubscriptionIds: string[] = [];
  internalHeaderCell?: AcDatagridInternalHeaderCellElement;
  private dropIndicator?: HTMLElement;

  private autoBindDatagrid() {
    if (this.isConnected) {
      const datagrid = acGetParentElementWithTag({ element: this, tag: AC_DATAGRID_TAG.datagrid });
      if (datagrid) {
        this.datagridApi = (datagrid as AcDatagridElement).datagridApi;
        this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.HeaderInit });
        if (this.datagridApi.datagridColumns.length > 0) {
          this.render();
        }
        this.hookSubscriptionIds.push(this.datagridApi.hooks.subscribe({
          hook: AC_DATAGRID_HOOK.ColumnDefinitionsChange,
          callback: () => {
            this.render();
          }
        }));
      }
    } else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindDatagrid();
        }, duration: 50, key: 'autoInit'
      });
    }
  }

  showDropIndicator(leftPx: number) {
    if (!this.dropIndicator) {
      this.dropIndicator = document.createElement('div');
      this.dropIndicator.className = AC_DATAGRID_CLASS_NAME.acDatagridDropIndicator;
      this.dropIndicator.style.position = 'absolute';
      this.dropIndicator.style.top = '0';
      this.dropIndicator.style.bottom = '0';
      this.dropIndicator.style.width = '3px';
      this.dropIndicator.style.backgroundColor = '#2196f3';
      this.dropIndicator.style.zIndex = '999';
      this.dropIndicator.style.pointerEvents = 'none';
      this.appendChild(this.dropIndicator);
    }
    this.dropIndicator.style.left = `${leftPx}px`;
    this.dropIndicator.style.display = 'block';
  }

  hideDropIndicator() {
    if (this.dropIndicator) {
      this.dropIndicator.style.display = 'none';
    }
  }

  scrollbarSpacer?: HTMLElement;

  private clearHeader() {
    if (this.scrollbarSpacer) {
      this.scrollbarSpacer.remove();
      this.scrollbarSpacer = undefined;
    }
    if (this.internalHeaderCell) {
      this.internalHeaderCell.remove();
      this.internalHeaderCell.destroy();
      this.internalHeaderCell = undefined;
    }
    for (const cell of this.datagridHeaderCells) {
      cell.remove();
      cell.destroy();
    }
    acClearElement({ element: this });
    this.datagridHeaderCells = [];
  }

  override destroy(): void {
    this.clearHeader();
    if (this.datagridApi) {
      this.datagridApi.hooks.unsubscribe({ subscriptionIds: this.hookSubscriptionIds });
    }
    super.destroy();
  }

  override init(): void {
    super.init();
    this.style.position = 'relative';
    this.style.overflowX = 'hidden';
    this.style.overflowY = 'hidden';

    // Synchronize scroll events back to body if header is scrolled
    this.addEventListener('scroll', () => {
      const body = this.datagridApi?.datagrid?.datagridBody;
      if (body && body.scrollLeft !== this.scrollLeft) {
        body.scrollLeft = this.scrollLeft;
      }
    }, { passive: true });

    // Handle horizontal mouse wheel over header
    this.addEventListener('wheel', (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 0) {
        const body = this.datagridApi?.datagrid?.datagridBody;
        if (body) {
          body.scrollLeft += e.deltaX;
        }
      }
    }, { passive: true });

    // Handle touch swipe on header
    let touchStartX = 0;
    let bodyStartScrollLeft = 0;
    this.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        const body = this.datagridApi?.datagrid?.datagridBody;
        bodyStartScrollLeft = body ? body.scrollLeft : 0;
      }
    }, { passive: true });

    this.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = touchStartX - e.touches[0].clientX;
        const body = this.datagridApi?.datagrid?.datagridBody;
        if (body) {
          body.scrollLeft = bodyStartScrollLeft + deltaX;
        }
      }
    }, { passive: true });

    this.autoBindDatagrid();
  }

  syncScrollbarSpacer() {
    if (!this.datagridApi?.datagrid?.datagridBody) return;
    const body = this.datagridApi.datagrid.datagridBody;
    const scrollbarWidth = Math.max(0, body.offsetWidth - body.clientWidth);
    if (!this.scrollbarSpacer) {
      this.scrollbarSpacer = document.createElement('div');
      this.scrollbarSpacer.className = 'ac-datagrid-header-scrollbar-spacer';
      this.scrollbarSpacer.style.flexShrink = '0';
      this.scrollbarSpacer.style.boxSizing = 'border-box';
      this.appendChild(this.scrollbarSpacer);
    }
    this.scrollbarSpacer.style.width = `${scrollbarWidth}px`;
    this.scrollbarSpacer.style.minWidth = `${scrollbarWidth}px`;
  }

  refresh() {
    if (this.internalHeaderCell) {
      this.internalHeaderCell.refresh();
    }
    for (const cell of this.datagridHeaderCells) {
      cell.refresh();
    }
    this.syncScrollbarSpacer();
  }

  render() {
    if (!this.datagridApi) return;
    const prevScrollLeft = this.datagridApi?.datagrid?.datagridBody?.scrollLeft ?? this.scrollLeft;
    this.clearHeader();
    const hookArgs: IAcDatagridHeaderHookArgs = {
      datagridHeader: this,
      datagridApi: this.datagridApi
    };
    this.datagridHeaderCells = [];
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.BeforeHeaderColumnCellsCreate, args: hookArgs });

    this.internalHeaderCell = new AcDatagridInternalHeaderCellElement();
    this.internalHeaderCell.setHeader({ datagridApi: this.datagridApi });
    this.append(this.internalHeaderCell);

    for (const column of this.datagridApi.datagridColumns) {
      if (column.visible) {
        const headerCell = this.ownerDocument.createElement('ac-datagrid-header-cell') as AcDatagridHeaderCellElement;
        headerCell.setHeaderCell({ datagridColumn: column, datagridApi: this.datagridApi });
        this.append(headerCell);
        this.datagridHeaderCells.push(headerCell);
      }
    }
    this.syncScrollbarSpacer();
    this.scrollLeft = prevScrollLeft;
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.HeaderColumnCellsCreate, args: hookArgs });
  }

  setFlexColumnWidth() {
    if (!this.datagridApi) return;
    const flexColumns: IAcDatagridColumn[] = [];
    let currentTotalWidth: number = 0;
    for (const column of this.datagridApi.datagridColumns) {
      if (column.visible) {
        if (column.columnDefinition.flexSize != undefined) {
          flexColumns.push(column);
        } else {
          currentTotalWidth += column.width;
        }
      }
    }
    const bodyWidth = this.datagridApi.bodyWidth || this.getBoundingClientRect().width || 1000;
    const internalColWidth = this.datagridApi.getInternalColumnWidth();
    const fillWidth = bodyWidth - currentTotalWidth - internalColWidth - 20;
    if (fillWidth > 0) {
      for (const column of flexColumns) {
        column.width = fillWidth * column.columnDefinition.flexSize!;
      }
    }
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-header', type: AcDatagridHeaderElement });
