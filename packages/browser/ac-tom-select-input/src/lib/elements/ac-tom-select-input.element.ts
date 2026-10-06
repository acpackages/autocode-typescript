/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcInputBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import TomSelect from "tom-select";
import { AcDataManager, AC_DATA_MANAGER_HOOK } from "@autocode-ts/autocode";
import { stringIsJson } from "@autocode-ts/ac-extensions";
import { AcFilterGroup, AcEnumConditionOperator, IAcOnDemandRequestArgs, IAcOnDemandResponseArgs } from "@autocode-ts/autocode";

export class AcTomSelectInputElement extends AcInputBase {
  override isInputElementValidHtmlInput = false;

  static override get observedAttributes() {
    return [...super.observedAttributes, "placeholder", "readonly", "label-key", "value-key", "select-options", "add-row"];
  }

  override get inputReflectedAttributes() {
    return [...super.inputReflectedAttributes, "placeholder", "readonly", "label-key", "value-key", "select-options", "add-row"];
  }

  // ── Properties ──────────────────────────────────────────────────────

  override get placeholder(): string | null {
    return this.getAttribute("placeholder");
  }
  override set placeholder(value: string | null) {
    if (value) {
      this.setAttribute("placeholder", value);
      if (this.tomSelect) {
        (this.tomSelect as any).settings.placeholder = value;
        this.tomSelect.inputState();
      }
    } else {
      this.removeAttribute("placeholder");
      if (this.tomSelect) {
        (this.tomSelect as any).settings.placeholder = "";
        this.tomSelect.inputState();
      }
    }
  }

  get addRow(): boolean {
    return this.getAttribute('add-row') ? this.getAttribute('add-row') === 'true' : true;
  }
  set addRow(value: boolean) {
    this.setAttribute('add-row', `${value}`);
  }

  private _options: any[] = [];
  get options(): any[] {
    return this._options;
  }
  set options(value: any[]) {
    this.dataManager.type = 'offline';
    let valueOptions: any[] = [];
    if (value && value.length > 0) {
      if (typeof value[0] !== "object") {
        for (const val of value) {
          valueOptions.push({ [this.labelKey]: val, [this.valueKey]: val });
        }
      } else {
        valueOptions = [...value];
      }
    }
    this._options = valueOptions;
    this.dataManager.data = valueOptions;
    if (this.tomSelect) {
      this.tomSelect.addOptions(this._options);
      this.refreshTomSelectOptions();
    }
  }

  get data(): any[] {
    return this.options;
  }
  set data(value: any[]) {
    this.options = value;
  }

  override get readonly(): boolean {
    return this.getAttribute("readonly") === "true";
  }
  override set readonly(value: boolean) {
    if (value) {
      this.setAttribute("readonly", "true");
      if (this.tomSelect) this.tomSelect.disable();
    } else {
      this.removeAttribute("readonly");
      if (this.tomSelect) this.tomSelect.enable();
    }
  }

  get readOnly(): boolean {
    return this.readonly;
  }
  set readOnly(value: boolean) {
    this.readonly = value;
  }

  get labelKey(): string {
    return this.getAttribute("label-key") || "label";
  }
  set labelKey(value: string) {
    if (value) {
      this.setAttribute("label-key", value);
      if (this._value) {
        this.value = this._value;
      }
    } else {
      this.removeAttribute("label-key");
    }
  }

  get valueKey(): string {
    return this.getAttribute("value-key") || "value";
  }
  set valueKey(value: string) {
    if (value) {
      this.setAttribute("value-key", value);
      if (this._value) {
        this.value = this._value;
      }
    } else {
      this.removeAttribute("value-key");
    }
  }

  get searchKeys(): string {
    return this.getAttribute("search-keys") ?? "";
  }
  set searchKeys(value: string) {
    if (value) {
      this.setAttribute("search-keys", value);
    } else {
      this.removeAttribute("search-keys");
    }
  }

  get onDemandFunction(): any {
    return this.dataManager.onDemandFunction;
  }
  set onDemandFunction(value: (args: IAcOnDemandRequestArgs) => void) {
    this.dataManager.type = 'ondemand';
    this.dataManager.onDemandFunction = value;
    if (this.tomSelect) {
      this.setupOnDemandLoad();
    }
    if (this.value) {
      this.setSelectedRowsFromValue();
    }
  }

  initialValueOption?: any;

  private _searchQuery: string = '';
  get searchQuery(): string { return this._searchQuery; }
  set searchQuery(val: string) {
    val = (val || '').trim();
    this._searchQuery = val;
    const event: CustomEvent = new CustomEvent('searchQueryChange', { detail: { searchQuery: this.searchQuery } });
    this.dispatchEvent(event);
  }

