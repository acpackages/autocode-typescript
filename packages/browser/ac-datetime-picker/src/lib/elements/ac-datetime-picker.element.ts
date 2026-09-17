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
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.min,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.max,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.disabledDates,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.format,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showSidebar,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showFooter,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showTime,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.showSeconds,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.minuteStep,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.hour12,
      AC_DATETIME_PICKER_ATTRIBUTE_NAME.outputType,
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
  private _inputEl!: HTMLInputElement;
  private _clearBtn!: HTMLButtonElement;
  private _iconEl!: HTMLSpanElement;

  private _backdropEl!: HTMLDivElement;
  private _popup!: HTMLDivElement;

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

  get mode(): AcEnumDateTimePickerMode {
    return this._state.mode;
  }
  set mode(value: AcEnumDateTimePickerMode) {
    this._state.mode = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.mode, value);
    this._applyModeClasses();
    this._updateInputDisplay();
    this._renderCalendars();
  }

  get outputType(): AcEnumDateTimePickerOutputType {
    return this._state.outputType;
  }
  set outputType(value: AcEnumDateTimePickerOutputType) {
    this._state.outputType = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.outputType, value);
  }

  get dateRangeSeperator(): string {
    return this._dateRangeSeparator;
  }
  set dateRangeSeperator(value: string) {
    this._dateRangeSeparator = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeperator, value);
    this._updateInputDisplay();
  }

  get format(): string {
    return this._format;
  }
  set format(value: string) {
    this._format = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.format, value);
    this._updateInputDisplay();
  }

  get showSidebar(): boolean {
    return this._showSidebar;
  }
  set showSidebar(value: boolean) {
    this._showSidebar = value;
    if (this._sidebarEl) {
      this._sidebarEl.style.display = value ? '' : 'none';
    }
  }

  get showFooter(): boolean {
    return this._showFooter;
  }
  set showFooter(value: boolean) {
    this._showFooter = value;
    if (this._footerEl) {
      this._footerEl.style.display = value ? '' : 'none';
    }
  }

  get showTime(): boolean {
    return this._showTime;
  }
  set showTime(value: boolean) {
    this._showTime = value;
    if (this._timeSection) {
      this._timeSection.style.display = (value || this._state.hasTime) ? 'flex' : 'none';
    }
    this._updateInputDisplay();
  }

  get showSeconds(): boolean {
    return this._showSeconds;
  }
  set showSeconds(value: boolean) {
    this._showSeconds = value;
    this._rebuildTimePickers();
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
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeperator:
        this.dateRangeSeperator = newValue || 'to';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.min:
        this.min = newValue;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.max:
        this.max = newValue;
        break;
      default:
        super.attributeChangedCallback(name, oldValue, newValue);
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
    this._renderPresets();

    if (this._value) {
      this._applyValueToState(this._value);
    }
    this._updateInputDisplay();
    this._updateHeader();
  }

  override disconnectedCallback() {
    this._destroyPopper();
    this._unbindOutsideClickListener();
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
    if (this._popup?.parentNode === document.body) {
      document.body.removeChild(this._popup);
    }
    if (this._backdropEl?.parentNode === document.body) {
      document.body.removeChild(this._backdropEl);
    }
    this._domBuilt = false;
    super.destroy();
  }

  // ── Public API Methods ──────────────────────────────────────────

  open() {
    if (this._isOpen || this.disabled || this.readonly) return;
    this._isOpen = true;

    this._state.syncViewDates();
    this._renderCalendars();
    this._updateHeader();
    this._syncTimePickersFromState();

    const isMobile = window.innerWidth < 600;

    if (isMobile) {
      document.body.style.overflow = 'hidden';
      this._backdropEl.classList.add('ac-dtp__backdrop--visible');
      this._popup.classList.add('ac-dtp__popup--open');
    } else {
      this._createPopper();
      this._popup.classList.add('ac-dtp__popup--open');
    }

    this._inputEl.setAttribute('aria-expanded', 'true');
    this._bindOutsideClickListener();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Open);
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;

    this._popup.classList.remove('ac-dtp__popup--open');
    this._backdropEl.classList.remove('ac-dtp__backdrop--visible');
    document.body.style.overflow = '';

    this._destroyPopper();
    this._unbindOutsideClickListener();
    this._inputEl.setAttribute('aria-expanded', 'false');
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
    this._updateInputDisplay();
    this._updateHeader();
    this._renderCalendars();

    const isoValue = this._computeCurrentIsoValue();
    super.setValue({ value: isoValue as any, emitEvent });
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

    this._inputEl = document.createElement('input');
    this._inputEl.className = AC_DATETIME_PICKER_CSS_CLASS.input;
    this._inputEl.placeholder = this.placeholder || (this._state.isRangeMode ? 'Select date range' : 'Select date');
    this._inputEl.setAttribute('aria-haspopup', 'dialog');
    this._inputEl.setAttribute('aria-expanded', 'false');

    this._clearBtn = document.createElement('button');
    this._clearBtn.type = 'button';
    this._clearBtn.className = 'ac-dtp__clear-btn';
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
    this._inputWrap.appendChild(this._clearBtn);
    this._inputWrap.appendChild(this._iconEl);

    // ── Backdrop Scrim (for mobile modal) ─────────
    this._backdropEl = document.createElement('div');
    this._backdropEl.className = 'ac-dtp__backdrop';
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

    const info = document.createElement('div');
    info.className = 'ac-dtp__header-info';

    const startBlock = document.createElement('div');
    startBlock.className = 'ac-dtp__header-block';
    const startLabel = document.createElement('div');
    startLabel.className = 'ac-dtp__header-label';
    startLabel.textContent = this._state.isRangeMode ? 'Start Date' : 'Date';
    this._headerStartValue = document.createElement('div');
    this._headerStartValue.className = 'ac-dtp__header-value';
    this._headerStartValue.textContent = '—';
    startBlock.appendChild(startLabel);
    startBlock.appendChild(this._headerStartValue);

    this._headerSeparator = document.createElement('div');
    this._headerSeparator.className = 'ac-dtp__header-separator';

    this._headerEndBlock = document.createElement('div');
    this._headerEndBlock.className = 'ac-dtp__header-block';
    const endLabel = document.createElement('div');
    endLabel.className = 'ac-dtp__header-label';
    endLabel.textContent = 'End Date';
    this._headerEndValue = document.createElement('div');
    this._headerEndValue.className = 'ac-dtp__header-value';
    this._headerEndValue.textContent = '—';
    this._headerEndBlock.appendChild(endLabel);
    this._headerEndBlock.appendChild(this._headerEndValue);

    info.appendChild(startBlock);
    info.appendChild(this._headerSeparator);
    info.appendChild(this._headerEndBlock);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ac-dtp__header-close';
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
    mainContent.className = 'ac-dtp__main-content';

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
    this._timeSection.className = 'ac-dtp__time-section';
    this._buildTimePickers();

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
    }
  }

  // ── Event Bindings ──────────────────────────────────────────────

  private _bindEvents() {
    // Open picker on input trigger click
    this._inputWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Freeform manual typing
    this._inputEl.addEventListener('input', () => {
      this._onManualInput();
    });

    // Enter to commit, Escape to revert/close
    this._inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._commitManualInput();
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

    // Clipboard paste support
    this._inputEl.addEventListener('paste', (e: ClipboardEvent) => {
      setTimeout(() => {
        this._onManualInput();
      }, 0);
    });

    // Blur to commit display value
    this._inputEl.addEventListener('blur', () => {
      if (!this._isOpen) {
        this._commitManualInput();
      }
    });
  }

  // ── Selection & Input Handlers ──────────────────────────────────

  private _onDaySelected() {
    this._updateHeader();

    const hasTime = this._state.hasTime || this._showTime;

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

  private _onManualInput() {
    const raw = this._inputEl.value.trim();
    if (!raw) {
      this._state.clear();
      this._updateHeader();
      this._renderCalendars();
      return;
    }

    if (this._state.isRangeMode) {
      const parsed = acDtpParseRange(raw, this._dateRangeSeparator, this._format);
      if (parsed.isValid) {
        this._state.startDate = parsed.start;
        this._state.endDate = parsed.end;
        this._updateHeader();
        this._renderCalendars();
      }
    } else {
      const parsed = acDtpParseAnyDate(raw, this._format);
      if (parsed) {
        this._state.startDate = parsed;
        this._state.endDate = null;
        this._updateHeader();
        this._renderCalendars();
      }
    }
  }

  private _commitManualInput() {
    const raw = this._inputEl.value.trim();
    if (!raw) {
      this.clear();
      return;
    }

    if (this._state.isRangeMode) {
      const parsed = acDtpParseRange(raw, this._dateRangeSeparator, this._format);
      if (parsed.start) {
        this._state.startDate = parsed.start;
        this._state.endDate = parsed.end;
        this._commitSelection(false);
      } else {
        this._updateInputDisplay();
      }
    } else {
      const parsed = acDtpParseAnyDate(raw, this._format);
      if (parsed) {
        this._state.startDate = parsed;
        this._state.endDate = null;
        this._commitSelection(false);
      } else {
        this._updateInputDisplay();
      }
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
    super.setValue(isoValue as any);

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

  private _updateHeader() {
    if (!this._headerStartValue) return;

    const includeTime = this._state.hasTime || this._showTime;
    const fmt = this._format + (includeTime ? ' hh:mm AA' : '');

    if (this._state.startDate) {
      this._headerStartValue.textContent = acDtpFormatDisplay(this._state.startDate, fmt);
      this._headerStartValue.classList.add('ac-dtp__header-value--active');
    } else {
      this._headerStartValue.textContent = '—';
      this._headerStartValue.classList.remove('ac-dtp__header-value--active');
    }

    if (this._state.isRangeMode) {
      if (this._state.endDate) {
        this._headerEndValue.textContent = acDtpFormatDisplay(this._state.endDate, fmt);
        this._headerEndValue.classList.add('ac-dtp__header-value--active');
      } else {
        this._headerEndValue.textContent = '—';
        this._headerEndValue.classList.remove('ac-dtp__header-value--active');
      }
    }
  }

  private _updateInputDisplay() {
    if (!this._inputEl) return;

    const includeTime = this._state.hasTime || this._showTime;
    const fmt = this._format + (includeTime ? ' hh:mm AA' : '');

    let text = '';
    if (this._state.isRangeMode) {
      if (this._state.startDate && this._state.endDate) {
        const s = acDtpFormatDisplay(this._state.startDate, fmt);
        const e = acDtpFormatDisplay(this._state.endDate, fmt);
        text = `${s} ${this._dateRangeSeparator} ${e}`;
      } else if (this._state.startDate) {
        text = acDtpFormatDisplay(this._state.startDate, fmt);
      }
    } else if (this._state.startDate) {
      text = acDtpFormatDisplay(this._state.startDate, fmt);
    }

    this._inputEl.value = text;
    this._inputWrap.classList.toggle('ac-dtp__input-wrap--has-value', !!text);
  }

  private _computeCurrentIsoValue(): string | IAcDateTimePickerRangeValue | null {
    const includeTime = this._state.hasTime || this._showTime;

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
      return;
    }

    if (typeof val === 'object' && ('start' in val || 'end' in val)) {
      this._state.startDate = val.start ? acDtpParseAnyDate(val.start) : null;
      this._state.endDate = val.end ? acDtpParseAnyDate(val.end) : null;
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

    if (this._headerEndBlock) {
      this._headerEndBlock.style.display = isRange ? '' : 'none';
      this._headerSeparator.style.display = isRange ? '' : 'none';
    }

    if (this._calRightContainer) {
      this._calRightContainer.style.display = isRange ? '' : 'none';
    }
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
