/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acClearElement, AcModal, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcBuilderApi, AcBuilderPropertyInput, AcEnumBuilderHook, IAcBuilderElementPropertyChangeHookArgs } from "@autocode-ts/ac-builder";
import { AcDataDictionary, AcDDTable, AcDDView } from "@autocode-ts/ac-data-dictionary";

export class AcDDDatagridColumnsInput extends AcBuilderPropertyInput {
  override set builderApi(value: AcBuilderApi) {
    super.builderApi = value;
    value.hooks.subscribe({
      hook: AcEnumBuilderHook.ElementPropertyChange, callback: (args: IAcBuilderElementPropertyChangeHookArgs) => {
        if (this.componentElement?.instanceName == args.componentElement.instanceName && args.propertyName == 'sourceType') {
          // this.setSourceValueOptions();
        }
      }
    })
  }

  displayElement: HTMLInputElement = document.createElement('input');
  modal: AcModal = new AcModal();

  constructor() {
    super();
    this.displayElement.placeholder = "0 Column(s)";
    this.displayElement.readOnly = true;
    this.displayElement.addEventListener('click', () => {
      this.openModal();
    });
    this.modal.innerHTML = `
    <div class="ac-modal-header" style="padding: 1rem; border-bottom: 1px solid #ddd;min-width:50vw;">
          <h5 style="margin: 0;font-weight:bold">Datagid Columns</h5>
        </div>
        <div class="ac-modal-body p-3" >
          <div class="form-group mb-2">
            <label class="form-label">Exclude Columns</label>
            <ac-tags-input class="form-control" />
          </div>
          <div class="form-group mb-2">
            <label class="form-label">Include Columns</label>
            <ac-tags-input class="form-control" />
          </div>
          <div class="form-group mb-2">
            <label class="form-label">Additional Columns</label>
            <ac-tags-input class="form-control" />
          </div>
          <ac-collapse ac-collapse-open>
            <div class="mb-2">
              <button type="button" class="btn btn-primary btn-sm" ac-collapse-toggle>Additional Columns</button>
            </div>
            <div ac-collapse-content class="border bg-white p-3">
              Include Columns List
            </div>
          </ac-collapse>
        </div>
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    acClearElement({element:this});
    this.append(this.displayElement);
  }

  openModal() {
    document.querySelector('body')?.append(this.modal);
    this.modal.open({ triggerElement: this.displayElement,morphModalColor:'white',morphTriggerColor:'#555' });
  }

}

acRegisterCustomElement({ tag: 'ac-dd-datagrid-columns-input', type: AcDDDatagridColumnsInput });
