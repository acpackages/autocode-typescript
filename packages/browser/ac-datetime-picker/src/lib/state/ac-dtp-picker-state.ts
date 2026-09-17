import { AcEnumDateTimePickerMode } from '../enums/ac-enum-datetime-picker-mode.enum';
import { AcEnumDateTimePickerOutputType } from '../enums/ac-enum-datetime-picker-output-type.enum';
import {
  acDtpIsBeforeDay,
  acDtpIsSameDay,
} from '../utils/ac-dtp-calendar-math';

export interface IAcDtpStateChangeCallback {
  (): void;
}

export class AcDtpPickerState {
  // Mode & configuration
  mode: AcEnumDateTimePickerMode = AcEnumDateTimePickerMode.DateRange;
  outputType: AcEnumDateTimePickerOutputType = AcEnumDateTimePickerOutputType.Utc;

  // Selected date objects (with time preserved)
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Cross-calendar hover date (for live range preview)
  hoverDate: Date | null = null;

  // View navigation dates (Month/Year currently visible)
  viewDateLeft: Date = new Date();
  viewDateRight: Date = new Date();

  // Constraints
  minDate: Date | null = null;
  maxDate: Date | null = null;
  disabledDates: (Date | string)[] = [];
  disabledDaysOfWeek: number[] = [];

  // Active preset label
  activePresetLabel: string | null = null;

  private _listeners: Set<IAcDtpStateChangeCallback> = new Set();

  constructor() {
    this._initViewDates();
  }

  get isRangeMode(): boolean {
    return (
      this.mode === AcEnumDateTimePickerMode.DateRange ||
      this.mode === AcEnumDateTimePickerMode.DateTimeRange ||
      this.mode === AcEnumDateTimePickerMode.MonthRange ||
      this.mode === AcEnumDateTimePickerMode.YearRange
    );
  }

  get hasTime(): boolean {
    return (
      this.mode === AcEnumDateTimePickerMode.DateTime ||
      this.mode === AcEnumDateTimePickerMode.DateTimeRange
    );
  }

  subscribe(cb: IAcDtpStateChangeCallback): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  notify() {
    for (const cb of this._listeners) {
      cb();
    }
  }

  private _initViewDates() {
    const base = this.startDate ? new Date(this.startDate) : new Date();
    this.viewDateLeft = new Date(base.getFullYear(), base.getMonth(), 1);

    const nextM = base.getMonth() === 11 ? 0 : base.getMonth() + 1;
    const nextY = base.getMonth() === 11 ? base.getFullYear() + 1 : base.getFullYear();
    this.viewDateRight = new Date(nextY, nextM, 1);
  }

