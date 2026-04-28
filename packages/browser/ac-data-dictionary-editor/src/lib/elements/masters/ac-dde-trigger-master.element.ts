import { acRegisterCustomElement, AcTextareaInputElement } from "@autocode-ts/ac-browser";
import { AC_DDE_TAG, AcDDECssClassName, AcDDEElementBase, IAcDDETrigger } from "../../_ac-data-dictionary-editor.export";

export class AcDDETriggerMaster extends AcDDEElementBase {
  private _trigger: IAcDDETrigger | any;
  get trigger(): IAcDDETrigger {
    return this._trigger;
  }
  set trigger(value: IAcDDETrigger) {
    this._trigger = value;
    this.queryInput.value = value.triggerCode ? value.triggerCode : '';
  }

  changeTimeout:any;
  element: HTMLElement = this.ownerDocument.createElement('div');
  queryInput!: AcTextareaInputElement;

  override init() {
    super.init();
    this.append(this.element);
    this.element.classList.add(AcDDECssClassName.acDDEMasterContainer);
    this.element.innerHTML = `
    <div class="form-group" style="height:100%">
        <label>Trigger Query</label>
        <div style="height:calc(100% - 25px);">
        <ac-textarea-input class="form-control query-input" rows="12"></ac-textarea-input>
        </div>
      </div>
    `;
    this.queryInput = this.element.querySelector('.query-input') as AcTextareaInputElement;
    this.queryInput.on({
      event: 'change', callback: () => {
        this.notifyChange();
      }
    });
    this.queryInput.on({
      event: 'input', callback: () => {
        this.notifyChange();
      }
    });
  }

  notifyChange() {
    if (this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }
    this.delayedCallback.add({callback:() => {
      this.trigger.triggerCode = this.queryInput.value;
      this.events.execute({ event: 'change', args: { trigger: this.trigger } });
    }, duration:300});
  }
}

acRegisterCustomElement({ tag: AC_DDE_TAG.triggerMaster, type: AcDDETriggerMaster });
