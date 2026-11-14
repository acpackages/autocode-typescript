// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill ElementInternals if missing in jsdom
if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.attachInternals) {
  HTMLElement.prototype.attachInternals = function () {
    return {
      setFormValue: () => {},
      setValidity: () => {},
      validationMessage: '',
      willValidate: false,
      checkValidity: () => true,
      reportValidity: () => true,
      labels: [],
      form: null,
    } as unknown as ElementInternals;
  };
}
import {
  acDtpParseAnyDate,
  acDtpParseRange,
  acDtpFormatDisplay,
} from '../src/lib/utils/ac-dtp-flexible-parser.utils';
import { AcDtpPickerState } from '../src/lib/state/ac-dtp-picker-state';
import { AcEnumDateTimePickerMode } from '../src/lib/enums/ac-enum-datetime-picker-mode.enum';
import { AcDateTimePickerElement } from '../src/lib/elements/ac-datetime-picker.element';

describe('ac-datetime-picker comprehensive fixes', () => {
  describe('Timezone & Date Parsing Fixes', () => {
    it('parses UTC ISO strings with Z accurately into local Date', () => {
      const utcStr = '2026-07-15T18:30:00Z';
      const parsed = acDtpParseAnyDate(utcStr);
      expect(parsed).not.toBeNull();
      const expectedTime = new Date(utcStr).getTime();
      expect(parsed!.getTime()).toBe(expectedTime);
    });

    it('parses ISO strings with explicit numeric offset', () => {
      const offsetStr = '2026-07-15T10:30:00+05:30';
      const parsed = acDtpParseAnyDate(offsetStr);
      expect(parsed).not.toBeNull();
      const expectedTime = new Date(offsetStr).getTime();
      expect(parsed!.getTime()).toBe(expectedTime);
    });

    it('does not parse single/double digits as 2001 fallback', () => {
      expect(acDtpParseAnyDate('1')).toBeNull();
      expect(acDtpParseAnyDate('15')).toBeNull();
    });

    it('parses JSON stringified range values in acDtpParseRange', () => {
      const jsonRange = JSON.stringify({
        start: '2026-05-01',
        end: '2026-05-15',
      });
      const parsed = acDtpParseRange(jsonRange);
      expect(parsed.isValid).toBe(true);
      expect(parsed.isComplete).toBe(true);
      expect(parsed.start).not.toBeNull();
      expect(parsed.end).not.toBeNull();
      expect(parsed.start!.getDate()).toBe(1);
      expect(parsed.end!.getDate()).toBe(15);
    });

    it('formats compact ISO strings with T delimiter properly', () => {
      const d = new Date(2026, 4, 15, 14, 30, 45);
      const formatted = acDtpFormatDisplay(d, 'YYYY-MM-DDTHH:mm:ss');
      expect(formatted).toBe('2026-05-15T14:30:45');
    });
  });

  describe('Month and Year State Machine', () => {
    let state: AcDtpPickerState;

    beforeEach(() => {
      state = new AcDtpPickerState();
    });

    it('identifies month and year modes correctly', () => {
      state.mode = AcEnumDateTimePickerMode.Month;
      expect(state.isMonthMode).toBe(true);
      expect(state.isYearMode).toBe(false);

      state.mode = AcEnumDateTimePickerMode.YearRange;
      expect(state.isYearMode).toBe(true);
      expect(state.isMonthMode).toBe(false);
    });

    it('selects single month via handleMonthClick', () => {
      state.mode = AcEnumDateTimePickerMode.Month;
      const res = state.handleMonthClick(2026, 4); // May 2026
      expect(res.complete).toBe(true);
      expect(state.startDate).not.toBeNull();
      expect(state.startDate!.getFullYear()).toBe(2026);
      expect(state.startDate!.getMonth()).toBe(4);
      expect(state.startDate!.getDate()).toBe(1);
      expect(state.endDate).toBeNull();
    });

    it('selects month range via handleMonthClick', () => {
      state.mode = AcEnumDateTimePickerMode.MonthRange;
      const click1 = state.handleMonthClick(2026, 2); // Mar 2026
      expect(click1.complete).toBe(false);

      const click2 = state.handleMonthClick(2026, 6); // Jul 2026
      expect(click2.complete).toBe(true);
      expect(state.startDate!.getMonth()).toBe(2);
      expect(state.endDate!.getMonth()).toBe(6);
      // End date covers the full month (last day of July is 31)
      expect(state.endDate!.getDate()).toBe(31);
    });

    it('selects single year and year range via handleYearClick', () => {
      state.mode = AcEnumDateTimePickerMode.Year;
      const single = state.handleYearClick(2028);
      expect(single.complete).toBe(true);
      expect(state.startDate!.getFullYear()).toBe(2028);

      state.mode = AcEnumDateTimePickerMode.YearRange;
      state.startDate = null;
      state.endDate = null;
      const click1 = state.handleYearClick(2025);
      expect(click1.complete).toBe(false);
      const click2 = state.handleYearClick(2030);
      expect(click2.complete).toBe(true);
      expect(state.startDate!.getFullYear()).toBe(2025);
      expect(state.endDate!.getFullYear()).toBe(2030);
      expect(state.endDate!.getMonth()).toBe(11);
      expect(state.endDate!.getDate()).toBe(31);
    });

    it('preserves setStartTime when startDate is initially null', () => {
      state.setStartTime(15, 45, 30);
      expect(state.startDate).not.toBeNull();
      expect(state.startDate!.getHours()).toBe(15);
      expect(state.startDate!.getMinutes()).toBe(45);

      // Now click a day — time should be preserved
      state.handleDayClick(new Date(2026, 8, 20));
      expect(state.startDate!.getFullYear()).toBe(2026);
      expect(state.startDate!.getMonth()).toBe(8);
      expect(state.startDate!.getDate()).toBe(20);
      expect(state.startDate!.getHours()).toBe(15);
      expect(state.startDate!.getMinutes()).toBe(45);
    });
  });

  describe('AcDateTimePickerElement Capabilities & Time Visibility', () => {
    it('only requires time when mode has time or showTime is true', () => {
      const picker = new AcDateTimePickerElement();

      // Default: daterange, showTime=false -> false
      expect(picker.mode).toBe(AcEnumDateTimePickerMode.DateRange);
      expect(picker.showTime).toBe(false);
      expect(picker.isTimeRequired).toBe(false);

      // Set mode to datetime -> true
      picker.mode = AcEnumDateTimePickerMode.DateTime;
      expect(picker.isTimeRequired).toBe(true);

      // Set mode to date -> false
      picker.mode = AcEnumDateTimePickerMode.Date;
      expect(picker.isTimeRequired).toBe(false);

      // Set showTime=true on date -> true
      picker.showTime = true;
      expect(picker.isTimeRequired).toBe(true);
    });

    it('provides setStart, setEnd, and refresh methods', () => {
      const picker = new AcDateTimePickerElement();
      expect(typeof picker.setStart).toBe('function');
      expect(typeof picker.setEnd).toBe('function');
      expect(typeof picker.refresh).toBe('function');

      picker.setStart('2026-05-10');
      picker.setEnd('2026-05-20');
      const val = picker.getValue() as { start: string; end: string };
      expect(val).not.toBeNull();
      expect(val.start).toBe('2026-05-10');
      expect(val.end).toBe('2026-05-20');
    });

    it('parses JSON string directly in setValue', () => {
      const picker = new AcDateTimePickerElement();
      picker.setValue(JSON.stringify({ start: '2026-06-01', end: '2026-06-30' }));
      const val = picker.getValue() as { start: string; end: string };
      expect(val).not.toBeNull();
      expect(val.start).toBe('2026-06-01');
      expect(val.end).toBe('2026-06-30');
    });

    it('sets default range value using various formats and syncs view dates', () => {
      const picker = new AcDateTimePickerElement();

      // 1. Object with { start, end }
      picker.setValue({ start: '2026-04-10', end: '2026-04-25' });
      let val = picker.getValue() as { start: string; end: string };
      expect(val.start).toBe('2026-04-10');
      expect(val.end).toBe('2026-04-25');
      // View date must sync to start month
      expect((picker as any)._state.viewDateLeft.getMonth()).toBe(3); // April
      expect((picker as any)._state.viewDateLeft.getFullYear()).toBe(2026);

      // 2. Object with { from, to }
      picker.setValue({ from: '2026-08-01', to: '2026-08-15' });
      val = picker.getValue() as { start: string; end: string };
      expect(val.start).toBe('2026-08-01');
      expect(val.end).toBe('2026-08-15');
      expect((picker as any)._state.viewDateLeft.getMonth()).toBe(7); // August

      // 3. Array of ISO strings [start, end]
      picker.setValue(['2026-10-05', '2026-10-20']);
      val = picker.getValue() as { start: string; end: string };
      expect(val.start).toBe('2026-10-05');
      expect(val.end).toBe('2026-10-20');
      expect((picker as any)._state.viewDateLeft.getMonth()).toBe(9); // October

      // 4. JSON Array string
      picker.setValue(JSON.stringify(['2026-12-01', '2026-12-31']));
      val = picker.getValue() as { start: string; end: string };
      expect(val.start).toBe('2026-12-01');
      expect(val.end).toBe('2026-12-31');
      expect((picker as any)._state.viewDateLeft.getMonth()).toBe(11); // December

      // 5. defaultValue property
      const picker2 = new AcDateTimePickerElement();
      picker2.defaultValue = { start: '2027-01-01', end: '2027-01-15' };
      const val2 = picker2.getValue() as { start: string; end: string };
      expect(val2.start).toBe('2027-01-01');
      expect(val2.end).toBe('2027-01-15');
      expect((picker2 as any)._state.viewDateLeft.getFullYear()).toBe(2027);

      // 6. Connected callback with default-value attribute
      const picker3 = new AcDateTimePickerElement();
      picker3.setAttribute('default-value', JSON.stringify({ start: '2026-03-01', end: '2026-03-10' }));
      document.body.appendChild(picker3);
      const val3 = picker3.getValue() as { start: string; end: string };
      expect(val3.start).toBe('2026-03-01');
      expect(val3.end).toBe('2026-03-10');
      // In range mode, dual inputs (_inputStartEl and _inputEndEl) are used
      expect((picker3 as any)._inputStartEl.value).toContain('2026');
      expect((picker3 as any)._inputEndEl.value).toContain('2026');
      document.body.removeChild(picker3);
    });
  });

  describe('Dual Inputs for Range Mode vs Single Input for Single Date Mode', () => {
    it('uses dual inputs in DateRange mode and single input in Date mode', () => {
      const picker = new AcDateTimePickerElement();
      document.body.appendChild(picker);

      // Default is DateRange mode
      const rangeWrap = picker.querySelector('.ac-dtp-range-inputs') as HTMLElement;
      const startInput = picker.querySelector('.ac-dtp-input-start') as HTMLInputElement;
      const endInput = picker.querySelector('.ac-dtp-input-end') as HTMLInputElement;
      const separator = picker.querySelector('.ac-dtp-input-separator') as HTMLElement;
      const singleInput = picker.querySelector('.ac-dtp-input:not(.ac-dtp-input-start):not(.ac-dtp-input-end)') as HTMLInputElement;

      expect(rangeWrap).not.toBeNull();
      expect(startInput).not.toBeNull();
      expect(endInput).not.toBeNull();
      expect(separator).not.toBeNull();
      expect(separator.textContent).toBe('to');

      // Range wrapper should be visible, single input hidden
      expect(rangeWrap.style.display).not.toBe('none');
      expect(singleInput.style.display).toBe('none');

      // Switch to Single Date mode
      picker.mode = AcEnumDateTimePickerMode.Date;
      expect(rangeWrap.style.display).toBe('none');
      expect(singleInput.style.display).not.toBe('none');

      // Set value in Single Date mode
      picker.setValue('2026-07-20');
      expect(singleInput.value).toBe('20-07-2026');
      expect(picker.getValue()).toBe('2026-07-20');

      // Switch back to DateRange mode
      picker.mode = AcEnumDateTimePickerMode.DateRange;
      expect(rangeWrap.style.display).not.toBe('none');
      expect(singleInput.style.display).toBe('none');

      document.body.removeChild(picker);
    });

    it('updates start and end inputs when typing independently in range mode', () => {
      const picker = new AcDateTimePickerElement();
      document.body.appendChild(picker);

      const startInput = picker.querySelector('.ac-dtp-input-start') as HTMLInputElement;
      const endInput = picker.querySelector('.ac-dtp-input-end') as HTMLInputElement;

      // Type in start input
      startInput.value = '15-08-2026';
      startInput.dispatchEvent(new Event('input'));
      expect((picker as any)._state.startDate).not.toBeNull();
      expect((picker as any)._state.startDate.getDate()).toBe(15);
      expect((picker as any)._state.startDate.getMonth()).toBe(7); // Aug

      // Type in end input
      endInput.value = '25-08-2026';
      endInput.dispatchEvent(new Event('input'));
      expect((picker as any)._state.endDate).not.toBeNull();
      expect((picker as any)._state.endDate.getDate()).toBe(25);
      expect((picker as any)._state.endDate.getMonth()).toBe(7); // Aug

      // Commit via Enter on end input
      endInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      const val = picker.getValue() as { start: string; end: string };
      expect(val.start).toBe('2026-08-15');
      expect(val.end).toBe('2026-08-25');

      document.body.removeChild(picker);
    });

    it('clears both start and end inputs on clear() in range mode', () => {
      const picker = new AcDateTimePickerElement();
      document.body.appendChild(picker);
      picker.setValue({ start: '2026-05-01', end: '2026-05-15' });

      const startInput = picker.querySelector('.ac-dtp-input-start') as HTMLInputElement;
      const endInput = picker.querySelector('.ac-dtp-input-end') as HTMLInputElement;

      expect(startInput.value).toBe('01-05-2026');
      expect(endInput.value).toBe('15-05-2026');

      picker.clear();

      expect(startInput.value).toBe('');
      expect(endInput.value).toBe('');
      expect(picker.getValue()).toBeNull();

      document.body.removeChild(picker);
    });

    it('does not toggle popup when switching or clicking between From and To inputs', () => {
      const picker = new AcDateTimePickerElement();
      document.body.appendChild(picker);

      const startInput = picker.querySelector('.ac-dtp-input-start') as HTMLInputElement;
      const endInput = picker.querySelector('.ac-dtp-input-end') as HTMLInputElement;
      const icon = picker.querySelector('.ac-dtp-icon') as HTMLElement;

      expect((picker as any)._isOpen).toBe(false);

      // 1. Click start input opens popup
      startInput.click();
      expect((picker as any)._isOpen).toBe(true);

      // 2. Click end input while open keeps popup open (does NOT close or toggle)
      endInput.click();
      expect((picker as any)._isOpen).toBe(true);

      // 3. Click start input again while open keeps popup open
      startInput.click();
      expect((picker as any)._isOpen).toBe(true);

      // 4. Multiple switches back and forth maintain open state
      endInput.click();
      expect((picker as any)._isOpen).toBe(true);
      startInput.click();
      expect((picker as any)._isOpen).toBe(true);

      // 5. Calendar icon toggles popup
      icon.click();
      expect((picker as any)._isOpen).toBe(false);

      icon.click();
      expect((picker as any)._isOpen).toBe(true);

      picker.close();
      document.body.removeChild(picker);
    });

    it('hides date in popup header in single date mode, but shows in range mode', () => {
      const picker = new AcDateTimePickerElement();
      document.body.appendChild(picker);

      const headerInfo = (picker as any)._headerInfo as HTMLElement;
      const headerEl = (picker as any)._headerEl as HTMLElement;

      // In DateRange mode, header info is visible
      expect(headerInfo.style.display).not.toBe('none');

      // Switch to Single Date mode
      picker.mode = AcEnumDateTimePickerMode.Date;
      expect(headerInfo.style.display).toBe('none');
      expect(headerEl.style.display).toBe('none');

      // Switch back to DateRange mode
      picker.mode = AcEnumDateTimePickerMode.DateRange;
      expect(headerInfo.style.display).not.toBe('none');
      expect(headerEl.style.display).not.toBe('none');

      document.body.removeChild(picker);
    });

    it('hides footer (apply, cancel, clear) in single date mode and auto-commits on day selection', () => {
      const picker = new AcDateTimePickerElement();
      document.body.appendChild(picker);

      const footerEl = (picker as any)._footerEl as HTMLElement;

      // In DateRange mode, footer is visible
      expect(footerEl.style.display).not.toBe('none');

      // Switch to Single Date mode
      picker.mode = AcEnumDateTimePickerMode.Date;
      expect(footerEl.style.display).toBe('none');

      // Open popup and click a day button
      picker.open();
      expect((picker as any)._isOpen).toBe(true);

      const dayBtn = (picker as any)._calLeftContainer.querySelector('.ac-dtp-cell:not(.ac-dtp-cell-other-month)') as HTMLButtonElement;
      expect(dayBtn).not.toBeNull();
      dayBtn.click();

      // In single date mode, selecting a day should auto-apply and close popup
      expect((picker as any)._isOpen).toBe(false);
      expect(picker.getValue()).not.toBeNull();

      // Switch back to DateRange mode -> footer visible again
      picker.mode = AcEnumDateTimePickerMode.DateRange;
      expect(footerEl.style.display).not.toBe('none');

      document.body.removeChild(picker);
    });
  });

  describe('CSS Class Naming Standardization (Single Hyphen)', () => {
    it('uses single hyphens for all generated DOM elements and no double hyphens or underscores', () => {
      const picker = new AcDateTimePickerElement();
      document.body.appendChild(picker);
      picker.open();

      // Check all elements in picker and popup
      const allElements = [
        ...Array.from(picker.querySelectorAll('*')),
        ...Array.from((picker as any)._popup.querySelectorAll('*')),
        picker,
        (picker as any)._popup,
      ];

      for (const el of allElements) {
        const classList = Array.from(el.classList);
        for (const cls of classList) {
          if (cls.startsWith('ac-dtp')) {
            expect(cls).not.toContain('__');
            expect(cls).not.toContain('--');
          }
        }
      }

      picker.close();
      document.body.removeChild(picker);
    });
  });
});
