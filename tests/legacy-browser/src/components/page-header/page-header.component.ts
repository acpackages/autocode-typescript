/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement } from "@autocode-ts/ac-browser";
import { Autocode } from "@autocode-ts/autocode";

export interface IMenuItem {
  label: string;
  class?:string;
  callback?: Function;
  url?: string;
  children?: IMenuItem[]
};

export class PageHeader {
  private _pageTitle: string = '';
  get pageTitle(): string {
    return this._pageTitle;
  }
  set pageTitle(value: string) {
    this._pageTitle = value;
    this.pageTitleElement.innerHTML = this._pageTitle;
  }

  private _menuItems: IMenuItem[] = [];
  get menuItems(): IMenuItem[] {
    return this._menuItems;
  }
  set menuItems(value: IMenuItem[]) {
    this._menuItems = value;
    this.renderMenuItems();
  }

  backButtonElement: HTMLElement = document.createElement('button');
  element: HTMLElement = document.createElement('nav');
  navBarMenuElement: HTMLElement = document.createElement('div');
  navBarMenuToggleElement: HTMLElement = document.createElement('button');
  pageTitleElement: HTMLElement = document.createElement('div');


  constructor() {
    acAddClassToElement({ class_: 'navbar navbar-expand-lg navbar-light bg-light', element: this.element });

    acAddClassToElement({ class_: 'navbar-brand ps-1', element: this.pageTitleElement });
    this.element.append(this.pageTitleElement);

    acAddClassToElement({ class_: 'navbar-toggler', element: this.navBarMenuToggleElement });
    this.navBarMenuToggleElement.setAttribute('type', 'button');
    this.navBarMenuToggleElement.setAttribute('data-toggle', 'collapse');
    this.navBarMenuToggleElement.setAttribute('data-target', '#navbarSupportedContent');
    this.navBarMenuToggleElement.innerHTML = '<span class="navbar-toggler-icon"></span>';
    this.element.append(this.navBarMenuToggleElement);

    acAddClassToElement({ class_: 'collapse navbar-collapse', element: this.navBarMenuElement });
    this.navBarMenuElement.setAttribute('id', 'navbarSupportedContent');
    this.element.append(this.navBarMenuElement);
  }

  addMenuItem(menuItem: IMenuItem) {
    this.menuItems.push(menuItem);
    this.renderMenuItems();
  }

  getMenuElement(menuItem: IMenuItem): HTMLElement {
    const menuItemId: string = Autocode.uuid();
    const menuItemElement: HTMLElement = document.createElement('li');
    acAddClassToElement({ class_: 'nav-item', element: menuItemElement });

    const menuButtonElement: HTMLButtonElement = document.createElement('button');
    menuButtonElement.setAttribute('type','button');
    if(menuItem.class){
      acAddClassToElement({ class_:menuItem.class, element: menuButtonElement });
    }
    else{
      acAddClassToElement({ class_:'btn btn-default btn-block w-100', element: menuButtonElement });
    }
    menuButtonElement.innerHTML = menuItem.label;
    acAddClassToElement({ class_: 'nav-link', element: menuButtonElement });


    menuButtonElement.addEventListener('click', () => {
      if (menuItem.url) {
        document.location.href = menuItem.url;
      }
      else if (menuItem.callback) {
        menuItem.callback!();
      }
    });
    if (menuItem.children && menuItem.children.length > 0) {
      const menuWrapperElement:HTMLElement = document.createElement('div');
      menuWrapperElement.classList.add('dropdown');

      menuWrapperElement.append(menuButtonElement);
      menuButtonElement.setAttribute('row', 'button');
      menuButtonElement.setAttribute('data-bs-toggle', 'dropdown');
      menuButtonElement.setAttribute('id', `dropdown-${menuItemId}`);
      menuButtonElement.setAttribute('aria-haspopup', 'true');
      menuButtonElement.setAttribute('aria-expanded', 'false');
      const dropdownMenuItemsElement: HTMLElement = document.createElement('div');
      menuWrapperElement.append(dropdownMenuItemsElement);
      dropdownMenuItemsElement.setAttribute('aria-labelledby', `dropdown-${menuItemId}`);
      acAddClassToElement({ class_: 'dropdown-menu', element: dropdownMenuItemsElement });
      for (const subMenuItem of menuItem.children) {
        dropdownMenuItemsElement.append(this.getMenuElement(subMenuItem));
      }
      menuItemElement.append(menuWrapperElement);
    }
    else{
      menuItemElement.append(menuButtonElement);
    }

    return menuItemElement;
  }

  renderMenuItems() {
    this.navBarMenuElement.innerHTML = '';
    const menuListElement: HTMLElement = document.createElement('ul');
    this.navBarMenuElement.append(menuListElement);
    acAddClassToElement({ class_: 'navbar-nav mr-auto', element: menuListElement });
    for (const menuItem of this.menuItems) {
      menuListElement.append(this.getMenuElement(menuItem));
    }
  }


}
