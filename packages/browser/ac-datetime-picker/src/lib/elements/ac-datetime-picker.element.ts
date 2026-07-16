/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcInputBase, acRegisterCustomElement } from '@autocode-ts/ac-browser';
import AirDatepicker from 'air-datepicker';
import en from 'air-datepicker/locale/en';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';

import { AC_DATETIME_PICKER_ATTRIBUTE_NAME } from '../consts/ac-datetime-picker-attribute-name.const';
import { AC_DATETIME_PICKER_CSS_CLASS } from '../consts/ac-datetime-picker-css-class-name.const';
import { AcEnumDateTimePickerEvent } from '../enums/ac-enum-datetime-picker-event.enum';
import { AcEnumDateTimePickerMode } from '../enums/ac-enum-datetime-picker-mode.enum';
import { AcEnumDateTimePickerOutputType } from '../enums/ac-enum-datetime-picker-output-type.enum';
import { IAcDateTimePickerPreset } from '../interfaces/ac-datetime-picker-preset.interface';
import { IAcDateTimePickerRangeValue } from '../interfaces/ac-datetime-picker-range-value.interface';
import {
  acDtpFormatDisplay,
  acDtpParseDisplay,
  acDtpParseIso,
  acDtpToIso,
} from '../utils/ac-datetime-picker-iso.utils';
import {
  acDtpGetView,
  acDtpHasTime,
  acDtpIsRangeMode,
} from '../utils/ac-datetime-picker-date.utils';
import {
  AC_DTP_MASKS,
  acDtpMaskBackspace,
  acDtpMaskEmpty,
  acDtpMaskInsert,
  acDtpMaskIsComplete,
  acDtpMaskNextSlot,
} from '../utils/ac-datetime-picker-mask.utils';
import { acDtpGetDefaultPresets } from '../utils/ac-datetime-picker-presets.utils';

// Import Air Datepicker CSS — bundled into the output CSS
import 'air-datepicker/air-datepicker.css';
// Import component CSS
import '../css/ac-datetime-picker.css';

export class AcDateTimePickerElement extends AcInputBase {
  override isInputElementValidHtmlInput = false;

