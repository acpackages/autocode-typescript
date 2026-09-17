import { AcEnumDateTimePickerOutputType } from '../enums/ac-enum-datetime-picker-output-type.enum';
import {
  AC_DTP_MONTH_NAMES_LONG,
  AC_DTP_MONTH_NAMES_SHORT,
} from './ac-dtp-calendar-math';

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Returns the local timezone offset in format "+05:30" or "-04:00".
 */
export function acDtpGetTimezoneOffsetString(d: Date = new Date()): string {
  const totalMinutes = -d.getTimezoneOffset();
  const sign = totalMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(totalMinutes);
  const hh = pad2(Math.floor(abs / 60));
  const mm = pad2(abs % 60);
  return `${sign}${hh}:${mm}`;
}

/**
 * Format a Date to standard ISO 8601 string.
 */
export function acDtpToIsoString(
  d: Date | null,
  outputType: AcEnumDateTimePickerOutputType = AcEnumDateTimePickerOutputType.Utc,
  includeTime: boolean = false
): string {
  if (!d || isNaN(d.getTime())) return '';

  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());

  if (!includeTime) {
    return `${y}-${m}-${day}`;
  }

  const h = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  const s = pad2(d.getSeconds());

  if (outputType === AcEnumDateTimePickerOutputType.Local) {
    return `${y}-${m}-${day}T${h}:${min}:${s}`;
  }

  if (outputType === AcEnumDateTimePickerOutputType.Offset) {
    return `${y}-${m}-${day}T${h}:${min}:${s}${acDtpGetTimezoneOffsetString(d)}`;
  }

  // UTC
  const utcYear = d.getUTCFullYear();
  const utcMonth = pad2(d.getUTCMonth() + 1);
  const utcDay = pad2(d.getUTCDate());
  const utcH = pad2(d.getUTCHours());
  const utcMin = pad2(d.getUTCMinutes());
  const utcS = pad2(d.getUTCSeconds());
  return `${utcYear}-${utcMonth}-${utcDay}T${utcH}:${utcMin}:${utcS}Z`;
}

/**
 * Format a Date for human-readable display in the trigger input.
 */
export function acDtpFormatDisplay(d: Date | null, format: string = 'DD-MM-YYYY'): string {
  if (!d || isNaN(d.getTime())) return '';

  const y = d.getFullYear();
  const mo = d.getMonth();
  const day = d.getDate();
  const h24 = d.getHours();
  const h12 = h24 % 12 || 12;
  const min = d.getMinutes();
  const sec = d.getSeconds();
  const ampm = h24 < 12 ? 'AM' : 'PM';

  return format
    .replace(/\bYYYY\b/g, String(y))
    .replace(/\bYY\b/g, String(y).slice(-2))
    .replace(/\bMMMM\b/g, AC_DTP_MONTH_NAMES_LONG[mo])
    .replace(/\bMMM\b/g, AC_DTP_MONTH_NAMES_SHORT[mo])
    .replace(/\bMM\b/g, pad2(mo + 1))
    .replace(/\bM\b/g, String(mo + 1))
    .replace(/\bDD\b/g, pad2(day))
    .replace(/\bD\b/g, String(day))
    .replace(/\bHH\b/g, pad2(h24))
    .replace(/\bhh\b/g, pad2(h12))
    .replace(/\bmm\b/g, pad2(min))
    .replace(/\bss\b/g, pad2(sec))
    .replace(/\bAA\b/g, ampm)
    .replace(/\baa\b/g, ampm.toLowerCase());
}

/**
 * Parses time part from a string: e.g. "14:30", "2:30 PM", "02:30:45 am"
 */
function extractTime(timeStr: string): { hours: number; minutes: number; seconds: number } | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const ampm = match[4]?.toLowerCase();

  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;

  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
    return { hours, minutes, seconds };
  }
  return null;
}

/**
 * Universal date parser that accepts ANY common date format:
 * - ISO 8601 ("2026-05-15", "2026-05-15T14:30:00Z")
 * - Numeric delimited ("15-05-2026", "15/05/2026", "05/15/2026", "2026/05/15", "1-5-2026")
 * - Textual month names ("15 Jan 2026", "Jan 15 2026", "15th January 2026")
 * - Relative shortcuts ("today", "yesterday", "tomorrow", "now", "+7d", "-30d", "+1m")
 * - Optional time strings ("... 14:30", "... 2:30 PM")
 */
