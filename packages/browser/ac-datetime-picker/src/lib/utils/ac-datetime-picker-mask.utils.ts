import { AcEnumDateTimePickerMode } from '../enums/ac-enum-datetime-picker-mode.enum';

/**
 * Input mask format strings per picker mode.
 *
 * Tokens:
 *   '#' → digit slot  (0-9)
 *   '@' → letter slot (a-z / A-Z), auto-uppercased
 * All other characters are literals, auto-inserted into the value.
 *
 * Must stay in sync with the default _format ('DD MMM YYYY').
 */
export const AC_DTP_MASKS: Partial<Record<AcEnumDateTimePickerMode, string>> = {
  [AcEnumDateTimePickerMode.Date]:          '##-##-####',
  [AcEnumDateTimePickerMode.DateTime]:      '##-##-#### ##:## @@',
  [AcEnumDateTimePickerMode.DateRange]:     '##-##-#### to ##-##-####',
  [AcEnumDateTimePickerMode.DateTimeRange]: '##-##-#### ##:## @@ to ##-##-#### ##:## @@',
  [AcEnumDateTimePickerMode.Month]:         '@@@ ####',
  [AcEnumDateTimePickerMode.MonthRange]:    '@@@ #### – @@@ ####',
  [AcEnumDateTimePickerMode.Year]:          '####',
  [AcEnumDateTimePickerMode.YearRange]:     '#### – ####',
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function isSlot(ch: string): boolean {
  return ch === '#' || ch === '@';
}

function charFitsSlot(char: string, slot: string): boolean {
  if (slot === '#') return /\d/.test(char);
  if (slot === '@') return /[a-zA-Z]/.test(char);
  return false;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns the position of the next fillable slot at or after `from`. */
export function acDtpMaskNextSlot(mask: string, from: number): number {
  for (let i = from; i < mask.length; i++) {
    if (isSlot(mask[i])) return i;
  }
  return mask.length;
}

/** Returns the position of the previous fillable slot before `from`, or -1. */
function acDtpMaskPrevSlot(mask: string, from: number): number {
  for (let i = from - 1; i >= 0; i--) {
    if (isSlot(mask[i])) return i;
  }
  return -1;
}

/** Build an empty mask template — unfilled slots become '_', literals kept. */
export function acDtpMaskEmpty(mask: string): string {
  return mask.split('').map(c => isSlot(c) ? '_' : c).join('');
}

/** True when every slot position contains a non-underscore character. */
export function acDtpMaskIsComplete(value: string, mask: string): boolean {
  for (let i = 0; i < mask.length; i++) {
    if (isSlot(mask[i]) && (value[i] === '_' || value[i] === undefined)) return false;
  }
  return true;
}

/** True when ALL slot positions contain '_' (the mask is entirely unfilled). */
export function acDtpMaskIsEmpty(value: string, mask: string): boolean {
  for (let i = 0; i < mask.length; i++) {
    // If a slot position has a real character (not '_' / undefined), the mask is NOT empty
    if (isSlot(mask[i]) && value[i] !== '_' && value[i] !== undefined) return false;
  }
  return true;
}

/**
 * Insert a character at/after `cursor` into the next available slot.
 * Returns the new value + cursor position, or null if no slot fits the char.
 */
export function acDtpMaskInsert(
  value: string,
  mask: string,
  cursor: number,
  char: string
): { value: string; cursor: number } | null {
  const pos = acDtpMaskNextSlot(mask, cursor);
  if (pos >= mask.length) return null;
  const slot = mask[pos];
  if (!charFitsSlot(char, slot)) return null;

  const chars = value.split('');
  chars[pos] = slot === '@' ? char.toUpperCase() : char;
  const nextCursor = acDtpMaskNextSlot(mask, pos + 1);
  return {
    value: chars.join(''),
    cursor: nextCursor < mask.length ? nextCursor : pos + 1,
  };
}

/** Clear the slot immediately before `cursor`, return new value + cursor. */
export function acDtpMaskBackspace(
  value: string,
  mask: string,
  cursor: number
): { value: string; cursor: number } {
  const pos = acDtpMaskPrevSlot(mask, cursor);
  if (pos < 0) return { value, cursor };
  const chars = value.split('');
  chars[pos] = '_';
  return { value: chars.join(''), cursor: pos };
}

/**
 * Strip the mask template from a (possibly partial) masked value for parsing.
 * Returns '' if the value is blank or matches the empty mask template.
 */
export function acDtpMaskExtractRaw(value: string, mask: string): string {
  if (!value) return '';
  // Compare against the empty template — no slots filled → nothing to parse
  if (value === acDtpMaskEmpty(mask)) return '';
  // Replace unfilled underscores with space so partial inputs parse as NaN
  return value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}
