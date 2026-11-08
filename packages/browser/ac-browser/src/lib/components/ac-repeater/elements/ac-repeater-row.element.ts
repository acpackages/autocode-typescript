/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcRepeaterAttributeName } from "../consts/ac-repeater-attribute-name.const";
import { AcRepeaterCssClassName } from "../consts/ac-repeater-css-class-name.const";
import { AcRepeaterApi } from "../core/ac-repeater-api";
import { IAcRepeaterRow } from "../interfaces/ac-repeater-row.interface";
import { AcEnumRepeaterHook } from "../enums/ac-enum-repeater-hooks.enum";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_REPEATER_TAG, IAcRepeaterRowRendererElementArgs } from "../_ac-repeater.export";
import { AcRepeaterRowEditForm, IAcRepeaterRowEditResult } from "./ac-repeater-row-edit-form";
import { IAcRepeaterFieldDef } from "../interfaces/ac-repeater-field-def.interface";
import { IAcRepeaterFieldValueChangeArgs } from "../interfaces/event-args/ac-repeater-field-value-change-event.interface";
import { AcEnumRepeaterEvent } from "../enums/ac-enum-repeater-event.enum";
import { IAcRepeaterRowEditorArgs } from "../interfaces/callback-args/ac-repeater-row-editor-args.interface";

export class AcRepeaterRowElement extends AcElementBase {
  private repeaterApi: AcRepeaterApi;
  private repeaterRow!: IAcRepeaterRow;
  swappingRowPosition: boolean = false;
  private renderingElement: HTMLElement | null = null;
  // PERF FIX (2.1): hookSubscriptionIds kept for extension use; RowUpdate moved to body-level delegation
  private hookSubscriptionIds: string[] = [];
  // PERF FIX (2.1): Exposed so AcRepeaterBodyElement can route delegated RowUpdate without closure capture
  repeaterRowId: string = '';
  public isEditing: boolean = false;
  private _editForm?: AcRepeaterRowEditForm;
  private _customEditElement?: HTMLElement;
  private _dataSnapshot?: Record<string, any>;

  private clearRenderingElement() {
    if (this.renderingElement) {
      this.renderingElement.remove();
      this.renderingElement = null;
    }
  }

  override destroy(): void {
    this.repeaterRow.instance = null;
    this.repeaterApi.hooks.unsubscribe({ subscriptionIds: this.hookSubscriptionIds });
    super.destroy();
  }

  initElement() {
    // PERF FIX (2.1): Store rowId for body-level RowUpdate delegation
    this.repeaterRowId = this.repeaterRow.rowId;
    this.setAttribute(AcRepeaterAttributeName.IAcRepeaterRowId, this.repeaterRow.rowId);
    acAddClassToElement({ class_: AcRepeaterCssClassName.IAcRepeaterRow, element: this });
    if (this.repeaterRow.index == 0 || this.repeaterRow.index % 2 == 0) {
      acAddClassToElement({ class_: AcRepeaterCssClassName.IAcRepeaterRowEven, element: this });
    }
    else {
      acAddClassToElement({ class_: AcRepeaterCssClassName.IAcRepeaterRowOdd, element: this });
    }
    // PERF FIX (2.1): RowUpdate hook is now handled by a single delegation subscription in AcRepeaterBodyElement
    // to prevent N dangling subscriptions accumulating on clearBody()+rebuild cycles.
    // Extensions may still use hookSubscriptionIds via hooks.subscribe() in their own init().
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
      acClearElement({ element: this });
      const args: IAcRepeaterRowRendererElementArgs = {
        rowElement: this,
        row: this.repeaterRow
      };
      this.renderingElement = this.repeaterApi.rowRendererFunction(args);
      this.append(this.renderingElement);
    } else {
      // PERF FIX (3.2): textContent avoids HTML parsing overhead and XSS risk vs innerHTML
      this.textContent = JSON.stringify(this.repeaterRow.data);
    }
  }

  setRow({ repeaterApi, repeaterRow, index }: { repeaterApi: AcRepeaterApi, repeaterRow: IAcRepeaterRow, index?: number }) {
    this.repeaterApi = repeaterApi;
    this.repeaterRow = repeaterRow;
    this.initElement();
  }

  enterEditMode(): void {
    if (this.isEditing) return;
    this.isEditing = true;
    this._dataSnapshot = { ...this.repeaterRow.data };
    acClearElement({ element: this });
    this.classList.add(AcRepeaterCssClassName.acRepeaterRowEditing);

    if (this.repeaterApi.rowEditorFunction) {
      const args: IAcRepeaterRowEditorArgs = {
        row:          this.repeaterRow,
        rowElement:   this,
        fields:       this.repeaterApi.fields as IAcRepeaterFieldDef[],
        dataSnapshot: { ...this._dataSnapshot },
        repeaterApi:  this.repeaterApi,

        notifyFieldChange: (field: IAcRepeaterFieldDef, newValue: any) => {
          const oldValue = this._dataSnapshot![field.key];
          this.repeaterRow.data[field.key] = newValue;
          const changeArgs: IAcRepeaterFieldValueChangeArgs = {
            repeaterApi: this.repeaterApi, repeaterRow: this.repeaterRow,
            field, oldValue, newValue,
          };
          this.repeaterApi.hooks.execute({ hook: AcEnumRepeaterHook.RowFieldValueChange, args: changeArgs });
          this.repeaterApi.events.execute({ event: AcEnumRepeaterEvent.RowFieldValueChange, args: changeArgs });
        },

        commit: (changedFields?: string[]) => {
          this.repeaterApi.stopEditingRow({ commit: true, changedFields });
        },

        cancel: () => {
          this.repeaterApi.stopEditingRow({ commit: false });
        },
      };

      this._customEditElement = this.repeaterApi.rowEditorFunction(args);
      this.append(this._customEditElement);
    } else {
      this._editForm = new AcRepeaterRowEditForm(
        this.repeaterApi,
        this.repeaterRow,
        this.repeaterApi.fields as IAcRepeaterFieldDef[],
      );
      this.append(this._editForm.build());
      setTimeout(() => this._editForm?.focusFirst(), 0);
    }
  }

  exitEditMode({ committed, changedFields }: { committed: boolean; changedFields?: string[] }): IAcRepeaterRowEditResult {
    if (!this.isEditing) return { committed, changedFields: changedFields ?? [] };
    this.isEditing = false;
    let result: IAcRepeaterRowEditResult;

    if (this._customEditElement) {
      if (!committed && this._dataSnapshot) {
        Object.assign(this.repeaterRow.data, this._dataSnapshot);
      }
      this._customEditElement.remove();
      this._customEditElement = undefined;
      result = { committed, changedFields: changedFields ?? [] };
    } else if (this._editForm) {
      result = committed ? this._editForm.commit() : this._editForm.cancel();
      this._editForm = undefined;
    } else {
      result = { committed, changedFields: [] };
    }

    this.classList.remove(AcRepeaterCssClassName.acRepeaterRowEditing);
    this.render();
    return result;
  }
}

acRegisterCustomElement({ tag: AC_REPEATER_TAG.repeaterRow, type: AcRepeaterRowElement });
