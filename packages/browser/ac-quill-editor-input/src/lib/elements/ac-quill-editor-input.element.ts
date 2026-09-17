/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcInputBase, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import Quill from "quill";
import { AC_QUILL_EDITOR_OPTIONS } from "../consts/ac-quill-editor-options.const";

export class AcQuillEditorInput extends AcInputBase {
  override isInputElementValidHtmlInput = false;

  static override get observedAttributes() {
    return [...super.observedAttributes, "placeholder", "readonly"];
  }

  override get inputReflectedAttributes() {
    return [...super.inputReflectedAttributes, "placeholder", "readonly"];
  }

  override get placeholder(): string | null {
    return this.getAttribute("placeholder");
  }
  override set placeholder(value: string | null) {
    if (value) {
      this.setAttribute("placeholder", value);
      this.editor?.root.setAttribute("data-placeholder", value);
    } else {
      this.removeAttribute("placeholder");
      this.editor?.root.removeAttribute("data-placeholder");
    }
  }

  get readOnly(): boolean {
    return this.hasAttribute("readonly");
  }
  set readOnly(value: boolean) {
    if (value) {
      this.setAttribute("readonly", "");
      this.editor?.enable(false);
    } else {
      this.removeAttribute("readonly");
      this.editor?.enable(true);
    }
  }

  override get value(): string {
    const raw = this._value || "";
    return raw === '<p><br></p>' ? '' : raw;
  }

  override set value(val: string) {
    this.setValue({ value: val });
  }

  override setValue(arg: any, maybeEmit?: boolean): void {
    let val: any;
    let emitEvent: boolean = true;
    if (arg !== null && typeof arg === 'object' && 'value' in arg && Object.keys(arg).every(k => k === 'value' || k === 'emitEvent')) {
      val = arg.value;
      emitEvent = arg.emitEvent !== false;
    } else {
      val = arg;
      if (maybeEmit === false) emitEvent = false;
    }

    const normalized = (val === '<p><br></p>' || !val) ? '' : val;
    if (this.editor && normalized !== this.editor.root.innerHTML) {
      this.editor.root.innerHTML = normalized;
    }
    super.setValue({ value: normalized, emitEvent });
  }

  private editorEl!: HTMLDivElement;
  private editor!: Quill;
  private isEditorInitialized: boolean = false;

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;

    if (name === "placeholder") {
      this.placeholder = newValue;
    } else if (name === "readonly") {
      this.readOnly = newValue !== null;
    } else {
      super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.isEditorInitialized) {
      this.innerHTML = `<div class="ac-quill-container" style="display: flex;flex-direction: column;height: -webkit-fill-available;"><div class="ac-quill-editor"></div></div>`;
      this.editorEl = this.querySelector('.ac-quill-editor')!;
      this.editor = new Quill(this.editorEl, {
        ...AC_QUILL_EDITOR_OPTIONS,
        theme: "snow",
        placeholder: this.placeholder || "",
        readOnly: this.readOnly,
      });
      if (this.value) {
        this.editor.root.innerHTML = this.value;
      }
      this.editor.on("text-change", () => {
        const html = this.editor.root.innerHTML;
        const normalized = html === '<p><br></p>' ? '' : html;
        if (normalized !== this._value) {
          super.setValue({ value: normalized, emitEvent: true });
        }
      });
      this.isEditorInitialized = true;
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  override destroy(): void {
    this.isEditorInitialized = false;
    super.destroy();
  }


}

acRegisterCustomElement({ tag: 'ac-quill-editor-input', type: AcQuillEditorInput });
