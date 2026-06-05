/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @nx/enforce-module-boundaries */
import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDatagridExtensionManager } from "@autocode-ts/ac-browser";
import {
  AcDDEExtensionManager,
  AcEnumDDEExtension,
  AcRelationshipsDetectorDDEExtension,
  AcSqlAnalyzerDDEExtension,
  AcDataDictionaryEditorElement,
  AcDDEApi
} from '@autocode-ts/ac-data-dictionary-editor';
import { AcCodeGeneratorDDEExtension,AcDDECodeGeneratorDefaultConfig } from '@autocode-ts/ac-dde-code-generator';
import { AcBrowserStorageDDEExtension } from '@autocode-ts/ac-dde-browser-storage';
import { AgGridOnAcDatagrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDelayedCallback } from "@autocode-ts/autocode";

import { dataDictionaryJson as accountea } from './../../data/accountea';
import { dataDictionaryJson as accounteaPro } from './../../data/accountea-pro';
import { dataDictionaryJson as accounteaProInternal } from './../../data/accountea-pro-internal';
import { dataDictionaryJson as accounteaWeb } from './../../data/accountea-web';
import { dataDictionaryJson as communityDataDictionary } from './../../data/sst-community';
import { dataDictionaryJson as unifiDataDictionary } from './../../data/unifi-data-dictionary';
import { dataDictionaryJson as ddeDataDictionary } from './../../data/dde-data-dictionary';
import { dataDictionaryJson as autocodeSchema } from './../../data/autocode-schema';
import { dataDictionaryJson as autocodeSync } from './../../data/autocode-sync';
import { dataDictionaryJson as sagDataDictionary } from './../../data/scoresandgames';
import { IAppMenuItem } from "src/_app.export";

import './../../../../../packages/browser/ac-data-dictionary-editor/src/lib/css/ac-data-dictionary-editor.css';
import './../../../../../packages/browser/extensions/datagrid/ac-datagrid-on-ag-grid/src/lib/css/ac-datagrid-on-ag-grid.css';
import './../../../../../packages/browser/ac-browser/src/lib/icons/css/ac-icons.css';

@AcElement({
  selector: 'data-dictionary-editor-page',
  template: `
    <div class="app-page d-flex flex-column">
      <div class="flex-fill overflow-hidden">
        <ac-data-dictionary-editor #editor class="h-100"></ac-data-dictionary-editor>
      </div>
    </div>
  `
})
export class DataDictionaryEditorPage {
  @AcViewChild('#editor') editor!: AcDataDictionaryEditorElement;

  startEditor:boolean = false;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  constructor(){

    AcDatagridExtensionManager.register(AgGridOnAcDatagrid);
    AcDDEExtensionManager.register(AcBrowserStorageDDEExtension);
    AcDDEExtensionManager.register(AcCodeGeneratorDDEExtension);
  }

  acOnInit() {
    // Register Extensions

    this.initEditor();
  }

  initEditor(){
    if(this.editor){
      AcDDECodeGeneratorDefaultConfig.viewNameColumnClassPrefix = "";
      const api:AcDDEApi = this.editor.editorApi!;

    // Enable Extensions
    api.enableExtension({ extensionName: AcEnumDDEExtension.ImportExport });
    api.enableExtension({ extensionName: AcCodeGeneratorDDEExtension.extensionName });
    api.enableExtension({ extensionName: AcRelationshipsDetectorDDEExtension.extensionName });
    api.enableExtension({ extensionName: AcSqlAnalyzerDDEExtension.extensionName });

    console.log(accounteaPro);
    // Load initial dictionary
    // accountea
    // api.setDataDictionaryJson({ dataDictionaryJson: accountea });
    // api.setDataDictionaryJson({ dataDictionaryJson: accounteaPro });
    api.setDataDictionaryJson({ dataDictionaryJson: accounteaProInternal });
    // api.setDataDictionaryJson({ dataDictionaryJson: accounteaWeb });
    // api.setDataDictionaryJson({ dataDictionaryJson: autocodeSchema });
    // api.setDataDictionaryJson({ dataDictionaryJson: autocodeSync });
    // api.setDataDictionaryJson({ dataDictionaryJson: sagDataDictionary });

    }
    else{
      this.delayedCallback.add({callback:()=>{
        this.initEditor();
      },duration:100,key:'initEditor'});
    }
  }
}