  selectedRows: any[] = [];
  previousState: any = {};
  dropdownSize: { height: number, width: number } = { height: 250, width: 400 };
  hasCustomSize: boolean = false;
  isFocused: boolean = false;
  isDropdownOpenedOnce: boolean = false;
  rendererFunction?:({item}:{item:any})=>any;

  addRowCallback: (({ query, callback }: { query: string, callback: Function }) => void) = ({ query, callback }: { query: string, callback: Function }): void => {
    const newOption = { [this.labelKey]: query, [this.valueKey]: query };
    callback(newOption);
  };

  dataManager: AcDataManager = new AcDataManager();
  private selectEl!: HTMLSelectElement;
  private tomSelect!: TomSelect;
  private subscriptionId?: string;
  private isDropdownOpen: boolean = false;
  // ── Value management ────────────────────────────────────────────────

//   override setValueListener() {
//     Object.defineProperty(this, 'value', {
//       get() {
//         return this._value;
//       },

//       set(value) {
//         this.setValue(value);
//         this.setSelectedRowsFromValue();
//       },

//       enumerable: true,
//       configurable: true
//     });
//   }

  private setSelectedRows({ rows }: { rows: any[] }) {
    this.selectedRows = rows;
    if (rows.length > 0) {
      if (this.tomSelect) {
        const row = rows[0];
        const optKey = String(row[this.valueKey]);
        if (!this.tomSelect.options[optKey]) {
          this.tomSelect.addOption({
            [this.valueKey]: row[this.valueKey],
            [this.labelKey]: row[this.labelKey]
          });
        }
        this.tomSelect.setValue(optKey, true);
      }
    }
  }

  private async setSelectedRowsFromValue(): Promise<void> {
    if (!this.value || this.value === 'null' || this.value === 'undefined') {
      this.selectedRows = [];
      if (this.tomSelect && this.tomSelect.getValue() !== '') {
        this.tomSelect.clear(true);
      }
      return;
    }

    if(!this.tomSelect){
      return;
    }

    if (!this.isDropdownOpenedOnce && this.initialValueOption) {
      if (this.labelKey && this.valueKey) {
        if (this.value == this.initialValueOption[this.valueKey]) {
          const optKey = String(this.value);
          this.selectedRows = [this.initialValueOption];
          this.tomSelect.addOption(this.initialValueOption);
          this.tomSelect.setValue(optKey, true);
        }
      }
      return;
    }

    // Already selected?
    if (this.selectedRows.length > 0 && this.selectedRows[0][this.valueKey] === this.value) {
      // Ensure tom-select is in sync
      if (this.tomSelect) {
        const optKey = String(this.value);
        if (!this.tomSelect.options[optKey]) {
          this.tomSelect.addOption({
            [this.valueKey]: this.selectedRows[0][this.valueKey],
            [this.labelKey]: this.selectedRows[0][this.labelKey]
          });
        }
        this.tomSelect.setValue(optKey, true);
      }
      return;
    }

    // Search in existing data
    const allData = this.dataManager.data || [];
    const valueRow = allData.find((row: any) => row && row[this.valueKey] === this.value);
    if (valueRow) {
      this.setSelectedRows({ rows: [valueRow] });
      return;
    }

    // On-demand fetch
    if (this.onDemandFunction && this.value != null && this.value != undefined) {
      const filterGroup = new AcFilterGroup();
      filterGroup.addFilter({
        key: this.valueKey,
        operator: AcEnumConditionOperator.EqualTo,
        value: this.value
      });

      try {
        const response = await new Promise<IAcOnDemandResponseArgs>((resolve) => {
          this.onDemandFunction({
            filterGroup,
            successCallback: resolve
          });
        });

        if (response && response.totalCount > 0 && response.data && response.data.length > 0) {
          const rowData = response.data[0];
          this.setSelectedRows({ rows: [rowData] });
          return;
        }
      } catch (err) {
        console.error("Error fetching selected option on-demand:", err);
      }
    }

    this.setSelectedRows({ rows: [{ [this.valueKey]: this.value, [this.labelKey]: this.value }] });

  }

  // ── Dropdown management ─────────────────────────────────────────────

  openDropdown() {
    if (this.tomSelect && !this.isDropdownOpen) {
      this.tomSelect.open();
    }
  }

