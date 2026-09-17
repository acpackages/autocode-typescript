import { describe, it, expect } from 'vitest';
import {
  acDtpParseAnyDate,
  acDtpParseRange,
  acDtpToIsoString,
  acDtpFormatDisplay,
} from '../src/lib/utils/ac-dtp-flexible-parser.utils';
import {
  acDtpBuildMonthMatrix,
  acDtpGetDaysInMonth,
  acDtpIsSameDay,
  acDtpIsBetweenDays,
  acDtpIsDateDisabled,
} from '../src/lib/utils/ac-dtp-calendar-math';
import { AcEnumDateTimePickerOutputType } from '../src/lib/enums/ac-enum-datetime-picker-output-type.enum';

describe('acDtpFlexibleParser', () => {
  describe('Single Date Parsing', () => {
    it('parses standard ISO date strings', () => {
      const d = acDtpParseAnyDate('2026-05-15');
      expect(d).not.toBeNull();
      expect(d!.getFullYear()).toBe(2026);
      expect(d!.getMonth()).toBe(4); // 0-based May
      expect(d!.getDate()).toBe(15);
    });

    it('parses numeric delimited dates (DD-MM-YYYY, DD/MM/YYYY)', () => {
      const d1 = acDtpParseAnyDate('15-05-2026');
      expect(d1).not.toBeNull();
      expect(d1!.getDate()).toBe(15);
      expect(d1!.getMonth()).toBe(4);
      expect(d1!.getFullYear()).toBe(2026);

      const d2 = acDtpParseAnyDate('15/05/2026');
      expect(d2).not.toBeNull();
      expect(d2!.getDate()).toBe(15);

      const d3 = acDtpParseAnyDate('1-5-2026');
      expect(d3).not.toBeNull();
      expect(d3!.getDate()).toBe(1);
      expect(d3!.getMonth()).toBe(4);
    });

    it('disambiguates MM/DD/YYYY when day > 12', () => {
      const d = acDtpParseAnyDate('05/25/2026');
      expect(d).not.toBeNull();
      expect(d!.getMonth()).toBe(4); // May
      expect(d!.getDate()).toBe(25);
    });

    it('parses textual month names', () => {
      const d1 = acDtpParseAnyDate('15 Jan 2026');
      expect(d1).not.toBeNull();
      expect(d1!.getMonth()).toBe(0);
      expect(d1!.getDate()).toBe(15);

      const d2 = acDtpParseAnyDate('January 15 2026');
      expect(d2).not.toBeNull();
      expect(d2!.getMonth()).toBe(0);
      expect(d2!.getDate()).toBe(15);

      const d3 = acDtpParseAnyDate('15th Oct 2026');
      expect(d3).not.toBeNull();
      expect(d3!.getMonth()).toBe(9); // Oct
      expect(d3!.getDate()).toBe(15);
    });

    it('parses relative terms', () => {
      const now = new Date();

      const today = acDtpParseAnyDate('today');
      expect(today).not.toBeNull();
      expect(acDtpIsSameDay(today, now)).toBe(true);

      const yesterday = acDtpParseAnyDate('yesterday');
      expect(yesterday).not.toBeNull();
      const expectedYesterday = new Date(now);
      expectedYesterday.setDate(now.getDate() - 1);
      expect(acDtpIsSameDay(yesterday, expectedYesterday)).toBe(true);

      const nextWeek = acDtpParseAnyDate('+7d');
      expect(nextWeek).not.toBeNull();
      const expectedNextWeek = new Date(now);
      expectedNextWeek.setDate(now.getDate() + 7);
      expect(acDtpIsSameDay(nextWeek, expectedNextWeek)).toBe(true);
    });

    it('parses dates with 24h and 12h times', () => {
      const d24 = acDtpParseAnyDate('2026-05-15 14:30');
      expect(d24).not.toBeNull();
      expect(d24!.getHours()).toBe(14);
      expect(d24!.getMinutes()).toBe(30);

      const d12 = acDtpParseAnyDate('15 May 2026 02:30 PM');
      expect(d12).not.toBeNull();
      expect(d12!.getHours()).toBe(14);
      expect(d12!.getMinutes()).toBe(30);

      const dAm = acDtpParseAnyDate('2026-05-15 09:15 AM');
      expect(dAm).not.toBeNull();
      expect(dAm!.getHours()).toBe(9);
      expect(dAm!.getMinutes()).toBe(15);
    });

    it('rejects invalid dates and boundary overflows', () => {
      expect(acDtpParseAnyDate('31-02-2026')).toBeNull(); // Feb 31 does not exist
      expect(acDtpParseAnyDate('random-string')).toBeNull();
      expect(acDtpParseAnyDate('')).toBeNull();
    });
  });

  describe('Range Parsing', () => {
    it('splits and parses ranges by "to"', () => {
      const r = acDtpParseRange('2026-05-01 to 2026-05-15');
      expect(r.isValid).toBe(true);
      expect(r.isComplete).toBe(true);
      expect(r.start!.getDate()).toBe(1);
      expect(r.end!.getDate()).toBe(15);
    });

    it('splits and parses ranges by "-" and "–"', () => {
      const r1 = acDtpParseRange('01/05/2026 - 15/05/2026');
      expect(r1.isComplete).toBe(true);
      expect(r1.start!.getDate()).toBe(1);
      expect(r1.end!.getDate()).toBe(15);

      const r2 = acDtpParseRange('15 Jan 2026 – 20 Jan 2026');
      expect(r2.isComplete).toBe(true);
      expect(r2.start!.getDate()).toBe(15);
      expect(r2.end!.getDate()).toBe(20);
    });

    it('handles partial range entry gracefully', () => {
      const r = acDtpParseRange('2026-05-01 to');
      expect(r.isValid).toBe(true);
      expect(r.isComplete).toBe(false);
      expect(r.start).not.toBeNull();
      expect(r.end).toBeNull();
    });
  });

  describe('ISO Output Formatting', () => {
    it('formats date-only without time', () => {
      const d = new Date(2026, 4, 15, 10, 30, 0);
      const iso = acDtpToIsoString(d, AcEnumDateTimePickerOutputType.Utc, false);
      expect(iso).toBe('2026-05-15');
    });

    it('formats local datetime', () => {
      const d = new Date(2026, 4, 15, 14, 30, 0);
      const iso = acDtpToIsoString(d, AcEnumDateTimePickerOutputType.Local, true);
      expect(iso).toBe('2026-05-15T14:30:00');
    });

    it('formats UTC datetime', () => {
      const d = new Date(Date.UTC(2026, 4, 15, 14, 30, 0));
      const iso = acDtpToIsoString(d, AcEnumDateTimePickerOutputType.Utc, true);
      expect(iso).toBe('2026-05-15T14:30:00Z');
    });
  });

  describe('Display Formatting', () => {
    it('formats date according to DD-MM-YYYY token pattern', () => {
      const d = new Date(2026, 4, 5, 14, 30, 0);
      expect(acDtpFormatDisplay(d, 'DD-MM-YYYY')).toBe('05-05-2026');
      expect(acDtpFormatDisplay(d, 'D MMMM YYYY')).toBe('5 May 2026');
      expect(acDtpFormatDisplay(d, 'DD MMM YYYY hh:mm AA')).toBe('05 May 2026 02:30 PM');
    });
  });

  describe('Calendar Math', () => {
    it('computes days in month accurately including leap years', () => {
      expect(acDtpGetDaysInMonth(2024, 1)).toBe(29); // 2024 is leap
      expect(acDtpGetDaysInMonth(2026, 1)).toBe(28); // 2026 is non-leap
      expect(acDtpGetDaysInMonth(2026, 0)).toBe(31); // Jan
      expect(acDtpGetDaysInMonth(2026, 3)).toBe(30); // Apr
    });

    it('builds a complete 42-cell matrix with proper padding', () => {
      const cells = acDtpBuildMonthMatrix(2026, 4, true); // May 2026
      expect(cells.length).toBe(42);

      // May 2026 starts on a Friday (5th day of week).
      // With Monday as first day (0=Mo, ..., 4=Fr), leading days should be 4 (April 27, 28, 29, 30).
      expect(cells[0].isPrevMonth).toBe(true);
      expect(cells[0].dayNumber).toBe(27);

      // Day 1 of current month
      expect(cells[4].isCurrentMonth).toBe(true);
      expect(cells[4].dayNumber).toBe(1);

      // Total days in May is 31
      const mayDays = cells.filter(c => c.isCurrentMonth);
      expect(mayDays.length).toBe(31);

      // Trailing days from June
      const juneDays = cells.filter(c => c.isNextMonth);
      expect(juneDays.length).toBe(42 - 4 - 31); // 7 trailing days
      expect(juneDays[0].dayNumber).toBe(1);
    });

    it('checks range inclusion with acDtpIsBetweenDays', () => {
      const start = new Date(2026, 4, 10);
      const end = new Date(2026, 4, 20);

      expect(acDtpIsBetweenDays(new Date(2026, 4, 15), start, end)).toBe(true);
      expect(acDtpIsBetweenDays(new Date(2026, 4, 10), start, end)).toBe(true);
      expect(acDtpIsBetweenDays(new Date(2026, 4, 20), start, end)).toBe(true);
      expect(acDtpIsBetweenDays(new Date(2026, 4, 9), start, end)).toBe(false);
      expect(acDtpIsBetweenDays(new Date(2026, 4, 21), start, end)).toBe(false);
    });

    it('detects disabled dates via min, max, and day of week', () => {
      const min = new Date(2026, 4, 5);
      const max = new Date(2026, 4, 25);

      expect(acDtpIsDateDisabled(new Date(2026, 4, 4), min, max)).toBe(true);
      expect(acDtpIsDateDisabled(new Date(2026, 4, 10), min, max)).toBe(false);
      expect(acDtpIsDateDisabled(new Date(2026, 4, 26), min, max)).toBe(true);

      // Weekend disabled (0 = Sun, 6 = Sat)
      const sunday = new Date(2026, 4, 10); // May 10, 2026 is Sunday
      expect(acDtpIsDateDisabled(sunday, undefined, undefined, undefined, [0, 6])).toBe(true);
    });
  });
});
