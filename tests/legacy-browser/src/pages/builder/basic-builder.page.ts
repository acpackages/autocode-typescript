/* eslint-disable @nx/enforce-module-boundaries */
import './../../../../../packages/browser/ac-builder/src/lib/css/ac-builder.css';
import { AcBuilder, AcBuilderApi } from '@autocode-ts/ac-builder';
import { acRegisterBootstrapBuilderElements } from '@autocode-ts/ac-bootstrap-builder-elements';
import { acRegisterDataDictionaryBuilderElements } from '@autocode-ts/ac-dd-builder-elements';
import { PageHeader } from '../../components/page-header/page-header.component';
import { dataDictionaryJson as actDataDictionary } from './../../../../data/accountea-pro';
import { AcDataDictionary } from '@autocode-ts/ac-data-dictionary';

export class BasicBuilderPage extends HTMLElement {
  builder!: AcBuilder;
  builderApi!: AcBuilderApi;
  pageHeader: PageHeader = new PageHeader();
  async connectedCallback() {
    const html = `
      <div id="builderContainer" class="builder-container" style="height:calc(100vh);"></div>
    `;
    this.innerHTML = html;
    this.style.height = '100vh;'
    this.pageHeader.pageTitle = 'Builder';
    this.initBuilder();
  }

  async initBuilder() {
    const container = document.querySelector<HTMLElement>('#builderContainer');
    if (container) {
      acRegisterBootstrapBuilderElements();
      AcDataDictionary.registerDataDictionary({ jsonData: actDataDictionary });
      acRegisterDataDictionaryBuilderElements();
      this.builder = new AcBuilder();
      this.builderApi = this.builder.builderApi;
      container.append(this.builder.element);
      this.builderApi.hooks.subscribeAllHooks({
        callback: (hook: string, args: any) => {
          console.log(hook);
          console.log(args);
        }
      });
      // this.builderApi.addElement({
      //   element: {
      //     category: 'New Test Category',
      //     name: 'test-element',
      //     tag: 'test',
      //     title: 'Test Element',
      //   }
      // })
      const state: any = {
  "extensionStates": {},
  "components": [
    {
      "name": "default",
      "elements": {
        "ddDatagrid": {
          "instanceName": "ddDatagrid",
          "name": "ddDatagrid",
          "events": {},
          "properties": {
            "instanceName": {
              "name": "instanceName",
              "value": "ddDatagrid",
              "valueType": "VALUE"
            },
            "sourceType": {
              "name": "sourceType",
              "value": "TABLE",
              "valueType": "VALUE"
            },
            "sourceValue": {
              "name": "sourceValue",
              "value": "act_ledger_accounts",
              "valueType": "VALUE"
            }
          }
        },
        "ddInputField": {
          "instanceName": "ddInputField",
          "name": "ddInputField",
          "events": {},
          "properties": {
            "instanceName": {
              "name": "instanceName",
              "value": "ddInputField",
              "valueType": "VALUE"
            },
            "tableName": {
              "name": "tableName",
              "value": "act_ledger_accounts",
              "valueType": "VALUE"
            },
            "columnName": {
              "name": "columnName",
              "value": "reflecting_statement",
              "valueType": "VALUE"
            },
            "inputProperties": {
              "name": "inputProperties",
              "value": [
                {
                  "key": "class",
                  "value": "form-control"
                },
                {
                  "key": "name",
                  "value": "tbl-test"
                }
              ],
              "valueType": "VALUE"
            }
          }
        },
        "bsContainer": {
          "instanceName": "bsContainer",
          "name": "bsContainer",
          "events": {
            "click": {
              "name": "click",
              "functionName": "handleContainer1Click"
            },
            "doubleClick": {
              "name": "doubleClick",
              "functionName": "handleContainer1DoubleClick"
            }
          },
          "properties": {
            "instanceName": {
              "name": "instanceName",
              "value": "bsContainer",
              "valueType": "VALUE"
            }
          }
        },
        "bsForm": {
          "instanceName": "bsForm",
          "name": "bsForm",
          "events": {
            "submit": {
              "name": "submit",
              "functionName": "handleBsFormSubmit"
            }
          },
          "properties": {
            "instanceName": {
              "name": "instanceName",
              "value": "bsForm",
              "valueType": "VALUE"
            }
          }
        }
      },
      "html": "<div><div ac-builder-element-instance-name=\"bsContainer\" ac-builder-keep-html=\"true\">Container Element</div><div ac-builder-element-instance-name=\"ddDatagrid\" ac-builder-keep-html=\"false\"></div><div ac-builder-element-instance-name=\"ddInputField\" ac-builder-keep-html=\"false\"></div><form ac-builder-element-instance-name=\"bsForm\" ac-builder-keep-html=\"true\">\n    <div ac-builder-element-interactive=\"\" class=\"mb-3\" ac-builder-interactive-set=\"true\"><label for=\"exampleFormControlInput1\" ac-builder-element-interactive=\"\" class=\"form-label\">Email address</label><input id=\"exampleFormControlInput1\" type=\"email\" placeholder=\"name@example.com\" ac-builder-element-interactive=\"\" class=\"form-control\"></div>\n    <div ac-builder-element-interactive=\"\" class=\"mb-3\" ac-builder-interactive-set=\"true\"><label for=\"exampleFormControlTextarea1\" class=\"form-label\">Example textarea</label><textarea id=\"exampleFormControlTextarea1\" rows=\"3\" class=\"form-control\"></textarea></div>\n    <button type=\"submit\" class=\"btn btn-primary\">Submit</button>\n    </form></div>",
      "script": "class DefaultPageScript {\n\n    handleContainer1Click() {\n        console.log(\"Container 1 Click\");\n    }\n\n    handleContainer1DoubleClick() {\n        alert(\"Container 1 Double Click\");\n    }\n\n    handleBsFormSubmit() {\n        alert(\"Container 1 Double Click\");\n    }\n\n}",
      "className": "DefaultPageScript"
    }
  ]
};
      setTimeout(() => {
        this.builderApi.fromJson(state);
      }, 500);
    }
  }
}
