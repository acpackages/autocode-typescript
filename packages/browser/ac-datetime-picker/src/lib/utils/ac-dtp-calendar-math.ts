/**
 * Date math and calendar grid utilities for custom zero-dependency calendar.
 */

export interface IAcDtpCalendarCell {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPrevMonth: boolean;
  isNextMonth: boolean;
  isoString: string;
}

export const AC_DTP_MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AC_DTP_MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const AC_DTP_WEEKDAY_NAMES_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const AC_DTP_WEEKDAY_NAMES_SUN_FIRST = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Returns number of days in a given month (1-based month or 0-based month). */
export function acDtpGetDaysInMonth(year: number, monthZeroBased: number): number {
  return new Date(year, monthZeroBased + 1, 0).getDate();
}

/** Check if two dates represent the exact same calendar day (ignoring time). */
export function acDtpIsSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Check if date A is strictly before date B by calendar day. */
export function acDtpIsBeforeDay(a: Date, b: Date): boolean {
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return d1 < d2;
}

/** Check if date A is strictly after date B by calendar day. */
export function acDtpIsAfterDay(a: Date, b: Date): boolean {
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return d1 > d2;
}

/** Check if target date is between start and end dates (inclusive). */
export function acDtpIsBetweenDays(target: Date, start: Date, end: Date): boolean {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const min = Math.min(s, e);
  const max = Math.max(s, e);
  return t >= min && t <= max;
}

/** Check if a date is today in local time. */
export function acDtpIsToday(date: Date): boolean {
  const now = new Date();
  return acDtpIsSameDay(date, now);
}

/** Check if a date is disabled given min, max, disabledDates, and disabledDaysOfWeek. */
export function acDtpIsDateDisabled(
  date: Date,
  minDate?: Date | null,
  maxDate?: Date | null,
  disabledDates?: (Date | string)[],
  disabledDaysOfWeek?: number[]
): boolean {
  if (minDate && acDtpIsBeforeDay(date, minDate)) {
    return true;
  }
  if (maxDate && acDtpIsAfterDay(date, maxDate)) {
    return true;
  }
  if (disabledDaysOfWeek && disabledDaysOfWeek.includes(date.getDay())) {
    return true;
  }
  if (disabledDates && disabledDates.length > 0) {
    for (const d of disabledDates) {
      const checkDate = d instanceof Date ? d : new Date(d);
      if (!isNaN(checkDate.getTime()) && acDtpIsSameDay(date, checkDate)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Generates 42 calendar cells (6 rows x 7 days) for a given year and month.
 * Automatically prepends tail days of previous month and appends head days of next month.
 * @param year Full year (e.g. 2026)
 * @param monthZeroBased 0-11
 * @param startOnMonday true = Monday first, false = Sunday first
 */
export function acDtpBuildMonthMatrix(
  year: number,
  monthZeroBased: number,
  startOnMonday: boolean = true
): IAcDtpCalendarCell[] {
  const cells: IAcDtpCalendarCell[] = [];
  const daysInCurrentMonth = acDtpGetDaysInMonth(year, monthZeroBased);

  // Determine weekday of the 1st day
  const firstDay = new Date(year, monthZeroBased, 1).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Number of leading days from previous month
  const leadingDaysCount = startOnMonday
    ? (firstDay === 0 ? 6 : firstDay - 1)
    : firstDay;

  // Previous month details
  const prevMonthYear = monthZeroBased === 0 ? year - 1 : year;
  const prevMonth = monthZeroBased === 0 ? 11 : monthZeroBased - 1;
  const daysInPrevMonth = acDtpGetDaysInMonth(prevMonthYear, prevMonth);

  // 1. Leading days from previous month
  for (let i = leadingDaysCount - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(prevMonthYear, prevMonth, day);
    cells.push({
      date: d,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: acDtpIsToday(d),
      isPrevMonth: true,
      isNextMonth: false,
      isoString: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  // 2. Days of current month
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const d = new Date(year, monthZeroBased, day);
    cells.push({
      date: d,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: acDtpIsToday(d),
      isPrevMonth: false,
      isNextMonth: false,
      isoString: `${year}-${String(monthZeroBased + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  // 3. Trailing days from next month (fill up to 42 cells)
  const nextMonthYear = monthZeroBased === 11 ? year + 1 : year;
  const nextMonth = monthZeroBased === 11 ? 0 : monthZeroBased + 1;
  const trailingDaysCount = 42 - cells.length;

  for (let day = 1; day <= trailingDaysCount; day++) {
    const d = new Date(nextMonthYear, nextMonth, day);
    cells.push({
      date: d,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: acDtpIsToday(d),
      isPrevMonth: false,
      isNextMonth: true,
      isoString: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  return cells;
}

/** Clone a date object safely. */
export function acDtpCloneDate(d: Date | null): Date | null {
  return d ? new Date(d.getTime()) : null;
}
