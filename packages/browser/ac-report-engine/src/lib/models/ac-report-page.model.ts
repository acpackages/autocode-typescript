import { AcReport } from "./ac-report.model";
import { AcEnumPageOrientation } from "../enums/ac-enum-page-orientations.enum";
import { AC_REPORT_ATTRIBUTE } from "../consts/ac-report-html-attributes.const";

/* eslint-disable @typescript-eslint/no-inferrable-types */
export class AcReportPage {
  element!: HTMLElement;
  index: number;
  report!: AcReport;
  isFixedHeight: boolean = true;
  pageOrientation: AcEnumPageOrientation = AcEnumPageOrientation.Portrait;
  allocatedHeight: number = 0;
  allocatedWidth: number = 0;
  cachedPageHeight: number = 0;
  sectionName: string = '';
  sectionPageNumber: number = 1;
  sectionTotalPages: number = 1;
  subtotals: Record<string, number> = {};
  broughtForward: Record<string, number> = {};
  carriedForward: Record<string, number> = {};

  get isContentOverflow(): boolean {
    let result: boolean = false;
    if (this.isFixedHeight) {
      if (this.element && this.report) {
        const targetHeight = this.allocatedHeight > 0 ? this.allocatedHeight : this.report.pageHeight;
        this.cachedPageHeight = this.pageHeight;
        result = this.cachedPageHeight > targetHeight;
      }
    }
    return result;
  }

  checkOverflowWithEstimatedAddition(addedHeight: number = 30): boolean {
    if (!this.isFixedHeight || !this.element || !this.report) return false;
    const targetHeight = this.allocatedHeight > 0 ? this.allocatedHeight : this.report.pageHeight;
    // Fast path: if last known height + estimated addition is under 75% of target height, skip forced reflow!
    if (this.cachedPageHeight > 0 && (this.cachedPageHeight + addedHeight < targetHeight * 0.75)) {
      this.cachedPageHeight += addedHeight;
      return false;
    }
    // Near boundary or unmeasured: perform real DOM measurement
    this.cachedPageHeight = this.pageHeight;
    return this.cachedPageHeight > targetHeight;
  }

  get pageHeight(): number {
    let result: number = 0;
    if (this.element) {
      result = this.element.offsetHeight;
    }
    return result;
  }

  get pageNumber(): number {
    return this.index + 1;
  }

  constructor({
    element,
    index,
    report,
    isFixedHeight = true,
  }: {
    element: HTMLElement;
    index: number;
    report: AcReport;
    isFixedHeight?: boolean;
  }) {
    this.report = report;
    this.element = element;
    this.index = index;
    this.isFixedHeight = isFixedHeight;

    // Detect per-page orientation
    if (element.hasAttribute(AC_REPORT_ATTRIBUTE.pageOrientation)) {
      const orientationStr = element.getAttribute(AC_REPORT_ATTRIBUTE.pageOrientation)!.toUpperCase();
      if (Object.values(AcEnumPageOrientation).includes(orientationStr as any)) {
        this.pageOrientation = orientationStr as AcEnumPageOrientation;
      }
    } else if (this.report) {
      this.pageOrientation = this.report.pageOrientation;
    }

    if (this.report) {
      this.applyDimensions();
    }
  }

  applyDimensions(): void {
    if (!this.report || !this.element) return;
    const isPortrait = this.pageOrientation === AcEnumPageOrientation.Portrait;
    const widthMm = isPortrait ? this.report.pageSize.widthMm : this.report.pageSize.heightMm;
    const heightMm = isPortrait ? this.report.pageSize.heightMm : this.report.pageSize.widthMm;

    this.allocatedWidth = widthMm * this.report.mmConversionValue;
    this.allocatedHeight = heightMm * this.report.mmConversionValue;

    this.element.style.maxWidth = `${this.allocatedWidth}px`;
    this.element.style.minWidth = `${this.allocatedWidth}px`;
    this.element.style.width = `${this.allocatedWidth}px`;
  }

  recordValue(key: string, value: number): void {
    const num = Number(value) || 0;
    this.subtotals[key] = (this.subtotals[key] || 0) + num;
  }

  destroy(): void {
    if (this.element && this.element.parentElement) {
      this.element.remove();
    }
    (this as any).element = null;
    (this as any).report = null;
  }

  toJson() {
    return {
      index: this.index,
      number: this.pageNumber,
      pageNumber: this.pageNumber,
      totalPages: this.report?.pages?.length || 1,
      orientation: this.pageOrientation,
      sectionName: this.sectionName,
      sectionPageNumber: this.sectionPageNumber,
      sectionTotalPages: this.sectionTotalPages,
      subtotals: { ...this.subtotals },
      broughtForward: { ...this.broughtForward },
      carriedForward: { ...this.carriedForward },
    };
  }
}
