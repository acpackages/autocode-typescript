/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcInputBase } from "../core/ac-input-base";
import { AC_INPUT_TAG } from "../consts/ac-input-tags.const";
import { acClearElement, acCloneEvent, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_EVENT, AcDatagrid, IAcDatagridCell } from "../../_components.export";
import { AcEnumConditionOperator, AcFilterGroup, IAcOnDemandRequestArgs, IAcOnDemandResponseArgs } from "@autocode-ts/autocode";
import { createPopper, Instance as PopperInstance, Placement } from '@popperjs/core';

export class AcDatagridSelectInputElement extends AcInputBase {
  static override get observedAttributes() {
    return [... super.observedAttributes, 'value-key'];
  }

  get addRow(): boolean {
    return this.getAttribute('add-row') ? this.getAttribute('add-row') == 'true' : true;
  }
  set addRow(value: boolean) {
    this.setAttribute('add-row', `${value}`);
    if(value){
      this.addNewButton.style.display = '';
    }
    else{
      this.addNewButton.style.display = 'none';
    }
  }

  get columnDefinitions(): any {
    return this.datagrid.datagridApi.columnDefinitions;
  }
  set columnDefinitions(value: any) {
    this.datagrid.datagridApi.columnDefinitions = value;
  }

  get data(): any[] {
    return this.datagrid.datagridApi.data;
  }
  set data(value: any[]) {
    this.datagrid.datagridApi.data = value;
  }

  get labelKey(): string {
    return this.getAttribute('label-key')!;
  }
  set labelKey(value: string) {
    this.setAttribute('label-key', value);
    if (this._value) {
      this.value = this._value;
    }
  }

  get onDemandFunction(): any {
    if (this.data) {
      return this.datagrid.datagridApi.dataManager.onDemandFunction;
    }
    return undefined;
  };
  set onDemandFunction(value: (args: IAcOnDemandRequestArgs) => void) {
    this.datagrid.datagridApi.dataManager.onDemandFunction = value;
    this.datagrid.datagridApi.dataManager.getData();
  }

  get valueKey(): string {
    return this.getAttribute('value-key')!;
  }
  set valueKey(value: string) {
    this.setAttribute('value-key', value);
    if (this._value) {
      this.value = this._value;
    }
  }

  override get placeholder(): string | null {
    return this.textInputElement.getAttribute('placeholder');
  }
  override set placeholder(value: string) {
    if (value != '') {
      this.textInputElement.setAttribute('placeholder', value);
    }
    else {
      this.textInputElement.removeAttribute(value);
    }
  }

  override get value() { return super.value; }
  override set value(val: any) {
    if (this._value != val) {
      super.value = val;
      this.setSelectedRowsFromValue();
    }

  }

  private _searchQuery: string = '';
  get searchQuery(): string { return this._searchQuery; }
  set searchQuery(val: string) {
    val = val.trim();
    this._searchQuery = val;
    this.addNewButton.textContent = `Add "${this.textInputElement.value}"`;
    if (this.datagrid) {
      this.datagrid.afterRowsContainer.style.visibility = 'hidden';
      this.datagrid.datagridApi.dataManager.searchQuery = val;
      const event: CustomEvent = new CustomEvent('searchQueryChange', { detail: { searchQuery: this.searchQuery } });
      this.dispatchEvent(event);
      this.delayedCallback.add({callback:() => {
        if(val){
          this.datagrid.afterRowsContainer.style.visibility = '';
        }
        this.highlightRow();
        this.textInputElement.focus();
      }, duration:100});
    }
  }

  private dropdownContainer!: HTMLDivElement;
  private isDropdownOpen = false;
  private popper!: PopperInstance | null;
  private addNewButton:HTMLButtonElement|any;
  textInputElement: HTMLInputElement = this.ownerDocument.createElement('input');
  addNewContainer: HTMLElement = this.ownerDocument.createElement('div');
  datagrid: AcDatagrid = new AcDatagrid();
  private clickOutsideListener?: any = (event: Event) => {
    const target = event.target as HTMLElement;
    if (this.textInputElement && !this.textInputElement.contains(target) && this.dropdownContainer && !this.dropdownContainer.contains(target)) {
      if (!this.isFocused) {
          this.closeDropdown();
        }
    }
  };
  private visibilityObserver?: IntersectionObserver | null;
  private resizeObserver?: ResizeObserver | null;
  selectedRows: any[] = [];
  previousState: any = {};
  dropdownSize: { height: number, width: number } = { height: 300, width: 600 };
  isFocused: boolean = false;
  addRowCallback: (({ query, callback }: { query: string, callback: Function }) => void) = ({ query, callback }: { query: string, callback: Function }): void => {
    const newOption = { [this.labelKey]: query, [this.valueKey]: query };
    callback(newOption);
  };

