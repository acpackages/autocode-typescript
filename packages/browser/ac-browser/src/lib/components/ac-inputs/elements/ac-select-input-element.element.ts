/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { stringIsJson } from "@autocode-ts/ac-extensions";
import { IAcOnDemandRequestArgs, AcDataManager, AcEnumConditionOperator, IAcDataRow, AC_DATA_MANAGER_HOOK } from "@autocode-ts/autocode";
import { createPopper } from '@popperjs/core';
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcScrollable } from "../../_components.export";
import { AcInputBase, AC_INPUT_TAG } from "../_ac-inputs.export";

export class AcSelectInputElement extends AcInputBase {
  static override get observedAttributes() {
    return [...super.observedAttributes, 'label-key', 'value-key', 'select-options'];
  }

  get addOption(): boolean {
    return this.getAttribute('add-option') ? this.getAttribute('add-option') == 'true' : true;
  }
  set addOption(value: boolean) {
    this.setAttribute('add-option', `${value}`);
  }

  get labelKey(): string {
    return this.getAttribute('label-key') ?? 'label';
  }
  set labelKey(value: string) {
    this.setAttribute('label-key', value);
    this.setValueLabel();
  }

  get valueKey(): string {
    return this.getAttribute('value-key') ?? 'value';
  }
  set valueKey(value: string) {
    this.setAttribute('value-key', value);
    this.setValueLabel();
  }

  get onDemandFunction(): ((args: IAcOnDemandRequestArgs) => void) | undefined {
    return this.dataManager.onDemandFunction;
  }
  set onDemandFunction(value: (args: IAcOnDemandRequestArgs) => void) {
    this.dataManager.onDemandFunction = value;
  }

  override get placeholder(): string | null {
    return this.textInputElement.getAttribute('placeholder');
  }
  override set placeholder(value: string) {
    if (value !== '') this.textInputElement.setAttribute('placeholder', value);
    else this.textInputElement.removeAttribute('placeholder');
  }

  get options(): any[] { return this.dataManager.data; }
  set options(value: any[]) {
    this.dataManager.type = 'offline';
    let valueOptions: any[] = [];
    if (value.length > 0) {
      if (typeof value[0] !== "object") {
        for (const val of value) {
          valueOptions.push({ [this.labelKey]: val, [this.valueKey]: val });
        }
      } else {
        valueOptions = [...value];
      }
    }
    this.dataManager.data = valueOptions;
    if (this.isDropdownOpen) this.renderVirtualList();
    this.setValueLabel();
  }

  override get value() { return super.value; }
  override set value(val: any) {
    if (this._value != val) {
      this.previousValue = val;
      super.value = val;
      this.setValueLabel();
    }
  }

  get selectedOptions(): any[] {
    const result: any[] = [];
    for (const option of this.options) {
      if (option[this.valueKey] == this.value) {
        result.push(option);
      }
    }
    return result;
  }

  dataManager: AcDataManager = new AcDataManager();
  override isInputElementValidHtmlInput: boolean = false;
  protected dropdownContainer!: HTMLDivElement;
  selectContainer: HTMLDivElement = this.ownerDocument.createElement('div');
  protected highlightingIndex = -1;
  protected textInputElement: HTMLInputElement = this.ownerDocument.createElement("input");
  protected isDropdownOpen = false;
  protected listEl!: HTMLDivElement;
  protected maxDropdownHeight = 300;
  protected optionHeight = 32;
  protected scrollable!: AcScrollable;
  protected batchSize = 20;
  protected loadedCount = 0;
  protected addOptionText = "";
  private previousValue: any;
  private previousSearchTerm: string = '';
  private popper?: ReturnType<typeof createPopper>;
  addOptionCallback: Function = ({ query, callback }: { query: string, callback: Function }): void => {
    const newOption = { [this.labelKey]: query, [this.valueKey]: query };
    callback(newOption);
  };

