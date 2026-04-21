/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { acAddClassToElement, acClearElement, acRegisterCustomElement, AcTooltip } from "@autocode-ts/ac-browser";
import { AcEnumDDETab } from "../../enums/ac-enum-dde-tab.enum";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AcEnumDDEHook } from "../../enums/ac-enum-dde-hooks.enum";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { IAcDDEMenuGroupAddHookArgs } from "../../interfaces/hook-args/ac-dde-menu-group-add-hook-args.interface";
import { IAcDDEHookArgs } from "../../interfaces/hook-args/ac-dde-hook-args.interface";
import { IAcDDEMenuGroup } from "../../interfaces/ac-dde-menu-group.interface";
import { IAcDDEMenuItem } from "../../interfaces/ac-dde-menu-item.interface";
import { IAcDDEDataDictionary } from "../../interfaces/ac-dde-data-dictionary.inteface";
import { AcDDEBase } from "./ac-dde-element-base.element";
import { AC_DDE_TAG } from "../../_ac-data-dictionary-editor.export";

export class AcDDEHeader extends AcDDEBase {
  activeView: AcEnumDDETab = AcEnumDDETab.TableEditor;
  dropdown: HTMLElement = document.createElement('div');

  // selectDataDictionaryInput: AcSelectInputElement;

