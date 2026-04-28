/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @angular-eslint/no-output-on-prefix */
/* eslint-disable @angular-eslint/prefer-standalone */
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { AcNgScrollableModule } from '@autocode-ts/ac-angular';
import { AcDataDictionaryEditorElement, AcDDEApi, AcDDEExtensionManager, AcEnumDDEExtension, AcEnumDDEHook, AcRelationshipsDetectorDDEExtension, AcSqlAnalyzerDDEExtension } from '@autocode-ts/ac-data-dictionary-editor';
import { AcCodeGeneratorDDEExtension } from '@autocode-ts/ac-dde-code-generator'
import { AcDelayedCallback } from '@autocode-ts/autocode';
import { dataDictionaryJson as actDataDictionary } from 'tests/data/act-data-dictionary-v1';

@Component({
  selector: 'app-data-dictionary-editor',
  imports: [CommonModule, AcNgScrollableModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './data-dictionary-editor.component.html',
  styleUrl: './data-dictionary-editor.component.scss',
  standalone: true
})
export class DataDictionaryEditorComponent {
  @ViewChild('editor') editorRef?: ElementRef<AcDataDictionaryEditorElement>;
  dataDictionaryEditor?: AcDataDictionaryEditorElement;
  editorApi?: AcDDEApi;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  constructor(private elementRef: ElementRef) {
    AcDataDictionaryEditorElement;
    AcDDEExtensionManager.register(AcCodeGeneratorDDEExtension);
  }

  ngOnInit() {
    this.initDataDictionaryEditor();
  }

  initDataDictionaryEditor() {
    if (this.editorRef && this.editorRef.nativeElement) {
      this.dataDictionaryEditor = this.editorRef.nativeElement;
      this.editorApi = this.dataDictionaryEditor.editorApi;
      this.editorApi.hooks.subscribeAllHooks({
        callback: (hookName: string, hookArgs: any) => {
          // console.log(`Found hook : ${hookName}`,hookArgs);
        }
      });
      this.editorApi.enableExtension({ extensionName: AcEnumDDEExtension.ImportExport });
      // this.editorApi.enableExtension({extensionName:AcBrowserStorageDDEExtension.extensionName});
      this.editorApi.enableExtension({ extensionName: AcCodeGeneratorDDEExtension.extensionName });
      this.editorApi.enableExtension({ extensionName: AcRelationshipsDetectorDDEExtension.extensionName });
      this.editorApi.enableExtension({ extensionName: AcSqlAnalyzerDDEExtension.extensionName });

      this.editorApi.setDataDictionaryJson({ dataDictionaryJson: actDataDictionary });
    }
    else{
      this.delayedCallback.add({callback:()=>{
        this.initDataDictionaryEditor();
      },duration:10});
    }
  }


}
