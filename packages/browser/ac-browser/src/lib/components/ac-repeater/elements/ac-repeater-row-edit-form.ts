/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcRepeaterApi } from '../core/ac-repeater-api';
import { IAcRepeaterRow } from '../interfaces/ac-repeater-row.interface';
import { IAcRepeaterFieldDef } from '../interfaces/ac-repeater-field-def.interface';
import { IAcRepeaterFieldEditor } from '../interfaces/ac-repeater-field-editor.interface';
import { IAcRepeaterFieldEditorArgs } from '../interfaces/callback-args/ac-repeater-field-editor-args.interface';
import { AcRepeaterFieldEditorElement } from './ac-repeater-field-editor.element';
import { AcRepeaterFunctionalFieldEditor } from './ac-repeater-functional-field-editor';
import { AcRepeaterCssClassName } from '../consts/ac-repeater-css-class-name.const';

export interface IAcRepeaterRowEditResult {
  committed: boolean;
  changedFields: string[];
}

export class AcRepeaterRowEditForm {
  private editors: Map<string, IAcRepeaterFieldEditor> = new Map();
  public element!: HTMLElement;
  private _dataSnapshot: Record<string, any> = {};

  constructor(
    private repeaterApi: AcRepeaterApi,
    private repeaterRow: IAcRepeaterRow,
    private fields: IAcRepeaterFieldDef[],
  ) {}

  build(): HTMLElement {
    this._dataSnapshot = { ...this.repeaterRow.data };

    this.element = document.createElement('div');
    this.element.className = AcRepeaterCssClassName.acRepeaterRowEditForm;

    const editableFields = this.fields.filter(f => f.allowEdit !== false);
    for (const field of editableFields) {
      this.element.appendChild(this._buildFieldWrapper(field));
    }

    this._attachKeyboardListeners();
    this._attachBlurListener();
    return this.element;
  }

  commit(): IAcRepeaterRowEditResult {
    const changedFields: string[] = [];
    for (const [key, editor] of this.editors) {
      const newVal = editor.getValue();
      if (this._dataSnapshot[key] !== newVal) changedFields.push(key);
      this.repeaterRow.data[key] = newVal;
    }
    this.destroy();
    return { committed: true, changedFields };
  }

  cancel(): IAcRepeaterRowEditResult {
    Object.assign(this.repeaterRow.data, this._dataSnapshot);
    this.destroy();
    return { committed: false, changedFields: [] };
  }

  destroy(): void {
    for (const editor of this.editors.values()) editor.destroy?.();
    this.editors.clear();
    this.element?.remove();
  }

  focusFirst(): void {
    const first = this.editors.values().next().value as IAcRepeaterFieldEditor | undefined;
    first?.focus?.();
  }

  private _buildFieldWrapper(field: IAcRepeaterFieldDef): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = AcRepeaterCssClassName.acRepeaterFieldEditorWrapper;

    if (field.labelPosition !== 'hidden') {
      const label = document.createElement('label');
      label.textContent = field.label;
      label.className = AcRepeaterCssClassName.acRepeaterFieldEditorLabel;
      if (field.labelPosition === 'left') wrapper.classList.add('--label-left');
      wrapper.appendChild(label);
    }

    const args: IAcRepeaterFieldEditorArgs = {
      repeaterApi: this.repeaterApi,
      repeaterRow: this.repeaterRow,
      field,
      value:    this.repeaterRow.data[field.key],
      rawValue: this.repeaterRow.data[field.key],
      params:   field.fieldEditorElementParams,
    };

    let editor: IAcRepeaterFieldEditor;
    if (field.fieldEditorFunction) {
      editor = new AcRepeaterFunctionalFieldEditor();
    } else if (field.fieldEditorElement) {
      editor = new field.fieldEditorElement();
    } else {
      editor = new AcRepeaterFieldEditorElement();
    }

    editor.init(args);
    this.editors.set(field.key, editor);

    const editorEl = editor.getElement();
    wrapper.appendChild(editorEl);
    return wrapper;
  }

  private _attachKeyboardListeners(): void {
    this.element.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.repeaterApi.stopEditingRow({ commit: true });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.repeaterApi.stopEditingRow({ commit: false });
      }
    });
  }

  private _attachBlurListener(): void {
    this.element.addEventListener('focusout', (e: FocusEvent) => {
      if (!this.element.contains(e.relatedTarget as Node | null)) {
        setTimeout(() => {
          if (this.element && !this.element.contains(document.activeElement)) {
            this.repeaterApi.stopEditingRow({ commit: true });
          }
        }, 0);
      }
    });
  }
}
