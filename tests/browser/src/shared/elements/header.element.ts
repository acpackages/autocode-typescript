/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { IAppMenuItem } from '../interfaces/app-menu-item.interface';
import { acElementHasParentTag, AcModal } from '@autocode-ts/ac-browser';
import { AcElement, AcInput, AcOutput, AcViewChild, IAcOnInit } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'app-header',
  template: `
    <div class="py-1 px-2" #headerContainer>
  <div class="header-row">
    <div class="">
      <div class="title-container">
        <ac-container ac:if="titleTemplate">
          <ac-container ac:template:outlet="titleTemplate"></ac-container>
        </ac-container>
        <h5 class="mb-0 pt-0" ac:if="title">{{title}}</h5>
      </div>
    </div>
    <div class="">
      <div class="float-end d-flex gap-1">
        <span ac:if="showSearchInput">
          <ac-input #searchInput class="form-control form-control-sm" [attr.placeholder]="searchLabel" (change)="handleSearchChange(searchInput)"/>
        </span>
        <button type="button" class="btn btn-sm btn-dark py-1" ac:if="showAddButton" (click)="handleAddClick()">
          <ac-svg-icon ac:bind:svg-code='ACI_SVG_SOLID.plus'></ac-svg-icon>
          <span class="ps-1" ac:if="addLabel">{{addLabel}}</span>
        </button>
        <ac-container ac:if="actionsTemplate">
          <ac-container ac:template:outlet="actionsTemplate"></ac-container>
        </ac-container>
        <div class="dropdown" ac:class:d-none="!dropdownItems || dropdownItems.length == 0">
          <button type="button" class="btn btn-sm btn-dark py-1 dropdown-toggle"  data-coreui-toggle="dropdown">
            <ac-svg-icon ac:bind:svg-code="ACI_SVG_SOLID.ellipsisVertical"></ac-svg-icon>
          </button>
          <ul class="dropdown-menu pt-0 w-auto">
            <ac-container ac:for="let item of dropdownItems">
              <li class="py-0" (click)="handleDropdownItemClick(item)">
                <hr class="my-0" role="menuitem" tabindex="-1" ac:if="item.isDivider == true" />
                <a class="dropdown-header px-2" role="menuitem" tabindex="-1" ac:if="item.isHeader == true"> {{item.label}}</a>
                <a class="dropdown-item" role="menuitem" tabindex="-1" ac:if="item.isHeader != true && item.isDivider != true"> {{item.label}}</a>
              </li>
            </ac-container>
          </ul>
        </div>
        <button type="button" class="btn px-2" style="" (click)="handleCloseClick()" ac:if="isModal">
          <ac-svg-icon ac:bind:svg-code="ACI_SVG_SOLID.xmark"></ac-svg-icon>
        </button>
      </div>
    </div>
  </div>
  <app-info-display>
    <p class="mb-0" ac:if="description" [innerHTML]="description"></p>
  </app-info-display>
</div>
<hr class="my-0">
    `,
  styles: [`
    .title-container {
  display: flex;
  height: -webkit-fill-available;
  flex-direction: column;
  justify-content: center;
}
.header-row{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.dropdown-item{
  cursor: pointer;
}
.dropdown-header{
  background:#333;
  color:white;
  text-decoration:none;
}

.dropdown-toggle::after{
  display: none;
}`
  ]
})
export class AppHeaderElement implements IAcOnInit {
  @AcViewChild('headerContainer') headerContainer?: HTMLElement;
  @AcInput() actionsTemplate?: any;
  @AcInput() addLabel: string = "";
  @AcInput() dropdownItems: IAppMenuItem[] = [];
  @AcInput() searchLabel: string = "Search Records...";
  @AcInput() showAddButton: boolean = false;
  @AcInput() showSearchInput: boolean = false;
  @AcInput() title: string = "";
  @AcInput() titleTemplate?: any;
  @AcInput() description: string = "";

  ACI_SVG_SOLID = ACI_SVG_SOLID;
  element!: HTMLElement;
  isModal: boolean = false;

  acOnInit(): void {
    this.checkInModal();
  }

  private checkInModal() {
    if (this.element && this.element.isConnected) {
      this.isModal = acElementHasParentTag({ element: this.element, tag: 'ac-modal' });
    }
    else {
      setTimeout(() => {
        this.checkInModal();
      }, 50);
    }
  }

  handleCloseClick() {
    const modal: AcModal | undefined = this.element.closest('ac-modal') as AcModal;
    if (modal) {
      modal.close();
    }
  }

  handleDropdownItemClick(item: IAppMenuItem) {
    if (item.callback) {
      item.callback();
    }
  }
}