  // ── Observed attributes ──────────────────────────────────────
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
    ];
  }

  // ── Private state ────────────────────────────────────────────
  private _mode: AcEnumDateTimePickerMode = AcEnumDateTimePickerMode.DateRange;
  private _outputType: AcEnumDateTimePickerOutputType = AcEnumDateTimePickerOutputType.Utc;
  private _dateRangeSeperator = "to";
  private _format: string = 'DD-MM-YYYY';
  private _showSidebar: boolean = true;
  private _showFooter: boolean = true;
  private _showTime: boolean = false;
  private _showSeconds: boolean = false;
  private _minuteStep: number = 1;
  private _hour12: boolean = false;
  private _presets: IAcDateTimePickerPreset[] = acDtpGetDefaultPresets();
  private _activePresetLabel: string | null = null;

  // Range selection state
  private _pendingStart: Date | null = null;
  private _pendingEnd: Date | null = null;
  private _isOpen: boolean = false;
  private _calendarsCreated: boolean = false;
  // Prevents onChangeView cascade when programmatically setting both calendars at once
  private _suppressLinkedNav: boolean = false;
  // Prevents re-entrant onSelect calls when _syncRangeHighlight calls selectDate programmatically
  private _suppressSelect: boolean = false;

  // DOM refs (set in init)
  private _root!: HTMLDivElement;
  private _inputWrap!: HTMLDivElement;
  private _inputEl!: HTMLInputElement;
  private _iconEl!: HTMLSpanElement;
  private _popup!: HTMLDivElement;
  private _headerStartLabel!: HTMLDivElement;
  private _headerStartValue!: HTMLDivElement;
  private _headerSeparator!: HTMLDivElement;
  private _headerEndBlock!: HTMLDivElement;
  private _headerEndValue!: HTMLDivElement;
  private _sidebarEl!: HTMLUListElement;
  private _calLeftEl!: HTMLDivElement;
  private _calRightEl!: HTMLDivElement;
  private _footerEl!: HTMLDivElement;

  // Air Datepicker instances (created lazily once on first open)
  private _dpLeft: AirDatepicker<HTMLDivElement> | null = null;
  private _dpRight: AirDatepicker<HTMLDivElement> | null = null;

  // Popper instance — created on open, destroyed on close
  private _popper: PopperInstance | null = null;

  // ── Public properties ────────────────────────────────────────

  get mode(): AcEnumDateTimePickerMode {
    return this._mode;
  }
  set mode(value: AcEnumDateTimePickerMode) {
    this._mode = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.mode, value);
    this._applyModeClasses();
    this._updateInputDisplay();
  }

  get outputType(): AcEnumDateTimePickerOutputType {
    return this._outputType;
  }
  set outputType(value: AcEnumDateTimePickerOutputType) {
    this._outputType = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.outputType, value);
  }

  get dateRangeSeperator(): string {
    return this._dateRangeSeperator;
  }
  set dateRangeSeperator(value: string) {
    this._dateRangeSeperator = value;
    this.setAttribute(AC_DATETIME_PICKER_ATTRIBUTE_NAME.rangeSeperator, value);
  }

  get format(): string {
    return this._format;
  }
  set format(value: string) {
    this._format = value;
    this._updateInputDisplay();
  }

  get showSidebar(): boolean {
    return this._showSidebar;
  }
  set showSidebar(value: boolean) {
    this._showSidebar = value;
    this._root?.classList.toggle('ac-dtp--no-sidebar', !value);
  }

  get showFooter(): boolean {
    return this._showFooter;
  }
  set showFooter(value: boolean) {
    this._showFooter = value;
    this._root?.classList.toggle('ac-dtp--no-footer', !value);
  }

  get showTime(): boolean {
    return this._showTime;
  }
  set showTime(value: boolean) {
    this._showTime = value;
    // Rebuild calendars if already open
    if (this._calendarsCreated) {
      this._destroyCalendars();
      this._createCalendars();
    }
  }

  get showSeconds(): boolean {
    return this._showSeconds;
  }
  set showSeconds(value: boolean) {
    this._showSeconds = value;
  }

  get minuteStep(): number {
    return this._minuteStep;
  }
  set minuteStep(value: number) {
    this._minuteStep = value;
  }

  get hour12(): boolean {
    return this._hour12;
  }
  set hour12(value: boolean) {
    this._hour12 = value;
  }

  get presets(): IAcDateTimePickerPreset[] {
    return this._presets;
  }
  set presets(value: IAcDateTimePickerPreset[]) {
    this._presets = value;
    if (this._sidebarEl) {
      this._renderPresets();
    }
  }

  // ── Lifecycle ────────────────────────────────────────────────

  override attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;

    switch (name) {
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.mode:
        this._mode = (newValue as AcEnumDateTimePickerMode) || AcEnumDateTimePickerMode.DateRange;
        this._applyModeClasses();
        this._updateInputDisplay();
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.outputType:
        this._outputType = (newValue as AcEnumDateTimePickerOutputType) || AcEnumDateTimePickerOutputType.Utc;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.format:
        this._format = newValue || 'DD-MM-YYYY';
        this._updateInputDisplay();
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
        this._showSeconds = newValue === 'true';
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.minuteStep:
        this._minuteStep = parseInt(newValue, 10) || 1;
        break;
      case AC_DATETIME_PICKER_ATTRIBUTE_NAME.hour12:
        this._hour12 = newValue === 'true';
        break;
      default:
        super.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this._buildDOM();
    this._bindEvents();
    this._applyModeClasses();
    this._renderPresets();
    this._updateInputDisplay();
    // Reflect any value already set via attribute before init
    if (this._value) {
      this._applyValueToState(this._value);
      this._updateInputDisplay();
      this._updateHeader();
    }
  }

  override disconnectedCallback() {
    this._destroyCalendars();
    this._destroyPopper();
    this._unbindDocumentClickListener();
    // Remove popup from body if it was attached there
    if (this._popup?.parentNode === document.body) {
      document.body.removeChild(this._popup);
    }
    super.disconnectedCallback();
  }

  // ── Public methods ───────────────────────────────────────────

  open() {
    if (this._isOpen || this.disabled || this.readonly) return;
    this._isOpen = true;

    // Create and synchronously position Popper BEFORE the open class is added
    // so the CSS transition plays from the correct coordinates
    this._createPopper();
    this._popup.classList.add(AC_DATETIME_PICKER_CSS_CLASS.popupOpen);

    if (!this._calendarsCreated) {
      this._createCalendars();
    }
    this._syncCalendarsToState();
    this._bindDocumentClickListener();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Open);
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._popup.classList.remove(AC_DATETIME_PICKER_CSS_CLASS.popupOpen);
    this._destroyPopper();
    this._unbindDocumentClickListener();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Close);
  }

  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  clear() {
    this._pendingStart = null;
    this._pendingEnd = null;
    this._activePresetLabel = null;
    this.setValue(null);
    this._updateInputDisplay();
    this._updateHeader();
    this._clearActivePreset();
    if (this._dpLeft) this._dpLeft.clear();
    if (this._dpRight) this._dpRight.clear();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Clear);
  }


  override focus() {
    this._inputEl?.focus();
  }

  /** Set value from ISO string or range object. */
  override setValue(value: string | IAcDateTimePickerRangeValue | null) {
    super.setValue(value as any);
    this._applyValueToState(value);
    this._updateInputDisplay();
    this._updateHeader();
  }

  getValue(): string | IAcDateTimePickerRangeValue | null {
    return this._value ?? null;
  }

  setStart(isoString: string) {
    this._pendingStart = acDtpParseIso(isoString);
    this._updateHeader();
    if (this._dpLeft) this._syncCalendarsToState();
  }

  setEnd(isoString: string) {
    this._pendingEnd = acDtpParseIso(isoString);
    this._updateHeader();
    if (this._dpRight) this._syncCalendarsToState();
  }

  refresh() {
    this._renderPresets();
    this._updateInputDisplay();
    this._updateHeader();
  }

  override destroy() {
    this._destroyCalendars();
    this._unbindDocumentClickListener();
    super.destroy();
  }

  // ── DOM building ─────────────────────────────────────────────

  private _buildDOM() {
    this.innerHTML = '';

    this._root = document.createElement('div');
    this._root.className = AC_DATETIME_PICKER_CSS_CLASS.root;

    // Input trigger
    this._inputWrap = document.createElement('div');
    this._inputWrap.className = AC_DATETIME_PICKER_CSS_CLASS.inputWrap;

    this._inputEl = document.createElement('input');
    this._inputEl.className = AC_DATETIME_PICKER_CSS_CLASS.input;
    // NOTE: not readOnly — user can type a date directly
    this._inputEl.setAttribute('aria-haspopup', 'dialog');
    this._inputEl.setAttribute('aria-expanded', 'false');
    this._inputEl.placeholder = this.placeholder || 'Select date';

    this._iconEl = document.createElement('span');
    this._iconEl.className = AC_DATETIME_PICKER_CSS_CLASS.icon;
    this._iconEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

    this._inputWrap.appendChild(this._inputEl);
    this._inputWrap.appendChild(this._iconEl);

    // Popup
    this._popup = document.createElement('div');
    this._popup.className = AC_DATETIME_PICKER_CSS_CLASS.popup;
    this._popup.setAttribute('role', 'dialog');
    this._popup.setAttribute('aria-modal', 'true');
    this._popup.setAttribute('aria-label', 'Date picker');

    // Header
    const header = document.createElement('div');
    header.className = AC_DATETIME_PICKER_CSS_CLASS.header;

    const startBlock = document.createElement('div');
    startBlock.className = AC_DATETIME_PICKER_CSS_CLASS.headerStart;

    this._headerStartLabel = document.createElement('div');
    this._headerStartLabel.className = AC_DATETIME_PICKER_CSS_CLASS.headerLabel;
    this._headerStartLabel.textContent = 'Start';

    this._headerStartValue = document.createElement('div');
    this._headerStartValue.className = AC_DATETIME_PICKER_CSS_CLASS.headerValue;
    this._headerStartValue.textContent = '—';

    startBlock.appendChild(this._headerStartLabel);
    startBlock.appendChild(this._headerStartValue);

    this._headerSeparator = document.createElement('div');
    this._headerSeparator.className = AC_DATETIME_PICKER_CSS_CLASS.headerSeparator;

    this._headerEndBlock = document.createElement('div');
    this._headerEndBlock.className = AC_DATETIME_PICKER_CSS_CLASS.headerEnd;

    const endLabel = document.createElement('div');
    endLabel.className = AC_DATETIME_PICKER_CSS_CLASS.headerLabel;
    endLabel.textContent = 'End';

    this._headerEndValue = document.createElement('div');
    this._headerEndValue.className = AC_DATETIME_PICKER_CSS_CLASS.headerValue;
    this._headerEndValue.textContent = '—';

    this._headerEndBlock.appendChild(endLabel);
    this._headerEndBlock.appendChild(this._headerEndValue);

    header.appendChild(startBlock);
    header.appendChild(this._headerSeparator);
    header.appendChild(this._headerEndBlock);

    // Body
    const body = document.createElement('div');
    body.className = AC_DATETIME_PICKER_CSS_CLASS.body;

    // Sidebar
    const sidebarContainer = document.createElement('div');
    sidebarContainer.className = 'ac-dtp__sidebar-container';

    const sidebar = document.createElement('div');
    sidebar.className = AC_DATETIME_PICKER_CSS_CLASS.sidebar;
    sidebarContainer.appendChild(sidebar);

    this._sidebarEl = document.createElement('ul');
    this._sidebarEl.className = AC_DATETIME_PICKER_CSS_CLASS.presetList;
    sidebar.appendChild(this._sidebarEl);

    // Calendars
    const calendars = document.createElement('div');
    calendars.className = AC_DATETIME_PICKER_CSS_CLASS.calendars;

    this._calLeftEl = document.createElement('div');
    this._calLeftEl.className = AC_DATETIME_PICKER_CSS_CLASS.calLeft;

    this._calRightEl = document.createElement('div');
    this._calRightEl.className = AC_DATETIME_PICKER_CSS_CLASS.calRight;

    calendars.appendChild(this._calLeftEl);
    calendars.appendChild(this._calRightEl);

    body.appendChild(sidebarContainer);
    body.appendChild(calendars);

    // Footer
    this._footerEl = document.createElement('div');
    this._footerEl.className = AC_DATETIME_PICKER_CSS_CLASS.footer;

    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.className = AC_DATETIME_PICKER_CSS_CLASS.btnClear;
    btnClear.textContent = 'Clear';
    btnClear.addEventListener('click', () => this._onClearClick());

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = AC_DATETIME_PICKER_CSS_CLASS.btnCancel;
    btnCancel.textContent = 'Cancel';
    btnCancel.addEventListener('click', () => this._onCancelClick());

    const btnApply = document.createElement('button');
    btnApply.type = 'button';
    btnApply.className = AC_DATETIME_PICKER_CSS_CLASS.btnApply;
    btnApply.textContent = 'Apply';
    btnApply.addEventListener('click', () => this._onApplyClick());

    this._footerEl.appendChild(btnClear);
    this._footerEl.appendChild(btnCancel);
    this._footerEl.appendChild(btnApply);

    // Assemble popup
    this._popup.appendChild(header);
    this._popup.appendChild(body);
    this._popup.appendChild(this._footerEl);

    // Assemble root
    this._root.appendChild(this._inputWrap);
    this.appendChild(this._root);

    // Attach popup to body so Popper can position it above all stacking contexts
    document.body.appendChild(this._popup);
  }

  private _bindEvents() {
    // Show calendar dropdown when clicked on input
    this._inputEl.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      this.toggle();
    });

    // Auto update date in calendar when input is valid date value in all modes
    this._inputEl.addEventListener('keyup', () => {
      const mask = AC_DTP_MASKS[this._mode];
      let raw = this._inputEl.value;
      const isRange = acDtpIsRangeMode(this._mode);
      const includeTime = acDtpHasTime(this._mode) || this._showTime;
      const fmt = this._format + (includeTime ? ' hh:mm AA' : '');

      if (isRange) {
        const separatorRegExp = new RegExp(`\\s+${this.dateRangeSeperator}\\s+|\\s+-\\s+|\\s+–\\s+`);
        const parts = raw.split(separatorRegExp);
        const rawStart = parts[0]?.trim();
        const rawEnd = parts[1]?.trim();

        // Do not consider valid if underscores are still present (meaning the year or other fields are incomplete)
        const startComplete = !!(rawStart && !rawStart.includes('_'));
        const endComplete = !!(rawEnd && !rawEnd.includes('_'));

        const startStr = startComplete ? rawStart.replace(/_/g, ' ').replace(/\s+/g, ' ').trim() : '';
        const endStr = endComplete ? rawEnd.replace(/_/g, ' ').replace(/\s+/g, ' ').trim() : '';

        const start = startStr ? acDtpParseDisplay(startStr, fmt) : new Date(NaN);
        const end = endStr ? acDtpParseDisplay(endStr, fmt) : new Date(NaN);

        const startValid = !isNaN(start.getTime());
        const endValid = !isNaN(end.getTime());

        if (startValid || endValid) {
          if (startValid) {
            this._pendingStart = start;
          }
          if (endValid) {
            this._pendingEnd = end;
          } else {
            this._pendingEnd = null;
          }
          this._syncCalendarsToState();

          const rangeValue: IAcDateTimePickerRangeValue = {
            start: startValid ? acDtpToIso(start, this._outputType, includeTime) : '',
            end: endValid ? acDtpToIso(end, this._outputType, includeTime) : '',
          };
          super.setValue(rangeValue as any);
        }
      } else {
        if (mask) {
          if (!acDtpMaskIsComplete(raw, mask)) {
            return;
          }
          raw = raw.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          raw = raw.trim();
        }
        const d = acDtpParseDisplay(raw, fmt);
        if (!isNaN(d.getTime())) {
          this._pendingStart = d;
          this._pendingEnd   = null;
          this._syncCalendarsToState();
          const isoValue = acDtpToIso(d, this._outputType, includeTime);
          super.setValue(isoValue);
        }
      }
    });

    // Focus → show empty mask template when input is blank
    this._inputEl.addEventListener('focus', () => {
      const mask = AC_DTP_MASKS[this._mode];
      if (!mask || this._inputEl.value) return;
      const empty = acDtpMaskEmpty(mask);
      this._inputEl.value = empty;
      this._inputEl.dispatchEvent(new Event('keyup'));
      // Place cursor at first slot
      const firstSlot = acDtpMaskNextSlot(mask, 0);
      // Use setTimeout so the browser's own focus positioning doesn't override us
      setTimeout(() => this._inputEl.setSelectionRange(firstSlot, firstSlot));
    });

    // Keydown — full mask enforcement + Enter/Escape/Tab handling
    this._inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      // System shortcuts pass through
      if (e.ctrlKey || e.metaKey) return;

      // ── Navigation / control keys ──────────────────────────────
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this._isOpen) { this.close(); } else { this._onInputCommit(); }
        return;
      }
      if (e.key === 'Escape') {
        if (this._isOpen) { e.preventDefault(); this.close(); }
        else { this._updateInputDisplay(); } // revert typed text
        return;
      }
      if (e.key === 'Tab') {
        if (this._isOpen) this.close();
        return; // allow Tab to move focus naturally
      }
      // Allow cursor navigation
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Delete'].includes(e.key)) return;

      // ── Mask character enforcement ──────────────────────────────
      const mask = AC_DTP_MASKS[this._mode];
      if (!mask) return; // no mask → browser handles the key natively

      e.preventDefault(); // take full control from here

      const inp = this._inputEl;
      // Ensure mask template is showing
      if (!inp.value || inp.value.length !== mask.length) {
        inp.value = acDtpMaskEmpty(mask);
      }

      const cursor = inp.selectionStart ?? 0;

      if (e.key === 'Backspace') {
        const r = acDtpMaskBackspace(inp.value, mask, cursor);
        inp.value = r.value;
        inp.setSelectionRange(r.cursor, r.cursor);
        inp.dispatchEvent(new Event('keyup'));
        return;
      }

      if (e.key.length === 1) {
        const r = acDtpMaskInsert(inp.value, mask, cursor, e.key);
        if (!r) return; // char doesn't fit any slot — silently reject
        inp.value = r.value;
        inp.setSelectionRange(r.cursor, r.cursor);
        inp.dispatchEvent(new Event('keyup'));
        // Auto-commit when mask is fully filled in single-date mode
        if (acDtpMaskIsComplete(r.value, mask) && !acDtpIsRangeMode(this._mode)) {
          setTimeout(() => this._onInputCommit());
        }
      }
    });

    // Blur → commit typed value (ONLY when popup is not open)
    // The popup is open when user clicks calendar cells, Apply, etc.
    // Committing on blur in that case would clear pending dates before Apply fires.
    this._inputEl.addEventListener('blur', (e: FocusEvent) => {
      if (this._isOpen) return;
      this._onInputCommit();
    });

    // Keyboard trap inside popup
    this._popup.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
        this._inputEl.focus();
      }
    });
  }

  /** Parse the current input text and apply as selection. Reverts on invalid input. */
  private _onInputCommit() {
    // Never commit while the popup is open — blur can fire when clicking calendar
    // cells or the Apply button, which would clear _pendingStart/_pendingEnd
    // before _applySelection() runs.
    if (this._isOpen) return;

    const mask = AC_DTP_MASKS[this._mode];
    let raw: string;

    if (mask) {
      const val = this._inputEl.value;
      // Blank input or the empty mask template (“__ ___ ____”) — nothing typed yet
      if (!val || val === acDtpMaskEmpty(mask)) {
        this._updateInputDisplay(); // revert to last committed value
        return;
      }
      // Replace unfilled underscores with spaces so partial entries parse as NaN
      raw = val.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      raw = this._inputEl.value.trim();
      if (!raw) {
        this._updateInputDisplay();
        return;
      }
    }

    const isRange = acDtpIsRangeMode(this._mode);
    const includeTime = acDtpHasTime(this._mode) || this._showTime;
    const fmt = this._format + (includeTime ? ' hh:mm AA' : '');

    if (isRange) {
      const parts = raw.split(/\s*–\s*/);
      if (parts.length === 2) {
        const start = acDtpParseDisplay(parts[0].trim(), fmt);
        const end   = acDtpParseDisplay(parts[1].trim(), fmt);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          this._pendingStart = start;
          this._pendingEnd   = end;
          this._applySelection();
          return;
        }
      }
    } else {
      const d = acDtpParseDisplay(raw, fmt);
      if (!isNaN(d.getTime())) {
        this._pendingStart = d;
        this._pendingEnd   = null;
        this._applySelection();
        return;
      }
    }

    // Invalid — revert to the last committed display
    this._updateInputDisplay();
  }

  // ── Calendar creation ────────────────────────────────────────

  private _createCalendars() {
    const isRange = acDtpIsRangeMode(this._mode);
    const hasTime = acDtpHasTime(this._mode) || this._showTime;
    const view = acDtpGetView(this._mode);

    const sharedOptions: any = {
      inline: true,
      isMobile: false,
      locale: en,
      timepicker: hasTime,
      timeFormat: this._hour12 ? 'hh:mm aa' : 'HH:mm',
      minutesStep: this._minuteStep,
      range: isRange,
      dateFormat: 'dd MMM yyyy',
      view,
      minView: view,
      toggleSelected: false,
    };

    // LEFT calendar
    this._dpLeft = new AirDatepicker(this._calLeftEl, {
      ...sharedOptions,
      onSelect: ({ date }: any) => {
        this._onCalendarSelect(date, 'left');
      },
      onChangeView: ({ month, year }: any) => {
        // When the user navigates left calendar, advance right by 1 month
        // Skip during programmatic sync to avoid cascade overwriting each other
        if (this._suppressLinkedNav || !this._dpRight || !isRange) return;
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        this._suppressLinkedNav = true;
        this._dpRight.setViewDate(new Date(nextYear, nextMonth, 1));
        this._suppressLinkedNav = false;
      },
    });

    if (isRange) {
      // RIGHT calendar — starts one month ahead of left
      const now = new Date();
      const rightMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
      const rightYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();

      this._dpRight = new AirDatepicker(this._calRightEl, {
        ...sharedOptions,
        startDate: new Date(rightYear, rightMonth, 1),
        onSelect: ({ date }: any) => {
          this._onCalendarSelect(date, 'right');
        },
        onChangeView: ({ month, year }: any) => {
          // When the user navigates right calendar, move left back 1 month
          // Skip during programmatic sync to avoid cascade overwriting each other
          if (this._suppressLinkedNav || !this._dpLeft) return;
          const prevMonth = month === 0 ? 11 : month - 1;
          const prevYear = month === 0 ? year - 1 : year;
          this._suppressLinkedNav = true;
          this._dpLeft.setViewDate(new Date(prevYear, prevMonth, 1));
          this._suppressLinkedNav = false;
        },
      });
    }

    this._calendarsCreated = true;
  }

  private _destroyCalendars() {
    if (this._dpLeft) {
      this._dpLeft.destroy();
      this._dpLeft = null;
    }
    if (this._dpRight) {
      this._dpRight.destroy();
      this._dpRight = null;
    }
    this._calendarsCreated = false;
  }

  // ── Calendar selection logic ─────────────────────────────────

  private _onCalendarSelect(date: Date | Date[], _side: 'left' | 'right') {
    // Guard against re-entrant calls triggered by _syncRangeHighlight's selectDate calls
    if (this._suppressSelect) return;

    const isRange = acDtpIsRangeMode(this._mode);

    if (!isRange) {
      const selected = Array.isArray(date) ? date[0] : date;
      this._pendingStart = selected || null;
      this._pendingEnd = null;
      this._updateHeader();
      // Single mode always auto-applies — the footer is CSS-hidden.
      // The _showFooter flag stays true by default so the old guard
      // (!this._showFooter) never fired, leaving the input blank.
      const isTimeChanging = !!(
        (this._dpLeft && (this._dpLeft as any).timepickerIsActive) ||
        (this._dpRight && (this._dpRight as any).timepickerIsActive) ||
        (document.activeElement && document.activeElement.closest('.air-datepicker-time'))
      );
      this._applySelection(!isTimeChanging);
      return;
    }

    // Range mode: two-click selection
    const dates = Array.isArray(date) ? date : [date];

    if (dates.length === 0) return;

    if (dates.length === 1) {
      this._pendingStart = dates[0];
      this._pendingEnd = null;
    } else {
      // Air Datepicker gives [start, end] in chronological order
      this._pendingStart = dates[0];
      this._pendingEnd = dates[dates.length - 1];
    }

    // Sync both calendars to show the same range selection
    this._syncRangeHighlight();
    this._updateHeader();
    this._updateInputDisplay();

    // Auto-apply if no footer
    if (!this._showFooter && this._pendingStart && this._pendingEnd) {
      const isTimeChanging = !!(
        (this._dpLeft && (this._dpLeft as any).timepickerIsActive) ||
        (this._dpRight && (this._dpRight as any).timepickerIsActive) ||
        (document.activeElement && document.activeElement.closest('.air-datepicker-time'))
      );
      this._applySelection(!isTimeChanging);
    }
  }

  private _syncRangeHighlight() {
    if (!this._pendingStart) return;
    const dates = this._pendingEnd
      ? [this._pendingStart, this._pendingEnd]
      : [this._pendingStart];

    // IMPORTANT: pass { silent: true } to every programmatic clear() / selectDate() call.
    //
    // Air Datepicker fires onSelect asynchronously via setTimeout. This means any
    // _suppressSelect flag is already reset to false before the callback actually runs,
    // making flag-based guards completely ineffective.
    //
    // { silent: true } prevents onSelect from being queued at all, so our handler is
    // never called for programmatic changes — only for real user clicks.
    //
    // Air Datepicker's selectDate([date1]) with range:true correctly sets rangeDateFrom=date1
    // internally (via the "default" switch case), so no manual patch is needed.
    this._suppressLinkedNav = true;

    if (this._dpLeft) {
      this._dpLeft.clear({ silent: true });
      this._dpLeft.selectDate(dates, { silent: true });
      // selectDate may navigate — restore left to start month
      this._dpLeft.setViewDate(this._pendingStart);
    }

    if (this._dpRight) {
      this._dpRight.clear({ silent: true });
      this._dpRight.selectDate(dates, { silent: true });
      // Restore right to end month (or start+1 if no end yet)
      if (this._pendingEnd) {
        this._dpRight.setViewDate(this._pendingEnd);
      } else {
        const base = this._pendingStart;
        const nextMonth = base.getMonth() === 11 ? 0 : base.getMonth() + 1;
        const nextYear = base.getMonth() === 11 ? base.getFullYear() + 1 : base.getFullYear();
        this._dpRight.setViewDate(new Date(nextYear, nextMonth, 1));
      }
    }

    this._suppressLinkedNav = false;
  }



  private _syncCalendarsToState() {
    if (!this._dpLeft) return;
    const isRange = acDtpIsRangeMode(this._mode);
    const now = new Date();

    // Suppress linked-nav handlers so setting left and right independently
    // doesn't trigger a cascade that puts both on the same month
    this._suppressLinkedNav = true;

    // Left always shows the start month (or current month if no value)
    this._dpLeft.setViewDate(this._pendingStart || now);

    if (isRange && this._dpRight) {
      if (this._pendingEnd) {
        // Right shows the end month
        this._dpRight.setViewDate(this._pendingEnd);
      } else {
        // No end yet — right shows one month ahead of start
        const base = this._pendingStart || now;
        const nextMonth = base.getMonth() === 11 ? 0 : base.getMonth() + 1;
        const nextYear = base.getMonth() === 11 ? base.getFullYear() + 1 : base.getFullYear();
        this._dpRight.setViewDate(new Date(nextYear, nextMonth, 1));
      }
    }

    this._suppressLinkedNav = false;

    if (this._pendingStart || this._pendingEnd) {
      this._syncRangeHighlight();
    }
  }

  // ── Apply / Cancel / Clear ───────────────────────────────────

  private _onApplyClick() {
    this._applySelection();
  }

  private _onCancelClick() {
    // Revert pending state back to last committed value
    this._applyValueToState(this._value);
    this._updateHeader();
    this.close();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Cancel);
  }

  private _onClearClick() {
    this.clear();
  }

  private _applySelection(closePopup: boolean = true) {
    const isRange = acDtpIsRangeMode(this._mode);
    const includeTime = acDtpHasTime(this._mode) || this._showTime;

    if (isRange) {
      if (!this._pendingStart && !this._pendingEnd) {
        this.clear();
        return;
      }
      // Swap if end < start
      let start = this._pendingStart;
      let end = this._pendingEnd;
      if (start && end && end < start) {
        [start, end] = [end, start];
        this._pendingStart = start;
        this._pendingEnd = end;
      }

      const rangeValue: IAcDateTimePickerRangeValue = {
        start: start ? acDtpToIso(start, this._outputType, includeTime) : '',
        end: end ? acDtpToIso(end, this._outputType, includeTime) : '',
      };
      super.setValue(rangeValue as any);
    } else {
      if (!this._pendingStart) {
        this.clear();
        return;
      }
      const isoValue = acDtpToIso(this._pendingStart, this._outputType, includeTime);
      super.setValue(isoValue);
    }

    this._updateInputDisplay();
    this._updateHeader();
    this._dispatchEvent(AcEnumDateTimePickerEvent.Apply);
    if (closePopup) {
      this.close();
    }
  }

  // ── Presets ──────────────────────────────────────────────────

  private _renderPresets() {
    if (!this._sidebarEl) return;
    this._sidebarEl.innerHTML = '';

    for (const preset of this._presets) {
      const li = document.createElement('li');
      li.className = AC_DATETIME_PICKER_CSS_CLASS.presetItem;
      li.textContent = preset.label;
      if (preset.label === this._activePresetLabel) {
        li.classList.add(AC_DATETIME_PICKER_CSS_CLASS.presetItemActive);
      }
      li.addEventListener('click', () => this._onPresetClick(preset, li));
      this._sidebarEl.appendChild(li);
    }
  }

  private _onPresetClick(preset: IAcDateTimePickerPreset, li: HTMLLIElement) {
    const { start, end } = preset.getValue();
    this._pendingStart = start;
    this._pendingEnd = end;
    this._activePresetLabel = preset.label;

    this._renderPresets(); // re-render to update active state
    this._syncCalendarsToState();
    this._updateHeader();

    this._dispatchEvent(AcEnumDateTimePickerEvent.PresetSelect, {
      preset: preset.label,
      start,
      end,
    });

    // Auto-apply if no footer
    if (!this._showFooter) {
      this._applySelection();
    }
  }

  private _clearActivePreset() {
    this._activePresetLabel = null;
    this._renderPresets();
  }

  // ── Display helpers ──────────────────────────────────────────

  private _applyModeClasses() {
    if (!this._root) return;
    const isRange = acDtpIsRangeMode(this._mode);

    // Apply to root (for any CSS that lives inside the custom element)
    this._root.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.singleMode, !isRange);
    this._root.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.rangeMode, isRange);

    // Apply to popup too — popup lives in document.body so it has no ancestor
    // relationship with _root; CSS rules inside the popup need the class here
    if (this._popup) {
      this._popup.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.singleMode, !isRange);
      this._popup.classList.toggle(AC_DATETIME_PICKER_CSS_CLASS.rangeMode, isRange);
    }

    // CSS hides/shows the header, sidebar, footer, and right calendar based on the
    // mode class above. Only the label text needs to be set here.
    if (this._headerStartLabel) {
      this._headerStartLabel.textContent = isRange ? 'Start' : 'Date';
    }
  }


  private _applyValueToState(value: any) {
    if (!value) {
      this._pendingStart = null;
      this._pendingEnd = null;
      return;
    }
    if (typeof value === 'object' && 'start' in value) {
      this._pendingStart = value.start ? acDtpParseIso(value.start) : null;
      this._pendingEnd = value.end ? acDtpParseIso(value.end) : null;
    } else if (typeof value === 'string') {
      this._pendingStart = acDtpParseIso(value);
      this._pendingEnd = null;
    }
  }

  private _updateInputDisplay() {
    if (!this._inputEl) return;
    const includeTime = acDtpHasTime(this._mode) || this._showTime;
    const fmt = this._format + (includeTime ? ' hh:mm AA' : '');

    const isRange = acDtpIsRangeMode(this._mode);
    let newValue = '';

    if (isRange && this._pendingStart) {
      const startStr = acDtpFormatDisplay(this._pendingStart, fmt);
      const endStr = this._pendingEnd ? acDtpFormatDisplay(this._pendingEnd, fmt) : '';
      if (endStr) {
        newValue = `${startStr} ${this.dateRangeSeperator} ${endStr}`;
      } else {
        const mask = AC_DTP_MASKS[this._mode];
        if (mask) {
          const emptyMask = acDtpMaskEmpty(mask);
          const startLen = startStr.length;
          const endPart = emptyMask.substring(startLen);
          newValue = `${startStr}${endPart}`;
        } else {
          newValue = `${startStr} ${this.dateRangeSeperator} `;
        }
      }
    } else if (!isRange && this._pendingStart) {
      newValue = acDtpFormatDisplay(this._pendingStart, fmt);
    } else {
      newValue = '';
    }

    if (this._inputEl.value !== newValue) {
      const selectionStart = this._inputEl.selectionStart;
      const selectionEnd = this._inputEl.selectionEnd;
      this._inputEl.value = newValue;
      if (selectionStart !== null && selectionEnd !== null && document.activeElement === this._inputEl) {
        this._inputEl.setSelectionRange(selectionStart, selectionEnd);
      }
    }

    this._inputEl.setAttribute('aria-expanded', String(this._isOpen));
  }

  private _updateHeader() {
    if (!this._headerStartValue) return;
    const includeTime = acDtpHasTime(this._mode) || this._showTime;
    const fmt = this._format + (includeTime ? ' hh:mm AA' : '');

    if (this._pendingStart) {
      this._headerStartValue.textContent = acDtpFormatDisplay(this._pendingStart, fmt);
      this._headerStartValue.classList.add('ac-dtp__header-value--active');
    } else {
      this._headerStartValue.textContent = '—';
      this._headerStartValue.classList.remove('ac-dtp__header-value--active');
    }

    const isRange = acDtpIsRangeMode(this._mode);

    if (isRange && this._pendingEnd) {
      this._headerEndValue.textContent = acDtpFormatDisplay(this._pendingEnd, fmt);
      this._headerEndValue.classList.add('ac-dtp__header-value--active');
    } else if (isRange) {
      this._headerEndValue.textContent = '—';
      this._headerEndValue.classList.remove('ac-dtp__header-value--active');
    } else {
      // Single mode — hide end column (CSS handles it via .ac-dtp--single)
      this._headerEndValue.textContent = '';
    }
  }

  // ── Popper positioning ───────────────────────────────────────

  private _createPopper() {
    this._popper = createPopper(this._inputWrap, this._popup, {
      placement: 'bottom-start',
      strategy: 'fixed',
      modifiers: [
        {
          name: 'offset',
          options: { offset: [0, 4] },
        },
        {
          name: 'flip',
          options: { fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] },
        },
        {
          name: 'preventOverflow',
          options: { padding: 8 },
        },
        {
          // Use top/left instead of transform — prevents conflict with our CSS transform animation
          name: 'computeStyles',
          options: { gpuAcceleration: false },
        },
      ],
    });
    // Force synchronous first placement so the popup is correctly positioned
    // before it becomes visible (avoids flash at 0,0)
    this._popper.forceUpdate();
  }

  private _destroyPopper() {
    if (this._popper) {
      this._popper.destroy();
      this._popper = null;
    }
  }

  // ── Document click to close ──────────────────────────────────

  private _docClickHandler: ((e: MouseEvent) => void) | null = null;

  private _bindDocumentClickListener() {
    this._docClickHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!this._popup.contains(target) && !this._root.contains(target)) {
        this.close();
      }
    };
    // Use capture so it fires before inner handlers
    document.addEventListener('mousedown', this._docClickHandler, true);
  }

  private _unbindDocumentClickListener() {
    if (this._docClickHandler) {
      document.removeEventListener('mousedown', this._docClickHandler, true);
      this._docClickHandler = null;
    }
  }

  // ── Event helpers ────────────────────────────────────────────

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
