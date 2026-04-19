/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @nx/enforce-module-boundaries */
import './../../../../../packages/browser/ac-data-dictionary-editor/src/lib/css/ac-data-dictionary-editor.css';
import './../../../../../packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid/src/lib/css/ac-datagrid-on-ag-grid.css';
import './../../../../../node_modules/tom-select/dist/css/tom-select.bootstrap5.css';
import { AcDataDictionaryEditor, AcDDEApi, AcDDEExtensionManager, AcEnumDDEExtension, AcEnumDDEHook, AcRelationshipsDetectorDDEExtension, AcSqlAnalyzerDDEExtension } from '@autocode-ts/ac-data-dictionary-editor';
import { AcCodeGeneratorDDEExtension, AcDDECodeGeneratorDefaultConfig } from '@autocode-ts/ac-dde-code-generator'
import { AcBrowserStorageDDEExtension } from '@autocode-ts/ac-dde-browser-storage';
import { PageHeader } from '../../components/page-header/page-header.component';
import { dataDictionaryJson as accountea } from './../../../../data/accountea';
import { dataDictionaryJson as accounteaPro } from './../../../../data/accountea-pro';
import { dataDictionaryJson as accounteaProInternal } from './../../../../data/accountea-pro-internal';
import { dataDictionaryJson as accounteaWeb } from './../../../../data/accountea-web';
import { dataDictionaryJson as communityDataDictionary } from './../../../../data/sst-community';
import { dataDictionaryJson as unifiDataDictionary } from './../../../../data/unifi-data-dictionary';
import { dataDictionaryJson as ddeDataDictionary } from './../../../../data/dde-data-dictionary';

export class DDEEditorDatagridPage  extends HTMLElement {
  dataDictionaryEditor!: AcDataDictionaryEditor;
  editorApi!: AcDDEApi;
  pageHeader: PageHeader = new PageHeader();
  async connectedCallback() {
    const html = `
      <div id="editorContainer" class="editor-container" style="height:calc(100vh);"></div>
    `;
    this.innerHTML = html;
    this.style.height = '100vh;'
    // this.prepend(this.pageHeader.element);
    this.pageHeader.pageTitle = 'Data Dictionary Editor';
    this.initDatagrid();
  }

  async initDatagrid() {
    const gridDiv = document.querySelector<HTMLElement>('#editorContainer');
    if (gridDiv) {
      AcDDECodeGeneratorDefaultConfig.viewNameColumnClassPrefix = "";
      AcDDEExtensionManager.register(AcBrowserStorageDDEExtension);
      AcDDEExtensionManager.register(AcCodeGeneratorDDEExtension);
      this.dataDictionaryEditor = new AcDataDictionaryEditor();

      gridDiv.append(this.dataDictionaryEditor);

      console.dir(this.dataDictionaryEditor);
      this.editorApi = this.dataDictionaryEditor.editorApi!;
      this.editorApi.hooks.subscribeAllHooks({callback:(hookName:string,hookArgs:any)=>{
        // console.log(`Found hook : ${hookName}`,hookArgs);
      }});
      this.editorApi.enableExtension({extensionName:AcEnumDDEExtension.ImportExport});
      // this.editorApi.enableExtension({extensionName:AcBrowserStorageDDEExtension.extensionName});
      this.editorApi.enableExtension({extensionName:AcCodeGeneratorDDEExtension.extensionName});
      this.editorApi.enableExtension({extensionName:AcRelationshipsDetectorDDEExtension.extensionName});
      this.editorApi.enableExtension({extensionName:AcSqlAnalyzerDDEExtension.extensionName});

      this.editorApi.setDataDictionaryJson({dataDictionaryJson:communityDataDictionary});
      // this.editorApi.setDataDictionaryJson({dataDictionaryJson:accounteaProInternal});
      this.editorApi.setDataDictionaryJson({dataDictionaryJson:accounteaPro});
      this.editorApi.setDataDictionaryJson({dataDictionaryJson:accounteaWeb});
      // this.editorApi.setDataDictionaryJson({dataDictionaryJson:unifiDataDictionary});
      // this.editorApi.setDataDictionaryJson({dataDictionaryJson:ddeDataDictionary});
      console.log(this.editorApi);
      // this.editorApi.setDataDictionaryJson({dataDictionaryJson:dataDictionaryJson,dataDictionaryName:'accountea'});



    }
  }
}
