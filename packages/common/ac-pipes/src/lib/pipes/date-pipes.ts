/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from "luxon";
import { AcPipeRegistry } from "../core/ac-pipe";

AcPipeRegistry.register({
  name: 'date',
  pure: true,
  transform: (
    v: any,
    format: 'short' | 'long' | 'medium' | 'full' | string = 'short',
    locale: string = 'en-IN'
  ) => {
    if (!v) return '';

    // Prefer ISO parsing via Luxon to avoid UTC day-shift bugs in Western timezones
    let dt: DateTime;
    if (typeof v === 'string') {
      dt = DateTime.fromISO(v, { setZone: true });
      if (!dt.isValid) {
        const d = new Date(v);
        if (!isNaN(d.getTime())) {
          dt = DateTime.fromJSDate(d);
        }
      }
    } else if (v instanceof Date) {
      dt = DateTime.fromJSDate(v);
    } else {
      const d = new Date(v);
      if (!isNaN(d.getTime())) {
        dt = DateTime.fromJSDate(d);
      } else {
        return v;
      }
    }

    if (!dt.isValid) return v;

    if (typeof format === 'string' && ['short', 'medium', 'long', 'full'].includes(format)) {
      return new Intl.DateTimeFormat(locale, { dateStyle: format as any }).format(dt.toJSDate());
    }

    return dt.toFormat(format);
  }
});
