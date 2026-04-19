/* eslint-disable @typescript-eslint/no-explicit-any */
import { acAddClassToElement, AcDatagridExtensionManager, AcElementBase, acInit, acRegisterCustomElement, acSetElementAttributes } from '@autocode-ts/ac-browser';
import { AgGridOnAcDatagrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDataDictionaryEditorHeader } from "./ac-data-dictionary-editor-header.element";
import { AcDDERelationshipsDatagrid } from "../datagrid/ac-dde-relationships-datagrid.element";
import { AcDDEFunctionsDatagrid } from "../datagrid/ac-dde-functions-datagrid.element";
import { AcDDEStoredProceduresDatagrid } from "../datagrid/ac-dde-stored-procedures-datagrid.element";
import { AcDDEViewsDatagrid } from "../datagrid/ac-dde-views-datagrid.element";
import { AcDDEViewColumnsDatagrid } from "../datagrid/ac-dde-view-columns-datagrid.element";
import { AcDDETableEditor } from '../editors/ac-dde-table-editor.element';
import { AcEnumDDETab } from '../../enums/ac-enum-dde-tab.enum';
import { AcDDETablesDatagrid } from '../datagrid/ac-dde-tables-datagrid.element';
import { AcDDETableColumnsDatagrid } from '../datagrid/ac-dde-table-columns-datagrid.element';
import { AcDDETriggersDatagrid } from '../datagrid/ac-dde-triggers-datagrid.element';
import { AcDDEApi } from '../../core/ac-dde-api';
import { IAcDDEHookArgs } from '../../interfaces/hook-args/ac-dde-hook-args.interface';
import { AcEnumDDEHook } from '../../enums/ac-enum-dde-hooks.enum';
import { AcDDECssClassName } from '../../consts/ac-dde-css-class-name.const';
import { IAcDDEDataDictionary } from '../../interfaces/ac-dde-data-dictionary.inteface';
import { AcDDEViewEditor } from '../editors/ac-dde-view-editor.element';
import { AC_DDE_TAG } from '../../_ac-data-dictionary-editor.export';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class AcDataDictionaryEditor extends AcElementBase{
  activeDataDictionary?: IAcDDEDataDictionary;
  editorApi?: AcDDEApi;

  bodyElement: HTMLElement = document.createElement('div');
  tabsContainer:HTMLElement = document.createElement('div');

  tableEditor?: AcDDETableEditor;
  viewEditor?: AcDDEViewEditor;
  header!: AcDataDictionaryEditorHeader;
  functionsDatagrid?: AcDDEFunctionsDatagrid;
  relationshipsDatagrid?: AcDDERelationshipsDatagrid;
  storedProceduresDatagrid?: AcDDEStoredProceduresDatagrid;
  tablesDatagrid?: AcDDETablesDatagrid;
  tableColumnsDatagrid?: AcDDETableColumnsDatagrid;
  triggersDatagrid?: AcDDETriggersDatagrid;
  viewsDatagrid?: AcDDEViewsDatagrid;
  viewColumnsDatagrid?: AcDDEViewColumnsDatagrid;
  override init() {
    super.init();
    this.editorApi = new AcDDEApi({editor:this});

    AcDatagridExtensionManager.register(AgGridOnAcDatagrid);

    this.header = new AcDataDictionaryEditorHeader({ editorApi: this.editorApi });

    const hookArgs: IAcDDEHookArgs = {
      editorApi: this.editorApi,
    };
    acInit({element:this});

    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.EditorInit, args: hookArgs });
    this.editorApi.hooks.subscribe({hook:AcEnumDDEHook.EditorTabChange,callback:(args:IAcDDEHookArgs)=>{
      this.setActiveTab({tab:args.value});
    }});

    this.setActiveTab({tab:this.editorApi.activeEditorTab});
    acAddClassToElement({ class_: AcDDECssClassName.acDataDictionaryEditor, element: this });
    // acAddClassToElement({ class_: AcDDECssClassName.acDDEDatagridWrapper, element: this.element });

    this.append(this.header.element);
    // acAddClassToElement({class_:AcDDECssClassName.acDDEHeader,element:this.header});

    this.append(this.bodyElement);
    acAddClassToElement({ class_: AcDDECssClassName.acDDEBody, element: this.bodyElement });

    // acAddClassToElement({ class_: `tab-content`, element: this.tabsContainer });
    // this.bodyElement.append(this.tabsContainer);
  }

  setActiveTab({tab}:{tab:AcEnumDDETab}){
    const getElementTab = (tabName:string,element:HTMLElement)=>{
      const tabElement:HTMLElement = document.createElement('div');
      const toggleButton:HTMLElement = document.createElement('button');
      acSetElementAttributes({attributes:{
        'class':`nav-link toggle-tab-${tab}`,
        'data-bs-toggle':'tab',
        'data-bs-target':`#${tab}`,
        'type':'button',
        'role':'tab',
        'aria-controls':tab,
        'aria-selected':"true",
        'style':'visibility:hidden;'
      },element:toggleButton});
      toggleButton.innerHTML = tab;
      // this.bodyElement.appendChild(toggleButton);
      acSetElementAttributes({attributes:{
        'class':'tab-pane fade',
        'id':`${tab}`,
        'role':'tabpanel',
        'aria-labelledby':`${tab}-tab`
      },element:tabElement});

      acAddClassToElement({class_:`.ac-dde-tab-${tab} ac-dde-tab`,element:element});
      tabElement.appendChild(element);
      return element;
    }
    if(this.editorApi){
    if(tab == AcEnumDDETab.TableEditor){
      if(this.tableEditor == undefined){
        this.tableEditor = new AcDDETableEditor({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.tableEditor.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.ViewEditor){
      if(this.viewEditor == undefined){
        this.viewEditor = new AcDDEViewEditor({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.viewEditor.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.Functions){
      if(this.functionsDatagrid == undefined){
        this.functionsDatagrid = new AcDDEFunctionsDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.functionsDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.Relationships){
      if(this.relationshipsDatagrid == undefined){
        this.relationshipsDatagrid = new AcDDERelationshipsDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.relationshipsDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.StoredProcedures){
      if(this.storedProceduresDatagrid == undefined){
        this.storedProceduresDatagrid = new AcDDEStoredProceduresDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.storedProceduresDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.TableColumns){
      if(this.tableColumnsDatagrid == undefined){
        this.tableColumnsDatagrid = new AcDDETableColumnsDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.tableColumnsDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.Tables){
      if(this.tablesDatagrid == undefined){
        this.tablesDatagrid = new AcDDETablesDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.tablesDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.Triggers){
      if(this.triggersDatagrid == undefined){
        this.triggersDatagrid = new AcDDETriggersDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.triggersDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.ViewColumns){
      if(this.viewColumnsDatagrid == undefined){
        this.viewColumnsDatagrid = new AcDDEViewColumnsDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.viewColumnsDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    else if(tab == AcEnumDDETab.Views){
      if(this.viewsDatagrid == undefined){
        this.viewsDatagrid = new AcDDEViewsDatagrid({editorApi:this.editorApi});
        const tabContent = getElementTab(tab,this.viewsDatagrid.element);
        this.bodyElement.appendChild(tabContent);
      }
    }
    this.bodyElement.querySelectorAll(`.ac-dde-tab`).forEach((el)=>{
      const element = el as HTMLElement;
      element.style.display = 'none';
    });
  }
    const tabElement:HTMLElement= this.bodyElement.getElementsByClassName(`.ac-dde-tab-${tab}`)![0] as HTMLElement;
    tabElement.style.display = '';
  }

}

acRegisterCustomElement({ tag: AC_DDE_TAG.dataDictionaryEditor, type: AcDataDictionaryEditor });