  constructor() {
    super();
    this.dataManager.hooks.subscribe({
      hook: AC_DATA_MANAGER_HOOK.DataChange, callback: () => {
        this.setValueLabel();
      }
    });
  }

  private applyHighlightStyles() {
    const all = this.dropdownContainer.querySelectorAll<HTMLElement>('[data-option-index]');
    all.forEach(n => n.style.background = "");
    if (this.highlightingIndex >= 0) {
      const el = this.dropdownContainer.querySelector<HTMLElement>(`[data-option-index="${this.highlightingIndex}"]`);
      if (el) el.style.background = "#ddd";
    }
  }

  private attachEvents() {
    this.textInputElement.addEventListener("focus", async () => {
      const term = this.textInputElement.value.trim().toLowerCase();
      this.dataManager.filterGroup.setFilter({ key: this.labelKey, operator: AcEnumConditionOperator.Contains, value: term });
      this.openDropdown();
      const idx = this.dataManager.getRowIndex({ key: this.labelKey, value: this.value });
      this.highlightingIndex = idx >= 0 ? idx : -1;
      if (this.dataManager.type === 'ondemand') this.loadedCount = 0;
      await this.renderVirtualList();
      if (this.highlightingIndex >= 0) await this.loadMoreUntil(this.highlightingIndex);
      this.scrollToIndex(this.highlightingIndex);
      this.applyHighlightStyles();
    });

    this.textInputElement.addEventListener("blur", () => {
      this.delayedCallback.add({ callback: () => this.closeDropdown(), duration: 150 });
    });

    this.textInputElement.addEventListener("keyup", async (e) => {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Escape"].includes(e.key)) {
        return;
      }
      const term = this.textInputElement.value.trim().toLowerCase();
      if (this.value && term != this.previousSearchTerm) {
        this.value = null;
      }
      this.previousSearchTerm = term;
      this.dataManager.filterGroup.setFilter({ key: this.labelKey, operator: AcEnumConditionOperator.Contains, value: term });
      this.openDropdown();
      this.highlightingIndex = this.dataManager.rows.length ? 0 : -1;
      if (this.dataManager.type === 'ondemand') this.loadedCount = 0;
      await this.renderVirtualList();
      this.ensureHighlightInView();
    });
    this.textInputElement.addEventListener("keydown", async (e) => {
      if (!this.isDropdownOpen) {
        if (e.key === "F2") {
          e.preventDefault();
          const term = this.textInputElement.value.trim().toLowerCase();
          this.dataManager.filterGroup.setFilter({ key: this.labelKey, operator: AcEnumConditionOperator.Contains, value: term });
          this.openDropdown();
        }
        if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
          return;
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const maxIndex = this.loadedCount - 1 + (this.addOption ? 1 : 0);
        const newIndex = Math.min(this.highlightingIndex + 1, maxIndex);
        this.highlightingIndex = newIndex;
        this.applyHighlightStyles();
        this.ensureHighlightInView();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newIndex = Math.max(this.highlightingIndex - 1, 0);
        this.highlightingIndex = newIndex;
        this.applyHighlightStyles();
        this.ensureHighlightInView();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (this.addOption && this.highlightingIndex === this.loadedCount) {
          this.addNewOption(this.addOptionText);
        } else if (this.highlightingIndex >= 0) {
          const row = this.dataManager.getRowAtIndex({ index: this.highlightingIndex });
          if (row) this.selectOption(row.data);
        }
      } else if (e.key === "Escape") {
        this.closeDropdown();
      }
    });

