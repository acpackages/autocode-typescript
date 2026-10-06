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
import { AcDelayedCallback } from "@autocode-ts/autocode";

import { dataDictionaryJson as accounteaPro } from './../../data/accountea-pro';
import { dataDictionaryJson as actExtEcommerce } from './../../data/act-ext-ecommerce';
import { dataDictionaryJson as edookaan } from './../../data/edookaan';
import { IAppMenuItem } from "src/_app.export";

import './../../../../../packages/browser/ac-data-dictionary-editor/src/lib/css/ac-data-dictionary-editor.css';
import './../../../../../packages/browser/ac-browser/src/lib/icons/css/ac-icons.css';

@AcElement({
  selector: 'data-dictionary-editor-page',
  template: `
    <div class="app-page d-flex flex-column h-100">
      <div class="flex-fill overflow-hidden h-100">
        <ac-data-dictionary-editor #editor class="h-100 d-block"></ac-data-dictionary-editor>
      </div>
    </div>
  `
})
export class DataDictionaryEditorPage {
  @AcViewChild('#editor') editor!: AcDataDictionaryEditorElement;

  startEditor:boolean = false;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  constructor(){
    AcDDEExtensionManager.register(AcBrowserStorageDDEExtension);
    AcDDEExtensionManager.register(AcCodeGeneratorDDEExtension);
  }

  acOnInit() {
    this.initEditor();
  }

  initEditor(){
    if(this.editor && this.editor.editorApi){
      AcDDECodeGeneratorDefaultConfig.viewNameColumnClassPrefix = "";
      const api:AcDDEApi = this.editor.editorApi;

      // Enable Extensions
      api.enableExtension({ extensionName: AcEnumDDEExtension.ImportExport });
      api.enableExtension({ extensionName: AcCodeGeneratorDDEExtension.extensionName });
      api.enableExtension({ extensionName: AcRelationshipsDetectorDDEExtension.extensionName });
      api.enableExtension({ extensionName: AcSqlAnalyzerDDEExtension.extensionName });

      // Load multiple dictionaries simultaneously to demonstrate multi-dictionary capability
      api.setDataDictionaryJson({ dataDictionaryJson: edookaan, dataDictionaryName: 'EdookaanDB' });
      api.setDataDictionaryJson({ dataDictionaryJson: accounteaPro, dataDictionaryName: 'AccounteaPro' });
      api.setDataDictionaryJson({ dataDictionaryJson: actExtEcommerce, dataDictionaryName: 'EcommerceExt' });

      // Set active dictionary to first loaded
      const allDicts = api.dataStorage.getDataDictionaries();
      if (allDicts.length > 0) {
        api.activeDataDictionary = allDicts[0];
      }
    }
    else{
      this.delayedCallback.add({callback:()=>{
        this.initEditor();
      },duration:100,key:'initEditor'});
    }
  }
}
