/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcInputBase, acRegisterCustomElement } from '@autocode-ts/ac-browser';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';

import { AC_DATETIME_PICKER_ATTRIBUTE_NAME } from '../consts/ac-datetime-picker-attribute-name.const';
import { AC_DATETIME_PICKER_CSS_CLASS } from '../consts/ac-datetime-picker-css-class-name.const';
import { AcEnumDateTimePickerEvent } from '../enums/ac-enum-datetime-picker-event.enum';
import { AcEnumDateTimePickerMode } from '../enums/ac-enum-datetime-picker-mode.enum';
import { AcEnumDateTimePickerOutputType } from '../enums/ac-enum-datetime-picker-output-type.enum';
import { IAcDateTimePickerPreset } from '../interfaces/ac-datetime-picker-preset.interface';
import { IAcDateTimePickerRangeValue } from '../interfaces/ac-datetime-picker-range-value.interface';

import { AcDtpPickerState } from '../state/ac-dtp-picker-state';
import { AcDtpCalendarGrid } from '../calendar/ac-dtp-calendar-grid';
import { AcDtpTimePicker, IAcDtpTimeValue } from '../time/ac-dtp-time-picker';
import {
  acDtpFormatDisplay,
  acDtpParseAnyDate,
  acDtpParseRange,
  acDtpToIsoString,
} from '../utils/ac-dtp-flexible-parser.utils';
import { acDtpGetDefaultPresets } from '../utils/ac-datetime-picker-presets.utils';

// Import CSS
import '../css/ac-datetime-picker.css';

export class AcDateTimePickerElement extends AcInputBase {
  override isInputElementValidHtmlInput = false;

  // ── Observed Attributes ─────────────────────────────────────────
  static override get observedAttributes() {
    return [
      ...super.observedAttributes,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.mode,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.defaultValue,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.min,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.max,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.disabledDates,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.disabledDaysOfWeek,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.format,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showSidebar,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showFooter,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showTime,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showSeconds,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.minuteStep,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.hour12,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.outputType,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeparator,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeperator,
    ];
  }

  // ── Private State ───────────────────────────────────────────────
  private _state: AcDtpPickerState = new AcDtpPickerState();
  private _format: string = 'DD-MM-YYYY';
  private _dateRangeSeparator: string = 'to';
  private _showSidebar: boolean = true;
  private _showFooter: boolean = true;
  private _showTime: boolean = false;
  private _showSeconds: boolean = false;
  private _minuteStep: number = 1;
  private _hour12: boolean = false;
  private _presets: IAcDateTimePickerPreset[] = acDtpGetDefaultPresets();
  private _isOpen: boolean = false;
  private _domBuilt: boolean = false;

  // DOM Elements
  private _root!: HTMLDivElement;
  private _inputWrap!: HTMLDivElement;
  private _inputEl!: HTMLInputElement; // Single mode
  private _rangeInputsWrap!: HTMLDivElement; // Range mode dual inputs
  private _inputStartEl!: HTMLInputElement;
  private _inputSeparatorEl!: HTMLSpanElement;
  private _inputEndEl!: HTMLInputElement;
  private _clearBtn!: HTMLButtonElement;
  private _iconEl!: HTMLSpanElement;

  private _backdropEl!: HTMLDivElement;
  private _popup!: HTMLDivElement;

  private _headerEl!: HTMLDivElement;
  private _headerInfo!: HTMLDivElement;
  private _headerStartValue!: HTMLDivElement;
  private _headerEndBlock!: HTMLDivElement;
  private _headerEndValue!: HTMLDivElement;
  private _headerSeparator!: HTMLDivElement;

  private _sidebarEl!: HTMLDivElement;
  private _presetListEl!: HTMLUListElement;

  private _calLeftContainer!: HTMLDivElement;
  private _calRightContainer!: HTMLDivElement;
  private _gridLeft!: AcDtpCalendarGrid;
  private _gridRight!: AcDtpCalendarGrid;

  private _timeSection!: HTMLDivElement;
  private _timePickerStart!: AcDtpTimePicker;
  private _timePickerEnd!: AcDtpTimePicker;

  private _footerEl!: HTMLDivElement;
  private _popper: PopperInstance | null = null;
  private _outsideClickListener: ((e: PointerEvent) => void) | null = null;

  // ── Public Getters & Setters ────────────────────────────────────

  get isTimeRequired(): boolean {
    return this._state.hasTime || this._showTime;
  }

  override get disabled(): boolean {
    return super.disabled;
  }
  override set disabled(value: boolean) {
    super.disabled = value;
    this._applyDisabledReadonly();
  }

  override get readonly(): boolean {
    return super.readonly;
  }
  override set readonly(value: boolean) {
    super.readonly = value;
    this._applyDisabledReadonly();
  }

