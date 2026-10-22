/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AcDataManagerPerf
 * =================
 * Lightweight performance observability for AcDataManager.
 *
 * Usage:
 *   const perf = new AcDataManagerPerf({ dataManager, label: 'MyGrid' });
 *   perf.enable();          // start monitoring
 *   perf.disable();         // stop monitoring
 *   perf.getReport();       // returns last N operation timings
 *   perf.reset();           // clear collected timings
 *
 * Configuration:
 *   warnThresholdMs  — operations longer than this are logged as warnings  (default 16ms)
 *   errorThresholdMs — operations longer than this are logged as errors    (default 100ms)
 *   maxHistory       — number of timing records to keep in memory          (default 200)
 *   silent           — suppress all console output (still keeps history)   (default false)
 *
 * Zero production overhead: all instrumentation is guarded by the `enabled` flag and
 * uses `performance.now()` which is available in all modern browsers and Node ≥ 16.
 */

import { AcDataManager } from './ac-data-manager';
import { AC_DATA_MANAGER_HOOK } from '../consts/ac-data-manager-hook.const';

export interface IAcDataManagerPerfRecord {
  operation: string;
  durationMs: number;
  rowCount: number;
  timestamp: number;
  warning: boolean;
  error: boolean;
}

export interface IAcDataManagerPerfOptions {
  dataManager: AcDataManager;
  /** Label shown in console output, e.g. the grid name */
  label?: string;
  /** Operations longer than this (ms) are logged as console.warn. Default: 16 */
  warnThresholdMs?: number;
  /** Operations longer than this (ms) are logged as console.error. Default: 100 */
  errorThresholdMs?: number;
  /** Max timing records kept in memory. Default: 200 */
  maxHistory?: number;
  /** Suppress console output. History is still collected. Default: false */
  silent?: boolean;
}

export class AcDataManagerPerf {
  private dataManager: AcDataManager;
  private label: string;
  private warnThresholdMs: number;
  private errorThresholdMs: number;
  private maxHistory: number;
  private silent: boolean;

  private _enabled: boolean = false;
  private _history: IAcDataManagerPerfRecord[] = [];
  private _hookIds: string[] = [];

  constructor(options: IAcDataManagerPerfOptions) {
    this.dataManager = options.dataManager;
    this.label = options.label ?? 'DataManager';
    this.warnThresholdMs = options.warnThresholdMs ?? 16;
    this.errorThresholdMs = options.errorThresholdMs ?? 100;
    this.maxHistory = options.maxHistory ?? 200;
    this.silent = options.silent ?? false;
  }

  get enabled(): boolean { return this._enabled; }

  /** Begin instrumenting the data manager. Safe to call multiple times. */
  enable(): void {
    if (this._enabled) return;
    this._enabled = true;
    this._attachHooks();
  }

  /** Stop instrumenting. Cleans up all hook subscriptions. */
  disable(): void {
    if (!this._enabled) return;
    this._enabled = false;
    this._detachHooks();
  }

  /** Returns a copy of the collected timing history. */
  getReport(): IAcDataManagerPerfRecord[] {
    return [...this._history];
  }

  /** Returns a human-readable summary of slowest operations. */
  getSummary(): string {
    if (this._history.length === 0) return `[${this.label}] No perf data collected.`;
    const sorted = [...this._history].sort((a, b) => b.durationMs - a.durationMs);
    const lines = sorted.slice(0, 10).map(r =>
      `  ${r.operation.padEnd(20)} ${r.durationMs.toFixed(2).padStart(8)}ms  rows=${r.rowCount}`
    );
    return `[${this.label}] Top slow operations (last ${this._history.length} samples):\n${lines.join('\n')}`;
  }

  /** Clear collected timing history. */
  reset(): void {
    this._history = [];
  }

  destroy(): void {
    this.disable();
    this._history = [];
    (this.dataManager as any) = null;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private _record(operation: string, durationMs: number): void {
    const rowCount = this.dataManager?.allRows?.length ?? 0;
    const isError = durationMs >= this.errorThresholdMs;
    const isWarn = !isError && durationMs >= this.warnThresholdMs;

    const record: IAcDataManagerPerfRecord = {
      operation,
      durationMs,
      rowCount,
      timestamp: Date.now(),
      warning: isWarn,
      error: isError,
    };

    this._history.push(record);
    if (this._history.length > this.maxHistory) {
      this._history.shift();
    }

    if (!this.silent) {
      const msg = `[${this.label}] ${operation} took ${durationMs.toFixed(2)}ms (rows=${rowCount})`;
      if (isError) {
        console.error(`🔴 SLOW: ${msg}`);
      } else if (isWarn) {
        console.warn(`🟡 SLOW: ${msg}`);
      }
      // Fast operations are silent — no log spam
    }
  }

  private _time(operation: string, fn: () => void): void {
    const t0 = performance.now();
    fn();
    this._record(operation, performance.now() - t0);
  }

  private _attachHooks(): void {
    const dm = this.dataManager;

    // Instrument processRows (applyFilter + applySort)
    const id1 = dm.hooks.subscribe({
      hook: AC_DATA_MANAGER_HOOK.DisplayedRowsChange,
      callback: () => {
        // DisplayedRowsChange fires at end of processRows — measure total cycle
        // We can't wrap processRows directly from outside, so we log the hook timing
        // as a proxy. The hook fires synchronously after sort/filter completes.
        // To get accurate timing we patch processRows on the instance.
      }
    });

    // Patch key methods directly on the instance for precise measurement
    this._patchMethod('processRows', 'processRows');
    this._patchMethod('setRows', 'setRows');
    this._patchMethod('addRow', 'addRow');
    this._patchMethod('deleteRow', 'deleteRow');
    this._patchMethod('updateRow', 'updateRow');
    this._patchMethod('refreshRows', 'refreshRows');

    // Unregister DisplayedRowsChange hook we created (we use patching instead)
    dm.hooks.unsubscribe({ subscriptionId: id1 });
  }

  private _detachHooks(): void {
    // Restore patched methods
    this._restoreMethod('processRows');
    this._restoreMethod('setRows');
    this._restoreMethod('addRow');
    this._restoreMethod('deleteRow');
    this._restoreMethod('updateRow');
    this._restoreMethod('refreshRows');
  }

  private _originals: Map<string, Function> = new Map();

  private _patchMethod(methodName: string, label: string): void {
    const dm = this.dataManager as any;
    const orig = dm[methodName];
    if (typeof orig !== 'function' || this._originals.has(methodName)) return;
    this._originals.set(methodName, orig);
    const self = this;
    dm[methodName] = function (this: any, ...args: any[]) {
      const t0 = performance.now();
      const result = orig.apply(this, args);
      // Handle async methods (processRows, refreshRows return Promise)
      if (result && typeof result.then === 'function') {
        return result.then((val: any) => {
          self._record(label, performance.now() - t0);
          return val;
        });
      }
      self._record(label, performance.now() - t0);
      return result;
    };
  }

  private _restoreMethod(methodName: string): void {
    const dm = this.dataManager as any;
    const orig = this._originals.get(methodName);
    if (orig) {
      dm[methodName] = orig;
      this._originals.delete(methodName);
    }
  }
}
