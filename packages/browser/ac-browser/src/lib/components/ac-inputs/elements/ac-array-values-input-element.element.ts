/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocode } from "@autocode-ts/autocode";
import { arrayRemoveByIndex } from "@autocode-ts/ac-extensions";
import { AcInputBase } from "../core/ac-input-base";
import { AC_INPUT_TAG } from "../consts/ac-input-tags.const";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { IAcInputValueChangeEvent } from "../interfaces/ac-input-value-change-event.interface";
import { AcEnumInputEvent } from "../enums/ac-enum-input-event.enum";

interface IAcArrayValueItem {
  id: string,
  index: number,
  item: any,
  element?: HTMLElement,
}

export class AcArrayValuesInputElement extends AcInputBase {

  override get isValidRequired(): boolean {
    return this.value.length > 0;
  }

  override reflectValueAttribute: boolean = false;
  override isInputElementValidHtmlInput: boolean = false;
  itemsElement?: HTMLElement;
  itemClone?: HTMLElement;
  private items: IAcArrayValueItem[] = [];

  protected override _value: any[] = [];

  constructor() {
    super();
    this.value = [];
  }

  addItem({ data = {} }: { data?: any } = {}) {
    if (this.itemsElement && this.itemClone) {
      const arrayValueItem: IAcArrayValueItem = {
        id: Autocode.uniqueId(),
        item: data,
        index: this.value.length
      };
      this.value.push(data);
      this.items.push(arrayValueItem);
      this.renderArrayValueItem({ arrayValueItem });
      this.notifyValueChange();
    }
  }

  override init(): void {
    super.init();
    const itemsElement = this.querySelector('[ac-array-values-items]');
    if (itemsElement) {
      this.itemsElement = itemsElement as HTMLElement;
      if (itemsElement.childElementCount > 0) {
        this.itemClone = itemsElement.children[0].cloneNode(true) as HTMLElement;
      }
      acClearElement({element:this.itemsElement});
    }
    const addItemElements = this.querySelectorAll('[ac-array-values-item-add]');
    if (addItemElements) {
      for (const element of Array.from(addItemElements) as HTMLElement[]) {
        element.addEventListener('click', () => {
          this.addItem();
        });
      }
    }
    this.refreshItems();
  }

  notifyValueChange() {
    this.dispatchEvent(new CustomEvent('valuechange', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    const eventArgs: IAcInputValueChangeEvent = {
      oldValue: null,
      value: this.value,
      instance: this
    };
    this.events.execute({ event: AcEnumInputEvent.ValueChange, args: eventArgs });
    this.events.execute({ event: AcEnumInputEvent.Input, args: eventArgs });
  }

  private registerValueInputListeners({ arrayValueItem }: { arrayValueItem: IAcArrayValueItem }) {
    if (arrayValueItem.element) {
      for (const inputElement of Array.from(arrayValueItem.element.querySelectorAll('[ac-array-values-item-input]')) as HTMLInputElement[]) {
        const itemKey = inputElement!.getAttribute('ac-array-value-item-key');
        const setValue = () => {
          if (itemKey) {
            arrayValueItem.item[itemKey] = inputElement.value;
          }
          else {
            arrayValueItem.item = inputElement.value;
          }
          this.value[arrayValueItem.index] = arrayValueItem.item;
        }
        if (arrayValueItem.item) {
          if (itemKey) {
            if (arrayValueItem.item[itemKey]) {
              inputElement.value = arrayValueItem.item[itemKey];
            }
          }
          else {
            inputElement.value = arrayValueItem.item;
          }
        }
        inputElement.addEventListener('keyup', () => {
          setValue();
        });
        inputElement.addEventListener('input', () => {
          setValue();
        });
        inputElement.addEventListener('change', () => {
          setValue();
        });
      }
    }
  }

  private refreshItems() {
    if (this.itemsElement && this.itemClone) {
      this.items = [];
      for (const item of this.value) {
        const arrayValueItem: IAcArrayValueItem = {
          id: Autocode.uniqueId(),
          item: item,
          index: this.items.length
        };
        this.items.push(arrayValueItem);
        this.renderArrayValueItem({ arrayValueItem });
      }
    }
  }

  removeItem({ index }: { index: number }) {
    if (this.items[index].element) {
      this.items[index].element.remove();
    }
    arrayRemoveByIndex(this.value, index);
    arrayRemoveByIndex(this.items, index);
    let newIndex: number = 0;
    for (const item of this.items) {
      item.index = newIndex;
      newIndex++;
    }
    this.notifyValueChange();
  }

  private renderArrayValueItem({ arrayValueItem }: { arrayValueItem: IAcArrayValueItem }) {
    if (this.itemsElement && this.itemClone) {
      const itemId: string = arrayValueItem.id;
      if (this.itemsElement.querySelector(`[ac-array-values-item-id=${itemId}]`) == null) {
        const itemElement = this.itemClone.cloneNode(true) as HTMLElement;
        itemElement.setAttribute('ac-array-values-item-id', itemId);
        arrayValueItem.element = itemElement;
        this.itemsElement?.append(itemElement);
        this.registerValueInputListeners({ arrayValueItem });
        const removeItemElements = itemElement.querySelectorAll('[ac-array-values-item-remove]');
        if (removeItemElements) {
          for (const element of Array.from(removeItemElements) as HTMLElement[]) {
            element.addEventListener('click', () => {
              this.removeItem({ index: arrayValueItem.index });
            });
          }
        }
      }
    }
  }

  override setValue(value: any): void {
    if (value != this._value) {
      super.setValue(value);
      this._value = value;
    }
    this.refreshItems();
  }

  override setValueListener() {
    Object.defineProperty(this, 'value', {
      get() {
        return this._value;
      },

      set(value) {
        if (value == undefined || value == null) {
      value = [];
    }
    if (value != this._value) {
      this.setValue(value);
    }
      },

      enumerable: true,
      configurable: true
    });
  }

}

acRegisterCustomElement({ tag: AC_INPUT_TAG.arrayValuesInput, type: AcArrayValuesInputElement });
