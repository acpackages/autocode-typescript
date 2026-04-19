/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcInputBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import TomSelect from "tom-select";
import TomSelectOptions from "tom-select";
import { AcDataManager, AC_DATA_MANAGER_HOOK } from "@autocode-ts/autocode";

export class AcTomSelectInput extends AcInputBase {
  static override get observedAttributes() {
    return [...super.observedAttributes, "placeholder", "readonly", "label-key", "value-key"];
  }

  override get inputReflectedAttributes() {
    return [...super.inputReflectedAttributes, "placeholder", "readonly", "label-key", "value-key"];
  }

  override get placeholder(): string | null {
    return this.getAttribute("placeholder");
  }
  override set placeholder(value: string | null) {
    if (value) {
      this.setAttribute("placeholder", value);
      if (this.tomSelect) {
        (this.tomSelect as any).settings.placeholder = value;
        // this.tomSelect.updatePlaceholder();
      }
    } else {
      this.removeAttribute("placeholder");
      if (this.tomSelect) {
        (this.tomSelect as any).settings.placeholder = "";
        // this.tomSelect.updatePlaceholder();
      }
    }
  }

  private _options: any[] = [];
  get options(): any[] {
    return this._options;
  }
  set options(value: any[]) {
    this._options = value;
    this.dataManager.data = value;
  }

  get readOnly(): boolean {
    return this.hasAttribute("readonly");
  }
  set readOnly(value: boolean) {
    if (value) {
      this.setAttribute("readonly", "");
      if (this.tomSelect) this.tomSelect.disable();
    } else {
      this.removeAttribute("readonly");
      if (this.tomSelect) this.tomSelect.enable();
    }
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
  private tsWrapper!:HTMLElement;
  private subscriptionId?: string;

  override get value(): string {
    return super.value;
  }

  override set value(val: string) {
    if (this._value != val) {
      super.value = val;
      if (this.tomSelect) {
        this.tomSelect.setValue(val, false); // Don't trigger change event
      }
    }
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;

    if (name === "placeholder") {
      this.placeholder = newValue;
    } else if (name === "readonly") {
      this.readOnly = newValue !== null;
    } else if (name === "label-key") {
      this.labelKey = newValue;
    } else if (name === "value-key") {
      this.valueKey = newValue;
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
      onDropdownOpen:(element:HTMLElement)=>{
        this.dropdownEl = element;
        this.positionDropdown();
      },
      onChange: (value: string | string[]) => {
        // Assume single select; adjust for multiple if needed
        this.value = Array.isArray(value) ? value[0] || "" : (value || "");
      },
    };
    this.tomSelect = new TomSelect(this.selectEl, tomOptions);
    this.tsWrapper = this.querySelector('.ts-wrapper') as HTMLElement;
    if (this.readOnly) {
      this.tomSelect.disable();
    }
    if (this.dataManager) {
      if (this.dataManager.type === "offline") {
        this.refreshOptions();
      } else if (this.dataManager.type === "ondemand") {
        this.setupAjaxLoad();
      }
      // TODO: Subscribe to hooks as noted above
    }
    if (this.value) {
      this.tomSelect.setValue(this.value, false);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.subscriptionId && this.dataManager) {
      // TODO: Unsubscribe
      // this.dataManager.hooks.off({ subscriptionId: this.subscriptionId });
    }
  }

  override focus(options?: FocusOptions): void {
    this.tomSelect.focus();
    // this.tomSelect.open();
  }

  private positionDropdown() {
      const rect = this.tsWrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = this.dropdownEl.getBoundingClientRect().height;
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      this.dropdownEl.style.width = rect.width + "px";
      this.dropdownEl.style.position = 'fixed';
      this.dropdownEl.style.left = rect.left + "px";
      this.dropdownEl.style.top = showAbove ? (rect.top - dropdownHeight) + "px" : rect.bottom + "px";
      this.dropdownEl.style.overflowY = "auto";
      this.dropdownEl.style.border = "1px solid #ccc";
      this.dropdownEl.style.background = "#fff";
  }
  // Public method to manually refresh options (e.g., after setting dataManager.data for offline)
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
    // Re-apply value if it exists and isn't already set
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
        const data = await self.dataManager!.getData({ startIndex: 0, rowsCount: 50 }); // Limit results for search
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
    // TomSelect will reinitialize the load behavior automatically
  }
}

acRegisterCustomElement({ tag: "ac-tomselect-input", type: AcTomSelectInput });