  /** Sync view dates to currently selected start/end dates */
  syncViewDates() {
    if (this.startDate) {
      this.viewDateLeft = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
      if (this.endDate) {
        // If end date is in a different month, show end date on right calendar
        if (
          this.endDate.getFullYear() !== this.startDate.getFullYear() ||
          this.endDate.getMonth() !== this.startDate.getMonth()
        ) {
          this.viewDateRight = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), 1);
        } else {
          // Both in same month: right shows month + 1
          const m = this.startDate.getMonth() === 11 ? 0 : this.startDate.getMonth() + 1;
          const y = this.startDate.getMonth() === 11 ? this.startDate.getFullYear() + 1 : this.startDate.getFullYear();
          this.viewDateRight = new Date(y, m, 1);
        }
      } else {
        const m = this.startDate.getMonth() === 11 ? 0 : this.startDate.getMonth() + 1;
        const y = this.startDate.getMonth() === 11 ? this.startDate.getFullYear() + 1 : this.startDate.getFullYear();
        this.viewDateRight = new Date(y, m, 1);
      }
    } else {
      this._initViewDates();
    }
  }

  /**
   * Select a calendar day.
   * Handles single-mode direct selection vs range-mode 2-click selection.
   */
  handleDayClick(clickedDate: Date): { complete: boolean } {
    this.activePresetLabel = null;

    if (!this.isRangeMode) {
      // Preserve existing time if any
      const h = this.startDate ? this.startDate.getHours() : 0;
      const m = this.startDate ? this.startDate.getMinutes() : 0;
      const s = this.startDate ? this.startDate.getSeconds() : 0;
      const newD = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(), h, m, s);
      this.startDate = newD;
      this.endDate = null;
      this.hoverDate = null;
      this.notify();
      return { complete: true };
    }

    // Range selection
    if (!this.startDate || (this.startDate && this.endDate)) {
      // First click of a range
      const h = this.startDate ? this.startDate.getHours() : 0;
      const m = this.startDate ? this.startDate.getMinutes() : 0;
      const s = this.startDate ? this.startDate.getSeconds() : 0;
      this.startDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(), h, m, s);
      this.endDate = null;
      this.hoverDate = null;
      this.notify();
      return { complete: false };
    }

    // Second click of a range
    const startH = this.startDate.getHours();
    const startM = this.startDate.getMinutes();
    const startS = this.startDate.getSeconds();

    const endH = this.endDate ? this.endDate.getHours() : 23;
    const endM = this.endDate ? this.endDate.getMinutes() : 59;
    const endS = this.endDate ? this.endDate.getSeconds() : 59;

    if (acDtpIsBeforeDay(clickedDate, this.startDate)) {
      // Clicked date is earlier than start: swap start and end
      this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), endH, endM, endS);
      this.startDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(), startH, startM, startS);
    } else {
      this.endDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(), endH, endM, endS);
    }

    this.hoverDate = null;
    this.notify();
    return { complete: true };
  }

  /**
   * Hover over a calendar day during active range selection.
   */
  handleDayHover(hoveredDate: Date | null) {
    if (!this.isRangeMode || !this.startDate || this.endDate) {
      if (this.hoverDate !== null) {
        this.hoverDate = null;
        this.notify();
      }
      return;
    }

    if (!acDtpIsSameDay(this.hoverDate, hoveredDate)) {
      this.hoverDate = hoveredDate;
      this.notify();
    }
  }

  /**
   * Set start time (hours, minutes, seconds).
   */
  setStartTime(hours: number, minutes: number, seconds: number = 0) {
    if (this.startDate) {
      this.startDate = new Date(
        this.startDate.getFullYear(),
        this.startDate.getMonth(),
        this.startDate.getDate(),
        hours,
        minutes,
        seconds
      );
    }
    this.notify();
  }

  /**
   * Set end time (hours, minutes, seconds).
   */
  setEndTime(hours: number, minutes: number, seconds: number = 0) {
    if (this.endDate) {
      this.endDate = new Date(
        this.endDate.getFullYear(),
        this.endDate.getMonth(),
        this.endDate.getDate(),
        hours,
        minutes,
        seconds
      );
    }
    this.notify();
  }

  /**
   * Move calendar view by delta months.
   */
  navigateView(side: 'left' | 'right', delta: number) {
    if (side === 'left') {
      const cur = this.viewDateLeft;
      const nextM = cur.getMonth() + delta;
      this.viewDateLeft = new Date(cur.getFullYear(), nextM, 1);

      // In range mode, ensure right calendar advances if left catches up
      if (this.isRangeMode) {
        const leftMonthVal = this.viewDateLeft.getFullYear() * 12 + this.viewDateLeft.getMonth();
        const rightMonthVal = this.viewDateRight.getFullYear() * 12 + this.viewDateRight.getMonth();
        if (leftMonthVal >= rightMonthVal) {
          this.viewDateRight = new Date(this.viewDateLeft.getFullYear(), this.viewDateLeft.getMonth() + 1, 1);
        }
      }
    } else {
      const cur = this.viewDateRight;
      const nextM = cur.getMonth() + delta;
      this.viewDateRight = new Date(cur.getFullYear(), nextM, 1);

      // In range mode, ensure left calendar moves back if right pushes back
      if (this.isRangeMode) {
        const leftMonthVal = this.viewDateLeft.getFullYear() * 12 + this.viewDateLeft.getMonth();
        const rightMonthVal = this.viewDateRight.getFullYear() * 12 + this.viewDateRight.getMonth();
        if (rightMonthVal <= leftMonthVal) {
          this.viewDateLeft = new Date(this.viewDateRight.getFullYear(), this.viewDateRight.getMonth() - 1, 1);
        }
      }
    }
    this.notify();
  }

  /**
   * Set specific month and year for a calendar view.
   */
  setView(year: number, monthZeroBased: number, side: 'left' | 'right' = 'left') {
    if (side === 'left') {
      this.viewDateLeft = new Date(year, monthZeroBased, 1);
      if (this.isRangeMode) {
        const leftMonthVal = year * 12 + monthZeroBased;
        const rightMonthVal = this.viewDateRight.getFullYear() * 12 + this.viewDateRight.getMonth();
        if (leftMonthVal >= rightMonthVal) {
          this.viewDateRight = new Date(year, monthZeroBased + 1, 1);
        }
      }
    } else {
      this.viewDateRight = new Date(year, monthZeroBased, 1);
      if (this.isRangeMode) {
        const leftMonthVal = this.viewDateLeft.getFullYear() * 12 + this.viewDateLeft.getMonth();
        const rightMonthVal = year * 12 + monthZeroBased;
        if (rightMonthVal <= leftMonthVal) {
          this.viewDateLeft = new Date(year, monthZeroBased - 1, 1);
        }
      }
    }
    this.notify();
  }

  clear() {
    this.startDate = null;
    this.endDate = null;
    this.hoverDate = null;
    this.activePresetLabel = null;
    this.notify();
  }
}