  get defaultValue(): any {
    return this.getAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.defaultValue);
  }
  set defaultValue(value: any) {
    if (value !== null && value !== undefined) {
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.defaultValue, valStr);
      if (this._value == null) {
        this.setValue({ value, emitEvent: false });
      }
    } else {
      this.removeAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.defaultValue);
    }
  }

  get mode(): AcEnumDateTimePickerMode {
    return this._state.mode;
  }
  set mode(value: AcEnumDateTimePickerMode) {
    this._state.mode = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.mode, value);
    this._applyModeClasses();
    this._updateTimeSectionVisibility();
    this._updateFooterVisibility();
    this._updateInputDisplay();
    this._updateHeader();
    this._renderCalendars();
  }

  get outputType(): AcEnumDateTimePickerOutputType {
    return this._state.outputType;
  }
  set outputType(value: AcEnumDateTimePickerOutputType) {
    this._state.outputType = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.outputType, value);
  }

  get dateRangeSeparator(): string {
    return this._dateRangeSeparator;
  }
  set dateRangeSeparator(value: string) {
    this._dateRangeSeparator = value;
    if (this._inputSeparatorEl) {
      this._inputSeparatorEl.textContent = value;
    }
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeparator, value);
    this._updateInputDisplay();
  }

  get dateRangeSeperator(): string {
    return this.dateRangeSeparator;
  }
  set dateRangeSeperator(value: string) {
    this.dateRangeSeparator = value;
  }

  get format(): string {
    return this._format;
  }
  set format(value: string) {
    this._format = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.format, value);
    this._updateInputDisplay();
    this._updateHeader();
  }

  get showSidebar(): boolean {
    return this._showSidebar;
  }
  set showSidebar(value: boolean) {
    this._showSidebar = value;
    if (this._sidebarEl) {
      this._sidebarEl.style.display = value && this._state.isRangeMode ? '' : 'none';
    }
  }

  get showFooter(): boolean {
    return this._showFooter;
  }
  set showFooter(value: boolean) {
    this._showFooter = value;
    this._updateFooterVisibility();
  }

  get showTime(): boolean {
    return this._showTime;
  }
  set showTime(value: boolean) {
    this._showTime = value;
    this._updateTimeSectionVisibility();
    this._updateFooterVisibility();
    this._updateInputDisplay();
    this._updateHeader();
  }

  get showSeconds(): boolean {
    return this._showSeconds;
  }
  set showSeconds(value: boolean) {
    this._showSeconds = value;
    this._rebuildTimePickers();
    this._updateInputDisplay();
    this._updateHeader();
  }

  get minuteStep(): number {
    return this._minuteStep;
  }
  set minuteStep(value: number) {
    this._minuteStep = value;
    this._rebuildTimePickers();
  }

  get hour12(): boolean {
    return this._hour12;
  }
  set hour12(value: boolean) {
    this._hour12 = value;
    this._rebuildTimePickers();
    this._updateInputDisplay();
    this._updateHeader();
  }

  get min(): string | null {
    return this.getAttribute('min');
  }
  set min(value: string | null) {
    if (value) {
      this.setAttribute('min', value);
      this._state.minDate = acDtpParseAnyDate(value);
    } else {
      this.removeAttribute('min');
      this._state.minDate = null;
    }
    this._renderCalendars();
  }

  get max(): string | null {
    return this.getAttribute('max');
  }
  set max(value: string | null) {
    if (value) {
      this.setAttribute('max', value);
      this._state.maxDate = acDtpParseAnyDate(value);
    } else {
      this.removeAttribute('max');
      this._state.maxDate = null;
    }
    this._renderCalendars();
  }

  get disabledDates(): (Date | string)[] {
    return this._state.disabledDates;
  }
  set disabledDates(value: (Date | string)[]) {
    this._state.disabledDates = value || [];
    this._renderCalendars();
  }

  get disabledDaysOfWeek(): number[] {
    return this._state.disabledDaysOfWeek;
  }
  set disabledDaysOfWeek(value: number[]) {
    this._state.disabledDaysOfWeek = value || [];
    this._renderCalendars();
  }

  get presets(): IAcDateTimePickerPreset[] {
    return this._presets;
  }
  set presets(value: IAcDateTimePickerPreset[]) {
    this._presets = value;
    this._renderPresets();
  }

  // ── Lifecycle ───────────────────────────────────────────────────

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;

    switch (name) {
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.mode:
        this.mode = (newValue as AcEnumDateTimePickerMode) || AcEnumDateTimePickerMode.DateRange;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.outputType:
        this.outputType = (newValue as AcEnumDateTimePickerOutputType) || AcEnumDateTimePickerOutputType.Utc;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.format:
        this.format = newValue || 'DD-MM-YYYY';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.showSidebar:
        this.showSidebar = newValue !== 'false';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.showFooter:
        this.showFooter = newValue !== 'false';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.showTime:
        this.showTime = newValue === 'true';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.showSeconds:
        this.showSeconds = newValue === 'true';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.minuteStep:
        this.minuteStep = parseInt(newValue, 10) || 1;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.hour12:
        this.hour12 = newValue === 'true';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeparator:
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeperator:
        this.dateRangeSeparator = newValue || 'to';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.min:
        this.min = newValue;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.max:
        this.max = newValue;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.defaultValue:
        if (newValue !== null && this._value == null) {
          this.setValue({ value: newValue, emitEvent: false });
        }
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.disabledDates:
        try {
          this.disabledDates = typeof newValue === 'string' && newValue.startsWith('[')
            ? JSON.parse(newValue)
            : (newValue ? newValue.split(',').map((s: string) => s.trim()) : []);
        } catch {
          this.disabledDates = [];
        }
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.disabledDaysOfWeek:
        try {
          this.disabledDaysOfWeek = typeof newValue === 'string' && newValue.startsWith('[')
            ? JSON.parse(newValue)
            : (newValue ? newValue.split(',').map((s: string) => parseInt(s.trim(), 10)) : []);
        } catch {
          this.disabledDaysOfWeek = [];
        }
        break;
      default:
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'disabled' || name === 'readonly') {
          this._applyDisabledReadonly();
        }
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this._domBuilt) {
      this._buildDOM();
      this._bindEvents();
      this._state.subscribe(() => this._onStateChange());
      this._domBuilt = true;
    } else {
      if (this._popup && this._popup.parentNode !== document.body) {
        document.body.appendChild(this._popup);
      }
      if (this._backdropEl && this._backdropEl.parentNode !== document.body) {
        document.body.appendChild(this._backdropEl);
      }
    }
    this._applyModeClasses();
    this._updateTimeSectionVisibility();
    this._applyDisabledReadonly();
    this._renderPresets();

    const initVal = this._value ?? this.getAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.defaultValue) ?? this.getAttribute('value');
    if (initVal != null) {
      this._applyValueToState(initVal);
      this._syncTimePickersFromState();
    }
    this._updateInputDisplay();
    this._updateHeader();
    this._renderCalendars();
  }

  override disconnectedCallback() {
    this._destroyPopper();
    this._unbindOutsideClickListener();
    document.body.style.overflow = '';
    if (this._popup?.parentNode === document.body) {
      document.body.removeChild(this._popup);
    }
    if (this._backdropEl?.parentNode === document.body) {
      document.body.removeChild(this._backdropEl);
    }
    super.disconnectedCallback();
  }

  override destroy(): void {
    this._destroyPopper();
    this._unbindOutsideClickListener();
    document.body.style.overflow = '';
    if (this._popup?.parentNode === document.body) {
      document.body.removeChild(this._popup);
    }
    if (this._backdropEl?.parentNode === document.body) {
      document.body.removeChild(this._backdropEl);
    }
    this._domBuilt = false;
    super.destroy();
  }

  override focus(options?: FocusOptions): void {
    if (this._state.isRangeMode) {
      this._inputStartEl?.focus(options);
    } else {
      this._inputEl?.focus(options);
    }
  }

  // ── Public API Methods ──────────────────────────────────────────

  setStart(iso: string): void {
    const d = acDtpParseAnyDate(iso, this._format);
    if (d) {
      this._state.startDate = d;
      this._state.syncViewDates();
      this._syncTimePickersFromState();
      this._updateHeader();
      this._renderCalendars();
      const isoVal = this._computeCurrentIsoValue();
      super.setValue({ value: isoVal as any, emitEvent: true });
      this._updateInputDisplay();
    }
  }

  setEnd(iso: string): void {
    const d = acDtpParseAnyDate(iso, this._format);
    if (d) {
      this._state.endDate = d;
      this._state.syncViewDates();
      this._syncTimePickersFromState();
      this._updateHeader();
      this._renderCalendars();
      const isoVal = this._computeCurrentIsoValue();
      super.setValue({ value: isoVal as any, emitEvent: true });
      this._updateInputDisplay();
    }
  }

  refresh(): void {
    this._renderPresets();
    this._renderCalendars();
    this._updateHeader();
    this._updateInputDisplay();
    this._updateTimeSectionVisibility();
    this._applyDisabledReadonly();
  }

  open() {
    if (this._isOpen || this.disabled || this.readonly) return;
    this._isOpen = true;

    this._state.syncViewDates();
    this._renderCalendars();
    this._updateHeader();
    this._syncTimePickersFromState();

    const isMobile = window.innerWidth < 600;

    this._popup.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.mobileBottomSheet, isMobile);
    this._popup.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.desktopPopup, !isMobile);

    if (this._headerEl) {
      this._headerEl.style.display = this._state.isRangeMode ? '' : (isMobile ? '' : 'none');
    }

    if (isMobile) {
      document.body.style.overflow = 'hidden';
      this._backdropEl.classList.add(AC_DATETIME_PICKER_CSS_CLASS.backdropVisible);
      this._popup.classList.add(AC_DATETIME_PICKER_CSS_CLASS.popupOpen);
    } else {
      this._createPopper();
      this._popup.classList.add(AC_DATETIME_PICKER_CSS_CLASS.popupOpen);
    }

    this._inputEl?.setAttribute('aria-expanded', 'true');
    this._inputStartEl?.setAttribute('aria-expanded', 'true');
    this._inputEndEl?.setAttribute('aria-expanded', 'true');
    this._bindOutsideClickListener();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Open);
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;

    this._popup.classList.remove(AC_DATETIME_PICKER_CSS_CLASS.popupOpen);
    this._backdropEl.classList.remove(AC_DATETIME_PICKER_CSS_CLASS.backdropVisible);
    document.body.style.overflow = '';

    this._destroyPopper();
    this._unbindOutsideClickListener();
    this._inputEl?.setAttribute('aria-expanded', 'false');
    this._inputStartEl?.setAttribute('aria-expanded', 'false');
    this._inputEndEl?.setAttribute('aria-expanded', 'false');
    this._dispatchEvent(AcEnumDateTimePickerEvent.Close);
  }

  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  clear() {
    this._state.clear();
    this._timePickerStart?.setTime(0, 0, 0, true);
    this._timePickerEnd?.setTime(23, 59, 59, true);
    this.setValue(null);
    if (this._inputEl) this._inputEl.value = '';
    if (this._inputStartEl) this._inputStartEl.value = '';
    if (this._inputEndEl) this._inputEndEl.value = '';
    this._updateInputDisplay();
    this._updateHeader();
    this._renderCalendars();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Clear);
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

    this._applyValueToState(val);
    this._syncTimePickersFromState();
    this._updateHeader();
    this._renderCalendars();

    const isoValue = this._computeCurrentIsoValue();
    super.setValue({ value: isoValue as any, emitEvent });

    this._updateInputDisplay();
  }

  getValue(): string | IAcDateTimePickerRangeValue | null {
    return this._computeCurrentIsoValue();
  }

  // ── DOM Building ────────────────────────────────────────────────

  private _buildDOM() {
    this.innerHTML = '';

    this._root = document.createElement('div');
    this._root.className = AC_DATETIME_PICKER_CSS_CLASS.root;

    // ── Input Trigger ─────────────────────────────
    this._inputWrap = document.createElement('div');
    this._inputWrap.className = AC_DATETIME_PICKER_CSS_CLASS.inputWrap;

    // Single mode input
    this._inputEl = document.createElement('input');
    this._inputEl.className = AC_DATETIME_PICKER_CSS_CLASS.input;
    this._inputEl.placeholder = this.placeholder || 'Select date';
    this._inputEl.setAttribute('aria-haspopup', 'dialog');
    this._inputEl.setAttribute('aria-expanded', 'false');

    // Dual range inputs
    this._rangeInputsWrap = document.createElement('div');
    this._rangeInputsWrap.className = AC_DATETIME_PICKER_CSS_CLASS.rangeInputs;

    this._inputStartEl = document.createElement('input');
    this._inputStartEl.className = AC_DATETIME_PICKER_CSS_CLASS.inputStart;
    this._inputStartEl.placeholder = 'Start date';
    this._inputStartEl.setAttribute('aria-haspopup', 'dialog');
    this._inputStartEl.setAttribute('aria-expanded', 'false');

    this._inputSeparatorEl = document.createElement('span');
    this._inputSeparatorEl.className = AC_DATETIME_PICKER_CSS_CLASS.inputSeparator;
    this._inputSeparatorEl.textContent = this._dateRangeSeparator;

    this._inputEndEl = document.createElement('input');
    this._inputEndEl.className = AC_DATETIME_PICKER_CSS_CLASS.inputEnd;
    this._inputEndEl.placeholder = 'End date';
    this._inputEndEl.setAttribute('aria-haspopup', 'dialog');
    this._inputEndEl.setAttribute('aria-expanded', 'false');

    this._rangeInputsWrap.appendChild(this._inputStartEl);
    this._rangeInputsWrap.appendChild(this._inputSeparatorEl);
    this._rangeInputsWrap.appendChild(this._inputEndEl);

    this.inputElement = this._state.isRangeMode ? this._inputStartEl : this._inputEl;

    this._clearBtn = document.createElement('button');
    this._clearBtn.type = 'button';
    this._clearBtn.className = AC_DATETIME_PICKER_CSS_CLASS.clearBtn;
    this._clearBtn.setAttribute('aria-label', 'Clear date');
    this._clearBtn.innerHTML = '×';
    this._clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
    });

    this._iconEl = document.createElement('span');
    this._iconEl.className = AC_DATETIME_PICKER_CSS_CLASS.icon;
    this._iconEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

    this._inputWrap.appendChild(this._inputEl);
    this._inputWrap.appendChild(this._rangeInputsWrap);
    this._inputWrap.appendChild(this._clearBtn);
    this._inputWrap.appendChild(this._iconEl);

    // ── Backdrop Scrim (for mobile modal) ─────────
    this._backdropEl = document.createElement('div');
    this._backdropEl.className = AC_DATETIME_PICKER_CSS_CLASS.backdrop;
    this._backdropEl.addEventListener('click', () => this.close());
    document.body.appendChild(this._backdropEl);

    // ── Popup Dialog ──────────────────────────────
    this._popup = document.createElement('div');
    this._popup.className = AC_DATETIME_PICKER_CSS_CLASS.popup;
    this._popup.setAttribute('role', 'dialog');
    this._popup.setAttribute('aria-modal', 'true');
    this._popup.setAttribute('aria-label', 'Date picker');

    // ── Header ────────────────────────────────────
    const header = document.createElement('div');
    header.className = AC_DATETIME_PICKER_CSS_CLASS.header;
    this._headerEl = header;

    const info = document.createElement('div');
    info.className = AC_DATETIME_PICKER_CSS_CLASS.headerInfo;
    this._headerInfo = info;

    const startBlock = document.createElement('div');
    startBlock.className = AC_DATETIME_PICKER_CSS_CLASS.headerBlock;
    const startLabel = document.createElement('div');
    startLabel.className = AC_DATETIME_PICKER_CSS_CLASS.headerLabel;
    startLabel.textContent = this._state.isRangeMode ? 'Start Date' : 'Date';
    this._headerStartValue = document.createElement('div');
    this._headerStartValue.className = AC_DATETIME_PICKER_CSS_CLASS.headerValue;
    this._headerStartValue.textContent = '—';
    startBlock.appendChild(startLabel);
    startBlock.appendChild(this._headerStartValue);

    this._headerSeparator = document.createElement('div');
    this._headerSeparator.className = AC_DATETIME_PICKER_CSS_CLASS.headerSeparator;

    this._headerEndBlock = document.createElement('div');
    this._headerEndBlock.className = AC_DATETIME_PICKER_CSS_CLASS.headerBlock;
    const endLabel = document.createElement('div');
    endLabel.className = AC_DATETIME_PICKER_CSS_CLASS.headerLabel;
    endLabel.textContent = 'End Date';
    this._headerEndValue = document.createElement('div');
    this._headerEndValue.className = AC_DATETIME_PICKER_CSS_CLASS.headerValue;
    this._headerEndValue.textContent = '—';
    this._headerEndBlock.appendChild(endLabel);
    this._headerEndBlock.appendChild(this._headerEndValue);

    info.appendChild(startBlock);
    info.appendChild(this._headerSeparator);
    info.appendChild(this._headerEndBlock);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = AC_DATETIME_PICKER_CSS_CLASS.headerClose;
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(info);
    header.appendChild(closeBtn);

    // ── Body ──────────────────────────────────────
    const body = document.createElement('div');
    body.className = AC_DATETIME_PICKER_CSS_CLASS.body;

    // Sidebar
    this._sidebarEl = document.createElement('div');
    this._sidebarEl.className = AC_DATETIME_PICKER_CSS_CLASS.sidebar;
    this._presetListEl = document.createElement('ul');
    this._presetListEl.className = AC_DATETIME_PICKER_CSS_CLASS.presetList;
    this._sidebarEl.appendChild(this._presetListEl);

    // Main content (calendars + time)
    const mainContent = document.createElement('div');
    mainContent.className = AC_DATETIME_PICKER_CSS_CLASS.mainContent;

    const calendarsWrap = document.createElement('div');
    calendarsWrap.className = AC_DATETIME_PICKER_CSS_CLASS.calendars;

    this._calLeftContainer = document.createElement('div');
    this._calLeftContainer.className = AC_DATETIME_PICKER_CSS_CLASS.calLeft;
    this._gridLeft = new AcDtpCalendarGrid({
      side: 'left',
      state: this._state,
      onDayClick: () => this._onDaySelected(),
    });
    this._calLeftContainer.appendChild(this._gridLeft.getElement());

    this._calRightContainer = document.createElement('div');
    this._calRightContainer.className = AC_DATETIME_PICKER_CSS_CLASS.calRight;
    this._gridRight = new AcDtpCalendarGrid({
      side: 'right',
      state: this._state,
      onDayClick: () => this._onDaySelected(),
    });
    this._calRightContainer.appendChild(this._gridRight.getElement());

    calendarsWrap.appendChild(this._calLeftContainer);
    calendarsWrap.appendChild(this._calRightContainer);

    // Dedicated Time Controls
    this._timeSection = document.createElement('div');
    this._timeSection.className = AC_DATETIME_PICKER_CSS_CLASS.timeSection;
    this._buildTimePickers();
    this._updateTimeSectionVisibility();

    mainContent.appendChild(calendarsWrap);
    mainContent.appendChild(this._timeSection);

    body.appendChild(this._sidebarEl);
    body.appendChild(mainContent);

    // ── Footer ────────────────────────────────────
    this._footerEl = document.createElement('div');
    this._footerEl.className = AC_DATETIME_PICKER_CSS_CLASS.footer;

    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.className = `${AC_DATETIME_PICKER_CSS_CLASS.btn} ${AC_DATETIME_PICKER_CSS_CLASS.btnClear}`;
    btnClear.textContent = 'Clear';
    btnClear.addEventListener('click', () => this.clear());

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = `${AC_DATETIME_PICKER_CSS_CLASS.btn} ${AC_DATETIME_PICKER_CSS_CLASS.btnCancel}`;
    btnCancel.textContent = 'Cancel';
    btnCancel.addEventListener('click', () => this._onCancel());

    const btnApply = document.createElement('button');
    btnApply.type = 'button';
    btnApply.className = `${AC_DATETIME_PICKER_CSS_CLASS.btn} ${AC_DATETIME_PICKER_CSS_CLASS.btnApply}`;
    btnApply.textContent = 'Apply';
    btnApply.addEventListener('click', () => this._onApply());

    this._footerEl.appendChild(btnClear);
    this._footerEl.appendChild(btnCancel);
    this._footerEl.appendChild(btnApply);

    // Assemble Popup
    this._popup.appendChild(header);
    this._popup.appendChild(body);
    this._popup.appendChild(this._footerEl);

    // Assemble Component
    this._root.appendChild(this._inputWrap);
    this.appendChild(this._root);

    document.body.appendChild(this._popup);

    this._applyDisabledReadonly();
  }

  private _updateTimeSectionVisibility() {
    if (this._timeSection) {
      const visible = this.isTimeRequired;
      this._timeSection.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.timeSectionVisible, visible);
      this._timeSection.style.display = visible ? 'flex' : 'none';
      if (this._popup) {
        this._popup.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.hasTime, visible);
      }
    }
  }

  private _updateFooterVisibility() {
    if (this._footerEl) {
      const show = this._showFooter && (this._state.isRangeMode || this.isTimeRequired);
      this._footerEl.style.display = show ? '' : 'none';
    }
  }

  private _applyDisabledReadonly() {
    const dis = this.disabled;
    const ro = this.readonly;
    this.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.disabled, dis);
    this.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.readonly, ro);
    if (this._root) {
      this._root.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.disabled, dis);
      this._root.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.readonly, ro);
    }
    if (this._inputEl) {
      this._inputEl.disabled = dis;
      this._inputEl.readOnly = ro;
    }
    if (this._inputStartEl) {
      this._inputStartEl.disabled = dis;
      this._inputStartEl.readOnly = ro;
    }
    if (this._inputEndEl) {
      this._inputEndEl.disabled = dis;
      this._inputEndEl.readOnly = ro;
    }
  }

  private _buildTimePickers() {
    this._timeSection.innerHTML = '';

    this._timePickerStart = new AcDtpTimePicker({
      label: this._state.isRangeMode ? 'Start Time' : 'Time',
      hour12: this._hour12,
      showSeconds: this._showSeconds,
      minuteStep: this._minuteStep,
      onChange: (t) => this._onStartTimeChange(t),
    });
    this._timeSection.appendChild(this._timePickerStart.getElement());

    if (this._state.isRangeMode) {
      this._timePickerEnd = new AcDtpTimePicker({
        label: 'End Time',
        hour12: this._hour12,
        showSeconds: this._showSeconds,
        minuteStep: this._minuteStep,
        onChange: (t) => this._onEndTimeChange(t),
      });
      this._timeSection.appendChild(this._timePickerEnd.getElement());
    }
  }

  private _rebuildTimePickers() {
    if (this._timeSection) {
      this._buildTimePickers();
      this._syncTimePickersFromState();
      this._updateTimeSectionVisibility();
    }
  }

  // ── Event Bindings ──────────────────────────────────────────────

  private _bindEvents() {
    // Calendar icon acts as explicit toggle button
    this._iconEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.disabled || this.readonly) return;
      this.toggle();
    });

    // Input trigger clicks: open if closed; remain open if already open (do not toggle or close)
    this._inputWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.disabled || this.readonly) return;
      if (this._clearBtn.contains(e.target as Node) || this._iconEl.contains(e.target as Node)) {
        return;
      }
      if (!this._isOpen) {
        this.open();
      }
    });

    const ensureOpen = () => {
      if (this.disabled || this.readonly) return;
      if (!this._isOpen) {
        this.open();
      }
    };
    this._inputStartEl.addEventListener('click', ensureOpen);
    this._inputEndEl.addEventListener('click', ensureOpen);
    this._inputEl.addEventListener('click', ensureOpen);

    // Single mode input listeners
    this._inputEl.addEventListener('input', () => {
      if (this.disabled || this.readonly) return;
      this._onManualInputSingle();
    });

    this._inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.disabled || this.readonly) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        this._commitManualInputSingle();
        if (this._isOpen) this.close();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (this._isOpen) {
          this.close();
        } else {
          this._updateInputDisplay();
        }
      } else if (e.key === 'Tab') {
        if (this._isOpen) this.close();
      }
    });

    this._inputEl.addEventListener('paste', () => {
      if (this.disabled || this.readonly) return;
      setTimeout(() => {
        this._onManualInputSingle();
      }, 0);
    });

    this._inputEl.addEventListener('blur', () => {
      if (this.disabled || this.readonly) return;
      if (!this._isOpen) {
        this._commitManualInputSingle();
      }
    });

    // Start input listeners (range mode)
    this._inputStartEl.addEventListener('input', () => {
      if (this.disabled || this.readonly) return;
      this._onStartInput();
    });

    this._inputStartEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.disabled || this.readonly) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        this._commitStartInput();
        this._inputEndEl.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (this._isOpen) {
          this.close();
        } else {
          this._updateInputDisplay();
        }
      } else if (e.key === 'Tab' && !e.shiftKey) {
        // Tab naturally moves to _inputEndEl
      }
    });

    this._inputStartEl.addEventListener('paste', () => {
      if (this.disabled || this.readonly) return;
      setTimeout(() => this._onStartInput(), 0);
    });

    this._inputStartEl.addEventListener('blur', () => {
      if (this.disabled || this.readonly) return;
      if (!this._isOpen && document.activeElement !== this._inputEndEl) {
        this._commitStartInput();
      }
    });

    // End input listeners (range mode)
    this._inputEndEl.addEventListener('input', () => {
      if (this.disabled || this.readonly) return;
      this._onEndInput();
    });

    this._inputEndEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.disabled || this.readonly) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        this._commitEndInput();
        if (this._isOpen) this.close();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (this._isOpen) {
          this.close();
        } else {
          this._updateInputDisplay();
        }
      } else if (e.key === 'Tab') {
        if (this._isOpen) this.close();
      }
    });

    this._inputEndEl.addEventListener('paste', () => {
      if (this.disabled || this.readonly) return;
      setTimeout(() => this._onEndInput(), 0);
    });

    this._inputEndEl.addEventListener('blur', () => {
      if (this.disabled || this.readonly) return;
      if (!this._isOpen && document.activeElement !== this._inputStartEl) {
        this._commitEndInput();
      }
    });
  }

  // ── Selection & Input Handlers ──────────────────────────────────

  private _onDaySelected() {
    this._updateHeader();
    this._syncTimePickersFromState();

    const hasTime = this.isTimeRequired;

    if (!this._state.isRangeMode) {
      // In single date mode without time, auto-apply immediately
      if (!hasTime) {
        this._commitSelection();
      }
    } else {
      // Range mode: if both start and end dates are picked, auto-apply if footer is hidden
      if (!this._showFooter && this._state.startDate && this._state.endDate && !hasTime) {
        this._commitSelection();
      }
    }
  }

  private _onStartTimeChange(t: IAcDtpTimeValue) {
    this._state.setStartTime(t.hours, t.minutes, t.seconds);
    this._updateHeader();
  }

  private _onEndTimeChange(t: IAcDtpTimeValue) {
    this._state.setEndTime(t.hours, t.minutes, t.seconds);
    this._updateHeader();
  }

  private _onManualInputSingle() {
    const raw = this._inputEl.value.trim();
    if (!raw) {
      this._state.clear();
      this._updateHeader();
      this._renderCalendars();
      return;
    }

    const parsed = acDtpParseAnyDate(raw, this._format);
    if (parsed) {
      this._state.startDate = parsed;
      this._state.endDate = null;
      this._updateHeader();
      this._renderCalendars();
    }
  }

  private _commitManualInputSingle() {
    const raw = this._inputEl.value.trim();
    if (!raw) {
      this.clear();
      return;
    }

    const parsed = acDtpParseAnyDate(raw, this._format);
    if (parsed) {
      this._state.startDate = parsed;
      this._state.endDate = null;
      this._commitSelection(false);
    } else {
      this._updateInputDisplay();
    }
  }

  private _onStartInput() {
    const raw = this._inputStartEl.value.trim();
    if (!raw) {
      this._state.startDate = null;
      this._updateHeader();
      this._renderCalendars();
      return;
    }
    const parsed = acDtpParseAnyDate(raw, this._format);
    if (parsed) {
      this._state.startDate = parsed;
      this._state.syncViewDates();
      this._updateHeader();
      this._renderCalendars();
    }
  }

  private _commitStartInput() {
    const raw = this._inputStartEl.value.trim();
    if (!raw) {
      this._state.startDate = null;
      this._commitSelection(false);
      return;
    }
    const parsed = acDtpParseAnyDate(raw, this._format);
    if (parsed) {
      this._state.startDate = parsed;
      this._state.syncViewDates();
      this._commitSelection(false);
    } else {
      this._updateInputDisplay();
    }
  }

  private _onEndInput() {
    const raw = this._inputEndEl.value.trim();
    if (!raw) {
      this._state.endDate = null;
      this._updateHeader();
      this._renderCalendars();
      return;
    }
    const parsed = acDtpParseAnyDate(raw, this._format);
    if (parsed) {
      this._state.endDate = parsed;
      this._state.syncViewDates();
      this._updateHeader();
      this._renderCalendars();
    }
  }

  private _commitEndInput() {
    const raw = this._inputEndEl.value.trim();
    if (!raw) {
      this._state.endDate = null;
      this._commitSelection(false);
      return;
    }
    const parsed = acDtpParseAnyDate(raw, this._format);
    if (parsed) {
      this._state.endDate = parsed;
      this._state.syncViewDates();
      this._commitSelection(false);
    } else {
      this._updateInputDisplay();
    }
  }

  private _onApply() {
    this._commitSelection(true);
  }

  private _onCancel() {
    this._applyValueToState(this._value);
    this._updateHeader();
    this._renderCalendars();
    this.close();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Cancel);
  }

  private _commitSelection(closePopup: boolean = true) {
    const isoValue = this._computeCurrentIsoValue();
    super.setValue({ value: isoValue as any, emitEvent: true });

    this._updateInputDisplay();
    this._updateHeader();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Apply, { value: isoValue });

    if (closePopup) {
      this.close();
    }
  }

  private _onStateChange() {
    this._renderCalendars();
    this._updateHeader();
    this._renderPresets();
  }

  // ── Render Helpers ──────────────────────────────────────────────

  private _renderCalendars() {
    if (this._gridLeft) this._gridLeft.render();
    if (this._gridRight && this._state.isRangeMode) this._gridRight.render();
  }

  private _renderPresets() {
    if (!this._presetListEl) return;
    this._presetListEl.innerHTML = '';

    for (const preset of this._presets) {
      const li = document.createElement('li');
      li.className = AC_DATETIME_PICKER_CSS_CLASS.presetItem;
      li.textContent = preset.label;

      if (preset.label === this._state.activePresetLabel) {
        li.classList.add(AC_DATETIME_PICKER_CSS_CLASS.presetItemActive);
      }

      li.addEventListener('click', () => {
        const { start, end } = preset.getValue();
        this._state.startDate = start;
        this._state.endDate = this._state.isRangeMode ? end : null;
        this._state.activePresetLabel = preset.label;
        this._state.syncViewDates();
        this._syncTimePickersFromState();
        this._renderCalendars();
        this._updateHeader();
        this._renderPresets();

        this._dispatchEvent(AcEnumDateTimePickerEvent.PresetSelect, {
          preset: preset.label,
          start,
          end,
        });

        if (!this._showFooter) {
          this._commitSelection();
        }
      });

      this._presetListEl.appendChild(li);
    }
  }

  private _getEffectiveDisplayFormat(): string {
    let fmt = this._format;
    if (this.isTimeRequired) {
      const hasTimeTokens = /HH|hh|mm/i.test(fmt);
      if (!hasTimeTokens) {
        if (this._hour12) {
          fmt += this._showSeconds ? ' hh:mm:ss AA' : ' hh:mm AA';
        } else {
          fmt += this._showSeconds ? ' HH:mm:ss' : ' HH:mm';
        }
      }
    }
    return fmt;
  }

  private _updateHeader() {
    if (!this._headerStartValue) return;

    const fmt = this._getEffectiveDisplayFormat();

    if (this._state.startDate) {
      this._headerStartValue.textContent = acDtpFormatDisplay(this._state.startDate, fmt);
      this._headerStartValue.classList.add(AC_DATETIME_PICKER_CSS_CLASS.headerValueActive);
    } else {
      this._headerStartValue.textContent = '—';
      this._headerStartValue.classList.remove(AC_DATETIME_PICKER_CSS_CLASS.headerValueActive);
    }

    if (this._state.isRangeMode) {
      if (this._state.endDate) {
        this._headerEndValue.textContent = acDtpFormatDisplay(this._state.endDate, fmt);
        this._headerEndValue.classList.add(AC_DATETIME_PICKER_CSS_CLASS.headerValueActive);
      } else {
        this._headerEndValue.textContent = '—';
        this._headerEndValue.classList.remove(AC_DATETIME_PICKER_CSS_CLASS.headerValueActive);
      }
    }
  }

  private _updateInputDisplay() {
    const fmt = this._getEffectiveDisplayFormat();

    let hasValue = false;
    if (this._state.isRangeMode) {
      const s = this._state.startDate ? acDtpFormatDisplay(this._state.startDate, fmt) : '';
      const e = this._state.endDate ? acDtpFormatDisplay(this._state.endDate, fmt) : '';
      if (this._inputStartEl) this._inputStartEl.value = s;
      if (this._inputEndEl) this._inputEndEl.value = e;
      hasValue = !!(s || e);
    } else {
      const s = this._state.startDate ? acDtpFormatDisplay(this._state.startDate, fmt) : '';
      if (this._inputEl) this._inputEl.value = s;
      hasValue = !!s;
    }

    if (this._inputWrap) {
      this._inputWrap.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.inputWrapHasValue, hasValue);
    }
  }

  private _computeCurrentIsoValue(): string | IAcDateTimePickerRangeValue | null {
    const includeTime = this.isTimeRequired;

    if (this._state.isRangeMode) {
      if (!this._state.startDate && !this._state.endDate) return null;
      return {
        start: acDtpToIsoString(this._state.startDate, this._state.outputType, includeTime),
        end: acDtpToIsoString(this._state.endDate, this._state.outputType, includeTime),
      };
    }

    if (!this._state.startDate) return null;
    return acDtpToIsoString(this._state.startDate, this._state.outputType, includeTime);
  }

  private _applyValueToState(val: any) {
    if (!val) {
      this._state.startDate = null;
      this._state.endDate = null;
      this._state.syncViewDates();
      return;
    }

    if (val instanceof Date) {
      this._state.startDate = new Date(val);
      this._state.endDate = null;
      this._state.syncViewDates();
      return;
    }

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          val = JSON.parse(trimmed);
        } catch {
          // continue
        }
      }
    }

    if (Array.isArray(val)) {
      const [startRaw, endRaw] = val;
      const s = startRaw ? (startRaw instanceof Date ? new Date(startRaw) : acDtpParseAnyDate(String(startRaw), this._format)) : null;
      const e = endRaw ? (endRaw instanceof Date ? new Date(endRaw) : acDtpParseAnyDate(String(endRaw), this._format)) : null;
      this._state.startDate = s;
      this._state.endDate = this._state.isRangeMode ? e : null;
    } else if (typeof val === 'object' && val !== null) {
      const startKey = ('start' in val) ? 'start' : (('startDate' in val) ? 'startDate' : (('from' in val) ? 'from' : null));
      const endKey = ('end' in val) ? 'end' : (('endDate' in val) ? 'endDate' : (('to' in val) ? 'to' : null));
      const startRaw = startKey ? (val as any)[startKey] : null;
      const endRaw = endKey ? (val as any)[endKey] : null;

      const s = startRaw ? (startRaw instanceof Date ? new Date(startRaw) : acDtpParseAnyDate(String(startRaw), this._format)) : null;
      const e = endRaw ? (endRaw instanceof Date ? new Date(endRaw) : acDtpParseAnyDate(String(endRaw), this._format)) : null;
      this._state.startDate = s;
      this._state.endDate = this._state.isRangeMode ? e : null;
    } else if (typeof val === 'string') {
      if (this._state.isRangeMode) {
        const parsed = acDtpParseRange(val, this._dateRangeSeparator, this._format);
        this._state.startDate = parsed.start;
        this._state.endDate = parsed.end;
      } else {
        this._state.startDate = acDtpParseAnyDate(val, this._format);
        this._state.endDate = null;
      }
    }

    this._state.syncViewDates();
  }

  private _syncTimePickersFromState() {
    if (this._timePickerStart && this._state.startDate) {
      this._timePickerStart.setTime(
        this._state.startDate.getHours(),
        this._state.startDate.getMinutes(),
        this._state.startDate.getSeconds(),
        true
      );
    }
    if (this._timePickerEnd && this._state.endDate) {
      this._timePickerEnd.setTime(
        this._state.endDate.getHours(),
        this._state.endDate.getMinutes(),
        this._state.endDate.getSeconds(),
        true
      );
    }
  }

  private _applyModeClasses() {
    if (!this._root) return;
    const isRange = this._state.isRangeMode;

    this._root.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.singleMode, !isRange);
    this._root.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.rangeMode, isRange);

    if (this._popup) {
      this._popup.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.singleMode, !isRange);
      this._popup.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.rangeMode, isRange);
    }

    if (this._inputEl && this._rangeInputsWrap) {
      this._inputEl.style.display = isRange ? 'none' : '';
      this._rangeInputsWrap.style.display = isRange ? 'flex' : 'none';
      this.inputElement = isRange ? this._inputStartEl : this._inputEl;
    }

    if (this._headerEndBlock) {
      this._headerEndBlock.style.display = isRange ? '' : 'none';
      this._headerSeparator.style.display = isRange ? '' : 'none';
    }

    if (this._headerInfo) {
      this._headerInfo.style.display = isRange ? '' : 'none';
    }

    if (this._headerEl) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
      this._headerEl.style.display = isRange ? '' : (isMobile ? '' : 'none');
    }

    if (this._calRightContainer) {
      this._calRightContainer.style.display = isRange ? '' : 'none';
    }

    if (this._sidebarEl) {
      this._sidebarEl.style.display = isRange && this._showSidebar ? '' : 'none';
    }

    this._updateTimeSectionVisibility();
    this._updateFooterVisibility();
  }

  // ── Popper Positioning ──────────────────────────────────────────

  private _createPopper() {
    this._destroyPopper();
    this._popper = createPopper(this._inputWrap, this._popup, {
      placement: 'bottom-start',
      strategy: 'fixed',
      modifiers: [
        { name: 'offset', options: { offset: [0, 4] } },
        { name: 'flip', options: { fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] } },
        { name: 'preventOverflow', options: { padding: 8 } },
        { name: 'computeStyles', options: { gpuAcceleration: false } },
      ],
    });
    this._popper.forceUpdate();
  }

  private _destroyPopper() {
    if (this._popper) {
      this._popper.destroy();
      this._popper = null;
    }
  }

  // ── Outside Click Handling ──────────────────────────────────────

  private _bindOutsideClickListener() {
    this._unbindOutsideClickListener();
    this._outsideClickListener = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        this._popup &&
        !this._popup.contains(target) &&
        !this._root.contains(target) &&
        !this._backdropEl.contains(target)
      ) {
        this.close();
      }
    };
    document.addEventListener('pointerdown', this._outsideClickListener, true);
  }

  private _unbindOutsideClickListener() {
    if (this._outsideClickListener) {
      document.removeEventListener('pointerdown', this._outsideClickListener, true);
      this._outsideClickListener = null;
    }
  }

  private _dispatchEvent(eventName: AcEnumDateTimePickerEvent, detail?: any) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail: detail ?? { value: this.getValue() },
      })
    );
  }
}

acRegisterCustomElement({ tag: 'ac-datetime-picker', type: AcDateTimePickerElement });
