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
  });
});
