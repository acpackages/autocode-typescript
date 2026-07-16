import { IAcDateTimePickerPreset } from '../interfaces/ac-datetime-picker-preset.interface';
import {
  acDtpAddDays,
  acDtpAddMonths,
  acDtpAddYears,
  acDtpEndOfDay,
  acDtpEndOfMonth,
  acDtpEndOfQuarter,
  acDtpEndOfWeek,
  acDtpEndOfYear,
  acDtpStartOfDay,
  acDtpStartOfMonth,
  acDtpStartOfQuarter,
  acDtpStartOfWeek,
  acDtpStartOfYear,
} from './ac-datetime-picker-date.utils';

/** Returns the built-in sidebar preset list. */
export function acDtpGetDefaultPresets(): IAcDateTimePickerPreset[] {
  const today = () => new Date();

  return [
    {
      label: 'Today',
      getValue: () => ({ start: acDtpStartOfDay(today()), end: acDtpEndOfDay(today()) }),
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const d = acDtpAddDays(today(), -1);
        return { start: acDtpStartOfDay(d), end: acDtpEndOfDay(d) };
      },
    },
    {
      label: 'Tomorrow',
      getValue: () => {
        const d = acDtpAddDays(today(), 1);
        return { start: acDtpStartOfDay(d), end: acDtpEndOfDay(d) };
      },
    },
    {
      label: 'Last 7 Days',
      getValue: () => ({
        start: acDtpStartOfDay(acDtpAddDays(today(), -6)),
        end: acDtpEndOfDay(today()),
      }),
    },
    {
      label: 'Last 14 Days',
      getValue: () => ({
        start: acDtpStartOfDay(acDtpAddDays(today(), -13)),
        end: acDtpEndOfDay(today()),
      }),
    },
    {
      label: 'Last 30 Days',
      getValue: () => ({
        start: acDtpStartOfDay(acDtpAddDays(today(), -29)),
        end: acDtpEndOfDay(today()),
      }),
    },
    {
      label: 'Last 90 Days',
      getValue: () => ({
        start: acDtpStartOfDay(acDtpAddDays(today(), -89)),
        end: acDtpEndOfDay(today()),
      }),
    },
    {
      label: 'This Week',
      getValue: () => ({
        start: acDtpStartOfWeek(today()),
        end: acDtpEndOfWeek(today()),
      }),
    },
    {
      label: 'Last Week',
      getValue: () => {
        const lastWeek = acDtpAddDays(today(), -7);
        return { start: acDtpStartOfWeek(lastWeek), end: acDtpEndOfWeek(lastWeek) };
      },
    },
    {
      label: 'Next Week',
      getValue: () => {
        const nextWeek = acDtpAddDays(today(), 7);
        return { start: acDtpStartOfWeek(nextWeek), end: acDtpEndOfWeek(nextWeek) };
      },
    },
    {
      label: 'This Month',
      getValue: () => ({
        start: acDtpStartOfMonth(today()),
        end: acDtpEndOfMonth(today()),
      }),
    },
    {
      label: 'Last Month',
      getValue: () => {
        const d = acDtpAddMonths(today(), -1);
        return { start: acDtpStartOfMonth(d), end: acDtpEndOfMonth(d) };
      },
    },
    {
      label: 'Next Month',
      getValue: () => {
        const d = acDtpAddMonths(today(), 1);
        return { start: acDtpStartOfMonth(d), end: acDtpEndOfMonth(d) };
      },
    },
    {
      label: 'This Quarter',
      getValue: () => ({
        start: acDtpStartOfQuarter(today()),
        end: acDtpEndOfQuarter(today()),
      }),
    },
    {
      label: 'Last Quarter',
      getValue: () => {
        const d = acDtpAddMonths(today(), -3);
        return { start: acDtpStartOfQuarter(d), end: acDtpEndOfQuarter(d) };
      },
    },
    {
      label: 'Next Quarter',
      getValue: () => {
        const d = acDtpAddMonths(today(), 3);
        return { start: acDtpStartOfQuarter(d), end: acDtpEndOfQuarter(d) };
      },
    },
    {
      label: 'Month To Date',
      getValue: () => ({
        start: acDtpStartOfMonth(today()),
        end: acDtpEndOfDay(today()),
      }),
    },
    {
      label: 'Quarter To Date',
      getValue: () => ({
        start: acDtpStartOfQuarter(today()),
        end: acDtpEndOfDay(today()),
      }),
    },
    {
      label: 'Year To Date',
      getValue: () => ({
        start: acDtpStartOfYear(today()),
        end: acDtpEndOfDay(today()),
      }),
    },
  ];
}
