// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { AcInputBase, AcSelectInputElement, AcDatagridSelectInputElement } from '@autocode-ts/ac-browser';
import '../src/ac-data-dictionary-components';
import { AcDDInputFieldElement, AcDDInputElement } from '../src/ac-data-dictionary-components';

describe('AcDDInputFieldElement & AcInputBase Recursion Fixes', () => {
  beforeAll(() => {
    // Provide attachInternals mock if not present in jsdom
    if (!HTMLElement.prototype.attachInternals) {
      HTMLElement.prototype.attachInternals = function () {
        return {
          setValidity: () => {},
          setFormValue: () => {},
          checkValidity: () => true,
          reportValidity: () => true,
          validity: { valid: true },
          validationMessage: '',
        } as any;
      };
    }
  });

  it('Custom elements should be registered', () => {
    expect(customElements.get('ac-dd-input-field')).toBe(AcDDInputFieldElement);
    expect(customElements.get('ac-dd-input')).toBe(AcDDInputElement);
  });

  it('AcInputBase should not include "value" in inputReflectedAttributes', () => {
    if (!customElements.get('ac-test-input-base')) {
      customElements.define('ac-test-input-base', class extends AcInputBase {});
    }
    const input = document.createElement('ac-test-input-base') as AcInputBase;
    expect(input.inputReflectedAttributes).not.toContain('value');
    expect(input.inputReflectedAttributes).toContain('class');
    expect(input.inputReflectedAttributes).toContain('placeholder');
    expect(input.inputReflectedAttributes).toContain('disabled');
    expect(input.inputReflectedAttributes).toContain('readonly');
    expect(input.inputReflectedAttributes).toContain('required');
  });

  it('AcDDInputFieldElement initializes with value attribute without RangeError', () => {
    const el = document.createElement('ac-dd-input-field') as AcDDInputFieldElement;
    expect(() => {
      el.setAttribute('table-name', 'act_ledger_accounts');
      el.setAttribute('column-name', 'reflecting_statement');
      el.setAttribute('name', 'reflecting_statement');
      el.setAttribute('value', 'ADJUSTMENT');
      document.body.appendChild(el);
    }).not.toThrow();

    expect(el.value).toBe('ADJUSTMENT');
    document.body.removeChild(el);
  });

  it('Setting value property on AcDDInputFieldElement updates ddInput and does not cause infinite loop', () => {
    const el = document.createElement('ac-dd-input-field') as AcDDInputFieldElement;
    document.body.appendChild(el);

    expect(() => {
      el.value = 'NEW_VALUE';
    }).not.toThrow();

    expect(el.value).toBe('NEW_VALUE');
    expect(el.getAttribute('value')).toBe('NEW_VALUE');

    // Update again with different value
    expect(() => {
      el.value = 'ANOTHER_VALUE';
    }).not.toThrow();

    expect(el.value).toBe('ANOTHER_VALUE');
    expect(el.getAttribute('value')).toBe('ANOTHER_VALUE');

    document.body.removeChild(el);
  });

  it('Setting attribute "value" dynamically updates element value without recursion', () => {
    const el = document.createElement('ac-dd-input-field') as AcDDInputFieldElement;
    document.body.appendChild(el);

    expect(() => {
      el.setAttribute('value', 'DYNAMIC_VAL');
    }).not.toThrow();

    expect(el.value).toBe('DYNAMIC_VAL');
    document.body.removeChild(el);
  });

  it('AcDDInputElement initializes and syncs value without throwing Maximum call stack size exceeded', () => {
    const ddInput = document.createElement('ac-dd-input') as AcDDInputElement;
    expect(() => {
      ddInput.setAttribute('value', 'INITIAL');
      document.body.appendChild(ddInput);
      ddInput.value = 'UPDATED';
    }).not.toThrow();

    expect(ddInput.value).toBe('UPDATED');
    document.body.removeChild(ddInput);
  });

  it('AcSelectInputElement value getter returns the set value', () => {
    const select = new AcSelectInputElement();
    document.body.appendChild(select);

    select.options = [
      { label: 'Option One', value: 'opt1' },
      { label: 'Option Two', value: 'opt2' }
    ];

    select.value = 'opt1';
    expect(select.value).toBe('opt1');
    expect((select as any).textInputElement.value).toBe('Option One');

    select.setValue('opt2');
    expect(select.value).toBe('opt2');
    expect((select as any).textInputElement.value).toBe('Option Two');

    select.value = null;
    expect(select.value).toBe(null);
    expect((select as any).textInputElement.value).toBe('');

    document.body.removeChild(select);
  });

  it('AcDDInputElement with AcSelectInputElement as inputElement returns value properly', () => {
    const ddInput = document.createElement('ac-dd-input') as AcDDInputElement;
    const select = new AcSelectInputElement();
    select.options = [
      { label: 'Alpha', value: 'a' },
      { label: 'Beta', value: 'b' }
    ];
    ddInput.inputElement = select;
    ddInput.appendChild(select);
    document.body.appendChild(ddInput);

    ddInput.value = 'a';
    expect(ddInput.inputElement.value).toBe('a');
    expect(ddInput.value).toBe('a');

    ddInput.inputElement.value = 'b';
    expect(ddInput.inputElement.value).toBe('b');

    document.body.removeChild(ddInput);
  });

  it('AcDatagridSelectInputElement value getter returns the set value', () => {
    const dgSelect = new AcDatagridSelectInputElement();
    document.body.appendChild(dgSelect);

    dgSelect.value = 'row1';
    expect(dgSelect.value).toBe('row1');

    dgSelect.setValue('row2');
    expect(dgSelect.value).toBe('row2');

    document.body.removeChild(dgSelect);
  });
});
