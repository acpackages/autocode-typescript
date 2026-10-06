/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcDatagridApi } from "../core/ac-datagrid-api";
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_DATAGRID_TAG } from "../_ac-datagrid.export";

export class AcDatagridInternalHeaderCellElement extends AcElementBase {
  datagridApi?: AcDatagridApi;
  checkboxElement?: HTMLInputElement;

  override init() {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridInternalHeaderCell, element: this });
  }

  setHeader({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
    this.applyStyles();
    this.render();
  }

  applyStyles() {
    if (!this.datagridApi) return;
    const width = this.datagridApi.getInternalColumnWidth();
    if (width <= 0) {
      this.style.display = 'none';
      this.style.width = '0px';
      this.style.minWidth = '0px';
      this.style.maxWidth = '0px';
      return;
    }
    this.style.display = '';
    this.style.width = `${width}px`;
    this.style.minWidth = `${width}px`;
    this.style.maxWidth = `${width}px`;
  }

  refresh() {
    this.applyStyles();
    if (this.checkboxElement && this.datagridApi) {
      const displayed = this.datagridApi.displayedDatagridRows || [];
      if (displayed.length === 0) {
        this.checkboxElement.checked = false;
        this.checkboxElement.indeterminate = false;
        return;
      }
      let selectedCount = 0;
      for (const r of displayed) {
        if (this.datagridApi.selectedRowIds.has(r.rowId)) {
          selectedCount++;
        }
      }
      if (selectedCount === 0) {
        this.checkboxElement.checked = false;
        this.checkboxElement.indeterminate = false;
      } else if (selectedCount === displayed.length) {
        this.checkboxElement.checked = true;
        this.checkboxElement.indeterminate = false;
      } else {
        this.checkboxElement.checked = false;
        this.checkboxElement.indeterminate = true;
      }
    }
  }

  render() {
    this.innerHTML = `<div class="${AC_DATAGRID_CLASS_NAME.acDatagridInternalHeaderCellContainer}"></div>`;
    const container = this.querySelector(`.${AC_DATAGRID_CLASS_NAME.acDatagridInternalHeaderCellContainer}`) as HTMLElement;
    if (!container || !this.datagridApi) return;

    if (this.datagridApi.allowSelection && this.datagridApi.allowMultipleSelection && this.datagridApi.selectionMode !== 'single') {
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = AC_DATAGRID_CLASS_NAME.acDatagridSelectAllCheckbox;
      chk.addEventListener('change', (e) => {
        e.stopPropagation();
        this.datagridApi?.toggleSelectAll();
      });
      container.appendChild(chk);
      this.checkboxElement = chk;
    } else {
      this.checkboxElement = undefined;
    }

    if (this.datagridApi.showRowNumbers) {
      const numHeader = document.createElement('span');
      numHeader.className = AC_DATAGRID_CLASS_NAME.acDatagridRowNumberHeader;
      numHeader.textContent = '#';
      container.appendChild(numHeader);
    }

    // Resize handle for internal column
    if (this.datagridApi.allowColumnResizing !== false) {
      const resizeHandle = this.ownerDocument.createElement('div');
      resizeHandle.className = AC_DATAGRID_CLASS_NAME.acDatagridHeaderCellResize;
      resizeHandle.title = 'Drag to resize internal column, double-click to reset';
      this.appendChild(resizeHandle);

      let startX = 0;
      let startWidth = 0;
      let isResizing = false;

      resizeHandle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.datagridApi?.resetInternalColumnWidth();
      });

      resizeHandle.addEventListener('pointerdown', (e: PointerEvent) => {
        if (e.button !== 0 || !this.datagridApi) return;
        e.stopPropagation();
        e.preventDefault();
        resizeHandle.setPointerCapture(e.pointerId);
        isResizing = true;
        resizeHandle.classList.add('resizing');
        document.body.classList.add('ac-datagrid-dragging-active');
        startX = e.clientX;
        startWidth = this.datagridApi.getInternalColumnWidth();

        const onPointerMove = (moveEvt: PointerEvent) => {
          if (!isResizing || !this.datagridApi) return;
          const diff = moveEvt.clientX - startX;
          let newWidth = startWidth + diff;
          newWidth = Math.max(30, Math.min(300, newWidth));
          this.datagridApi.setInternalColumnWidth(newWidth);
        };

        const onPointerUp = (upEvt: PointerEvent) => {
          isResizing = false;
          resizeHandle.classList.remove('resizing');
          document.body.classList.remove('ac-datagrid-dragging-active');
          try {
            resizeHandle.releasePointerCapture(upEvt.pointerId);
          } catch (_) {}
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
      });
    }

    this.refresh();
  }
}

acRegisterCustomElement({ tag: AC_DATAGRID_TAG.datagridInternalHeaderCell, type: AcDatagridInternalHeaderCellElement });
