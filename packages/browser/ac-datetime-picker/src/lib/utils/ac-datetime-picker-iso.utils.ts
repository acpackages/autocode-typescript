import { AcEnumDateTimePickerOutputType } from '../enums/ac-enum-datetime-picker-output-type.enum';

/**
 * Parse any ISO 8601 string into a local JS Date.
 * Handles: date-only, local datetime, UTC (Z), and offset (+05:30).
 */
export function acDtpParseIso(iso: string): Date {
  if (!iso) return new Date(NaN);
  // Date-only "2026-07-15" — treat as local midnight to avoid UTC midnight shifting the day
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
}

/**
 * Returns the local UTC offset string e.g. "+05:30" or "-04:00".
 */
export function acDtpGetLocalOffset(): string {
  const totalMinutes = -new Date().getTimezoneOffset();
  const sign = totalMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(totalMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
}

/**
 * Pad a number to 2 digits.
 */
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Format a local Date as YYYY-MM-DDTHH:mm:ss (no timezone suffix).
 */
function toLocalIsoString(d: Date): string {
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const h = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  const s = pad2(d.getSeconds());
  return `${y}-${mo}-${day}T${h}:${min}:${s}`;
}

/**
 * Format a local Date as YYYY-MM-DD (date-only, no time).
 */
function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${mo}-${day}`;
}

/**
 * Convert a local Date to an ISO 8601 string based on outputType.
 *
 * outputType: 'utc'    → "2026-07-15T10:30:00"        (UTC, no Z)
 * outputType: 'local'  → "2026-07-15T15:30:00"        (local)
 * outputType: 'offset' → "2026-07-15T15:30:00+05:30"  (local + offset)
 *
 * For date-only modes (month, year, date) pass includeTime = false.
 */
export function acDtpToIso(
  d: Date,
  outputType: AcEnumDateTimePickerOutputType,
  includeTime: boolean = true
): string {
  if (!d || isNaN(d.getTime())) return '';

  if (!includeTime) {
    // Date-only: always return YYYY-MM-DD in local terms
    return toLocalDateString(d);
  }

  if (outputType === AcEnumDateTimePickerOutputType.Local) {
    return toLocalIsoString(d);
  }

  if (outputType === AcEnumDateTimePickerOutputType.Offset) {
    const offset = acDtpGetLocalOffset();
    return `${toLocalIsoString(d)}${offset}`;
  }

  // UTC — convert local date to UTC values, no Z suffix per spec
  const utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  const y = utc.getUTCFullYear();
  const mo = pad2(utc.getUTCMonth() + 1);
  const day = pad2(utc.getUTCDate());
  const h = pad2(utc.getUTCHours());
  const min = pad2(utc.getUTCMinutes());
  const s = pad2(utc.getUTCSeconds());
  return `${y}-${mo}-${day}T${h}:${min}:${s}`;
}

/**
 * Format a Date for display inside the trigger input.
 * Uses a simple token-based formatter compatible with Air Datepicker format strings.
 */
export function acDtpFormatDisplay(d: Date, format: string): string {
  if (!d || isNaN(d.getTime())) return '';

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonths = months.map(m => m.slice(0, 3));

  const y = d.getFullYear();
  const mo = d.getMonth();
  const day = d.getDate();
  const h24 = d.getHours();
  const h12 = h24 % 12 || 12;
  const min = d.getMinutes();
  const sec = d.getSeconds();
  const ampm = h24 < 12 ? 'AM' : 'PM';

  return format
    .replace('MMMM', months[mo])
    .replace('MMM', shortMonths[mo])
    .replace('MM', pad2(mo + 1))
    .replace('M', String(mo + 1))
    .replace('DD', pad2(day))
    .replace('D', String(day))
    .replace('YYYY', String(y))
    .replace('YY', String(y).slice(-2))
    .replace('HH', pad2(h24))
    .replace('hh', pad2(h12))
    .replace('mm', pad2(min))
    .replace('ss', pad2(sec))
    .replace('AA', ampm)
    .replace('aa', ampm.toLowerCase());
}

/**
 * Parse a display-formatted date string back to a Date.
 * Handles strings produced by acDtpFormatDisplay: "15 Jul 2026", "15 Jul 2026 02:30 PM", etc.
 * Returns an invalid Date (isNaN) if the string cannot be parsed.
 */
export function acDtpParseDisplay(text: string, format: string = 'DD-MM-YYYY'): Date {
  if (!text) return new Date(NaN);
  const trimmed = text.trim();

  // If format is a numeric date format (has MM but not MMM/MMMM), parse it explicitly
  // to avoid native Date parser interpreting DD-MM-YYYY as MM-DD-YYYY.
  const formatUpper = format.toUpperCase();
  const isNumericMonth = formatUpper.includes('MM') && !formatUpper.includes('MMM');

  if (isNumericMonth) {
    const yearIdx = formatUpper.indexOf('YYYY');
    const monthIdx = formatUpper.indexOf('MM');
    const dayIdx = formatUpper.indexOf('DD');

    if (yearIdx !== -1 && monthIdx !== -1 && dayIdx !== -1) {
      const yStr = trimmed.substring(yearIdx, yearIdx + 4);
      const mStr = trimmed.substring(monthIdx, monthIdx + 2);
      const dStr = trimmed.substring(dayIdx, dayIdx + 2);

      const year = parseInt(yStr, 10);
      const month = parseInt(mStr, 10) - 1; // 0-based
      const day = parseInt(dStr, 10);

      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        let hour = 0;
        let minute = 0;
        let second = 0;

        const hhIdx = formatUpper.indexOf('HH');
        const hh12Idx = format.indexOf('hh');
        const minIdx = format.indexOf('mm');
        const secIdx = format.indexOf('ss');

        if (hhIdx !== -1) {
          hour = parseInt(trimmed.substring(hhIdx, hhIdx + 2), 10) || 0;
        } else if (hh12Idx !== -1) {
          hour = parseInt(trimmed.substring(hh12Idx, hh12Idx + 2), 10) || 0;
          const ampmIdx = formatUpper.indexOf('AA');
          if (ampmIdx !== -1) {
            const ampm = trimmed.substring(ampmIdx, ampmIdx + 2).toUpperCase();
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
          }
        }

        if (minIdx !== -1) {
          minute = parseInt(trimmed.substring(minIdx, minIdx + 2), 10) || 0;
        }
        if (secIdx !== -1) {
          second = parseInt(trimmed.substring(secIdx, secIdx + 2), 10) || 0;
        }

        return new Date(year, month, day, hour, minute, second);
      }
    }
  }

  // Fast path — browser's Date constructor handles most display formats
  const native = new Date(trimmed);
  if (!isNaN(native.getTime())) return native;

  // Manual fallback for "DD MMM YYYY [HH:mm] [AM|PM]" patterns
  const MONTHS: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };

  const m = trimmed.match(
    /^(\d{1,2})\s+([a-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?(?:\s+(am|pm))?$/i
  );
  if (m) {
    const day = parseInt(m[1], 10);
    const mon = MONTHS[m[2].toLowerCase()];
    const year = parseInt(m[3], 10);
    let hour = m[4] ? parseInt(m[4], 10) : 0;
    const minute = m[5] ? parseInt(m[5], 10) : 0;
    const second = m[6] ? parseInt(m[6], 10) : 0;
    if (mon !== undefined) {
      if (m[7]) {
        const isPm = m[7].toLowerCase() === 'pm';
        if (isPm && hour < 12) hour += 12;
        if (!isPm && hour === 12) hour = 0;
      }
      return new Date(year, mon, day, hour, minute, second);
    }
  }

  return new Date(NaN);
}
