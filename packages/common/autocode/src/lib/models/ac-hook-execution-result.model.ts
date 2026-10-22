/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDispatchResult } from './ac-dispatch-result.model';

/**
 * AcHookExecutionResult
 * Re-parented onto AcDispatchResult (Phase 3) to eliminate the heavy AcResult
 * base class (two arrays + AcLogger + serialisation overhead) from every dispatch call.
 * Static key constants are kept for backward compatibility.
 */
export class AcHookExecutionResult extends AcDispatchResult {
  static readonly KeyContinueOperation = 'continueOperation';
  static readonly KeyHasResults = 'hasResults';
  static readonly KeyResults = 'results';
}
