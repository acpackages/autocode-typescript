/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcInputBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import TomSelect from "tom-select";
import { AcDataManager, AC_DATA_MANAGER_HOOK } from "@autocode-ts/autocode";
import { stringIsJson } from "@autocode-ts/ac-extensions";

export class AcTomSelectInput extends AcInputBase {
  override isInputElementValidHtmlInput = false;

  static override get observedAttributes() {
    return [...super.observedAttributes, "placeholder", "readonly", "label-key", "value-key", "select-options"];
  }

  override get inputReflectedAttributes() {
    return [...super.inputReflectedAttributes, "placeholder", "readonly", "label-key", "value-key", "select-options"];
  }

  override get placeholder(): string | null {
    return this.getAttribute("placeholder");
  }
  override set placeholder(value: string | null) {
    if (value) {
      this.setAttribute("placeholder", value);
      if (this.tomSelect) {
        (this.tomSelect as any).settings.placeholder = value;
      }
    } else {
      this.removeAttribute("placeholder");
      if (this.tomSelect) {
        (this.tomSelect as any).settings.placeholder = "";
      }
    }
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
      this.refreshOptions();
    }
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
      if (this.tomSelect && this.dataManager?.type === "offline") {
        this.refreshOptions();
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
      if (this.tomSelect && this.dataManager?.type === "offline") {
        this.refreshOptions();
      }
    } else {
      this.removeAttribute("value-key");
    }
  }

  private dataManager: AcDataManager = new AcDataManager();
  private selectEl!: HTMLSelectElement;
  private dropdownEl!: HTMLElement;
  private tomSelect!: TomSelect;
  private tsWrapper!: HTMLElement;
  private subscriptionId?: string;

  override setValueListener() {
    Object.defineProperty(this, 'value', {
      get() {
        return this._value;
      },

      set(value) {
        if (this._value !== value) {
          this.setValue(value);
          if (this.tomSelect) {
            this.tomSelect.setValue(value, false); // Don't trigger change event
          }
        }
      },
      enumerable: true,
      configurable: true
    });
  }

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
    } else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  override init() {
    super.init();
    this.innerHTML = `<select class="ac-tomselect"></select>`;
    this.selectEl = this.querySelector(".ac-tomselect")!;
    const tomOptions: any = {
      placeholder: this.placeholder || "",
      dropdownParent: this.ownerDocument.body,
      maxOptions: 1000, // Limit for performance
      onDropdownOpen: (element: HTMLElement) => {
        this.dropdownEl = element;
        this.positionDropdown();
      },
      onChange: (value: string | string[]) => {
        this.value = Array.isArray(value) ? value[0] || "" : (value || "");
      },
    };
    this.tomSelect = new TomSelect(this.selectEl, tomOptions);
    this.tsWrapper = this.querySelector('.ts-wrapper') as HTMLElement;
    if (this.readonly) {
      this.tomSelect.disable();
    }
    if (this.dataManager) {
      if (this.dataManager.type === "offline") {
        this.refreshOptions();
      } else if (this.dataManager.type === "ondemand") {
        this.setupAjaxLoad();
      }

      this.subscriptionId = this.dataManager.hooks.subscribe({
        hook: AC_DATA_MANAGER_HOOK.DataChange,
        callback: () => {
          if (this.dataManager.type === "offline") {
            this.refreshOptions();
          }
        }
      });
    }
    if (this.value) {
      this.tomSelect.setValue(this.value, false);
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

  override focus(options?: FocusOptions): void {
    this.tomSelect.focus();
  }

  private positionDropdown() {
    const rect = this.tsWrapper.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let currentHeight = parseFloat(this.dropdownEl.style.height) || this.dropdownEl.getBoundingClientRect().height;
    if (!currentHeight || currentHeight < 50) {
      currentHeight = 250;
    }

    const showAbove = spaceBelow < currentHeight && spaceAbove > spaceBelow;

    if (!this.dropdownEl.style.width) {
      this.dropdownEl.style.width = rect.width + "px";
    }
    this.dropdownEl.style.position = 'fixed';
    this.dropdownEl.style.left = rect.left + "px";
    this.dropdownEl.style.top = showAbove ? (rect.top - currentHeight) + "px" : rect.bottom + "px";
    this.dropdownEl.style.height = currentHeight + "px";
    this.dropdownEl.style.overflowY = "auto";
    this.dropdownEl.style.border = "1px solid #ccc";
    this.dropdownEl.style.background = "#fff";

    let handle = this.dropdownEl.querySelector('.ts-resize-handle') as HTMLElement;
    if (!handle) {
      handle = this.ownerDocument.createElement('div');
      handle.className = 'ts-resize-handle';
      handle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        cursor: se-resize;
        background: linear-gradient(135deg, transparent 50%, #888 50%);
        z-index: 10000;
      `;
      this.dropdownEl.appendChild(handle);

      handle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = this.dropdownEl.getBoundingClientRect().width;
        const startHeight = this.dropdownEl.getBoundingClientRect().height;

        const onMouseMove = (moveEvent: MouseEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;

          const newWidth = Math.max(150, startWidth + deltaX);
          const newHeight = Math.max(100, startHeight + deltaY);

          this.dropdownEl.style.width = newWidth + 'px';
          this.dropdownEl.style.height = newHeight + 'px';

          this.dispatchEvent(new CustomEvent('dropdown-resize', {
            detail: { width: newWidth, height: newHeight },
            bubbles: true,
            composed: true
          }));

          if (showAbove) {
            this.dropdownEl.style.top = (rect.top - newHeight) + 'px';
          }
        };

        const onMouseUp = () => {
          this.ownerDocument.removeEventListener('mousemove', onMouseMove);
          this.ownerDocument.removeEventListener('mouseup', onMouseUp);
        };

        this.ownerDocument.addEventListener('mousemove', onMouseMove);
        this.ownerDocument.addEventListener('mouseup', onMouseUp);
      });
    }
  }

  refresh(): void {
    this.refreshOptions();
  }

  private refreshOptions(): void {
    if (!this.dataManager || this.dataManager.type !== "offline" || !this.tomSelect) return;
    const options = this.dataManager.data.map((d: any) => ({
      value: d[this.valueKey],
      text: d[this.labelKey],
    }));
    this.tomSelect.clearOptions();
    this.tomSelect.addOptions(options);

    const currentValue = this.tomSelect.getValue();
    if (this.value && (!currentValue || currentValue !== this.value)) {
      this.tomSelect.setValue(this.value, false);
    }
  }

  private setupAjaxLoad(): void {
    if (!this.dataManager || !this.tomSelect) return;
    const self = this;
    (this.tomSelect as any).settings.load = async function (query: string, callback: (options: { value: string; text: string }[]) => void) {
      if (!query || query.length < 2) return callback([]);
      const oldSearch = self.dataManager!.searchQuery;
      self.dataManager!.searchQuery = query;
      try {
        const data = await self.dataManager!.getData({ startIndex: 0, rowsCount: 50 });
        const options = data.map((d: any) => ({
          value: d[self.valueKey],
          text: d[self.labelKey],
        }));
        callback(options);
      } catch (error) {
        console.error("Error loading options:", error);
        callback([]);
      } finally {
        self.dataManager!.searchQuery = oldSearch;
      }
    };
    (this.tomSelect as any).settings.loadFilter = (query: string) => !!query;
    (this.tomSelect as any).settings.loadThrottle = 300;
  }
}

acRegisterCustomElement({ tag: "ac-tomselect-input", type: AcTomSelectInput });
