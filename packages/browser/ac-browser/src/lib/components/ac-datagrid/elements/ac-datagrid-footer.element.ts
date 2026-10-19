/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_HOOK } from "../_ac-datagrid.export";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AC_DATAGRID_ICON_CLASS } from "../consts/ac-datagrid-icon-class.const";
import { AC_DATAGRID_EXTENSION_NAME } from "../consts/ac-datagrid-extension-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";

export class AcDatagridFooterElement extends AcElementBase {
  private _datagridApi?: AcDatagridApi;
  get datagridApi(): AcDatagridApi | undefined {
    return this._datagridApi;
  }
  set datagridApi(value: AcDatagridApi | undefined) {
    this._datagridApi = value;
    if (this._datagridApi) {
      this.bindDatagridApi();
    }
  }

  searchInput!: HTMLInputElement;
  paginationContainer!: HTMLElement;
  searchContainer!: HTMLElement;
  aggregatesContainer!: HTMLElement;
  settingsBtn!: HTMLElement;
  exportBtn?: HTMLElement;

  override init(): void {
    super.init();
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridFooter, element: this });

    this.searchInput = this.ownerDocument.createElement('input');
    this.paginationContainer = this.ownerDocument.createElement('div');
    this.searchContainer = this.ownerDocument.createElement('div');
    this.aggregatesContainer = this.ownerDocument.createElement('div');
    this.aggregatesContainer.className = 'ac-datagrid-footer-aggregates';
    this.aggregatesContainer.style.display = 'flex';
    this.aggregatesContainer.style.gap = '12px';
    this.aggregatesContainer.style.fontSize = '12px';
    this.aggregatesContainer.style.color = '#475569';

    this.searchInput.classList.add('ac-datagrid-search-input');
    this.searchInput.placeholder = "Search...";
    this.searchInput.style.padding = '4px 8px';
    this.searchInput.style.fontSize = '12px';
    this.searchInput.style.border = '1px solid #cbd5e1';
    this.searchInput.style.borderRadius = '4px';
    this.searchInput.addEventListener('input', () => {
      this.delayedCallback.add({
        callback: () => {
          if (this.datagridApi) {
            this.datagridApi.dataManager.searchQuery = this.searchInput.value;
            this.datagridApi.dataManager.refreshRows();
          }
        }, duration: 300, key: 'searchInput'
      });
    });

    this.exportBtn = this.ownerDocument.createElement('button');
      this.exportBtn.innerHTML = `<i class="${AC_DATAGRID_ICON_CLASS.download}"></i>`;
      this.exportBtn.setAttribute('type','button' );
      this.exportBtn.title = 'Export Data';
      this.exportBtn.classList.add('ac-datagrid-footer-btn');
      this.exportBtn.addEventListener('click', () => {
        const ext: any =
          this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.DataExport] ||
          this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportXlsx] ||
          this.datagridApi?.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportCsv];

        if (ext && ext.allowXlsxExport !== false) {
          this.datagridApi?.exportDataAsExcel({ fileName: ext.fileName });
        } else {
          this.datagridApi?.exportDataAsCsv({ fileName: ext?.fileName });
        }
      });

    this.settingsBtn = this.ownerDocument.createElement('button');
    this.settingsBtn.innerHTML = `<i class="${AC_DATAGRID_ICON_CLASS.settings}"></i>`;
    this.settingsBtn.setAttribute('type','button' );
    this.settingsBtn.classList.add('ac-datagrid-footer-btn');
    this.settingsBtn.title = 'Customize Columns';
    this.settingsBtn.addEventListener('click', () => {
      this.datagridApi?.openColumnCustomizer();
    });

    this.append(this.paginationContainer);
    // this.append(this.searchContainer);
    this.append(this.aggregatesContainer);

    // this.append(settingsBtn);

    // this.setPagination();
    if (this.datagridApi) {
      this.bindDatagridApi();
    }
  }

  private bindDatagridApi() {
    if (!this.datagridApi) return;
    this.renderAggregates();
    this.renderExportButton();
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.DisplayedRowsChange,
      callback: () => {
        this.renderAggregates();
      }
    });
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.CellValueChange,
      callback: () => {
        this.renderAggregates();
      }
    });
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.PaginationChange,
      callback: () => {
        this.setPagination();
      }
    });
    this.datagridApi.hooks.subscribe({
      hook: AC_DATAGRID_HOOK.ExtensionEnable,
      callback: () => {
        this.renderExportButton();
      }
    });
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.FooterInit });
  }

  renderExportButton() {
    if (!this.datagridApi) return;
    const hasExportExt =
      this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExport] ||
      this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportXlsx] ||
      this.datagridApi.extensions[AC_DATAGRID_EXTENSION_NAME.DataExportCsv];

    // if (!hasExportExt) {
    //   if (this.exportBtn && this.exportBtn.parentElement) {
    //     this.exportBtn.parentElement.removeChild(this.exportBtn);
    //   }
    //   return;
    // }
    if(this.exportBtn){
      if (!hasExportExt) {
      this.exportBtn.style.display = 'd-none';
    }
    else{
      this.exportBtn.style.display = '';
    }
    }

  }

  renderAggregates() {
    if (!this.datagridApi || !this.aggregatesContainer) return;
    acClearElement({ element: this.aggregatesContainer });
    const aggCols = this.datagridApi.datagridColumns.filter(c => c.columnDefinition.aggregate);
    if (aggCols.length === 0) {
      this.aggregatesContainer.style.display = 'none';
      return;
    }
    this.aggregatesContainer.style.display = 'flex';
    const aggValues = this.datagridApi.calculateAggregates(this.datagridApi.datagridRows);
    for (const col of aggCols) {
      const field = col.columnDefinition.field;
      const val = aggValues[field];
      if (val !== undefined) {
        const span = document.createElement('span');
        const formatted = typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val;
        span.innerHTML = `<strong>${col.title || field}:</strong> ${formatted}`;
        this.aggregatesContainer.appendChild(span);
      }
    }
  }

  setPagination() {
    acClearElement({ element: this.paginationContainer });
    if (this.datagridApi && this.datagridApi.usePagination && this.datagridApi.pagination) {
      this.append(this.datagridApi.pagination);
      const leftContainer: HTMLElement = this.datagridApi.pagination.querySelector('.ac-pagination-left-container');
      const rightContainer: HTMLElement = this.datagridApi.pagination.querySelector('.ac-pagination-right-container');
      // leftContainer.append(this.searchInput);
      rightContainer.append(this.exportBtn);
      rightContainer.append(this.settingsBtn);
    }
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-footer', type: AcDatagridFooterElement });