    this.listEl.addEventListener("scroll", this.handleScroll.bind(this), { passive: true });
    window.addEventListener("scroll", () => { if (this.isDropdownOpen) this.popper?.update(); }, true);
    window.addEventListener("resize", () => { if (this.isDropdownOpen) this.popper?.update(); });
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    if (name === 'label-key') this.labelKey = newValue;
    else if (name === 'class') {
      this.className = newValue;
      this.textInputElement.className = newValue;
    }
    else if (name === 'value-key') this.valueKey = newValue;
    else if (name === 'select-options') {
      if (stringIsJson(newValue)) this.options = JSON.parse(newValue);
      else this.options = newValue.split(",");
    } else super.attributeChangedCallback(name, oldValue, newValue);
  }

  private buildOptionElement(row: IAcDataRow): HTMLElement {
    const el = this.ownerDocument.createElement("div");
    el.dataset["optionIndex"] = String(row.index);
    el.style.padding = "4px 8px";
    el.style.cursor = "pointer";
    el.style.boxSizing = "border-box";
    const option = row.data;
    const label = typeof option === "object" ? option[this.labelKey] : option;
    el.textContent = String(label);
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.selectOption(option);
    });
    el.addEventListener("mouseenter", () => {
      this.highlightingIndex = row.index;
      this.applyHighlightStyles();
    });
    return el;
  }

  private buildAddOptionElement(label: string): HTMLElement {
    const el = this.ownerDocument.createElement("div");
    el.dataset["optionIndex"] = String(this.loadedCount);
    el.style.padding = "4px 8px";
    el.style.cursor = "pointer";
    el.style.color = "#0078d7";
    el.style.fontStyle = "italic";
    el.textContent = `Add "${label}"`;
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.addNewOption(label);
    });
    el.addEventListener("mouseenter", () => {
      this.highlightingIndex = this.loadedCount;
      this.applyHighlightStyles();
    });
    return el;
  }

  private addNewOption(label: string) {
    this.addOptionCallback({
      query: label, callback: (option: any) => {
        this.dataManager.addRow({ data: option });
        this.selectOption(option);
      }
    });
  }

  closeDropdown() {
    if (this.popper) {
      this.popper.destroy();
      this.popper = undefined;
    }
    this.dropdownContainer.style.display = "none";
    if (this.dropdownContainer.parentNode) {
      this.dropdownContainer.remove();
    }
    this.isDropdownOpen = false;
  }

  private ensureHighlightInView() {
    if (this.highlightingIndex < 0) {
      return;
    }
    this.scrollToIndex(this.highlightingIndex);
    this.applyHighlightStyles();
  }

  override focus(): void {
    this.textInputElement.focus();
  }

  private handleScroll() {
    if (this.dataManager.type !== 'ondemand') return;
    const { scrollTop, scrollHeight, clientHeight } = this.listEl;
    if (scrollTop + clientHeight >= scrollHeight - (this.optionHeight * 3)) this.loadMore();
  }

  override init() {
    super.init();
    this.innerHTML = '';
    if (this.hasAttribute('class')) {
      this.textInputElement.setAttribute('class', this.getAttribute('class')!);
    }
    this.append(this.selectContainer);
    if (!this.hasAttribute('label-key')) this.labelKey = 'label';
    if (!this.hasAttribute('value-key')) this.valueKey = 'value';

    this.selectContainer.style.display = "flex";
    this.selectContainer.style.height = "-webkit-fill-available";
    this.selectContainer.style.width = "-webkit-fill-available";
    this.textInputElement.type = "text";
    this.textInputElement.autocomplete = "off";
    this.selectContainer.appendChild(this.textInputElement);

    this.dropdownContainer = this.ownerDocument.createElement("div");
    Object.assign(this.dropdownContainer.style, {
      position: "fixed",
      display: "none",
      zIndex: "9999",
      minWidth: "max-content",
      maxHeight: `${this.maxDropdownHeight}px`,
      border: "1px solid #ccc",
      borderRadius: '5px',
      background: "#fff",
      boxSizing: "border-box",
      overflow: 'auto'
    });

    this.listEl = this.ownerDocument.createElement("div");
    this.dropdownContainer.appendChild(this.listEl);
    this.scrollable = new AcScrollable({
      element: this.listEl,
      options: { bufferCount: 3, elementHeight: this.optionHeight }
    });
    this.attachEvents();
  }

  private async loadMore() {
    if (this.dataManager.type !== 'ondemand' || this.dataManager.allDataAvailable || this.loadedCount >= this.dataManager.totalRows) return;
    const startIndex = this.loadedCount;
    const newRows = await this.dataManager.getRows({ startIndex, rowsCount: this.batchSize });
    if (newRows.length === 0) return;
    for (const row of newRows) {
      const rowElement = this.buildOptionElement(row);
      this.listEl.appendChild(rowElement);
    }
    this.loadedCount += newRows.length;
    this.scrollable.registerExistingElements();
    this.popper?.update();
  }

  private async loadMoreUntil(targetIndex: number) {
    while (this.loadedCount <= targetIndex && !this.dataManager.allDataAvailable && this.loadedCount < this.dataManager.totalRows) {
      await this.loadMore();
    }
  }

  openDropdown() {
    if (!this.isDropdownOpen) {
      this.ownerDocument.body.appendChild(this.dropdownContainer);
      this.isDropdownOpen = true;

      const rect = this.selectContainer.getBoundingClientRect();
      this.dropdownContainer.style.width = `${rect.width}px`;

      this.popper = createPopper(this.selectContainer, this.dropdownContainer, {
        strategy: 'fixed',
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top-start'],
            },
          },
          {
            name: 'offset',
            options: {
              offset: [0, 4],
            },
          },
        ],
      });

      this.dropdownContainer.style.display = "block";
      this.delayedCallback.add({
        callback: () => {
          this.renderVirtualList();
        }, duration: 1
      });
    }
  }

  private async renderVirtualList() {
    this.listEl.innerHTML = "";
    this.scrollable.pause();
    this.scrollable.clearAll();
    let rows: IAcDataRow[] = [];
    const startIndex = 0;
    let rowsCount = -1;
    const term = this.textInputElement.value.trim();
    if (this.dataManager.type === 'ondemand') rowsCount = this.batchSize;
    this.dataManager.searchQuery = term;
    await this.dataManager.processRows();
    rows = await this.dataManager.getRows({ startIndex, rowsCount });
    this.loadedCount = rows.length;
    if (this.dataManager.type === 'offline') this.loadedCount = this.dataManager.totalRows;
    const hasMatch = rows.some(r => String(r.data[this.labelKey]).toLowerCase() === term.toLowerCase());
    if (rows.length > 0) {
      for (const row of rows) this.listEl.appendChild(this.buildOptionElement(row));
    }

    if (rows.length === 0 && !term) {
      this.listEl.innerHTML = `<div style="text-align:center;">No records!</div>`;
    }
    if (this.addOption && !hasMatch && term) {
      this.addOptionText = term;
      this.listEl.appendChild(this.buildAddOptionElement(term));
    }
    this.scrollable.resume();
    this.scrollable.registerExistingElements();

    this.popper?.update();

    this.delayedCallback.add({ callback: () => this.applyHighlightStyles() });
  }

  setValueLabel() {
    if (this.value) {
      const matchRow = this.dataManager.getRow({ key: this.valueKey, value: this.value });
      if (matchRow) {
        this.textInputElement.value = matchRow.data[this.labelKey];
      }
      else {
        // this.dataManager.data = [{
        //   [this.labelKey]: super.value, [this.valueKey]: super.value
        // }];
      }
    }
  }

  private scrollToIndex(index: number) {
    if (index < 0) return;
    this.scrollable.scrollTo({ index });
  }

  private selectOption(option: any) {
    const label = typeof option === "object" ? option[this.labelKey] : option;
    const value = typeof option === "object" ? option[this.valueKey] : option;
    this.textInputElement.value = String(label);
    this.value = value;
    this.closeDropdown();
    this.textInputElement.dispatchEvent(new Event("change"));
  }

  toggleDropdown() {
    this.isDropdownOpen ? this.closeDropdown() : this.openDropdown();
  }
}

acRegisterCustomElement({ tag: AC_INPUT_TAG.selectInput, type: AcSelectInputElement });
