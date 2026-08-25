/**
 * Utility functions for Number manipulation.
 */

/**
 * Checks if a number is even.
 * @param num The number to check.
 * @returns True if the number is even, false otherwise.
 */
export function numberIsEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * Checks if a number is odd.
 * @param num The number to check.
 * @returns True if the number is odd, false otherwise.
 */
export function numberIsOdd(num: number): boolean {
  return num % 2 !== 0;
}

export function numberIsValid(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Formats a number according to specified options or a simplified format string.
 * This function specifically handles '0,0.00' style formats for Intl.NumberFormat.
 * For more complex formatting, consider dedicated libraries or extend Intl.NumberFormat options.
 *
 * @param num The number to format.
 * @param formatOptions A string like "0,0.00" or Intl.NumberFormatOptions object.
 * If "DISPLAY", it defaults to { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }.
 * @param locale Optional: The locale string (e.g., 'en-US', 'gu-IN'). Defaults to user's locale.
 * @returns The formatted string.
 */
export function numberFormat(
  num: number,
  formatOptions: string | Intl.NumberFormatOptions,
  locale?: string
): string {
  let options: Intl.NumberFormatOptions = {};

  if (typeof formatOptions === 'string') {
    if (formatOptions === 'DISPLAY') {
      options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      };
    } else {
      // Attempt to parse a simplified format string like "0,0.00"
      const decimalMatch = formatOptions.match(/0\.([0]+)/);
      const minimumFractionDigits = decimalMatch ? decimalMatch[1].length : 0;
      const useGrouping = formatOptions.includes(',');

      options = {
        minimumFractionDigits,
        maximumFractionDigits: minimumFractionDigits, // Usually same as min for fixed decimals
        useGrouping,
      };
    }
  } else {
    options = formatOptions; // Use provided Intl.NumberFormatOptions directly
  }

  // Use the provided locale or default to undefined (browser's default)
  return new Intl.NumberFormat(locale, options).format(num);
}


/**
 * Rounds a number to a specified number of decimal places.
 * @param num The number to round.
 * @param decimals The number of decimal places to round to (default: 2).
 * @returns The rounded number.
 */
export function numberRound(num: number, decimals = 2): number {
  if (typeof num !== 'number' || isNaN(num)) {
    return NaN; // Or throw an error, depending on desired behavior for invalid input
  }
  const mod = Math.pow(10, decimals);
  return Math.round(num * mod) / mod;
}
