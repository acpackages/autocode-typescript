import { AcEnumDateTimePickerOutputType } from '../enums/ac-enum-datetime-picker-output-type.enum';
import {
  acDtpFormatDisplay,
  acDtpGetTimezoneOffsetString,
  acDtpParseAnyDate,
  acDtpToIsoString,
} from './ac-dtp-flexible-parser.utils';

export { acDtpFormatDisplay, acDtpGetTimezoneOffsetString };

/**
 * Parse any ISO 8601 string into a local JS Date.
 * Handles: date-only, local datetime, UTC (Z), and offset (+05:30).
 */
export function acDtpParseIso(iso: string): Date {
  const parsed = acDtpParseAnyDate(iso);
  return parsed ?? new Date(NaN);
}

/**
 * Returns the local UTC offset string e.g. "+05:30" or "-04:00".
 */
export function acDtpGetLocalOffset(): string {
  return acDtpGetTimezoneOffsetString();
}

/**
 * Convert a local Date to an ISO 8601 string based on outputType.
 */
export function acDtpToIso(
  d: Date,
  outputType: AcEnumDateTimePickerOutputType = AcEnumDateTimePickerOutputType.Utc,
  includeTime: boolean = true
): string {
  return acDtpToIsoString(d, outputType, includeTime);
}

/**
 * Parse a display-formatted date string back to a Date.
 */
export function acDtpParseDisplay(text: string, format: string = 'DD-MM-YYYY'): Date {
  const parsed = acDtpParseAnyDate(text, format);
  return parsed ?? new Date(NaN);
}
