/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridColumn } from "../interfaces/ac-datagrid-column.interface";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { IAcDatagridSizeColumnsToFitOptions } from "../interfaces/options/ac-datagrid-size-columns-to-fit-options.interface";
import { acResolveCellValue } from "./ac-datagrid-value-helper";

/**
 * Singleton Canvas Text Measurer
 * Uses a single offscreen canvas instance to avoid GC allocations during repeated measurements.
 */
export class AcDatagridCanvasTextMeasurer {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static cachedFont: string = '';

  static measure(text: string, font: string): number {
    if (!text) return 0;
    if (!this.ctx) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    if (this.ctx) {
      if (this.cachedFont !== font) {
        this.ctx.font = font;
        this.cachedFont = font;
      }
      return this.ctx.measureText(text).width;
    }
    // Fallback if canvas context is unavailable
    return text.length * 8;
  }
}

export class AcDatagridColumnSizeHelper {
  /**
   * Resolves the computed font string for the grid container or uses a clean default.
   */
  static getGridFont(datagridApi?: AcDatagridApi, fontWeight: string = '400'): string {
    const el = datagridApi?.datagrid;
    if (el && typeof window !== 'undefined') {
      const style = window.getComputedStyle(el);
      const fontSize = style.fontSize || '14px';
      const fontFamily = style.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      return `${fontWeight} ${fontSize} ${fontFamily}`;
    }
    return `${fontWeight} 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  }

  /**
   * Measures header width taking title text, sort icon, filter icon, and padding into account.
   */
  static measureHeaderWidth({
    datagridColumn,
    datagridApi
  }: {
    datagridColumn: IAcDatagridColumn;
    datagridApi?: AcDatagridApi;
  }): number {
    const title = datagridColumn.title || datagridColumn.columnKey || '';
    const font = this.getGridFont(datagridApi, '600');
    const textWidth = AcDatagridCanvasTextMeasurer.measure(title, font);

    let extraWidth = 16; // base padding (8px left + 8px right) + resize handle buffer

    if (datagridColumn.columnDefinition.allowSort !== false && datagridApi?.allowSorting !== false) {
      extraWidth += 20; // 16px sort icon + 4px gap
    }
    if (datagridColumn.columnDefinition.allowFilter !== false && datagridApi?.allowFiltering !== false) {
      extraWidth += 20; // 16px filter icon + 4px gap
    }

    return Math.ceil(textWidth + extraWidth);
  }

  /**
   * Fast 2-tier content width measurement:
   * Tier 1: Scans formatted values of sample rows to find the top 3 longest text strings.
   * Tier 2: Measures only those 3 candidates with Canvas (97% reduction in measureText calls).
   */
  static measureContentWidth({
    datagridColumn,
    datagridApi,
    maxSampleRows = 100
  }: {
    datagridColumn: IAcDatagridColumn;
    datagridApi: AcDatagridApi;
    maxSampleRows?: number;
  }): number {
    const rows: IAcDatagridRow[] = datagridApi.displayedDatagridRows || [];
    const sampleLimit = Math.min(rows.length, maxSampleRows);
    if (sampleLimit === 0) return 0;

    const font = this.getGridFont(datagridApi, '400');
    const topCandidates: string[] = [];

    // Tier 1: Scan string lengths
    for (let i = 0; i < sampleLimit; i++) {
      const row = rows[i];
      if (!row) continue;
      const { formattedValue } = acResolveCellValue({ row, column: datagridColumn, datagridApi });
      if (!formattedValue) continue;

      if (topCandidates.length < 3) {
        topCandidates.push(formattedValue);
        topCandidates.sort((a, b) => b.length - a.length);
      } else if (formattedValue.length > topCandidates[2].length) {
        topCandidates[2] = formattedValue;
        topCandidates.sort((a, b) => b.length - a.length);
      }
    }

    // Tier 2: Measure top candidates with Canvas
    let maxCandidateWidth = 0;
    for (const str of topCandidates) {
      const w = AcDatagridCanvasTextMeasurer.measure(str, font);
      if (w > maxCandidateWidth) {
        maxCandidateWidth = w;
      }
    }

    // Check if DOM rendered cells exist and are wider (e.g. custom HTML renderers)
    const currentRows = datagridApi.datagrid?.datagridBody?.currentRows;
    if (currentRows && currentRows.length > 0) {
      const checkLimit = Math.min(currentRows.length, 10);
      for (let i = 0; i < checkLimit; i++) {
        const cellEl = currentRows[i].datagridCells?.find(
          c => c.datagridCell?.datagridColumn?.columnId === datagridColumn.columnId
        );
        if (cellEl) {
          const firstChild = cellEl.firstElementChild as HTMLElement;
          const scrollW = firstChild ? firstChild.scrollWidth : cellEl.scrollWidth;
          if (scrollW > maxCandidateWidth) {
            maxCandidateWidth = scrollW;
          }
        }
      }
    }

    const cellPadding = 20; // 8px left + 8px right + 4px breathing room
    return Math.ceil(maxCandidateWidth + cellPadding);
  }

  /**
   * Calculates the auto-sized width for a column based on header and cell content.
   */
  static calculateColumnAutoWidth({
    datagridColumn,
    datagridApi,
    skipHeader = false,
    additionalPadding = 0,
    maxSampleRows = 100
  }: {
    datagridColumn: IAcDatagridColumn;
    datagridApi: AcDatagridApi;
    skipHeader?: boolean;
    additionalPadding?: number;
    maxSampleRows?: number;
  }): number {
    const minWidth = datagridColumn.columnDefinition.minWidth ?? 40;
    const maxWidth = datagridColumn.columnDefinition.maxWidth ?? 1200;

    let targetWidth = 0;
    if (!skipHeader) {
      targetWidth = Math.max(targetWidth, this.measureHeaderWidth({ datagridColumn, datagridApi }));
    }

    const contentWidth = this.measureContentWidth({ datagridColumn, datagridApi, maxSampleRows });
    targetWidth = Math.max(targetWidth, contentWidth);
    targetWidth += additionalPadding;

    return Math.max(minWidth, Math.min(maxWidth, targetWidth));
  }

  /**
   * Calculates flexible column widths and fill-available-width distributions.
   * Handles both explicit column flex (flexSize) and grid-wide proportional fit (fillAvailableWidth / sizeColumnsToFit)
   * with iterative min/max constraint clamping.
   */
  static calculateFlexAndFillWidths({
    datagridApi,
    fillAvailableWidth,
    options
  }: {
    datagridApi: AcDatagridApi;
    fillAvailableWidth: boolean;
    options?: IAcDatagridSizeColumnsToFitOptions;
  }): { datagridColumn: IAcDatagridColumn; width: number }[] {
    const visibleCols = datagridApi.datagridColumns.filter(c => c.visible);
    if (visibleCols.length === 0) return [];

    const containerEl = datagridApi.datagrid?.containerElement;
    const containerWidth = containerEl?.clientWidth || datagridApi.bodyWidth || 0;
    if (containerWidth <= 0) return [];

    const internalColWidth = datagridApi.getInternalColumnWidth();
    const bodyEl = datagridApi.datagrid?.datagridBody;
    const scrollbarWidth = bodyEl ? Math.max(0, bodyEl.offsetWidth - bodyEl.clientWidth) : 0;
    const availableWidth = Math.max(0, containerWidth - internalColWidth - scrollbarWidth);

    // 1. Check if any columns have explicit flexSize
    const flexCols = visibleCols.filter(c => {
      const flex = c.columnDefinition.flex ?? c.columnDefinition.flexSize ?? c.flexSize;
      return typeof flex === 'number' && flex > 0;
    });

    const hasExplicitFlex = flexCols.length > 0;

    if (hasExplicitFlex) {
      return this.allocateExplicitFlexWidths({
        visibleCols,
        flexCols,
        availableWidth
      });
    }

    // 2. If fillAvailableWidth is enabled or sizeColumnsToFit was called, proportionally fit all columns
    if (fillAvailableWidth || options) {
      return this.allocateProportionalFitWidths({
        visibleCols,
        availableWidth,
        options
      });
    }

    return [];
  }

  /**
   * Allocates remaining space to columns with explicit flexSize.
   */
  private static allocateExplicitFlexWidths({
    visibleCols,
    flexCols,
    availableWidth
  }: {
    visibleCols: IAcDatagridColumn[];
    flexCols: IAcDatagridColumn[];
    availableWidth: number;
  }): { datagridColumn: IAcDatagridColumn; width: number }[] {
    const nonFlexCols = visibleCols.filter(c => !flexCols.includes(c));
    let fixedWidthTotal = 0;
    for (const c of nonFlexCols) {
      fixedWidthTotal += c.width;
    }

    let remainingSpace = Math.max(0, availableWidth - fixedWidthTotal);
    let activeFlexCols = [...flexCols];
    const finalWidths = new Map<string, number>();

    // Iterative clamping loop (max 4 passes)
    for (let pass = 0; pass < 4 && activeFlexCols.length > 0; pass++) {
      let totalFlex = 0;
      for (const c of activeFlexCols) {
        const flex = c.columnDefinition.flex ?? c.columnDefinition.flexSize ?? c.flexSize ?? 1;
        totalFlex += flex;
      }
      if (totalFlex <= 0) break;

      const clampedCols: IAcDatagridColumn[] = [];
      const unclampedCols: IAcDatagridColumn[] = [];

      for (const col of activeFlexCols) {
        const flex = col.columnDefinition.flex ?? col.columnDefinition.flexSize ?? col.flexSize ?? 1;
        const allocated = Math.floor((flex / totalFlex) * remainingSpace);
        const minW = col.columnDefinition.minWidth ?? 40;
        const maxW = col.columnDefinition.maxWidth ?? 1200;

        if (allocated < minW) {
          finalWidths.set(col.columnId, minW);
          clampedCols.push(col);
        } else if (allocated > maxW) {
          finalWidths.set(col.columnId, maxW);
          clampedCols.push(col);
        } else {
          unclampedCols.push(col);
        }
      }

      if (clampedCols.length > 0) {
        for (const col of clampedCols) {
          remainingSpace = Math.max(0, remainingSpace - (finalWidths.get(col.columnId) || 0));
        }
        activeFlexCols = unclampedCols;
      } else {
        // Converged: allocate exactly and distribute remainder
        let distributed = 0;
        for (let i = 0; i < activeFlexCols.length; i++) {
          const col = activeFlexCols[i];
          const flex = col.columnDefinition.flex ?? col.columnDefinition.flexSize ?? col.flexSize ?? 1;
          let w = Math.floor((flex / totalFlex) * remainingSpace);
          const minW = col.columnDefinition.minWidth ?? 40;
          const maxW = col.columnDefinition.maxWidth ?? 1200;
          w = Math.max(minW, Math.min(maxW, w));
          finalWidths.set(col.columnId, w);
          distributed += w;
        }

        // Give rounding remainder to the last flexible column if within bounds
        const remainder = remainingSpace - distributed;
        if (remainder > 0 && activeFlexCols.length > 0) {
          const lastCol = activeFlexCols[activeFlexCols.length - 1];
          const curW = finalWidths.get(lastCol.columnId) || 0;
          const maxW = lastCol.columnDefinition.maxWidth ?? 1200;
          if (curW + remainder <= maxW) {
            finalWidths.set(lastCol.columnId, curW + remainder);
          }
        }
        break;
      }
    }

    // Ensure all flex columns have a resolved width (at least minWidth)
    for (const col of flexCols) {
      if (!finalWidths.has(col.columnId)) {
        finalWidths.set(col.columnId, col.columnDefinition.minWidth ?? 40);
      }
    }

    const updates: { datagridColumn: IAcDatagridColumn; width: number }[] = [];
    for (const col of flexCols) {
      const calculated = finalWidths.get(col.columnId);
      if (calculated !== undefined && calculated !== col.width) {
        updates.push({ datagridColumn: col, width: calculated });
      }
    }
    return updates;
  }

  /**
   * Proportionally fits all eligible columns to fill available container width.
   */
  private static allocateProportionalFitWidths({
    visibleCols,
    availableWidth,
    options
  }: {
    visibleCols: IAcDatagridColumn[];
    availableWidth: number;
    options?: IAcDatagridSizeColumnsToFitOptions;
  }): { datagridColumn: IAcDatagridColumn; width: number }[] {
    const eligibleCols = visibleCols.filter(c => !c.columnDefinition.suppressSizeToFit && !c.suppressSizeToFit);
    const suppressedCols = visibleCols.filter(c => c.columnDefinition.suppressSizeToFit || c.suppressSizeToFit);

    if (eligibleCols.length === 0) return [];

    let fixedTotal = 0;
    for (const c of suppressedCols) {
      fixedTotal += c.width;
    }

    let targetSpace = Math.max(0, availableWidth - fixedTotal);
    let activeCols = [...eligibleCols];
    const finalWidths = new Map<string, number>();

    // Iterative clamping
    for (let pass = 0; pass < 4 && activeCols.length > 0; pass++) {
      let currentTotal = 0;
      for (const c of activeCols) {
        currentTotal += c.width || 100;
      }
      if (currentTotal <= 0) break;

      const ratio = targetSpace / currentTotal;
      const clampedCols: IAcDatagridColumn[] = [];
      const unclampedCols: IAcDatagridColumn[] = [];

      for (const col of activeCols) {
        const colLimits = options?.columnLimits?.[col.columnKey] || options?.columnLimits?.[col.columnDefinition.field];
        const minW = colLimits?.minWidth ?? col.columnDefinition.minWidth ?? options?.defaultMinWidth ?? 40;
        const maxW = colLimits?.maxWidth ?? col.columnDefinition.maxWidth ?? options?.defaultMaxWidth ?? 1200;

        const calculated = Math.floor((col.width || 100) * ratio);

        if (calculated < minW) {
          finalWidths.set(col.columnId, minW);
          clampedCols.push(col);
        } else if (calculated > maxW) {
          finalWidths.set(col.columnId, maxW);
          clampedCols.push(col);
        } else {
          unclampedCols.push(col);
        }
      }

      if (clampedCols.length > 0) {
        for (const col of clampedCols) {
          targetSpace = Math.max(0, targetSpace - (finalWidths.get(col.columnId) || 0));
        }
        activeCols = unclampedCols;
      } else {
        let distributed = 0;
        for (let i = 0; i < activeCols.length; i++) {
          const col = activeCols[i];
          const colLimits = options?.columnLimits?.[col.columnKey] || options?.columnLimits?.[col.columnDefinition.field];
          const minW = colLimits?.minWidth ?? col.columnDefinition.minWidth ?? options?.defaultMinWidth ?? 40;
          const maxW = colLimits?.maxWidth ?? col.columnDefinition.maxWidth ?? options?.defaultMaxWidth ?? 1200;
          let w = Math.floor((col.width || 100) * ratio);
          w = Math.max(minW, Math.min(maxW, w));
          finalWidths.set(col.columnId, w);
          distributed += w;
        }

        const remainder = targetSpace - distributed;
        if (remainder > 0 && activeCols.length > 0) {
          const lastCol = activeCols[activeCols.length - 1];
          const curW = finalWidths.get(lastCol.columnId) || 0;
          finalWidths.set(lastCol.columnId, curW + remainder);
        }
        break;
      }
    }

    // Ensure all eligible columns have a resolved width
    for (const col of eligibleCols) {
      if (!finalWidths.has(col.columnId)) {
        finalWidths.set(col.columnId, col.columnDefinition.minWidth ?? 40);
      }
    }

    const updates: { datagridColumn: IAcDatagridColumn; width: number }[] = [];
    for (const col of eligibleCols) {
      const calculated = finalWidths.get(col.columnId);
      if (calculated !== undefined && calculated !== col.width) {
        updates.push({ datagridColumn: col, width: calculated });
      }
    }
    return updates;
  }
}
