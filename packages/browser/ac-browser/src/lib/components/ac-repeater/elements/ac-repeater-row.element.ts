/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcRepeaterAttributeName } from "../consts/ac-repeater-attribute-name.const";
import { AcRepeaterCssClassName } from "../consts/ac-repeater-css-class-name.const";
import { AcRepeaterApi } from "../core/ac-repeater-api";
import { IAcRepeaterRow } from "../interfaces/ac-repeater-row.interface";
import { AcEnumRepeaterHook } from "../enums/ac-enum-repeater-hooks.enum";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_REPEATER_TAG, IAcRepeaterRowRendererElementArgs } from "../_ac-repeater.export";

export class AcRepeaterRowElement extends AcElementBase {
  private repeaterApi: AcRepeaterApi;
  private repeaterRow!: IAcRepeaterRow;
  swappingRowPosition: boolean = false;
  private renderingElement:HTMLElement|null = null;
  private hookSubscriptionIds:string[] = [];

  private clearRenderingElement(){
    if(this.renderingElement){
      this.renderingElement.remove();
      this.renderingElement = null;
    }
  }

  override destroy(): void {
    this.repeaterRow.instance = null;
    this.repeaterApi.hooks.unsubscribe({subscriptionIds:this.hookSubscriptionIds});
  }

  initElement() {
    this.style.display = "block";
    this.setAttribute(AcRepeaterAttributeName.IAcRepeaterRowId, this.repeaterRow.rowId);
    acAddClassToElement({ class_: AcRepeaterCssClassName.IAcRepeaterRow, element: this });
    if (this.repeaterRow.index == 0 || this.repeaterRow.index % 2 == 0) {
      acAddClassToElement({ class_: AcRepeaterCssClassName.IAcRepeaterRowEven, element: this });
    }
    else {
      acAddClassToElement({ class_: AcRepeaterCssClassName.IAcRepeaterRowOdd, element: this });
    }
    this.hookSubscriptionIds.push(this.repeaterApi.hooks.subscribe({
      hook: AcEnumRepeaterHook.RowUpdate,
      callback: (args: any) => {
        if (args.repeaterRow.rowId == this.repeaterRow.rowId) {
          this.refresh();
        }
      }
    }));
    // this.registerListeners();
    this.render();
  }

  refresh() {
    this.render();
  }

  registerListeners() {
    this.addEventListener('blur', (e: FocusEvent) => {
      this.repeaterApi.eventHandler.handleRowBlur({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('focus', (e: FocusEvent) => {
      this.repeaterApi.eventHandler.handleRowFocus({ repeaterRow: this.repeaterRow, event: e });
    });

    this.addEventListener('keydown', (e: KeyboardEvent) => {
      this.repeaterApi.eventHandler.handleRowKeyDown({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('keypress', (e: KeyboardEvent) => {
      this.repeaterApi.eventHandler.handleRowKeyPress({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('keyup', (e: KeyboardEvent) => {
      this.repeaterApi.eventHandler.handleRowKeyDown({ repeaterRow: this.repeaterRow, event: e });
    });

    this.addEventListener('click', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowClick({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('dblclick', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowDoubleClick({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('mousedown', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowMouseDown({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('mouseenter', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowMouseEnter({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('mouseleave', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowMouseLeave({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('mousemove', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowMouseMove({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('mouseover', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowMouseOver({ repeaterRow: this.repeaterRow, event: e });
    });
    this.addEventListener('mouseup', (e: MouseEvent) => {
      this.repeaterApi.eventHandler.handleRowMouseUp({ repeaterRow: this.repeaterRow, event: e });
    });

    this.addEventListener('touchcancel', (e: TouchEvent) => {
      this.repeaterApi.eventHandler.handleRowTouchCancel({ repeaterRow: this.repeaterRow, event: e });
    }, { passive: true });
    this.addEventListener('touchend', (e: TouchEvent) => {
      this.repeaterApi.eventHandler.handleRowTouchEnd({ repeaterRow: this.repeaterRow, event: e });
    }, { passive: true });
    this.addEventListener('touchmove', (e: TouchEvent) => {
      this.repeaterApi.eventHandler.handleRowTouchMove({ repeaterRow: this.repeaterRow, event: e });
    }, { passive: true });
    this.addEventListener('touchstart', (e: TouchEvent) => {
      this.repeaterApi.eventHandler.handleRowTouchStart({ repeaterRow: this.repeaterRow, event: e });
    }, { passive: true });
  }

  render() {
    this.clearRenderingElement();
    if (this.repeaterApi.rowRendererFunction) {
      this.innerHTML = '';
      const args: IAcRepeaterRowRendererElementArgs = {
        rowElement: this,
        row: this.repeaterRow
      };
      this.renderingElement = this.repeaterApi.rowRendererFunction(args);
      this.append(this.renderingElement);
    } else {
      this.innerHTML = JSON.stringify(this.repeaterRow.data);
    }
  }

  setRow({ repeaterApi, repeaterRow, index }: { repeaterApi: AcRepeaterApi, repeaterRow: IAcRepeaterRow, index?: number }) {
    this.repeaterApi = repeaterApi;
    this.repeaterRow = repeaterRow;
    this.initElement();
  }
}

acRegisterCustomElement({ tag: AC_REPEATER_TAG.repeaterRow, type: AcRepeaterRowElement });

