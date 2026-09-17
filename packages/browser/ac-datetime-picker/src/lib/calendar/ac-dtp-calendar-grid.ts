import {
  acDtpBuildMonthMatrix,
  acDtpIsBetweenDays,
  acDtpIsDateDisabled,
  acDtpIsSameDay,
  AC_DTP_MONTH_NAMES_LONG,
  AC_DTP_MONTH_NAMES_SHORT,
  AC_DTP_WEEKDAY_NAMES_SHORT,
  IAcDtpCalendarCell,
} from '../utils/ac-dtp-calendar-math';
import { AcDtpPickerState } from '../state/ac-dtp-picker-state';

export type AcDtpGridViewMode = 'days' | 'months' | 'years';

export interface IAcDtpCalendarGridOptions {
  side: 'left' | 'right';
  state: AcDtpPickerState;
  onDayClick?: (date: Date) => void;
  showNavPrev?: boolean;
  showNavNext?: boolean;
}

export class AcDtpCalendarGrid {
  private _side: 'left' | 'right';
  private _state: AcDtpPickerState;
  private _container: HTMLDivElement;
  private _headerEl: HTMLDivElement;
  private _titleBtn: HTMLButtonElement;
  private _prevBtn: HTMLButtonElement;
  private _nextBtn: HTMLButtonElement;
  private _bodyEl: HTMLDivElement;

  private _viewMode: AcDtpGridViewMode = 'days';
  private _decadeStartYear: number = 2020;
  private _onDayClick?: (date: Date) => void;

