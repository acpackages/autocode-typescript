/* eslint-disable @nx/enforce-module-boundaries */
import './../../../../../packages/browser/ac-builder/src/lib/css/ac-builder.css';
import { AcLogger,AcContext } from '@autocode-ts/autocode';
import { AcBuilder, AcBuilderApi, AcBuilderRuntimeComponent, IAcBuilderComponent, AcBuilderElementsManager } from '@autocode-ts/ac-builder';
import { PageHeader } from '../../components/page-header/page-header.component';
import { AcDataDictionary } from '@autocode-ts/ac-data-dictionary';
import { dataDictionaryJson as actDataDictionary } from './../../../../data/accountea-pro';
import { acRegisterDataDictionaryBuilderElements } from '@autocode-ts/ac-dd-builder-elements';
import { AcModal } from '@autocode-ts/ac-browser';
import { acRegisterBootstrapBuilderElements } from '@autocode-ts/ac-bootstrap-builder-elements';

export class RuntimeComponentPage extends HTMLElement {
  builder!: AcBuilder;
  builderApi!: AcBuilderApi;
  pageHeader: PageHeader = new PageHeader();
  datagridComponent: IAcBuilderComponent = {
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
            "value": "act_customers",
            "valueType": "VALUE"
          },
          "columns": {
            "name": "columns",
            "value": {
              "columnDefinitions": [
                {
                  "title": "Action",
                  "field": "action",
                }
              ]
            },
            "valueType": "VALUE"
          },
          "onDemandFunction": {
            "name": "onDemandFunction",
            "value": "onDemandFunction",
            "valueType": "CLASS_PROPERTY_REFERENCE"
          }
        }
      }
    },
    "html": "<div ac-builder-element-instance-name=\"ddDatagrid\"></div>",
    "script": `
    class DefaultPageScript extends AcBuilderComponent {
      onDemandFunction: Function = async (requestArgs: IAcOnDemandRequestArgs) => {
        console.log('Getting records in onDemandFunction');
        const pageSize: number = requestArgs.rowsCount;
        const pageNumber: number = (requestArgs.startIndex / pageSize) + 1;
        const res = await fetch(\`http://localhost:8081/api/customers/get?page_size=\${pageSize}&page_number=\${pageNumber}\`);
        if (res.ok) {
          const response = await res.json();
          const callbackResponse: IAcOnDemandResponseArgs = {
            data: response.rows,
            totalCount: response.total_rows
          };
          requestArgs.successCallback(callbackResponse);
          // this.datagridApi.data = response.rows;
        }
      }
    }`,
    "className": "DefaultPageScript"
  };
  formComponent: IAcBuilderComponent = {
    "name": "form",
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
          "context": {
            "name": "context",
            "value": "context",
            "valueType": "CLASS_PROPERTY_REFERENCE"
          },
          "contextKey": {
            "name": "contextKey",
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
    "html": `<div>
      <div ac-builder-element-instance-name="bsContainer" ac-builder-keep-html="true">Container Element</div>
      <div ac-builder-element-instance-name="ddDatagrid" ac-builder-keep-html="false"></div>
      <div ac-builder-element-instance-name="ddInputField" ac-builder-keep-html="false"></div>
      <form ac-builder-element-instance-name="bsForm" ac-builder-keep-html="true">
        <div ac-builder-element-interactive="" class="mb-3" ac-builder-interactive-set="true">
          <label for="exampleFormControlInput1" ac-builder-element-interactive="" class="form-label">Email address</label>
          <input id="exampleFormControlInput1" type="email" placeholder="name@example.com" ac-builder-element-interactive="" class="form-control">
        </div>
        <div ac-builder-element-interactive="" class="mb-3" ac-builder-interactive-set="true">
          <label for="exampleFormControlTextarea1" class="form-label">Example textarea</label>
          <textarea id="exampleFormControlTextarea1" rows="3" class="form-control"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>`,
    "script": `
      class FormPageScript extends AcBuilderComponent {
        context: AcContext = new AcContext({value: {}});
        handleContainer1Click() {
          console.log("Container 1 Click");
        }

        handleContainer1DoubleClick() {
          alert("Container 1 Double Click");
        }

        handleBsFormSubmit() {
          event.preventDefault();
          console.log(this.context);
          console.log(this.context.toJson());
        }
      }`,
    "className": "FormPageScript"
  };
  async connectedCallback() {
    this.style.display = "contents";
    const html = `
      <button type="button" class="btn btn-primary form-btn">Open Form Runtime Component in Modal</button>
      <button type="button" class="btn btn-danger datagrid-btn">Open Datagrid Runtime Component in Modal</button>
    `;
    this.innerHTML = html;
    const datagridBtn: HTMLElement = this.querySelector('.datagrid-btn')!;
    datagridBtn.addEventListener('click', () => {
      this.createDatagridRuntimeComponent(this.datagridComponent);
    });
    const formBtn: HTMLElement = this.querySelector('.form-btn')!;
    formBtn.addEventListener('click', () => {
      this.createDatagridRuntimeComponent(this.formComponent);
    });
    this.pageHeader.pageTitle = 'Builder';
    AcBuilderElementsManager.init();
    AcDataDictionary.registerDataDictionary({ jsonData: actDataDictionary });
    acRegisterDataDictionaryBuilderElements();
    acRegisterBootstrapBuilderElements();
    datagridBtn.click();
  }

  async createDatagridRuntimeComponent(component: any) {
    const runtimeComponent: AcBuilderRuntimeComponent = new AcBuilderRuntimeComponent({
      component: component,
      logger: new AcLogger()
    });
    runtimeComponent.scriptScope['AcContext'] = AcContext;
    await runtimeComponent.render();
    const div: HTMLElement = document.createElement('div');
    div.style.height = "90vh";
    div.style.width = "90vw";
    const instance = runtimeComponent.componentInstance;
    div.append(instance.element)
    this.openModal({ element: div });
  }



  openModal({ element, triggerElement }: { element: HTMLElement, triggerElement?: HTMLElement }) {
    const body = document.querySelector('body') as HTMLElement;
    const modal = new AcModal();
    modal.animationDuration = 150;
    modal.append(element);
    body.append(modal);
    modal.open({ triggerElement });
    modal.on({
      event: 'close', callback: () => {
        modal.remove();
      }
    })
    return modal;
  }

}
