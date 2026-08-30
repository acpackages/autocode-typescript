import { AcDataManager, AC_DATA_MANAGER_EVENT } from "@autocode-ts/autocode";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { AcElementBase } from "../../../core/ac-element-base";
import { acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATA_SORT_TAG } from "../consts/ac-data-sort-tag.const";
import { AcDataSortPopup } from "./ac-data-sort-popup";
import "../css/ac-data-sort.css";
import { acDataSortElementHtml } from "../_ac-data-sort.export";

export interface IAcDataSortField {
  key: string;
  label: string;
  allowSort?: boolean;
  type?: string;
}

export class AcDataSortElement extends AcElementBase {
  private _dataManager?: AcDataManager;
  get dataManager(): AcDataManager | undefined {
    return this._dataManager;
  }
  set dataManager(value: AcDataManager | undefined) {
    this._dataManager = value;
    if (value) {
      value.on({
        event: AC_DATA_MANAGER_EVENT.SortOrderChange,
        callback: () => this.updateBadge(),
      });
      value.on({
        event: AC_DATA_MANAGER_EVENT.DisplayedRowsChange,
        callback: () => this.updateBadge(),
      });
    }
    this.updateBadge();
  }

  private _targetField?: IAcDataSortField;
  get targetField(): IAcDataSortField | undefined {
    return this._targetField;
  }
  set targetField(value: IAcDataSortField | undefined) {
    this._targetField = value;
    this.recreatePopup();
    this.updateBadge();
  }

  get isSingleFieldMode(): boolean {
    return !!this._targetField;
  }

  fields: IAcDataSortField[] = [];
  buttonElement?: HTMLButtonElement;
  badgeElement?: HTMLElement;
  popup: AcDataSortPopup = new AcDataSortPopup({ sortElement: this });

  private recreatePopup() {
    this.popup.destroy();
    this.popup = new AcDataSortPopup({
      sortElement: this,
      targetField: this._targetField,
    });
  }

  override init(): void {
    super.init();
    const fieldKeyAttr = this.getAttribute('field-key') || this.getAttribute('key');
    if (fieldKeyAttr && !this._targetField) {
      this._targetField = { key: fieldKeyAttr, label: this.getAttribute('field-label') || fieldKeyAttr };
      this.recreatePopup();
    }
    this.render();
    this.autoBindParent();
  }

  private render() {
    this.innerHTML = `
      <button class="ac-data-sort-btn ac-data-sort-toggle-btn" type="button">
        ${acDataSortElementHtml.sort}
        <span class="ac-data-sort-badge" style="display:none">0</span>
      </button>
    `;

    this.buttonElement = this.querySelector('.ac-data-sort-btn') as HTMLButtonElement;
    this.badgeElement = this.querySelector('.ac-data-sort-badge') as HTMLElement;

    this.buttonElement?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePopup();
    });

    this.updateBadge();
  }

  private autoBindParent() {
    if (this._dataManager) return;

    if (this.isConnected) {
      // Check for parent ac-repeater
      const repeater = acGetParentElementWithTag({ element: this, tag: 'ac-repeater' }) as any;
      if (repeater?.repeaterApi) {
        this.dataManager = repeater.repeaterApi.dataManager;
        this.fields = repeater.repeaterApi.fields ?? [];
        repeater.repeaterApi.events.subscribe({
          event: 'FIELDS_CHANGE',
          callback: (args: any) => {
            this.fields = args.fields ?? repeater.repeaterApi.fields ?? [];
          },
        });
        return;
      }

      // Check for parent ac-datagrid
      const datagrid = acGetParentElementWithTag({ element: this, tag: 'ac-datagrid' }) as any;
      if (datagrid?.datagridApi) {
        this.dataManager = datagrid.datagridApi.dataManager;
        this.fields = (datagrid.datagridApi.columnDefinitions ?? []).map((col: any) => ({
          key: col.field,
          label: col.title ?? col.field,
          allowSort: col.allowSort !== false,
          type: col.type,
        }));
        return;
      }
    } else {
      this.delayedCallback.add({
        callback: () => this.autoBindParent(),
        duration: 50,
        key: 'autoBindSortParent',
      });
    }
  }

  openPopup() {
    this.popup.show();
  }

  closePopup() {
    this.popup.hide();
  }

  togglePopup() {
    if (this.popup.isOpen) {
      this.closePopup();
    } else {
      this.openPopup();
    }
  }

  updateBadge() {
    if (!this.badgeElement) return;
    const allSorts = this.dataManager?.sortOrder?.sortOrders ?? [];
    const count = this.isSingleFieldMode
      ? allSorts.filter((s) => s.key === this._targetField!.key).length
      : allSorts.length;

    this.badgeElement.innerText = count.toString();
    this.badgeElement.style.display = count > 0 ? 'flex' : 'none';
  }

  override destroy(): void {
    this.popup.destroy();
    super.destroy();
  }
}

acRegisterCustomElement({ tag: AC_DATA_SORT_TAG.dataSort, type: AcDataSortElement });
