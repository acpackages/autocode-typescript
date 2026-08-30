/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDataManager, AC_DATA_MANAGER_EVENT } from "@autocode-ts/autocode";
import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcEnumPaginationEvent, AcPaginationCssClassName, acPaginationElementHtml, acPaginationTags } from "../_ac-pagination.export";
import { IAcPaginationPageChangeEvent, IAcPaginationPageSizeChangeEvent } from "../interfaces/_interfaces.export";
import { AcPaginationNavigationButtonsElement } from "./ac-pagination-navigation-buttons.element";
import { AcPaginationSizeDropdownElement } from "./ac-pagination-size-dropdown.element";

export class AcPaginationElement extends AcElementBase {
  private _activePage: number = 0;
  get activePage(): number {
    return this._activePage;
  }
  set activePage(value: number) {
    if (value != this._activePage) {
      const previousActivePage: number = this._activePage;
      this._activePage = value;
      this.updateDisplayedRows();
      const eventParams: IAcPaginationPageChangeEvent = {
        totalPages: this.totalPages,
        activePage: this.activePage,
        previousActivePage: previousActivePage,
        startRow: this.startRow,
        endRow: this.endRow,
        pagination: this
      };
      this.events.execute({ event: AcEnumPaginationEvent.PageChange, args: eventParams });
    }
  }

  private _activePageSize: number = 50;
  get activePageSize(): number {
    return this._activePageSize;
  }
  set activePageSize(value: number) {
    if (value != this._activePageSize) {
      const previousPageSize: number = this._activePageSize;
      this._activePageSize = value;
      const eventParams: IAcPaginationPageSizeChangeEvent = {
        previousPageSize: previousPageSize,
        pageSize: value,
        pagination: this
      };
      this.events.execute({ event: AcEnumPaginationEvent.PageSizeChange, args: eventParams });
      const newPageNo = Math.ceil((this.startRow) / value);
      if (newPageNo != this.activePage) {
        this.activePage = newPageNo;
      }
      else {
        if (this.dataManager) {
          this.updateDisplayedRows();
        }
      }
    }
  }

  private dataManager?: AcDataManager;

  private _showAddButton: boolean = false;
  get showAddButton(): boolean {
    return this._showAddButton;
  }
  set showAddButton(value: boolean) {
    if (value != this._showAddButton) {
      this._showAddButton = value;
      this.handleShowAddButton();
    }
  }

  private _totalRows: number = 0;
  get totalRows(): number {
    return this._totalRows;
  }
  set totalRows(value: number) {
    if (value != this._totalRows) {
      this._totalRows = value;
      this.updateDisplayedRows();
    }
  }
  navigationButtons: AcPaginationNavigationButtonsElement = new AcPaginationNavigationButtonsElement();
  sizeDropdown: AcPaginationSizeDropdownElement = new AcPaginationSizeDropdownElement();

  addButton?: HTMLButtonElement;
  endRow: number = 0;
  pageSizes: number[] = [5, 20, 50, 100];
  startRow: number = 0;
  totalPages: number = 1;
  leftContainer?:HTMLElement;
  rightContainer?:HTMLElement;

  bindDataManager({ dataManager }: { dataManager: AcDataManager }) {
    this.dataManager = dataManager;
    dataManager.on({
      event: AC_DATA_MANAGER_EVENT.TotalRowsChange, callback: () => {
        this.totalRows = dataManager.totalRows;
      }
    });
    dataManager.on({
      event: AC_DATA_MANAGER_EVENT.OnDemandFunctionSet, callback: () => {
        this.dataManager.getRows({ startIndex: this.startRow - 1, rowsCount: this.activePageSize });
      }
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.leftContainer.append(this.navigationButtons);
    this.leftContainer.append(this.sizeDropdown);
    this.handleShowAddButton();
  }

  override destroy(): void {
    super.destroy();
  }


  override init() {
    super.init();
    this.navigationButtons.pagination = this;
    this.sizeDropdown.pagination = this;
    acAddClassToElement({ class_: AcPaginationCssClassName.acPagination, element: this });
    acAddClassToElement({ class_: 'ac-res-container', element: this });
    acClearElement({ element: this });
    this.innerHTML = '<div class="ac-pagination-left-container"></div><div class="ac-pagination-right-container"></div>';
    this.leftContainer = this.querySelector(".ac-pagination-left-container");
    this.rightContainer = this.querySelector(".ac-pagination-right-container");
  }

  private handleShowAddButton() {
    if (this.showAddButton) {
      if (!this.addButton) {
        this.addButton = this.ownerDocument.createElement('button');
        this.addButton.setAttribute('type', 'button');
        this.addButton.setAttribute('class','ac-pagination-add-btn');
        this.addButton.innerHTML = acPaginationElementHtml.add;
        this.addButton.addEventListener('click',()=>{
          this.dispatchEvent(new CustomEvent('add'));
        });
        this.leftContainer.append(this.addButton);
      }
    }
    else{
       if (!this.addButton) {
        this.addButton.remove();
        this.addButton = null;
       }
    }


  }

  updateDisplayedRows() {
    const oldStart = this.startRow;
    const oldEnd = this.endRow;
    const oldTotal = this.totalPages;
    if (this.totalRows > 0) {
      if (this.activePage == 0) {
        this._activePage = 1;
      }
      this.startRow = (this.activePageSize * (this.activePage - 1)) + 1;
      this.endRow = (this.startRow + this.activePageSize) - 1;
      if (this.endRow > this.totalRows) {
        this.endRow = this.totalRows;
      }
      this.totalPages = Math.ceil(this.totalRows / this.activePageSize);
    }
    else {
      this.startRow = this.endRow = this.totalPages = this._activePage = 0;
    }
    if (this.startRow != oldStart || this.endRow != oldEnd || this.totalPages != oldTotal) {
      if (this.dataManager && !this.dataManager.isWorking) {
        if (this.dataManager.type == 'ondemand') {
          this.dataManager.getData({ startIndex: this.startRow - 1, rowsCount: this.activePageSize }).then((res: any) => {
            this.dataManager.setDisplayedRows({ startIndex: this.startRow - 1, rowsCount: this.activePageSize });
          });
        }
        else {
          this.dataManager.setDisplayedRows({ startIndex: this.startRow - 1, rowsCount: this.activePageSize });
        }
      }
    }
    if (this.navigationButtons) {
      this.navigationButtons.render();
    }
  }

}

acRegisterCustomElement({ tag: acPaginationTags.pagination, type: AcPaginationElement });
