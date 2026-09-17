/**
 * @jest-environment jsdom
 */
import './ac-form-element.element';
import './ac-form-field-element.element';
import './ac-form-field-error-element.element';
import '../../ac-inputs/elements/ac-input-element.element';
import { AcForm } from './ac-form-element.element';
import { AcFormField } from './ac-form-field-element.element';
import { AcFormFieldErrorMessage } from './ac-form-field-error-element.element';
import { AcInputElement } from '../../ac-inputs/elements/ac-input-element.element';

describe('AcForm validation and submission tests', () => {
  beforeAll(() => {
    if (!HTMLElement.prototype.attachInternals) {
      HTMLElement.prototype.attachInternals = function () {
        let _validity: any = { valid: true };
        let _message = '';
        return {
          setValidity: jest.fn((flags: any, message?: string) => {
            const hasError = flags && Object.values(flags).some(Boolean);
            _validity = { valid: !hasError, ...flags };
            _message = message || '';
          }),
          setFormValue: jest.fn(),
          checkValidity: jest.fn(() => _validity.valid),
          reportValidity: jest.fn(() => _validity.valid),
          get validity() { return _validity; },
          get validationMessage() { return _message; },
        } as any;
      };
    }
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should be registered as custom elements', () => {
    expect(customElements.get('ac-form')).toBe(AcForm);
    expect(customElements.get('ac-form-field')).toBe(AcFormField);
    expect(customElements.get('ac-form-field-error-message')).toBe(AcFormFieldErrorMessage);
    expect(customElements.get('ac-input')).toBe(AcInputElement);
  });

  it('should NOT show validation errors before form is submitted', () => {
    const acForm = document.createElement('ac-form') as AcForm;
    const formField = document.createElement('ac-form-field') as AcFormField;
    const acInput = document.createElement('ac-input') as AcInputElement;
    acInput.setAttribute('name', 'username');
    acInput.setAttribute('required', 'true');
    const errorMsg = document.createElement('ac-form-field-error-message') as AcFormFieldErrorMessage;
    errorMsg.textContent = 'Username is required';

    formField.appendChild(acInput);
    formField.appendChild(errorMsg);
    acForm.appendChild(formField);

    document.body.appendChild(acForm);

    // Before submit, field should not be marked invalid and error message should remain hidden
    expect(formField.getAttribute('is-valid')).toBeNull();
    expect(errorMsg.style.display).toBe('none');

    // Typing and blurring before submit should not show errors
    acInput.dispatchEvent(new Event('input', { bubbles: true }));
    acInput.dispatchEvent(new Event('blur', { bubbles: true }));
    expect(formField.getAttribute('is-valid')).toBeNull();
    expect(errorMsg.style.display).toBe('none');
  });

  it('should NOT submit and NOT dispatch submit event when required ac-input is empty', () => {
    const acForm = document.createElement('ac-form') as AcForm;
    const formField = document.createElement('ac-form-field') as AcFormField;
    const acInput = document.createElement('ac-input') as AcInputElement;
    acInput.setAttribute('name', 'username');
    acInput.setAttribute('required', 'true');
    const errorMsg = document.createElement('ac-form-field-error-message') as AcFormFieldErrorMessage;
    errorMsg.textContent = 'Username is required';

    formField.appendChild(acInput);
    formField.appendChild(errorMsg);
    acForm.appendChild(formField);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    acForm.appendChild(submitBtn);

    document.body.appendChild(acForm);

    // Before submit, error is hidden
    expect(formField.getAttribute('is-valid')).toBeNull();

    let submitDispatched = false;
    acForm.addEventListener('submit', () => {
      submitDispatched = true;
    });

    // Check validity of the form
    expect(acForm.validateAll()).toBe(false);

    // Simulate clicking submit button
    submitBtn.click();

    expect(submitDispatched).toBe(false);
    expect(formField.getAttribute('is-valid')).toBe('false');
    expect(errorMsg.style.display).not.toBe('none');
  });

  it('should NOT submit when native input required is empty', () => {
    const acForm = document.createElement('ac-form') as AcForm;
    const formField = document.createElement('ac-form-field') as AcFormField;
    const nativeInput = document.createElement('input');
    nativeInput.name = 'email';
    nativeInput.required = true;
    const errorMsg = document.createElement('ac-form-field-error-message') as AcFormFieldErrorMessage;
    errorMsg.textContent = 'Email required';

    formField.appendChild(nativeInput);
    formField.appendChild(errorMsg);
    acForm.appendChild(formField);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    acForm.appendChild(submitBtn);

    document.body.appendChild(acForm);

    let submitDispatched = false;
    acForm.addEventListener('submit', () => {
      submitDispatched = true;
    });

    submitBtn.click();

    expect(submitDispatched).toBe(false);
    expect(formField.getAttribute('is-valid')).toBe('false');
  });

  it('should dispatch submit event when all fields are valid', () => {
    const acForm = document.createElement('ac-form') as AcForm;
    const formField = document.createElement('ac-form-field') as AcFormField;
    const acInput = document.createElement('ac-input') as AcInputElement;
    acInput.setAttribute('name', 'username');
    acInput.setAttribute('required', 'true');
    acInput.value = 'JohnDoe';

    formField.appendChild(acInput);
    acForm.appendChild(formField);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    acForm.appendChild(submitBtn);

    document.body.appendChild(acForm);

    let submitDispatched = false;
    acForm.addEventListener('submit', () => {
      submitDispatched = true;
    });

    expect(acForm.validateAll()).toBe(true);

    submitBtn.click();

    expect(submitDispatched).toBe(true);
  });

  it('should reset error state when form is reset', () => {
    const acForm = document.createElement('ac-form') as AcForm;
    const formField = document.createElement('ac-form-field') as AcFormField;
    const acInput = document.createElement('ac-input') as AcInputElement;
    acInput.setAttribute('name', 'username');
    acInput.setAttribute('required', 'true');
    const errorMsg = document.createElement('ac-form-field-error-message') as AcFormFieldErrorMessage;
    errorMsg.textContent = 'Username is required';

    formField.appendChild(acInput);
    formField.appendChild(errorMsg);
    acForm.appendChild(formField);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    acForm.appendChild(submitBtn);

    document.body.appendChild(acForm);

    // Trigger validation failure via submit
    submitBtn.click();
    expect(formField.getAttribute('is-valid')).toBe('false');

    // Reset form
    acForm.reset();
    expect(acForm.form?.submitted).toBe(false);
    expect(formField.hasAttribute('is-valid')).toBe(false);
  });
});