  private addNewOption(label: string) {
    this.addRowCallback({
      query: label, callback: (option: any) => {
        const row = this.datagrid.datagridApi.dataManager.addRow({ data: option });
        this.datagrid.datagridApi.focusRow({index:row.index});
      }
    });
  }

  private attachEvents() {
    this.addNewButton.addEventListener("click", (e:any) => {
      e.preventDefault();
      this.addNewOption(this.textInputElement.value);
    });
    this.addNewButton.addEventListener("keydown", (e: any) => {
      if (e.key === "ArrowUp") {
        if(this.datagrid.datagridApi.dataManager.totalRows == 0){
          this.textInputElement.focus();
          return;
        }
        else{
          const activeDatagridCell = this.datagrid.datagridApi.activeDatagridCell;
          if(activeDatagridCell){
            this.highlightRow({rowIndex:activeDatagridCell.datagridRow.index});
          }
        }
      }
    });
    this.textInputElement.addEventListener("input", (event) => {
      this.dispatchEvent(acCloneEvent(event));
      this.delayedCallback.add({callback:() => {
        const term = this.textInputElement.value.toLowerCase();
        if (term != this.searchQuery) {
          this.searchQuery = term;
        }
      }, duration:100,key:'searchInputTimeout'});

      this.openDropdown();
    });
    this.textInputElement.addEventListener("focus", (event: any) => {
      this.dispatchEvent(acCloneEvent(event));
      this.openDropdown();
    });
    this.textInputElement.addEventListener("blur", (event: any) => {
      this.dispatchEvent(acCloneEvent(event));
      this.delayedCallback.add({callback:()=>{
        if(!this.dropdownContainer.contains(this.ownerDocument.activeElement) && this.ownerDocument.activeElement != this.textInputElement){
          this.closeDropdown();
        }
      },duration:50,key:'inputBlurCloseDropdown'})
    });
    this.textInputElement.addEventListener("click", (event) => {
      this.dispatchEvent(acCloneEvent(event));
      this.delayedCallback.add({callback:() => this.openDropdown(), duration:150});
    });
    this.textInputElement.addEventListener("keydown", (e: any) => {
      this.dispatchEvent(acCloneEvent(e));
      if (!this.isDropdownOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if(this.datagrid.datagridApi.dataManager.totalRows == 0){
          this.addNewButton.focus();
          console.log("Focusing on add ne button");
          return;
        }
        let rowIndex: number = 0;
        const activeDatagridCell = this.datagrid.datagridApi.activeDatagridCell;
        if (activeDatagridCell) {
          rowIndex = activeDatagridCell.datagridRow.index + 1;
          if(activeDatagridCell.datagridRow.isLast){
            this.addNewButton.focus();
            return;
          }
        }
        this.highlightRow({ rowIndex });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        let rowIndex: number = 0;
        const activeDatagridCell = this.datagrid.datagridApi.activeDatagridCell;
        if (activeDatagridCell) {
          rowIndex = activeDatagridCell.datagridRow.index - 1;
        }
        this.highlightRow({ rowIndex });
      }
      else if (e.key === "Enter") {
        e.preventDefault();
        this.setValueFromDatagridData();
        this.closeDropdown();
      } else if (e.key === "Escape" || e.key === "Tab") {
        this.closeDropdown();
      }
    });
    this.datagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.CellClick, callback: (args: any) => {
        const datagridCell: IAcDatagridCell = args['datagridCell'];
        if (datagridCell) {
          this.setSelectedRows({ rows: [datagridCell.datagridRow.data] });
          this.closeDropdown();
        }
      }
    });
    this.datagrid.datagridApi.on({
      event: AC_DATAGRID_EVENT.StateChange, callback: (args: any) => {
        if (this.isDropdownOpen) {
          this.notifyState();
        }
      }
    });
  }

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    if (name == 'value-key') {
      this.valueKey = newValue;
    }
    if (name == 'class') {
      this.textInputElement.setAttribute('class', newValue);
    }
    else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  override blur(): void {
    super.blur();
    this.isFocused = false;
  }

  override disconnectedCallback(): void {
    this.closeDropdown();
  }

  closeDropdown() {
    this.dropdownContainer.remove();
    this.isDropdownOpen = false;
    this.popper?.destroy();
    this.popper = null;
    if (this.resizeObserver) {
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
    }
    if (this.visibilityObserver) {
      this.visibilityObserver?.disconnect();
      this.visibilityObserver = null;
    }
    this.ownerDocument.body.removeEventListener('click', this.clickOutsideListener);
    const event: CustomEvent = new CustomEvent('dropdownClose', {});
    this.dispatchEvent(event);
  }

  override destroy(): void {
    this.closeDropdown();
    if (this.datagrid) {
      this.datagrid.destroy();
    }
    super.destroy();
  }

  override focus(): void {
    super.focus();
    this.isFocused = true;
    this.textInputElement.focus();
  }

  getState() {
    if(!this.datagrid || !this.datagrid.datagridApi){
      return null;
    }
    const state = {
      datagridState: this.datagrid.datagridApi.getState(),
      dropdownSize: this.dropdownSize
    };
    return state;
  }

  highlightRow({ rowIndex = 0, focusInput = true }: { rowIndex?: number, focusInput?: boolean } = {}) {
    this.datagrid.datagridApi.setActiveCell({ rowIndex: rowIndex, key: this.labelKey });
    if (focusInput) {
      this.textInputElement.focus();
    }
  }

  override init() {
    super.init();
    acClearElement({element:this.addNewContainer});
    this.addNewContainer.innerHTML = `<div><button type="button">Add New Row</button></div>`;
    this.addNewButton = this.addNewContainer.querySelector('button');
    this.addNewButton.style.padding = "4px 8px";
    this.addNewButton.style.cursor = "pointer";
    this.addNewButton.style.color = "#0078d7";
    this.addNewButton.style.fontStyle = "italic";
    this.addNewButton.textContent = `Add "${this.searchQuery}"`;
    this.datagrid.datagridApi.dataManager.refreshRowsTimeoutDuration = 300;
    this.datagrid.afterRowsContainer.append(this.addNewContainer);
    if (!this.hasAttribute('label-key')) {
      this.labelKey = 'label';
    }
    if (!this.hasAttribute('value-key')) {
      this.valueKey = 'value';
    }
    acClearElement({element:this});
    this.append(this.textInputElement);
    this.textInputElement.type = "text";
    this.textInputElement.autocomplete = "off";
    this.attachEvents();
    this.addRow = this.getAttribute('add-row') != 'false';
  }

  private notifyState() {
    if(!this.datagrid || !this.datagrid.datagridApi){
      return;
    }
    const currentState = this.getState();
    const currentStateJson = JSON.stringify(currentState)
    if (this.previousState != currentStateJson) {
      this.previousState = currentStateJson;
      const event: CustomEvent = new CustomEvent('stateChange', { detail: { state: currentState } });
      this.dispatchEvent(event);
    }
  }

  openDropdown() {
    if (this.isDropdownOpen && this.isConnected) return;
    this.isDropdownOpen = true;
    this.dropdownContainer = this.ownerDocument.createElement("div");
    this.dropdownContainer.classList.add('ac-datagrid-select-dropdown');
    this.dropdownContainer.innerHTML = `
      <div class="dropdown-header" style=""></div>
      <div class="dropdown-body" style="flex-grow:1;overflow:auto"></div>
      <div class="dropdown-footer" style=""></div>
    `;
    const createEvent: CustomEvent = new CustomEvent('dropdownCreate', { detail: { dropdownContainer: this.dropdownContainer } });
    this.dispatchEvent(createEvent);
    (this.dropdownContainer.querySelector('.dropdown-body') as HTMLElement).append(this.datagrid);
    this.ownerDocument.body.append(this.dropdownContainer);
    Object.assign(this.dropdownContainer.style, {
      height: `${this.dropdownSize.height}px`,
      width: `${this.dropdownSize.width}px`,
      border: "1px solid #ccc",
      background: "#fff",
      boxSizing: "border-box",
      resize: 'both',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9999999999
    });
    this.popper = createPopper(this.textInputElement, this.dropdownContainer, {
      placement: 'bottom-start' as Placement,
      strategy: 'fixed',
      modifiers: [
        { name: 'offset', options: { offset: [0, 8] } },
        { name: 'flip', options: { fallbackPlacements: ['top-start', 'bottom-start'] } },
        { name: 'preventOverflow', options: { boundary: 'clippingParents' } },
      ],
    });

    this.delayedCallback.add({callback:() => this.popper?.update(), duration:0});

    this.resizeObserver = new ResizeObserver(entries => {
      const rect = (entries[0].target as HTMLElement).getBoundingClientRect();
      this.dropdownSize.width = rect.width;
      this.dropdownSize.height = rect.height;
      this.popper?.update();
      this.delayedCallback.add({callback:() => {
        const resizeEvent: CustomEvent = new CustomEvent('dropdownResize', { detail: { dropdownSize: this.dropdownSize } });
        this.dispatchEvent(resizeEvent);
        this.notifyState();
      }, duration:300,key:'resizeCallback'});
    });

    this.resizeObserver.observe(this.dropdownContainer);
    this.delayedCallback.add({callback:() => {
      this.ownerDocument.addEventListener('click', this.clickOutsideListener);
    }, duration:50,key:'outsideClickListerner'});

    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && this.isDropdownOpen) this.closeDropdown();
    });
    this.visibilityObserver.observe(this.textInputElement);
    this.popper?.update();
    this.datagrid.datagridApi.dataManager.getData();
    const event: CustomEvent = new CustomEvent('dropdownOpen', {});
    this.dispatchEvent(event);
    this.delayedCallback.add({callback:() => {
      this.textInputElement.focus();
    }, duration:0});
  }

  private setSelectedRows({ rows }: { rows: any[] }) {
    this.selectedRows = rows;
    if (rows.length > 0) {
      this.textInputElement.value = rows[0][this.labelKey];
      this.value = rows[0][this.valueKey];
    }
    else {
      if (this.value) {
        this.textInputElement.value = this.value;
      }
      else {
        this.textInputElement.value = '';
      }
    }
  }

  private async setSelectedRowsFromValue(): Promise<void> {
    if (!this.value) return;
    if(!this.datagrid || !this.datagrid.datagridApi){
      return;
    }

    let retry = false;
    let continueOperation = true;

    const finalize = () => {
      if (continueOperation) {
        this.setSelectedRows({ rows: [] });
      } else {
        const activeCell =
          this.datagrid.datagridApi.setActiveCell({
            key: this.valueKey,
            value: this.value
          });

        if (activeCell) {
          this.datagrid.datagridApi.ensureRowVisible({
            rowId: activeCell.datagridRow.rowId
          });
        }
      }
      if (this.isDropdownOpen) {
        this.textInputElement.focus();
      }
    };

    // 🔹 Already selected?
    if (
      this.selectedRows.length > 0 &&
      this.selectedRows[0][this.valueKey] === this.value
    ) {
      continueOperation = false;
      finalize();
      return;
    }

    if (!this.datagrid) return;

    retry = !this.datagrid.datagridApi.dataManager.isFirstRowsSet;
    if (retry) {
      this.delayedCallback.add({callback:() => this.setSelectedRowsFromValue(), duration:1});
      return;
    }

    // 🔹 Search in existing rows
    const valueRow =
      this.datagrid.datagridApi.dataManager.allRows.find(
        row => row.data[this.valueKey] === this.value
      );

    if (valueRow) {
      this.setSelectedRows({ rows: [valueRow.data] });
      continueOperation = false;
      finalize();
      return;
    }

    // 🔹 On-demand fetch (awaited)
    if (this.onDemandFunction) {
      const filterGroup = new AcFilterGroup();
      filterGroup.addFilter({
        key: this.valueKey,
        operator: AcEnumConditionOperator.EqualTo,
        value: this.value
      });

      const response = await new Promise<IAcOnDemandResponseArgs>(
        (resolve) => {
          this.onDemandFunction({
            filterGroup,
            successCallback: resolve
          });
        }
      );

      if (response.totalCount > 0) {
        continueOperation = false;

        this.datagrid.datagridApi.dataManager.reset();
        const datagridRow =
          this.datagrid.datagridApi.addRow({
            data: response.data[0]
          });

        this.setSelectedRows({ rows: [datagridRow.data] });
      }
    }

    finalize();
  }

  setState({ state }: { state: any }) {
    if(!this.datagrid || !this.datagrid.datagridApi){
      return;
    }
    if (state.dropdownSize) {
      this.dropdownSize = state.dropdownSize;
    }
    if (state.datagridState) {
      this.datagrid.datagridApi.setState({ state: state.datagridState });
    }
  }

  setValueFromDatagridData() {
    if(!this.datagrid || !this.datagrid.datagridApi){
      return;
    }
    const activeDatagridCell = this.datagrid.datagridApi.activeDatagridCell;
    if (activeDatagridCell) {
      this.setSelectedRows({ rows: [activeDatagridCell.datagridRow.data] });
      this.value = activeDatagridCell.datagridRow.data[this.valueKey];
    }
    else {
      this.setSelectedRows({ rows: [] });
      this.value = null;
    }
  }

  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
    else {
      this.openDropdown();
    }
  }
}

acRegisterCustomElement({ tag: AC_INPUT_TAG.datagridSelectInput, type: AcDatagridSelectInputElement });
