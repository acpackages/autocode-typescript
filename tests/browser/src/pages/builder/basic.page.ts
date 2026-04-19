import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcBuilderComponent } from "@autocode-ts/ac-browser";
import { acRegisterBootstrapBuilderElements } from '@autocode-ts/ac-bootstrap-builder-elements';
import { acRegisterDataDictionaryBuilderElements } from '@autocode-ts/ac-dd-builder-elements';
import { AcDataDictionary } from '@autocode-ts/ac-data-dictionary';
import { dataDictionaryJson as actDataDictionary } from '../../../../data/accountea-pro';
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'builder-basic-page',
  template: `
    <div class="app-page h-100 overflow-hidden d-flex flex-column">
      <app-header
        [title]="'Visual Builder'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-hidden">
        <ac-builder #builder class="h-100"></ac-builder>
      </div>
    </div>
  `
})
export class BuilderBasicPage {
  @AcViewChild('#builder') builder!: AcBuilderComponent;

  dropdownItems: IAppMenuItem[] = [
    { label: 'Builder Actions', isHeader: true },
    { label: 'Export JSON', callback: () => this.exportJson() },
    { label: 'Load Sample State', callback: () => this.loadSampleState() }
  ];

  acOnInit() {
    // Register required builder elements and dictionary
    acRegisterBootstrapBuilderElements();
    AcDataDictionary.registerDataDictionary({ jsonData: actDataDictionary });
    acRegisterDataDictionaryBuilderElements();

    const api = this.builder.builderApi;

    api.hooks.subscribeAllHooks({
      callback: (hook, args) => {
        console.log(`[Builder Hook] ${hook}`, args);
      }
    });

    // Load initial empty or sample state
    this.loadSampleState();
  }

  exportJson() {
    console.log('Builder State:', this.builder.builderApi.toJson());
  }

  loadSampleState() {
    const sampleState = {
      "extensionStates": {},
      "components": [
        {
          "name": "default",
          "elements": {
            "bsContainer": {
              "instanceName": "bsContainer",
              "name": "bsContainer",
              "properties": {
                "instanceName": { "name": "instanceName", "value": "bsContainer", "valueType": "VALUE" }
              }
            }
          },
          "html": "<div><div ac-builder-element-instance-name=\"bsContainer\" ac-builder-keep-html=\"true\" class=\"p-5 border bg-light\">Drag elements here...</div></div>",
          "script": "class DefaultPageScript { }",
          "className": "DefaultPageScript"
        }
      ]
    };
    this.builder.builderApi.fromJson(sampleState);
  }
}
