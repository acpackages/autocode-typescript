/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcEnumRepeaterHook } from '../enums/ac-enum-repeater-hooks.enum';
import { AcEnumRepeaterEvent } from '../enums/ac-enum-repeater-event.enum';
import { IAcRepeaterFieldEditor } from '../interfaces/ac-repeater-field-editor.interface';
import { IAcRepeaterFieldEditorArgs } from '../interfaces/callback-args/ac-repeater-field-editor-args.interface';
import { IAcRepeaterFieldValueChangeArgs } from '../interfaces/event-args/ac-repeater-field-value-change-event.interface';
import { AcRepeaterCssClassName } from '../consts/ac-repeater-css-class-name.const';

export class AcRepeaterFieldEditorElement implements IAcRepeaterFieldEditor {
  public element!: HTMLInputElement | HTMLSelectElement;
  private args!: IAcRepeaterFieldEditorArgs;
  private _oldValue: any;

  getElement(): HTMLElement { return this.element; }

  getValue(): any {
    switch (this.args?.field?.type) {
      case 'BOOLEAN': return this.element.value === 'true';
      case 'NUMBER': {
        const n = parseFloat((this.element as HTMLInputElement).value);
        return isNaN(n) ? undefined : n;
      }
      default: return (this.element as HTMLInputElement).value;
    }
  }

  init(args: IAcRepeaterFieldEditorArgs): void {
    this.args = args;
    this._oldValue = args.rawValue ?? args.value;
    this.element = this._createElement(args);
    this._applyAttrs(args.field.fieldEditorElementAttrs);
    this._setInitialValue(this._oldValue);
    this.element.classList.add(AcRepeaterCssClassName.acRepeaterFieldEditorInput);
    this.element.addEventListener('input', this._onInputChange);
    this.element.addEventListener('change', this._onInputChange);
  }

  refresh(args: IAcRepeaterFieldEditorArgs): void {
    this.args = args;
    const val = args.rawValue ?? args.value;
    (this.element as any).value = (val === undefined || val === null) ? '' : val;
  }

  focus(): void { this.element?.focus(); }
  blur():  void { this.element?.blur(); }

  destroy(): void {
    this.element?.removeEventListener('input',  this._onInputChange);
    this.element?.removeEventListener('change', this._onInputChange);
    this.element?.remove();
  }

  private _createElement(args: IAcRepeaterFieldEditorArgs): HTMLInputElement | HTMLSelectElement {
    if (args.field.type === 'BOOLEAN') {
      const sel = document.createElement('select');
      ['true', 'false'].forEach(v => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = v;
        sel.append(opt);
      });
      return sel;
    }
    const input = document.createElement('input');
    if (args.field.type === 'NUMBER')        input.type = 'number';
    else if (args.field.type === 'DATE')     input.type = 'date';
    else if (args.field.type === 'DATETIME') input.type = 'datetime-local';
    if (args.field.placeholder) input.placeholder = args.field.placeholder;
    return input;
  }

  private _applyAttrs(attrs?: Record<string, any>): void {
    if (!attrs) return;
    for (const [k, v] of Object.entries(attrs)) {
      this.element.setAttribute(k, String(v));
    }
  }

  private _setInitialValue(value: any): void {
    (this.element as any).value = (value === undefined || value === null) ? '' : value;
  }

  private _onInputChange = (_e: Event): void => {
    if (!this.args) return;
    const newValue = this.getValue();
    const oldValue = this._oldValue;
    const bothEmpty = (v: any) => v === undefined || v === null || v === '';
    if ((bothEmpty(oldValue) && bothEmpty(newValue)) || oldValue === newValue) return;

    this.args.repeaterRow.data[this.args.field.key] = newValue;

    const changeArgs: IAcRepeaterFieldValueChangeArgs = {
      repeaterApi: this.args.repeaterApi,
      repeaterRow: this.args.repeaterRow,
      field:       this.args.field,
      oldValue,
      newValue,
    };
    this.args.repeaterApi.hooks.execute({ hook: AcEnumRepeaterHook.RowFieldValueChange, args: changeArgs });
    this.args.repeaterApi.events.execute({ event: AcEnumRepeaterEvent.RowFieldValueChange, args: changeArgs });
    this._oldValue = newValue;
  };
}