export function acDtpParseAnyDate(input: string, formatHint?: string): Date | null {
  if (!input || typeof input !== 'string') return null;
  let text = input.trim();
  if (!text) return null;

  // Remove ordinal suffixes (1st, 2nd, 3rd, 4th)
  text = text.replace(/(\d+)(st|nd|rd|th)/gi, '$1').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Handle Relative Tokens
  const lower = text.toLowerCase();
  const today = new Date();
  if (lower === 'today' || lower === 'now') {
    return new Date();
  }
  if (lower === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (lower === 'tomorrow') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }

  // Relative offset like "+7d", "-3d", "+2w", "+1m", "-1y"
  const relMatch = lower.match(/^([+-])\s*(\d+)\s*([dwmy])$/);
  if (relMatch) {
    const sign = relMatch[1] === '+' ? 1 : -1;
    const amount = parseInt(relMatch[2], 10) * sign;
    const unit = relMatch[3];
    const d = new Date();
    if (unit === 'd') d.setDate(d.getDate() + amount);
    if (unit === 'w') d.setDate(d.getDate() + amount * 7);
    if (unit === 'm') d.setMonth(d.getMonth() + amount);
    if (unit === 'y') d.setFullYear(d.getFullYear() + amount);
    return d;
  }

  // 2. Separate date part and time part (if present)
  let datePart = text;
  let timePart = '';
  // Check for trailing time: e.g. "14:30:00", "14:30", "2:30 PM", "2:30:15 pm"
  const timeRegex = /(?:\s+|T)(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:am|pm))?)(?:\s*(?:z|[+-]\d{2}:?\d{2}))?$/i;
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    timePart = timeMatch[1];
    datePart = text.slice(0, timeMatch.index).trim();
  }

  let year: number | null = null;
  let monthZeroBased: number | null = null;
  let day: number | null = null;

  // 3. Check for standard ISO date: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = datePart.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    monthZeroBased = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  }

  // 4. Check for Textual Month: "15 Jan 2026" or "Jan 15 2026"
  if (year === null) {
    // "15 Jan 2026" or "15-Jan-2026"
    const textMatch1 = datePart.match(/^(\d{1,2})[-/\s]+([a-zA-Z]+)[-/\s]+(\d{2,4})$/);
    if (textMatch1) {
      const monStr = textMatch1[2].toLowerCase();
      if (MONTH_MAP[monStr] !== undefined) {
        day = parseInt(textMatch1[1], 10);
        monthZeroBased = MONTH_MAP[monStr];
        let y = parseInt(textMatch1[3], 10);
        if (y < 100) y += y > 50 ? 1900 : 2000;
        year = y;
      }
    }

    // "Jan 15 2026"
    if (year === null) {
      const textMatch2 = datePart.match(/^([a-zA-Z]+)[-/\s]+(\d{1,2})[-/\s]+(\d{2,4})$/);
      if (textMatch2) {
        const monStr = textMatch2[1].toLowerCase();
        if (MONTH_MAP[monStr] !== undefined) {
          monthZeroBased = MONTH_MAP[monStr];
          day = parseInt(textMatch2[2], 10);
          let y = parseInt(textMatch2[3], 10);
          if (y < 100) y += y > 50 ? 1900 : 2000;
          year = y;
        }
      }
    }
  }

  // 5. Delimited numeric date: e.g. "15-05-2026", "15/05/2026", "05/15/2026"
  if (year === null) {
    const numMatch = datePart.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (numMatch) {
      const n1 = parseInt(numMatch[1], 10);
      const n2 = parseInt(numMatch[2], 10);
      let y = parseInt(numMatch[3], 10);
      if (y < 100) y += y > 50 ? 1900 : 2000;
      year = y;

      const prefersMdy = formatHint ? formatHint.toUpperCase().startsWith('MM') : false;

      if (n1 > 12 && n2 <= 12) {
        // Definitely DD/MM
        day = n1;
        monthZeroBased = n2 - 1;
      } else if (n2 > 12 && n1 <= 12) {
        // Definitely MM/DD
        monthZeroBased = n1 - 1;
        day = n2;
      } else if (prefersMdy) {
        monthZeroBased = n1 - 1;
        day = n2;
      } else {
        // Default to DD-MM
        day = n1;
        monthZeroBased = n2 - 1;
      }
    }
  }

  // 6. Year-only / Month-only inputs
  if (year === null) {
    const yearMatch = datePart.match(/^(\d{4})$/);
    if (yearMatch) {
      return new Date(parseInt(yearMatch[1], 10), 0, 1);
    }
  }

  // 7. Validate year, month, day bounds
  if (year !== null && monthZeroBased !== null && day !== null) {
    if (monthZeroBased < 0 || monthZeroBased > 11 || day < 1 || day > 31) {
      return null;
    }
    const daysInMo = new Date(year, monthZeroBased + 1, 0).getDate();
    if (day > daysInMo) {
      return null; // Invalid day of month (e.g. Feb 30)
    }

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (timePart) {
      const parsedTime = extractTime(timePart);
      if (parsedTime) {
        hours = parsedTime.hours;
        minutes = parsedTime.minutes;
        seconds = parsedTime.seconds;
      }
    }

    return new Date(year, monthZeroBased, day, hours, minutes, seconds);
  }

  // Fallback: test native Date parsing for standard RFC formats
  const native = new Date(text);
  if (!isNaN(native.getTime())) {
    return native;
  }

  return null;
}

export interface IAcDtpParsedRange {
  start: Date | null;
  end: Date | null;
  isValid: boolean;
  isComplete: boolean;
}

/**
 * Universal range parser that splits user input by any common range separator:
 * " to ", " - ", " – ", " — ", " .. ", " / "
 */
export function acDtpParseRange(
  input: string,
  rangeSeparator: string = 'to',
  formatHint?: string
): IAcDtpParsedRange {
  if (!input || !input.trim()) {
    return { start: null, end: null, isValid: false, isComplete: false };
  }

  const trimmed = input.trim();
  const escapedSep = rangeSeparator ? rangeSeparator.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : 'to';
  const sepPattern = new RegExp(
    `\\s+(?:${escapedSep}|to|–|—|-|\\.\\.)(?:\\s+|$)|^(?:${escapedSep}|to|–|—|-|\\.\\.)\\s+`,
    'i'
  );

  const parts = trimmed.split(sepPattern);

  if (parts.length === 1) {
    const single = acDtpParseAnyDate(parts[0], formatHint);
    return {
      start: single,
      end: null,
      isValid: single !== null,
      isComplete: false,
    };
  }

  const rawStart = parts[0]?.trim();
  const rawEnd = parts[1]?.trim();

  const start = rawStart ? acDtpParseAnyDate(rawStart, formatHint) : null;
  const end = rawEnd ? acDtpParseAnyDate(rawEnd, formatHint) : null;

  const isValid = start !== null || end !== null;
  const isComplete = start !== null && end !== null;

  return {
    start,
    end,
    isValid,
    isComplete,
  };
}
