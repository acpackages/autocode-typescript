/* eslint-disable @typescript-eslint/no-inferrable-types */
import { stringIsJson } from "@autocode-ts/ac-extensions";
import { AcScrollable } from "../../ac-scrollable/_ac-scrollable.export";
import { AcInputBase } from "../core/ac-input-base";
import { AC_INPUT_TAG } from "../consts/ac-input-tags.const";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";

export class AcTagsInputElement extends AcInputBase {
  static override get observedAttributes() {
    return [...super.observedAttributes, 'label-key', 'value-key', 'tag-options', 'delimiter', 'separator'];
  }

  get labelKey(): string {
    return this.getAttribute('label-key') || 'label';
  }
  set labelKey(value: string) {
    this.setAttribute('label-key', value);
    this.renderTags();
  }

  get valueKey(): string {
    return this.getAttribute('value-key') || 'value';
  }
  set valueKey(value: string) {
    this.setAttribute('value-key', value);
    this.renderTags();
  }

  get delimiter(): string {
    return this.getAttribute('delimiter') || ',';
  }
  set delimiter(value: string) {
    this.setAttribute('delimiter', value);
  }

  get separator(): string {
    return this.getAttribute('separator') || ',';
  }
  set separator(value: string) {
    this.setAttribute('separator', value);
  }

  private _tagOptions: any[] = [];
  get tagOptions(): any[] {
    return this._tagOptions;
  }
  set tagOptions(options: any[]) {
    this._tagOptions = options.map(opt => {
      return typeof opt === 'object' ? opt : { [this.labelKey]: opt, [this.valueKey]: opt };
    });
    this._filteredOptions = this._tagOptions.filter(opt => !this.value.split(this.separator).map(v => v.trim()).includes(opt[this.valueKey]));
    if (this.isDropdownOpen) this.renderVirtualList();
    this.renderTags();
  }

  protected override _value: string = '';
  override get value(): string {
    return this._value || '';
  }
  override set value(val: string) {
    let valueString: string = typeof val === 'string' ? val : '';
    if (stringIsJson(val)) {
      try{
        valueString = JSON.parse(val).join(this.separator);
      }
      catch(ex){
        //
      }
    }
    if(Array.isArray(val)){
      valueString = val.join(this.separator);
    }
    super.value = valueString;
    this._filteredOptions = this._tagOptions.filter(opt => !this.value.split(this.separator).map(v => v.trim()).includes(opt[this.valueKey]));
    this.renderTags();
  }

  private _filteredOptions: any[] = [];
  private dropdownContainer!: HTMLDivElement;
  override inputElement: HTMLDivElement = this.ownerDocument.createElement('div');
  private textInputElement: HTMLInputElement = this.ownerDocument.createElement('input');
  private tagsContainer: HTMLDivElement = this.ownerDocument.createElement('div');
  private isDropdownOpen: boolean = false;
  private listEl!: HTMLDivElement;
  private maxDropdownHeight: number = 300;
  private optionHeight: number = 32;
  private scrollable!: AcScrollable;
  private highlightingIndex: number = -1;

  override isInputElementValidHtmlInput = false;

  private setupElements() {
    Object.assign(this.inputElement.style, {
      position: 'relative',
      display: 'flex',
      flexWrap: 'wrap',
      padding: '4px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      background: '#fff',
      boxSizing: 'border-box',
    });

    Object.assign(this.tagsContainer.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
    });
    this.inputElement.appendChild(this.tagsContainer);

    this.textInputElement.type = 'text';
    this.textInputElement.autocomplete = 'off';
    Object.assign(this.textInputElement.style, {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      flexGrow: '1',
      minWidth: '100px',
      padding: '4px',
    });
    this.inputElement.appendChild(this.textInputElement);

    this.dropdownContainer = this.ownerDocument.createElement('div');
    Object.assign(this.dropdownContainer.style, {
      position: 'fixed',
      display: 'none',
      zIndex: '9999',
      minWidth: 'max-content',
      maxHeight: `${this.maxDropdownHeight}px`,
      border: '1px solid #ccc',
      background: '#fff',
      boxSizing: 'border-box',
    });

