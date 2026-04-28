/* eslint-disable @typescript-eslint/no-explicit-any */
import { acAddClassToElement, acClearElement, AcDatagridExtensionManager, AcElementBase, acInit, acRegisterCustomElement, acSetElementAttributes } from '@autocode-ts/ac-browser';
import { AgGridOnAcDatagrid, initAgGrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDataDictionaryEditorHeader } from "./ac-data-dictionary-editor-header.element";
import { AcDDERelationshipsDatagridElement } from "../datagrid/ac-dde-relationships-datagrid.element";
import { AcDDEFunctionsDatagridElement } from "../datagrid/ac-dde-functions-datagrid.element";
import { AcDDEStoredProceduresDatagridElement } from "../datagrid/ac-dde-stored-procedures-datagrid.element";
import { AcDDEViewsDatagridElement } from "../datagrid/ac-dde-views-datagrid.element";
import { AcDDEViewColumnsDatagridElement } from "../datagrid/ac-dde-view-columns-datagrid.element";
import { AcDDETableEditorElement } from '../editors/ac-dde-table-editor.element';
import { AcEnumDDETab } from '../../enums/ac-enum-dde-tab.enum';
import { AcDDETablesDatagridElement } from '../datagrid/ac-dde-tables-datagrid.element';
import { AcDDETableColumnsDatagridElement } from '../datagrid/ac-dde-table-columns-datagrid.element';
import { AcDDETriggersDatagridElement } from '../datagrid/ac-dde-triggers-datagrid.element';
import { AcDDEApi } from '../../core/ac-dde-api';
import { IAcDDEHookArgs } from '../../interfaces/hook-args/ac-dde-hook-args.interface';
import { AcEnumDDEHook } from '../../enums/ac-enum-dde-hooks.enum';
import { AcDDECssClassName } from '../../consts/ac-dde-css-class-name.const';
import { IAcDDEDataDictionary } from '../../interfaces/ac-dde-data-dictionary.inteface';
import { AcDDEViewEditorElement } from '../editors/ac-dde-view-editor.element';
import { AC_DDE_TAG } from '../../_ac-data-dictionary-editor.export';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class AcDataDictionaryEditorElement extends AcElementBase {
  activeDataDictionary?: IAcDDEDataDictionary;
  editorApi?: AcDDEApi;

  bodyElement: HTMLElement = document.createElement('div');
  tabsContainer: HTMLElement = document.createElement('div');

  tableEditor?: AcDDETableEditorElement;
  viewEditor?: AcDDEViewEditorElement;
  header!: AcDataDictionaryEditorHeader;
  functionsDatagrid?: AcDDEFunctionsDatagridElement;
  relationshipsDatagrid?: AcDDERelationshipsDatagridElement;
  storedProceduresDatagrid?: AcDDEStoredProceduresDatagridElement;
  tablesDatagrid?: AcDDETablesDatagridElement;
  tableColumnsDatagrid?: AcDDETableColumnsDatagridElement;
  triggersDatagrid?: AcDDETriggersDatagridElement;
  viewsDatagrid?: AcDDEViewsDatagridElement;
  viewColumnsDatagrid?: AcDDEViewColumnsDatagridElement;
  override init() {
    super.init();
    this.editorApi = new AcDDEApi({ editor: this });

    // initAgGrid();
    // AcDatagridExtensionManager.register(AgGridOnAcDatagrid);

    this.header = new AcDataDictionaryEditorHeader({ editorApi: this.editorApi });

    const hookArgs: IAcDDEHookArgs = {
      editorApi: this.editorApi,
    };
    // acInit({element:this});

    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.EditorInit, args: hookArgs });
    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.EditorTabChange, callback: (args: IAcDDEHookArgs) => {
        this.setActiveTab({ tab: args.value });
      }
    });

    acAddClassToElement({ class_: AcDDECssClassName.acDataDictionaryEditor, element: this });
    // acAddClassToElement({ class_: AcDDECssClassName.acDDEDatagridWrapper, element: this.element });

    this.append(this.header.element);
    // acAddClassToElement({class_:AcDDECssClassName.acDDEHeader,element:this.header});

    this.append(this.bodyElement);
    acAddClassToElement({ class_: AcDDECssClassName.acDDEBody, element: this.bodyElement });


    this.setActiveTab({ tab: this.editorApi.activeEditorTab });
    // acAddClassToElement({ class_: `tab-content`, element: this.tabsContainer });
    // this.bodyElement.append(this.tabsContainer);
  }

  setActiveTab({ tab }: { tab: AcEnumDDETab }) {
    const getElementTab = (tabName: string, element: HTMLElement) => {
      const tabElement: HTMLElement = this.ownerDocument.createElement('div');
      const toggleButton: HTMLElement = this.ownerDocument.createElement('button');
      acSetElementAttributes({
        attributes: {
          'class': `nav-link toggle-tab-${tab}`,
          'data-bs-toggle': 'tab',
          'data-bs-target': `#${tab}`,
          'type': 'button',
          'role': 'tab',
          'aria-controls': tab,
          'aria-selected': "true",
          'style': 'visibility:hidden;'
        }, element: toggleButton
      });
      toggleButton.innerHTML = tab;
      // this.bodyElement.appendChild(toggleButton);
      acSetElementAttributes({
        attributes: {
          'class': 'tab-pane fade',
          'id': `${tab}`,
          'role': 'tabpanel',
          'aria-labelledby': `${tab}-tab`
        }, element: tabElement
      });

      acAddClassToElement({ class_: `ac-dde-tab-${tab.toLowerCase()} ac-dde-tab`, element: element });
      tabElement.appendChild(element);
      return element;
    }
    if (this.editorApi) {

        acClearElement({element:this.bodyElement});
      if (tab == AcEnumDDETab.TableEditor) {
        this.tableEditor = new AcDDETableEditorElement();
          const tabContent = getElementTab(tab, this.tableEditor);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.ViewEditor) {

          this.viewEditor = new AcDDEViewEditorElement();
          const tabContent = getElementTab(tab, this.viewEditor);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.Functions) {
        this.functionsDatagrid = new AcDDEFunctionsDatagridElement();
          const tabContent = getElementTab(tab, this.functionsDatagrid);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.Relationships) {
        this.relationshipsDatagrid = new AcDDERelationshipsDatagridElement();
          const tabContent = getElementTab(tab, this.relationshipsDatagrid);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.StoredProcedures) {
        this.storedProceduresDatagrid = new AcDDEStoredProceduresDatagridElement();
          const tabContent = getElementTab(tab, this.storedProceduresDatagrid);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.TableColumns) {
        this.tableColumnsDatagrid = new AcDDETableColumnsDatagridElement();
          const tabContent = getElementTab(tab, this.tableColumnsDatagrid);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.Tables) {
        this.tablesDatagrid = new AcDDETablesDatagridElement();
          const tabContent = getElementTab(tab, this.tablesDatagrid);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.Triggers) {
        this.triggersDatagrid = new AcDDETriggersDatagridElement();
          const tabContent = getElementTab(tab, this.triggersDatagrid.element);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.ViewColumns) {
        this.viewColumnsDatagrid = new AcDDEViewColumnsDatagridElement();
          const tabContent = getElementTab(tab, this.viewColumnsDatagrid);
          this.bodyElement.appendChild(tabContent);
      }
      else if (tab == AcEnumDDETab.Views) {
        this.viewsDatagrid = new AcDDEViewsDatagridElement();
          const tabContent = getElementTab(tab, this.viewsDatagrid);
          this.bodyElement.appendChild(tabContent);
      }
      this.bodyElement.querySelectorAll(`.ac-dde-tab`).forEach((el) => {
        const element = el as HTMLElement;
        element.style.display = 'none';
      });
    }
    const tabElement: HTMLElement = this.bodyElement.querySelector(`.ac-dde-tab-${tab.toLowerCase()}`) as HTMLElement;
    tabElement.style.display = '';
  }

}

acRegisterCustomElement({ tag: AC_DDE_TAG.editor, type: AcDataDictionaryEditorElement });
