import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { } from "@autocode-ts/ac-browser";
import {
  AcDDEExtensionManager,
  AcEnumDDEExtension,
  AcRelationshipsDetectorDDEExtension,
  AcSqlAnalyzerDDEExtension,
  AcDataDictionaryEditor
} from '@autocode-ts/ac-data-dictionary-editor';
import { AcCodeGeneratorDDEExtension } from '@autocode-ts/ac-dde-code-generator';
import { AcBrowserStorageDDEExtension } from '@autocode-ts/ac-dde-browser-storage';
import { dataDictionaryJson as accounteaPro } from '../../../../data/accountea-pro';
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'data-dictionary-editor-page',
  template: `
    <div class="app-page h-100 overflow-hidden d-flex flex-column">
      <app-header
        [title]="'Data Dictionary Editor'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-hidden">
        <ac-data-dictionary-editor #editor class="h-100"></ac-data-dictionary-editor>
      </div>
    </div>
  `
})
export class DataDictionaryEditorPage {
  @AcViewChild('#editor') editor!: AcDataDictionaryEditor;

  dropdownItems: IAppMenuItem[] = [
    { label: 'Editor Actions', isHeader: true },
    { label: 'Export Metadata', callback: () => this.exportMetadata() }
  ];

  acOnInit() {
    // Register Extensions
    AcDDEExtensionManager.register(AcBrowserStorageDDEExtension);
    AcDDEExtensionManager.register(AcCodeGeneratorDDEExtension);

    const api = this.editor.editorApi;

    // Enable Extensions
    api.enableExtension({ extensionName: AcEnumDDEExtension.ImportExport });
    api.enableExtension({ extensionName: AcCodeGeneratorDDEExtension.extensionName });
    api.enableExtension({ extensionName: AcRelationshipsDetectorDDEExtension.extensionName });
    api.enableExtension({ extensionName: AcSqlAnalyzerDDEExtension.extensionName });

    // Load initial dictionary
    api.setDataDictionaryJson({ dataDictionaryJson: accounteaPro });
  }

  exportMetadata() {
    console.log('Metadata JSON:', this.editor.editorApi.getDataDictionaryJson());
  }
}