  constructor(options: IAcDtpCalendarGridOptions) {
    this._side = options.side;
    this._state = options.state;
    this._onDayClick = options.onDayClick;

    this._container = document.createElement('div');
    this._container.className = `ac-dtp__cal ac-dtp__cal--${this._side}`;

    // Header
    this._headerEl = document.createElement('div');
    this._headerEl.className = 'ac-dtp__cal-header';

    this._prevBtn = document.createElement('button');
    this._prevBtn.type = 'button';
    this._prevBtn.className = 'ac-dtp__cal-nav ac-dtp__cal-nav--prev';
    this._prevBtn.setAttribute('aria-label', 'Previous Month');
    this._prevBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    this._prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._onPrevClick();
    });

    this._titleBtn = document.createElement('button');
    this._titleBtn.type = 'button';
    this._titleBtn.className = 'ac-dtp__cal-title';
    this._titleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._onTitleClick();
    });

    this._nextBtn = document.createElement('button');
    this._nextBtn.type = 'button';
    this._nextBtn.className = 'ac-dtp__cal-nav ac-dtp__cal-nav--next';
    this._nextBtn.setAttribute('aria-label', 'Next Month');
    this._nextBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
    this._nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._onNextClick();
    });

    this._headerEl.appendChild(this._prevBtn);
    this._headerEl.appendChild(this._titleBtn);
    this._headerEl.appendChild(this._nextBtn);

    // Body
    this._bodyEl = document.createElement('div');
    this._bodyEl.className = 'ac-dtp__cal-body';

    this._container.appendChild(this._headerEl);
    this._container.appendChild(this._bodyEl);

    // Initial render
    this.render();
  }

  getElement(): HTMLDivElement {
    return this._container;
  }

  private _getViewDate(): Date {
    return this._side === 'left' ? this._state.viewDateLeft : this._state.viewDateRight;
  }

  render() {
    const viewDate = this._getViewDate();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    if (this._viewMode === 'days') {
      this._titleBtn.textContent = `${AC_DTP_MONTH_NAMES_LONG[month]} ${year}`;
      this._renderDaysGrid(year, month);
    } else if (this._viewMode === 'months') {
      this._titleBtn.textContent = `${year}`;
      this._renderMonthsGrid(year);
    } else if (this._viewMode === 'years') {
      this._decadeStartYear = Math.floor(year / 10) * 10;
      this._titleBtn.textContent = `${this._decadeStartYear} – ${this._decadeStartYear + 9}`;
      this._renderYearsGrid(this._decadeStartYear);
    }
  }

  private _onPrevClick() {
    if (this._viewMode === 'days') {
      this._state.navigateView(this._side, -1);
    } else if (this._viewMode === 'months') {
      const cur = this._getViewDate();
      this._state.setView(cur.getFullYear() - 1, cur.getMonth(), this._side);
    } else if (this._viewMode === 'years') {
      this._decadeStartYear -= 10;
      this.render();
    }
  }

  private _onNextClick() {
    if (this._viewMode === 'days') {
      this._state.navigateView(this._side, 1);
    } else if (this._viewMode === 'months') {
      const cur = this._getViewDate();
      this._state.setView(cur.getFullYear() + 1, cur.getMonth(), this._side);
    } else if (this._viewMode === 'years') {
      this._decadeStartYear += 10;
      this.render();
    }
  }

  private _onTitleClick() {
    if (this._viewMode === 'days') {
      this._viewMode = 'months';
    } else if (this._viewMode === 'months') {
      this._viewMode = 'years';
    } else {
      this._viewMode = 'days';
    }
    this.render();
  }

  // ── Days Grid ─────────────────────────────────────────────────────────────

  private _renderDaysGrid(year: number, month: number) {
    this._bodyEl.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'ac-dtp__grid-table';
    table.setAttribute('role', 'grid');

    // Weekdays header
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    trHead.className = 'ac-dtp__weekdays';
    trHead.setAttribute('role', 'row');

    for (const w of AC_DTP_WEEKDAY_NAMES_SHORT) {
      const th = document.createElement('th');
      th.className = 'ac-dtp__weekday';
      th.setAttribute('role', 'columnheader');
      th.textContent = w;
      trHead.appendChild(th);
    }
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Days body
    const tbody = document.createElement('tbody');
    tbody.setAttribute('role', 'rowgroup');

    const matrix = acDtpBuildMonthMatrix(year, month, true);

    let row = document.createElement('tr');
    row.className = 'ac-dtp__row';
    row.setAttribute('role', 'row');

    for (let i = 0; i < matrix.length; i++) {
      if (i > 0 && i % 7 === 0) {
        tbody.appendChild(row);
        row = document.createElement('tr');
        row.className = 'ac-dtp__row';
        row.setAttribute('role', 'row');
      }

      const cell = matrix[i];
      const td = this._createDayCell(cell);
      row.appendChild(td);
    }
    tbody.appendChild(row);
    table.appendChild(tbody);

    this._bodyEl.appendChild(table);
  }

  private _createDayCell(cell: IAcDtpCalendarCell): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = 'ac-dtp__cell-wrap';
    td.setAttribute('role', 'gridcell');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ac-dtp__cell';
    btn.textContent = String(cell.dayNumber);
    btn.setAttribute('data-date', cell.isoString);

    const d = cell.date;
    const isDisabled = acDtpIsDateDisabled(
      d,
      this._state.minDate,
      this._state.maxDate,
      this._state.disabledDates,
      this._state.disabledDaysOfWeek
    );

    if (isDisabled) {
      btn.classList.add('ac-dtp__cell--disabled');
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }

    if (!cell.isCurrentMonth) {
      btn.classList.add('ac-dtp__cell--other-month');
    }

    if (cell.isToday) {
      btn.classList.add('ac-dtp__cell--today');
    }

    // Range / Selection state
    const isStart = acDtpIsSameDay(d, this._state.startDate);
    const isEnd = acDtpIsSameDay(d, this._state.endDate);

    if (isStart) {
      btn.classList.add('ac-dtp__cell--selected');
      if (this._state.isRangeMode) {
        btn.classList.add('ac-dtp__cell--range-start');
      }
      btn.setAttribute('aria-selected', 'true');
    }

    if (isEnd) {
      btn.classList.add('ac-dtp__cell--selected');
      btn.classList.add('ac-dtp__cell--range-end');
      btn.setAttribute('aria-selected', 'true');
    }

    // In-range selection
    if (
      this._state.isRangeMode &&
      this._state.startDate &&
      this._state.endDate &&
      acDtpIsBetweenDays(d, this._state.startDate, this._state.endDate)
    ) {
      btn.classList.add('ac-dtp__cell--in-range');
      td.classList.add('ac-dtp__cell-wrap--in-range');
    }

    // Cross-calendar range hover preview!
    if (
      this._state.isRangeMode &&
      this._state.startDate &&
      !this._state.endDate &&
      this._state.hoverDate &&
      acDtpIsBetweenDays(d, this._state.startDate, this._state.hoverDate)
    ) {
      btn.classList.add('ac-dtp__cell--range-hover');
      td.classList.add('ac-dtp__cell-wrap--range-hover');
      if (acDtpIsSameDay(d, this._state.hoverDate)) {
        btn.classList.add('ac-dtp__cell--hover-end');
      }
    }

    // Event listeners
    if (!isDisabled) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._state.handleDayClick(d);
        if (this._onDayClick) {
          this._onDayClick(d);
        }
      });

      btn.addEventListener('pointerenter', () => {
        this._state.handleDayHover(d);
      });
    }

    td.appendChild(btn);
    return td;
  }

  // ── Months View ────────────────────────────────────────────────────────────

  private _renderMonthsGrid(year: number) {
    this._bodyEl.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'ac-dtp__month-grid';

    for (let m = 0; m < 12; m++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ac-dtp__month-btn';
      btn.textContent = AC_DTP_MONTH_NAMES_SHORT[m];

      const isCurMonth =
        this._state.startDate &&
        this._state.startDate.getFullYear() === year &&
        this._state.startDate.getMonth() === m;

      if (isCurMonth) {
        btn.classList.add('ac-dtp__month-btn--active');
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._state.setView(year, m, this._side);
        this._viewMode = 'days';
        this.render();
      });

      grid.appendChild(btn);
    }

    this._bodyEl.appendChild(grid);
  }

  // ── Years View ─────────────────────────────────────────────────────────────

  private _renderYearsGrid(startYear: number) {
    this._bodyEl.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'ac-dtp__year-grid';

    for (let y = startYear - 1; y <= startYear + 10; y++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ac-dtp__year-btn';
      btn.textContent = String(y);

      if (y < startYear || y > startYear + 9) {
        btn.classList.add('ac-dtp__year-btn--other');
      }

      const isCurYear =
        this._state.startDate && this._state.startDate.getFullYear() === y;

      if (isCurYear) {
        btn.classList.add('ac-dtp__year-btn--active');
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cur = this._getViewDate();
        this._state.setView(y, cur.getMonth(), this._side);
        this._viewMode = 'months';
        this.render();
      });

      grid.appendChild(btn);
    }

    this._bodyEl.appendChild(grid);
  }
}