    this.listEl = this.ownerDocument.createElement('div');
    this.dropdownContainer.appendChild(this.listEl);
    this.scrollable = new AcScrollable({
      element: this.listEl,
      options: { bufferCount: 3, elementHeight: this.optionHeight },
    });
  }

  private attachEvents() {
    this.textInputElement.addEventListener('input', () => {
      const term = this.textInputElement.value.toLowerCase();
      this._filteredOptions = this._tagOptions.filter(opt => {
        const label = String(opt[this.labelKey]);
        return label.toLowerCase().includes(term) && !this.value.split(this.separator).map(v => v.trim()).includes(opt[this.valueKey]);
      });
      this.openDropdown();
      this.highlightingIndex = this._filteredOptions.length ? 0 : -1;
      this.renderVirtualList();
      this.ensureHighlightInView();
    });

    this.textInputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.highlightingIndex >= 0) {
          this.addTag(this._filteredOptions[this.highlightingIndex]);
        } else if (this.textInputElement.value.trim()) {
          this.addTag(this.textInputElement.value.trim());
        }
      } else if (e.key === 'Backspace' && !this.textInputElement.value) {
        e.preventDefault();
        const values = this.value.split(this.separator).map(v => v.trim()).filter(v => v);
        if (values.length > 0) this.removeTag(values[values.length - 1]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this._filteredOptions.length === 0) return;
        this.highlightingIndex = Math.min(
          this.highlightingIndex < 0 ? 0 : this.highlightingIndex + 1,
          this._filteredOptions.length - 1
        );
        this.applyHighlightStyles();
        this.ensureHighlightInView();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this._filteredOptions.length === 0) return;
        this.highlightingIndex = Math.max(this.highlightingIndex < 0 ? 0 : this.highlightingIndex - 1, 0);
        this.applyHighlightStyles();
        this.ensureHighlightInView();
      } else if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });

    this.textInputElement.addEventListener('focus', () => {
      this._filteredOptions = this._tagOptions.filter(opt => !this.value.split(this.separator).map(v => v.trim()).includes(opt[this.valueKey]));
      this.openDropdown();
      this.renderVirtualList();
      this.ensureHighlightInView();
    });

    this.textInputElement.addEventListener('blur', () => {
      this.delayedCallback.add({callback:() => {
        if (this.textInputElement.value.trim()) this.addTag(this.textInputElement.value.trim());
        this.closeDropdown();
      }, duration:150});
    });

    window.addEventListener('scroll', () => { if (this.isDropdownOpen) this.positionDropdown(); }, true);
    window.addEventListener('resize', () => { if (this.isDropdownOpen) this.positionDropdown(); });
  }

  private addTag(option: any) {
    const value = typeof option === 'object' ? option[this.valueKey] : option;
    const currentValues = this.value.split(this.separator).map(v => v.trim()).filter(v => v);
    if (!currentValues.includes(value)) {
      currentValues.push(value);
      this.value = currentValues.join(this.separator);
      this.renderTags();
      this.textInputElement.value = '';
      this._filteredOptions = this._tagOptions.filter(opt => !this.value.split(this.separator).map(v => v.trim()).includes(opt[this.valueKey]));
      this.renderVirtualList();
      this.dispatchEvent(new Event('change'));
    }
  }

  override init() {
    super.init();
    this.setupElements();
    this.attachEvents();
    this.append(this.inputElement);
    this.refreshReflectedAttributes();
  }

  private removeTag(value: any) {
    const normalized = typeof value === 'object' ? value[this.valueKey] : value;
    const currentValues = this.value.split(this.separator).map(v => v.trim()).filter(v => v);
    this.value = currentValues.filter(v => v !== normalized).join(this.separator);
    this.renderTags();
    this._filteredOptions = this._tagOptions.filter(opt => !this.value.split(this.separator).map(v => v.trim()).includes(opt[this.valueKey]));
    if (this.isDropdownOpen) this.renderVirtualList();
    this.dispatchEvent(new Event('change'));
  }

  private renderTags() {
    this.tagsContainer.innerHTML = '';
    const values = this.value.split(this.separator).map(v => v.trim()).filter(v => v);
    values.forEach(value => {
      const tagEl = this.ownerDocument.createElement('span');
      tagEl.classList.add('ac-tag-value');
      const labelObj = this._tagOptions.find(opt => opt[this.valueKey] === value);
      tagEl.textContent = labelObj ? labelObj[this.labelKey] : value;
      Object.assign(tagEl.style, {
        background: '#007bff',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '3px',
        margin: '2px',
        display: 'inline-flex',
        alignItems: 'center',
      });

      const removeBtn = this.ownerDocument.createElement('span');
      removeBtn.textContent = '×';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.marginLeft = '8px';
      removeBtn.addEventListener('click', () => this.removeTag(value));

      tagEl.appendChild(removeBtn);
      this.tagsContainer.appendChild(tagEl);
    });
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    if (name === 'label-key') {
      this.labelKey = newValue;
    } else if (name === 'value-key') {
      this.valueKey = newValue;
    } else if (name === 'tag-options') {
      if (stringIsJson(newValue)) {
        this.tagOptions = JSON.parse(newValue);
      } else {
        this.tagOptions = newValue.split(this.delimiter).map((v:any) => v.trim());
      }
    } else if (name === 'delimiter') {
      this.delimiter = newValue;
    } else if (name === 'separator') {
      this.separator = newValue;
    } else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  private buildOptionElement(option: any, index: number): HTMLElement {
    const el = this.ownerDocument.createElement('div');
    el.dataset['optionIndex'] = String(index);
    el.style.padding = '4px 8px';
    el.style.cursor = 'pointer';
    el.style.boxSizing = 'border-box';
    el.textContent = String(option[this.labelKey]);
    el.addEventListener('mousedown', e => { e.preventDefault(); this.addTag(option); });
    el.addEventListener('mouseenter', () => { this.highlightingIndex = index; this.applyHighlightStyles(); });
    return el;
  }

  private openDropdown() {
    if (!this.isDropdownOpen) {
      this.ownerDocument.body.appendChild(this.dropdownContainer);
      this.isDropdownOpen = true;
      this.dropdownContainer.style.display = 'block';
    }
    this.positionDropdown();
  }

  private closeDropdown() {
    this.dropdownContainer.remove();
    this.isDropdownOpen = false;
    this.highlightingIndex = -1;
  }

  private positionDropdown() {
    this.delayedCallback.add({callback:() => {
      const rect = this.inputElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = Math.min(this._filteredOptions.length * this.optionHeight, this.maxDropdownHeight);
      const showAbove = spaceBelow < dropdownHeight && rect.top > spaceBelow;
      this.dropdownContainer.style.width = rect.width + 'px';
      this.dropdownContainer.style.left = rect.left + 'px';
      this.dropdownContainer.style.top = showAbove ? `${rect.top - dropdownHeight}px` : `${rect.bottom}px`;
      this.dropdownContainer.style.overflowY = 'auto';
    },duration:10});
  }

  private renderVirtualList() {
    this.listEl.innerHTML = '';
    if (this._filteredOptions.length) {
      this._filteredOptions.forEach((opt, i) => this.listEl.appendChild(this.buildOptionElement(opt, i)));
    } else {
      this.listEl.innerHTML = `<div style="text-align:center;padding:4px;">No matching options!</div>`;
    }
    this.scrollable.registerExistingElements();
    this.delayedCallback.add({callback:() => this.applyHighlightStyles()});
    this.positionDropdown();
  }

  private applyHighlightStyles() {
    const all = this.dropdownContainer.querySelectorAll<HTMLElement>('[data-option-index]');
    all.forEach(n => (n.style.background = ''));
    if (this.highlightingIndex >= 0) {
      const el = this.dropdownContainer.querySelector<HTMLElement>(`[data-option-index="${this.highlightingIndex}"]`);
      if (el) el.style.background = '#ddd';
    }
  }

  private ensureHighlightInView() {
    if (this.highlightingIndex < 0) return;
    this.scrollToIndex(this.highlightingIndex);
  }

  private scrollToIndex(index: number) {
    if (index < 0 || index >= this._filteredOptions.length) return;
    this.scrollable.scrollTo({ index });
  }

  override focus(): void {
    this.textInputElement.focus();
  }

  get items(): any[] {
    return this.value.split(this.separator).map(v => {
      const match = this._tagOptions.find(opt => opt[this.valueKey] === v.trim());
      return match || v.trim();
    }).filter(v => v);
  }
}

acRegisterCustomElement({ tag: AC_INPUT_TAG.tagsInput, type: AcTagsInputElement });
