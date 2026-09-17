/**
 * @jest-environment jsdom
 */
import './ac-number-input-element.element';
import { AcNumberInput } from './ac-number-input-element.element';

describe('AcNumberInput step attribute tests', () => {
  beforeAll(() => {
    if (!HTMLElement.prototype.attachInternals) {
      HTMLElement.prototype.attachInternals = function () {
        return {
          setValidity: jest.fn(),
          setFormValue: jest.fn(),
          checkValidity: jest.fn(() => true),
          reportValidity: jest.fn(() => true),
          validity: { valid: true },
          validationMessage: '',
        } as any;
      };
    }
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should be registered as custom element ac-number-input', () => {
    expect(customElements.get('ac-number-input')).toBe(AcNumberInput);
  });

  it('should default step to "any" on inner inputElement when no step attribute is provided', () => {
    const el = document.createElement('ac-number-input') as AcNumberInput;
    expect(el.hasAttribute('step')).toBe(false);
    expect(el.step).toBe('any');
    expect(el.inputElement.getAttribute('step')).toBe('any');

    document.body.appendChild(el);
    expect(el.hasAttribute('step')).toBe(false);
    expect(el.step).toBe('any');
    expect(el.inputElement.getAttribute('step')).toBe('any');
  });

  it('should not fail step validation when decimal values are entered without step attribute', () => {
    const el = document.createElement('ac-number-input') as AcNumberInput;
    document.body.appendChild(el);

    el.value = 12.34;
    expect(el.inputElement.value).toBe('12.34');
    expect(el.inputElement.validity.stepMismatch).toBe(false);
    expect(el.validityStateFlags.flags.stepMismatch).toBeFalsy();
    expect(el.validityStateFlags.message).not.toBe('Please enter a valid step value.');
    expect(el.validityStateFlags.valid).toBe(true);

    el.value = 0.05;
    expect(el.inputElement.value).toBe('0.05');
    expect(el.inputElement.validity.stepMismatch).toBe(false);
    expect(el.validityStateFlags.flags.stepMismatch).toBeFalsy();
    expect(el.validityStateFlags.valid).toBe(true);
  });

  it('should retain step="any" on inputElement after refreshReflectedAttributes is called', () => {
    const el = document.createElement('ac-number-input') as AcNumberInput;
    document.body.appendChild(el);

    el.refreshReflectedAttributes();
    expect(el.inputElement.getAttribute('step')).toBe('any');

    el.className = 'custom-class';
    expect(el.inputElement.getAttribute('step')).toBe('any');
  });

  it('should respect explicitly configured step attribute', () => {
    const el = document.createElement('ac-number-input') as AcNumberInput;
    el.setAttribute('step', '2');
    document.body.appendChild(el);

    expect(el.step).toBe(2);
    expect(el.inputElement.getAttribute('step')).toBe('2');

    // Value matching step (even number)
    el.value = 4;
    expect(el.inputElement.validity.stepMismatch).toBe(false);
    expect(el.validityStateFlags.flags.stepMismatch).toBeFalsy();

    // Value not matching step (odd number when base is 0 and step is 2)
    el.value = 3;
    expect(el.inputElement.validity.stepMismatch).toBe(true);
    expect(el.validityStateFlags.flags.stepMismatch).toBe(true);
    expect(el.validityStateFlags.message).toBe('Please enter a valid step value.');
  });

  it('should revert to step="any" on inputElement when step is removed or cleared', () => {
    const el = document.createElement('ac-number-input') as AcNumberInput;
    el.setAttribute('step', '2');
    document.body.appendChild(el);
    expect(el.inputElement.getAttribute('step')).toBe('2');

    el.removeAttribute('step');
    expect(el.step).toBe('any');
    expect(el.inputElement.getAttribute('step')).toBe('any');

    el.value = 3.75;
    expect(el.inputElement.validity.stepMismatch).toBe(false);
    expect(el.validityStateFlags.flags.stepMismatch).toBeFalsy();
    expect(el.validityStateFlags.valid).toBe(true);
  });

  it('should support setting step property to "any"', () => {
    const el = document.createElement('ac-number-input') as AcNumberInput;
    document.body.appendChild(el);

    el.step = 'any';
    expect(el.step).toBe('any');
    expect(el.inputElement.getAttribute('step')).toBe('any');
    expect(el.getAttribute('step')).toBe('any');

    el.value = 99.999;
    expect(el.inputElement.validity.stepMismatch).toBe(false);
    expect(el.validityStateFlags.valid).toBe(true);
  });
});
