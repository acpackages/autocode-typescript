import { AcDataManager, AC_DATA_MANAGER_EVENT } from "@autocode-ts/autocode";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { AcElementBase } from "../../../core/ac-element-base";
import { acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATA_FILTER_TAG } from "../consts/ac-data-filter-tag.const";
import { AcDataFilterPopup } from "./ac-data-filter-popup";
import "../css/ac-data-filter.css";
import { acDataFilterElementHtml } from "../_ac-data-filter.export";

export interface IAcDataFilterField {
  key: string;
  label: string;
  allowFilter?: boolean;
  type?: string;
}

export class AcDataFilterElement extends AcElementBase {
  private _dataManager?: AcDataManager;
  get dataManager(): AcDataManager | undefined {
    return this._dataManager;
  }
  set dataManager(value: AcDataManager | undefined) {
    this._dataManager = value;
    if (value) {
      value.on({
        event: AC_DATA_MANAGER_EVENT.FilterGroupChange,
        callback: () => this.updateBadge(),
      });
      value.on({
        event: AC_DATA_MANAGER_EVENT.DisplayedRowsChange,
        callback: () => this.updateBadge(),
      });
    }
    this.updateBadge();
  }

  private _targetField?: IAcDataFilterField;
  get targetField(): IAcDataFilterField | undefined {
    return this._targetField;
  }
  set targetField(value: IAcDataFilterField | undefined) {
    this._targetField = value;
    this.recreatePopup();
    this.updateBadge();
  }

  get isSingleFieldMode(): boolean {
    return !!this._targetField;
  }

  fields: IAcDataFilterField[] = [];
  buttonElement?: HTMLButtonElement;
  badgeElement?: HTMLElement;
  popup: AcDataFilterPopup = new AcDataFilterPopup({ filterElement: this });

  private recreatePopup() {
    this.popup.destroy();
    this.popup = new AcDataFilterPopup({
      filterElement: this,
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
      <button class="ac-data-filter-btn ac-data-filter-toggle-btn" type="button">
        ${acDataFilterElementHtml.filter}
        <span class="ac-data-filter-badge" style="display:none">0</span>
      </button>
    `;

    this.buttonElement = this.querySelector('.ac-data-filter-toggle-btn') as HTMLButtonElement;
    this.badgeElement = this.querySelector('.ac-data-filter-badge') as HTMLElement;

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
          allowFilter: col.allowFilter !== false,
          type: col.type,
        }));
        return;
      }
    } else {
      this.delayedCallback.add({
        callback: () => this.autoBindParent(),
        duration: 50,
        key: 'autoBindFilterParent',
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
    const allFilters = this.dataManager?.filterGroup?.filters ?? [];
    const count = this.isSingleFieldMode
      ? allFilters.filter((f) => f.key === this._targetField!.key).length
      : allFilters.length;

    this.badgeElement.innerText = count.toString();
    this.badgeElement.style.display = count > 0 ? 'flex' : 'none';
  }

  override destroy(): void {
    this.popup.destroy();
    super.destroy();
  }
}

acRegisterCustomElement({ tag: AC_DATA_FILTER_TAG.dataFilter, type: AcDataFilterElement });
