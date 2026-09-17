/**
 * Dedicated, accessible Start/End Time Picker component.
 * Supports direct typing, steppers, 12h AM/PM / 24h, seconds toggle, and mouse wheel.
 */

export interface IAcDtpTimeValue {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface IAcDtpTimePickerOptions {
  label?: string;
  hour12?: boolean;
  showSeconds?: boolean;
  minuteStep?: number;
  initialTime?: IAcDtpTimeValue;
  onChange?: (val: IAcDtpTimeValue) => void;
}

export class AcDtpTimePicker {
  private _container: HTMLDivElement;
  private _hoursInput: HTMLInputElement;
  private _minutesInput: HTMLInputElement;
  private _secondsInput: HTMLInputElement | null = null;
  private _ampmBtn: HTMLButtonElement | null = null;

  private _hours: number = 0; // 0-23
  private _minutes: number = 0; // 0-59
  private _seconds: number = 0; // 0-59
  private _hour12: boolean = false;
  private _showSeconds: boolean = false;
  private _minuteStep: number = 1;
  private _onChange?: (val: IAcDtpTimeValue) => void;

  constructor(options: IAcDtpTimePickerOptions = {}) {
    this._hour12 = options.hour12 ?? false;
    this._showSeconds = options.showSeconds ?? false;
    this._minuteStep = options.minuteStep ?? 1;
    this._onChange = options.onChange;

    if (options.initialTime) {
      this._hours = Math.max(0, Math.min(23, options.initialTime.hours));
      this._minutes = Math.max(0, Math.min(59, options.initialTime.minutes));
      this._seconds = Math.max(0, Math.min(59, options.initialTime.seconds));
    }

    this._container = document.createElement('div');
    this._container.className = 'ac-dtp__time-control';

    if (options.label) {
      const labelEl = document.createElement('span');
      labelEl.className = 'ac-dtp__time-label';
      labelEl.textContent = options.label;
      this._container.appendChild(labelEl);
    }

    const wrap = document.createElement('div');
    wrap.className = 'ac-dtp__time-wrap';

    // Hours
    this._hoursInput = this._createNumberInput(
      'hours',
      this._getDisplayHours(),
      this._hour12 ? 1 : 0,
      this._hour12 ? 12 : 23,
      1,
      (val) => this._onHoursChange(val)
    );
    wrap.appendChild(this._createInputColumn(this._hoursInput, 'HH'));

    // Separator
    const sep1 = document.createElement('span');
    sep1.className = 'ac-dtp__time-sep';
    sep1.textContent = ':';
    wrap.appendChild(sep1);

    // Minutes
    this._minutesInput = this._createNumberInput(
      'minutes',
      this._minutes,
      0,
      59,
      this._minuteStep,
      (val) => this._onMinutesChange(val)
    );
    wrap.appendChild(this._createInputColumn(this._minutesInput, 'MM'));

    // Seconds (optional)
    if (this._showSeconds) {
      const sep2 = document.createElement('span');
      sep2.className = 'ac-dtp__time-sep';
      sep2.textContent = ':';
      wrap.appendChild(sep2);

      this._secondsInput = this._createNumberInput(
        'seconds',
        this._seconds,
        0,
        59,
        1,
        (val) => this._onSecondsChange(val)
      );
      wrap.appendChild(this._createInputColumn(this._secondsInput, 'SS'));
    }

    // AM/PM button (if 12h)
    if (this._hour12) {
      this._ampmBtn = document.createElement('button');
      this._ampmBtn.type = 'button';
      this._ampmBtn.className = 'ac-dtp__ampm-btn';
      this._ampmBtn.textContent = this._hours < 12 ? 'AM' : 'PM';
      this._ampmBtn.setAttribute('aria-label', 'Toggle AM/PM');
      this._ampmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._toggleAmPm();
      });
      wrap.appendChild(this._ampmBtn);
    }

    this._container.appendChild(wrap);
  }

  getElement(): HTMLDivElement {
    return this._container;
  }

  getTime(): IAcDtpTimeValue {
    return {
      hours: this._hours,
      minutes: this._minutes,
      seconds: this._seconds,
    };
  }

  setTime(h: number, m: number, s: number = 0, silent: boolean = false) {
    this._hours = Math.max(0, Math.min(23, h));
    this._minutes = Math.max(0, Math.min(59, m));
    this._seconds = Math.max(0, Math.min(59, s));
    this._updateInputs();
    if (!silent) {
      this._notify();
    }
  }

  private _getDisplayHours(): number {
    if (!this._hour12) return this._hours;
    const h = this._hours % 12;
    return h === 0 ? 12 : h;
  }

  private _onHoursChange(val: number) {
    if (this._hour12) {
      const isPm = this._hours >= 12;
      let h = val % 12;
      if (isPm) h += 12;
      this._hours = h;
    } else {
      this._hours = Math.max(0, Math.min(23, val));
    }
    this._updateInputs();
    this._notify();
  }

  private _onMinutesChange(val: number) {
    this._minutes = Math.max(0, Math.min(59, val));
    this._updateInputs();
    this._notify();
  }

  private _onSecondsChange(val: number) {
    this._seconds = Math.max(0, Math.min(59, val));
    this._updateInputs();
    this._notify();
  }

  private _toggleAmPm() {
    if (this._hours < 12) {
      this._hours += 12;
    } else {
      this._hours -= 12;
    }
    if (this._ampmBtn) {
      this._ampmBtn.textContent = this._hours < 12 ? 'AM' : 'PM';
    }
    this._notify();
  }

  private _createNumberInput(
    name: string,
    initialVal: number,
    min: number,
    max: number,
    step: number,
    onValChange: (v: number) => void
  ): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.className = 'ac-dtp__time-input';
    input.value = String(initialVal).padStart(2, '0');
    input.setAttribute('aria-label', name);

    input.addEventListener('keydown', (e: KeyboardEvent) => {
      let cur = parseInt(input.value, 10) || 0;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        cur += step;
        if (cur > max) cur = min;
        input.value = String(cur).padStart(2, '0');
        onValChange(cur);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        cur -= step;
        if (cur < min) cur = max;
        input.value = String(cur).padStart(2, '0');
        onValChange(cur);
      } else if (e.key === 'Enter') {
        input.blur();
      }
    });

    input.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      let cur = parseInt(input.value, 10) || 0;
      if (e.deltaY < 0) {
        cur += step;
        if (cur > max) cur = min;
      } else {
        cur -= step;
        if (cur < min) cur = max;
      }
      input.value = String(cur).padStart(2, '0');
      onValChange(cur);
    }, { passive: false });

    input.addEventListener('blur', () => {
      let num = parseInt(input.value.replace(/\D/g, ''), 10);
      if (isNaN(num)) num = min;
      if (num < min) num = min;
      if (num > max) num = max;
      input.value = String(num).padStart(2, '0');
      onValChange(num);
    });

    return input;
  }

  private _createInputColumn(input: HTMLInputElement, placeholderText: string): HTMLDivElement {
    const col = document.createElement('div');
    col.className = 'ac-dtp__time-col';
    col.appendChild(input);
    return col;
  }

  private _updateInputs() {
    this._hoursInput.value = String(this._getDisplayHours()).padStart(2, '0');
    this._minutesInput.value = String(this._minutes).padStart(2, '0');
    if (this._secondsInput) {
      this._secondsInput.value = String(this._seconds).padStart(2, '0');
    }
    if (this._ampmBtn) {
      this._ampmBtn.textContent = this._hours < 12 ? 'AM' : 'PM';
    }
  }

  private _notify() {
    if (this._onChange) {
      this._onChange(this.getTime());
    }
  }
}
