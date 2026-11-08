/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcEnumRepeaterHook } from '../enums/ac-enum-repeater-hooks.enum';
import { AcEnumRepeaterEvent } from '../enums/ac-enum-repeater-event.enum';
import { IAcRepeaterFieldEditor } from '../interfaces/ac-repeater-field-editor.interface';
import { IAcRepeaterFieldEditorArgs } from '../interfaces/callback-args/ac-repeater-field-editor-args.interface';
import { IAcRepeaterFieldValueChangeArgs } from '../interfaces/event-args/ac-repeater-field-value-change-event.interface';

export class AcRepeaterFunctionalFieldEditor implements IAcRepeaterFieldEditor {
  public element!: HTMLElement;
  private args!: IAcRepeaterFieldEditorArgs;
  private _oldValue: any;
  private _handleChange!: (e: Event) => void;

  getElement(): HTMLElement { return this.element; }

  getValue(): any {
    if (typeof (this.element as any).getValue === 'function') {
      return (this.element as any).getValue();
    }
    if ('value' in (this.element as any)) return (this.element as any).value;
    return this._oldValue;
  }

  init(args: IAcRepeaterFieldEditorArgs): void {
    this.args      = args;
    this._oldValue = args.rawValue ?? args.value;

    const el = args.field.fieldEditorFunction!(args);
    this.element = el;

    this._handleChange = (_e: Event) => {
      const newValue = this.getValue();
      const oldValue = this._oldValue;
      const bothEmpty = (v: any) => v === undefined || v === null || v === '';
      if ((bothEmpty(oldValue) && bothEmpty(newValue)) || oldValue === newValue) return;

      args.repeaterRow.data[args.field.key] = newValue;

      const changeArgs: IAcRepeaterFieldValueChangeArgs = {
        repeaterApi: args.repeaterApi,
        repeaterRow: args.repeaterRow,
        field:       args.field,
        oldValue,
        newValue,
      };
      args.repeaterApi.hooks.execute({ hook: AcEnumRepeaterHook.RowFieldValueChange, args: changeArgs });
      args.repeaterApi.events.execute({ event: AcEnumRepeaterEvent.RowFieldValueChange, args: changeArgs });
      this._oldValue = newValue;
    };

    this.element.addEventListener('input',  this._handleChange);
    this.element.addEventListener('change', this._handleChange);
  }

  refresh(args: IAcRepeaterFieldEditorArgs): void {
    this.args = args;
    const val = args.rawValue ?? args.value;
    if (typeof (this.element as any).refresh === 'function') {
      (this.element as any).refresh(args);
    } else if ('value' in (this.element as any)) {
      (this.element as any).value = val ?? '';
    }
  }

  focus(): void { this.element?.focus?.(); }
  blur():  void { this.element?.blur?.(); }

  destroy(): void {
    if (this._handleChange) {
      this.element?.removeEventListener('input',  this._handleChange);
      this.element?.removeEventListener('change', this._handleChange);
    }
    this.element?.remove?.();
  }
}