  closeDropdown() {
    if (this.tomSelect && this.isDropdownOpen) {
      this.tomSelect.close();
    }
  }

  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  // ── State management ────────────────────────────────────────────────

  getState() {
    const state = {
      dropdownSize: this.dropdownSize,
      hasCustomSize: this.hasCustomSize
    };
    return state;
  }

  setState({ state }: { state: any }) {
    if (state && state.dropdownSize) {
      this.dropdownSize = state.dropdownSize;
      this.hasCustomSize = state.hasCustomSize || false;
    }
  }

  private notifyState() {
    const currentState = this.getState();
    const currentStateJson = JSON.stringify(currentState);
    if (this.previousState != currentStateJson) {
      this.previousState = currentStateJson;
      const event: CustomEvent = new CustomEvent('stateChange', { detail: { state: currentState } });
      this.dispatchEvent(event);
    }
  }

  // ── Attribute handling ──────────────────────────────────────────────

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;

    if (name === "placeholder") {
      this.placeholder = newValue;
    } else if (name === "readonly") {
      this.readonly = newValue === "true";
    } else if (name === "label-key") {
      this.labelKey = newValue;
    } else if (name === "value-key") {
      this.valueKey = newValue;
    } else if (name === "add-row") {
      this.addRow = newValue === "true";
    } else if (name === "select-options") {
      if (newValue) {
        if (stringIsJson(newValue)) {
          this.options = JSON.parse(newValue);
        } else {
          this.options = newValue.split(",");
        }
      } else {
        this.options = [];
      }
    } else if (name === 'class') {
      // Propagate class to the wrapper if needed
    } else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.innerHTML = `<select class="ac-tomselect" style="display:none;"></select>`;
    this.selectEl = this.querySelector(".ac-tomselect")!;

    this.initTomSelect();

    // Subscribe to data changes for offline mode
    if (this.dataManager) {
      this.subscriptionId = this.dataManager.hooks.subscribe({
        hook: AC_DATA_MANAGER_HOOK.DataChange,
        callback: () => {
          if (this.dataManager.type === "offline") {
            this.refreshTomSelectOptions();
          }
        }
      });
    }

