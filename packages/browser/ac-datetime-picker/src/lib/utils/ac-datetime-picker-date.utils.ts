import { AcEnumDateTimePickerMode } from '../enums/ac-enum-datetime-picker-mode.enum';

/** Returns true for all modes that select a range (start + end). */
export function acDtpIsRangeMode(mode: AcEnumDateTimePickerMode): boolean {
  return (
    mode === AcEnumDateTimePickerMode.DateRange ||
    mode === AcEnumDateTimePickerMode.DateTimeRange ||
    mode === AcEnumDateTimePickerMode.MonthRange ||
    mode === AcEnumDateTimePickerMode.YearRange
  );
}

/** Returns true for modes that include a time component. */
export function acDtpHasTime(mode: AcEnumDateTimePickerMode): boolean {
  return (
    mode === AcEnumDateTimePickerMode.DateTime ||
    mode === AcEnumDateTimePickerMode.DateTimeRange
  );
}

/** Returns the Air Datepicker view string for a given mode. */
export function acDtpGetView(mode: AcEnumDateTimePickerMode): 'days' | 'months' | 'years' {
  if (mode === AcEnumDateTimePickerMode.Month || mode === AcEnumDateTimePickerMode.MonthRange) {
    return 'months';
  }
  if (mode === AcEnumDateTimePickerMode.Year || mode === AcEnumDateTimePickerMode.YearRange) {
    return 'years';
  }
  return 'days';
}

export function acDtpStartOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function acDtpEndOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function acDtpStartOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  return acDtpStartOfDay(acDtpAddDays(d, diff));
}

export function acDtpEndOfWeek(d: Date): Date {
  return acDtpEndOfDay(acDtpAddDays(acDtpStartOfWeek(d), 6));
}

export function acDtpStartOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function acDtpEndOfMonth(d: Date): Date {
  return acDtpEndOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function acDtpStartOfQuarter(d: Date): Date {
  const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), quarterStartMonth, 1);
}

export function acDtpEndOfQuarter(d: Date): Date {
  return acDtpEndOfMonth(new Date(d.getFullYear(), acDtpStartOfQuarter(d).getMonth() + 2, 1));
}

export function acDtpStartOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function acDtpEndOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function acDtpAddDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function acDtpAddMonths(d: Date, n: number): Date {
  const result = new Date(d);
  result.setMonth(result.getMonth() + n);
  return result;
}

export function acDtpAddYears(d: Date, n: number): Date {
  const result = new Date(d);
  result.setFullYear(result.getFullYear() + n);
  return result;
}
