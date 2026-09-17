import { describe, it, expect, beforeEach } from 'vitest';
import { AcDtpPickerState } from '../src/lib/state/ac-dtp-picker-state';
import { AcEnumDateTimePickerMode } from '../src/lib/enums/ac-enum-datetime-picker-mode.enum';
import { acDtpIsSameDay } from '../src/lib/utils/ac-dtp-calendar-math';

describe('AcDtpPickerState State Machine', () => {
  let state: AcDtpPickerState;

  beforeEach(() => {
    state = new AcDtpPickerState();
    state.mode = AcEnumDateTimePickerMode.DateRange;
  });

  describe('Single Mode Selection', () => {
    it('selects single date and emits update', () => {
      const singleState = new AcDtpPickerState();
      singleState.mode = AcEnumDateTimePickerMode.Date;
      const target = new Date(2026, 4, 15);
      let emitted = false;
      singleState.subscribe(() => {
        emitted = true;
      });

      const res = singleState.handleDayClick(target);
      expect(res.complete).toBe(true);
      expect(emitted).toBe(true);
      expect(singleState.startDate).not.toBeNull();
      expect(acDtpIsSameDay(singleState.startDate!, target)).toBe(true);
      expect(singleState.endDate).toBeNull();
    });
  });

  describe('Range Mode Selection Flow', () => {
    it('sets start date on first click and returns complete: false', () => {
      const d1 = new Date(2026, 4, 10);
      const res = state.handleDayClick(d1);

      expect(res.complete).toBe(false);
      expect(state.startDate).not.toBeNull();
      expect(acDtpIsSameDay(state.startDate!, d1)).toBe(true);
      expect(state.endDate).toBeNull();
    });

    it('completes range on second click when second date is after start date', () => {
      const d1 = new Date(2026, 4, 10);
      const d2 = new Date(2026, 4, 20);

      state.handleDayClick(d1);
      const res = state.handleDayClick(d2);

      expect(res.complete).toBe(true);
      expect(acDtpIsSameDay(state.startDate!, d1)).toBe(true);
      expect(acDtpIsSameDay(state.endDate!, d2)).toBe(true);
    });

    it('auto-inverts dates when second click is before start date', () => {
      const d1 = new Date(2026, 4, 20);
      const d2 = new Date(2026, 4, 10);

      state.handleDayClick(d1);
      const res = state.handleDayClick(d2);

      expect(res.complete).toBe(true);
      expect(acDtpIsSameDay(state.startDate!, d2)).toBe(true);
      expect(acDtpIsSameDay(state.endDate!, d1)).toBe(true);
    });

    it('updates hover date only while range selection is in progress', () => {
      const d1 = new Date(2026, 4, 10);
      const h1 = new Date(2026, 4, 15);

      state.handleDayHover(h1);
      expect(state.hoverDate).toBeNull(); // not selecting range yet

      state.handleDayClick(d1);
      state.handleDayHover(h1);
      expect(state.hoverDate).not.toBeNull();
      expect(acDtpIsSameDay(state.hoverDate!, h1)).toBe(true);

      const d2 = new Date(2026, 4, 20);
      state.handleDayClick(d2);
      expect(state.hoverDate).toBeNull(); // cleared on range completion
    });
  });

  describe('Multi-Calendar Month Synchronization', () => {
    it('ensures left calendar is always strictly before right calendar when left meets or exceeds right', () => {
      state.setView(2026, 8, 'right'); // September 2026
      state.setView(2026, 9, 'left');  // October 2026 -> should push right to November 2026

      expect(state.viewDateLeft.getFullYear()).toBe(2026);
      expect(state.viewDateLeft.getMonth()).toBe(9);
      expect(state.viewDateRight.getFullYear()).toBe(2026);
      expect(state.viewDateRight.getMonth()).toBe(10);
    });

    it('navigates next and previous months cleanly without collision', () => {
      state.setView(2026, 11, 'left'); // December 2026
      expect(state.viewDateLeft.getFullYear()).toBe(2026);
      expect(state.viewDateLeft.getMonth()).toBe(11);
      expect(state.viewDateRight.getFullYear()).toBe(2027);
      expect(state.viewDateRight.getMonth()).toBe(0); // January 2027

      state.navigateView('left', 1); // advance left month to Jan 2027
      expect(state.viewDateLeft.getFullYear()).toBe(2027);
      expect(state.viewDateLeft.getMonth()).toBe(0);
      expect(state.viewDateRight.getFullYear()).toBe(2027);
      expect(state.viewDateRight.getMonth()).toBe(1); // right pushed forward to Feb 2027
    });

    it('pushes left calendar back if right calendar is navigated backwards to meet left', () => {
      state.setView(2026, 4, 'left');
      state.setView(2026, 5, 'right');

      state.navigateView('right', -1); // move right back to May 2026
      expect(state.viewDateRight.getMonth()).toBe(4);
      expect(state.viewDateLeft.getMonth()).toBe(3); // left pushed back to April 2026
    });
  });

  describe('Time State Management', () => {
    it('sets and retrieves time for start and end', () => {
      state.startDate = new Date(2026, 4, 10, 0, 0, 0);
      state.endDate = new Date(2026, 4, 20, 0, 0, 0);

      state.setStartTime(14, 30, 10);
      expect(state.startDate.getHours()).toBe(14);
      expect(state.startDate.getMinutes()).toBe(30);
      expect(state.startDate.getSeconds()).toBe(10);

      state.setEndTime(18, 45, 15);
      expect(state.endDate.getHours()).toBe(18);
      expect(state.endDate.getMinutes()).toBe(45);
      expect(state.endDate.getSeconds()).toBe(15);
    });
  });

  describe('Clear and Reset', () => {
    it('clears all selected dates and hover state', () => {
      state.handleDayClick(new Date(2026, 4, 10));
      state.handleDayClick(new Date(2026, 4, 20));
      expect(state.startDate).not.toBeNull();
      expect(state.endDate).not.toBeNull();

      state.clear();
      expect(state.startDate).toBeNull();
      expect(state.endDate).toBeNull();
      expect(state.hoverDate).toBeNull();
    });
  });
});