  override init() {
    super.init();
    this.initElement();
    this.setDataDictionaryDropdown();
    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.ActiveDataDictionaryChange, callback: (args: IAcDDEActiveDataDictionaryChangeHookArgs) => {
        this.querySelector('[ac-dde-data=active_data_dictionary_name]')!.innerHTML = args.activeDataDictionary.dataDictionaryName!;
      }
    });
    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.MenuGroupAdd, callback: (args: IAcDDEMenuGroupAddHookArgs) => {
        this.addMenuGroup({ menuGroup: args.menuGroup });
      }
    });
    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.DataDictionarySet, callback: (args: IAcDDEHookArgs) => {
        this.setDataDictionaryDropdown();
      }
    });
  }

  private addMenuGroup({ menuGroup }: { menuGroup: IAcDDEMenuGroup }): void {
    const menuGroupElement: HTMLElement = document.createElement('span');
    acAddClassToElement({ class_: 'dropdown', element: menuGroupElement });

    const menuButton: HTMLElement = document.createElement('button');
    menuGroupElement.append(menuButton);
    acAddClassToElement({ class_: 'btn btn-action btn-undodropdown-toggle me-1', element: menuButton });
    menuButton.setAttribute('type', 'button');
    menuButton.setAttribute('role', 'button');
    menuButton.setAttribute('data-bs-toggle', 'dropdown');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = `<i class="${menuGroup.iconClass} text-secondary"></i>`;
    menuButton.setAttribute('ac-tooltip', menuGroup.label);
    new AcTooltip({ element: menuButton });

    const dropdownItems: HTMLElement = document.createElement('ul');
    menuGroupElement.append(dropdownItems);
    acAddClassToElement({ class_: 'dropdown-menu', element: dropdownItems });

    for (const menuItem of menuGroup.menuItems) {
      dropdownItems.append(this.getMenuItemElement({ menuItem: menuItem }));
    }
    this.querySelector('.ac-dde-menus')?.append(menuGroupElement);
  }

  private getMenuItemElement({ menuItem }: { menuItem: IAcDDEMenuItem }): HTMLElement {
    const menuItemElement: HTMLElement = document.createElement('li');
    menuItemElement.style.cursor = 'pointer';
    acAddClassToElement({ class_: 'dropdown-item px-2', element: menuItemElement });
    menuItemElement.innerHTML = `<i class="${menuItem.iconClass}"></i> ${menuItem.label}`;
    menuItemElement.addEventListener('click', () => {
      menuItem.callback();
    });
    return menuItemElement;
  }

  private initElement() {
    // this.element.appendChild(this.selectDataDictionaryInput.element);
    // this.selectDataDictionaryInput.element.style.minWidth = '150px';
    // this.selectDataDictionaryInput.element.style.background = 'transparent';
    // acAddClassToElement({ class_: 'form-select', element: this.selectDataDictionaryInput.element });
    this.append(this.dropdown);
    this.innerHTML = `
    <div class="ac-dde-topbar">
          <div class="ac-dde-topbar-left ac-dde-menus">
          <span class="dropdown">
              <button type="button" class="btn dropdown-toggle me-1 text-black" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span ac-dde-data="active_data_dictionary_name">(No Data Dictionary Selected)</span>
              </button>
              <ul class="dropdown-menu data-dictionary-select-items">
              </ul>
            </span>
          </div>
          <div class=""></div>
          <div class="ac-dde-topbar-center">
            <div class="btn-group btn-action-grp btn-tabs-group" role="group"></div>
          </div>
          <div class="ac-dde-topbar-right">
            <div class="ac-dde-topbar-right-container me-2">
            </div>
          </div>
        </div>`;
    const tabs: any = [
      {
        label: 'Tables',
        icon: 'aci-table',
        tab: AcEnumDDETab.TableEditor
      },
      {
        label: 'Table Columns',
        icon: 'aci-table-column',
        tab: AcEnumDDETab.TableColumns
      },
      {
        label: 'Views',
        icon: 'aci-union',
        tab: AcEnumDDETab.ViewEditor
      },
      {
        label: 'View Columns',
        icon: 'aci-table-union',
        tab: AcEnumDDETab.ViewColumns
      },
      {
        label: 'Triggers',
        icon: 'aci-table-action',
        tab: AcEnumDDETab.Triggers
      },
      {
        label: 'Relationships',
        icon: 'aci-connected-boxes',
        tab: AcEnumDDETab.Relationships
      },
      {
        label: 'Stored Procedures',
        icon: 'aci-code',
        tab: AcEnumDDETab.StoredProcedures
      },
      {
        label: 'Functions',
        icon: 'aci-function',
        tab: AcEnumDDETab.Functions
      },
    ];
    for (const tabMenu of tabs) {
      const btn: HTMLElement = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.style.width = 'max-content';
      btn.setAttribute('ac-tooltip', tabMenu.label);
      btn.setAttribute('ac-data-tab', tabMenu.tab);
      acAddClassToElement({ class_: 'btn btn-action btn-device btn-table px-2', element: btn });
      btn.innerHTML = `<i class="${tabMenu.icon} text-secondary"></i><span class="text-black tab-label d-none">${tabMenu.label.replaceAll(" ", "&nbsp;")}</span>`;
      btn.addEventListener('click', () => {
        this.setActiveTab({ tab: tabMenu.tab });
      });
      this.querySelector('.btn-tabs-group')?.append(btn);
      new AcTooltip({ element: btn });
    }
  }

  private setDataDictionaryDropdown() {
    acClearElement({element:this.querySelector('.data-dictionary-select-items')!});
    const createMenuItem: Function = (row: IAcDDEDataDictionary) => {
      const menuItem: HTMLElement = document.createElement('li');
      menuItem.style.cursor = 'pointer';
      acAddClassToElement({ class_: 'dropdown-item', element: menuItem });
      menuItem.innerHTML = row.dataDictionaryName!;
      menuItem.addEventListener('click', () => {
        this.editorApi!.activeDataDictionary = row;
        // menuItem.callback();
      });
      return menuItem;
    };
    for (const row of this.editorApi!.dataStorage.getDataDictionaries()) {
      if (this.editorApi!.activeDataDictionary == undefined) {
        this.editorApi!.activeDataDictionary = row;
      }
      this.querySelector('.data-dictionary-select-items')?.append(createMenuItem(row));
    }
  }

  setActiveTab({ tab }: { tab: AcEnumDDETab }) {
    const btns = this.querySelectorAll(`[ac-data-tab]`)
    for (const btn of Array.from(btns)) {
      const icon = btn.querySelector('i') as HTMLElement;
      const label = btn.querySelector('span') as HTMLElement;
      icon.classList.remove('text-white');
      icon.classList.add('text-secondary');
      label.classList.add('d-none');
      btn.classList.remove('btn-dark');
    }
    const activeBtn = this.querySelector(`[ac-data-tab=${tab}]`) as HTMLElement;
    activeBtn.classList.add('btn-dark');
    const icon = activeBtn.querySelector('i') as HTMLElement;
    const label = activeBtn.querySelector('span') as HTMLElement;
    icon.classList.remove('text-secondary');
    // label.classList.remove('d-none');
    icon.classList.add('text-white');
    this.editorApi.activeEditorTab = tab;
  }
}

acRegisterCustomElement({ tag: AC_DDE_TAG.ddeHeader, type: AcDDEHeader });