    // Restore value if already set before connected
    if (this.value) {
      this.setSelectedRowsFromValue();
    }
  }

  override disconnectedCallback() {
    if (this.subscriptionId && this.dataManager) {
      this.dataManager.hooks.unsubscribe({ subscriptionId: this.subscriptionId });
    }
    if (this.tomSelect) {
      this.tomSelect.destroy();
    }
    super.disconnectedCallback();
  }

  override destroy(): void {
    if (this.tomSelect) {
      this.tomSelect.destroy();
    }
    super.destroy();
  }

  private setupCustomResizer(resizer: HTMLElement, dropdown: HTMLElement) {
    const handleDrag = (startX: number, startY: number, startWidth: number, startHeight: number, clientX: number, clientY: number) => {
      const newWidth = Math.max(150, startWidth + (clientX - startX));
      const newHeight = Math.max(100, startHeight + (clientY - startY));

      this.dropdownSize = { width: newWidth, height: newHeight };
      this.hasCustomSize = true;
      dropdown.style.width = `${newWidth}px`;
      dropdown.style.height = `${newHeight}px`;

      this.notifyState();
    };

    resizer.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startWidth = dropdown.offsetWidth;
      const startHeight = dropdown.offsetHeight;
      const startX = e.clientX;
      const startY = e.clientY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        handleDrag(startX, startY, startWidth, startHeight, moveEvent.clientX, moveEvent.clientY);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    resizer.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      const startWidth = dropdown.offsetWidth;
      const startHeight = dropdown.offsetHeight;
      const startX = touch.clientX;
      const startY = touch.clientY;

      const onTouchMove = (moveEvent: TouchEvent) => {
        const touchMove = moveEvent.touches[0];
        handleDrag(startX, startY, startWidth, startHeight, touchMove.clientX, touchMove.clientY);
      };

      const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };

      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    });
  }

  // ── Focus/Blur ──────────────────────────────────────────────────────

  override focus(options?: FocusOptions): void {
    super.focus(options);
    this.isFocused = true;
    if (this.tomSelect) {
      this.tomSelect.focus();
    }
  }

  override blur(): void {
    super.blur();
    this.isFocused = false;
    if (this.tomSelect) {
      this.tomSelect.blur();
    }
  }

  // ── Compatibility methods ───────────────────────────────────────────

  refresh(): void {
    this.refreshTomSelectOptions();
  }

  // ── Tom-select initialization ───────────────────────────────────────

  private initTomSelect() {
    const self = this;

    const tomOptions: any = {
      valueField: this.valueKey,
      labelField: this.labelKey,
      searchField: this.searchKeys == ''? [this.labelKey]:this.searchKeys.split(","),
      placeholder: this.placeholder || "",
      maxOptions: 200,
      openOnFocus: true,
      highlight: true,
      closeAfterSelect: true,
      loadThrottle: 350,
      dropdownParent: 'body',
      controlClass:'ac-tom-select-control',

      plugins: ['restore_on_backspace'],

      // On-demand load function (set up later if needed)
      load: undefined as any,

      // Create new option support
      create: this.addRow ? (input: string, callback: Function) => {
        this.addRowCallback({
          query: input,
          callback: (newOption: any) => {
            console.log(newOption);
            this.tomSelect.addOptions([newOption],true);
            const valueOptions = [...this._options, newOption];
            this._options = valueOptions;
            this.dataManager.data = valueOptions;
            callback({
              [self.valueKey]: newOption[self.valueKey],
              [self.labelKey]: newOption[self.labelKey]
            });
            this.tomSelect.setValue(newOption[self.valueKey]);
          }
        });
      } : false,

      onChange: (value: string | string[]) => {
        const newVal = Array.isArray(value) ? value[0] || "" : (value || "");
        if (newVal !== this._value) {
          this.setValue({value:newVal || null});

          // Update selectedRows from the selected option
          if (newVal && this.tomSelect && this.tomSelect.options[newVal]) {
            const optData = this.tomSelect.options[newVal];
            this.selectedRows = [optData];
          } else if (!newVal) {
            this.selectedRows = [];
          }
        }
      },

      onFocus: () => {
        this.isFocused = true;
      },

      onBlur: () => {
        this.isFocused = false;
      },

      onInitialize() {
        // this.wrapper.classList.add('my-tom-select');
        const inputClass:string|null = self.getAttribute('class');
        if(inputClass){
          for(const _class of self.classList){
            this.control.classList.add(_class);
          }
        }
        // this.control.classList.remove('ts-control');
      },

      onDropdownOpen: () => {
        this.isDropdownOpen = true;
        this.isDropdownOpenedOnce = true;

        const beforeEvent: CustomEvent = new CustomEvent('beforeDropdownOpen', {});
        this.dispatchEvent(beforeEvent);

        if (this.tomSelect && this.tomSelect.dropdown) {
          const dropdown = this.tomSelect.dropdown;

          let width = this.dropdownSize.width;
          if (!this.hasCustomSize && this.tomSelect.control) {
            width = this.tomSelect.control.offsetWidth;
          }

          dropdown.style.width = `${width}px`;
          dropdown.style.maxHeight = 'none';
          dropdown.style.display = 'flex';
          dropdown.style.flexDirection = 'column';
          dropdown.style.position = 'absolute';

          // Make sure it doesn't use browser's native resize
          dropdown.style.resize = 'none';
          dropdown.style.overflow = 'hidden';

          if (this.hasCustomSize) {
            dropdown.style.height = `${this.dropdownSize.height}px`;
          } else {
            dropdown.style.height = 'auto';
          }

          const content = dropdown.querySelector('.ts-dropdown-content') as HTMLElement;
          if (content) {
            content.style.flex = '1 1 auto';
            content.style.overflowY = 'auto';
            if (this.hasCustomSize) {
              content.style.maxHeight = 'none';
            } else {
              content.style.maxHeight = '280px'; // Approx 8 items (35px each)
            }
          }

          // Create/Retrieve custom resize grip
          let resizer = dropdown.querySelector('.ts-dropdown-resizer') as HTMLElement;
          if (!resizer) {
            resizer = document.createElement('div');
            resizer.className = 'ts-dropdown-resizer';
            resizer.style.cssText = `
              position: absolute;
              right: 0;
              bottom: 0;
              width: 14px;
              height: 14px;
              cursor: se-resize;
              z-index: 10000;
              background: linear-gradient(135deg, transparent 5px, #bbb 5px, #bbb 6px, transparent 6px, transparent 8px, #bbb 8px, #bbb 9px, transparent 9px, transparent 11px, #bbb 11px, #bbb 12px, transparent 12px);
            `;
            dropdown.appendChild(resizer);
            this.setupCustomResizer(resizer, dropdown);
          }
        }

        const event: CustomEvent = new CustomEvent('dropdownOpen', {});
        this.dispatchEvent(event);
      },

      onDropdownClose: () => {
        this.isDropdownOpen = false;
        const event: CustomEvent = new CustomEvent('dropdownClose', {});
        this.dispatchEvent(event);
        this.notifyState();
      },

      onType: (query: string) => {
        this._searchQuery = query;
        const event: CustomEvent = new CustomEvent('searchQueryChange', { detail: { searchQuery: query } });
        this.dispatchEvent(event);
      },

      render: {
        option: (data: any, escape: (str: string) => string) => {
          if(this.rendererFunction){
            return this.rendererFunction({item:data});
          }
          const label = data[this.labelKey] || data.text || '';
          return `<div class="option">${escape(String(label))}</div>`;
        },
        item: (data: any, escape: (str: string) => string) => {
          // if(this.rendererFunction){
          //   return this.rendererFunction({item:data});
          // }
          const label = data[this.labelKey] || data.text || '';
          return `<div class="item">${escape(String(label))}</div>`;
        },
        no_results: () => {
          return `<div class="no-results">No results found</div>`;
        }
      }
    };

    this.tomSelect = new TomSelect(this.selectEl, tomOptions);

    const originalPosition = this.tomSelect.position;
    this.tomSelect.position = function () {
      originalPosition.apply(this);
      if (self.isDropdownOpen && self.tomSelect && self.tomSelect.dropdown) {
        const dropdown = self.tomSelect.dropdown;

        let width = self.dropdownSize.width;
        if (!self.hasCustomSize && self.tomSelect.control) {
          width = self.tomSelect.control.offsetWidth;
        }

        dropdown.style.width = `${width}px`;
        dropdown.style.maxHeight = 'none';

        if (self.hasCustomSize) {
          dropdown.style.height = `${self.dropdownSize.height}px`;
        } else {
          dropdown.style.height = 'auto';
        }

        const content = dropdown.querySelector('.ts-dropdown-content') as HTMLElement;
        if (content) {
          if (self.hasCustomSize) {
            content.style.maxHeight = 'none';
          } else {
            content.style.maxHeight = '280px';
          }
        }
      }
    };

    this.tomSelect.control_input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Backspace') {
        return;
      }

      // Only when search box is empty
      if (this.tomSelect.control_input.value.length > 0) {
        return;
      }

      const values = this.tomSelect.items;
      if (values.length > 0) {
        e.preventDefault();
        const lastValue = values[values.length - 1];
        this.tomSelect.removeItem(lastValue);
      }
    });

    // Apply readonly state
    if (this.readonly) {
      this.tomSelect.disable();
    }

    // Initialize with current data mode
    if (this.dataManager) {
      if (this.dataManager.type === "offline") {
        this.refreshTomSelectOptions();
      } else if (this.dataManager.type === "ondemand" && this.dataManager.onDemandFunction) {
        this.setupOnDemandLoad();
      }
    }
  }

  // ── Data loading ────────────────────────────────────────────────────

  private refreshTomSelectOptions(): void {
    if (!this.dataManager || this.dataManager.type !== "offline" || !this.tomSelect) return;

    const options = this.dataManager.data;

    this.tomSelect.clearOptions();
    this.tomSelect.addOptions(options);

    // Restore current value if it exists
    const currentValue = this.tomSelect.getValue();
    if (this.value && (!currentValue || currentValue !== this.value)) {
      this.tomSelect.setValue(String(this.value), true);
    }
  }

  setValue({value,emitEvent = true}:{value: any, emitEvent?: boolean}): void {
    super.setValue({value,emitEvent});
    this.setSelectedRowsFromValue();
  }

  private setupOnDemandLoad(): void {
    if (!this.dataManager || !this.tomSelect) return;

    const self = this;

    (this.tomSelect as any).settings.load = function (query: string, callback: (options: any[]) => void) {
      if (!self.dataManager || !self.dataManager.onDemandFunction) {
        callback([]);
        return;
      }

      self._searchQuery = query;

      self.dataManager.onDemandFunction({
        searchQuery: query,
        startIndex: 0,
        rowsCount: 50,
        successCallback: (response: IAcOnDemandResponseArgs) => {
          if (response && response.data && response.data.length > 0) {
            const options = response.data;
            callback(options);
          } else {
            callback([]);
          }
        }
      } as any);
    };

    // Allow loading on every query
    (this.tomSelect as any).settings.shouldLoad = (query: string) => true;
    (this.tomSelect as any).settings.loadThrottle = 350;

    // Trigger initial load on focus
    (this.tomSelect as any).settings.preload = 'focus';
  }
}

acRegisterCustomElement({ tag: "ac-tom-select-input", type: AcTomSelectInputElement });
