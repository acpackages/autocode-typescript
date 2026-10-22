/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * AcDispatchResult
 * ================
 * Lightweight result object for in-process event/hook dispatch.
 *
 * Intentionally does NOT extend AcResult — AcResult is a heavy serialisable
 * domain model (toJson, fromJson, AcLogger, log[], otherDetails[]) that is
 * designed for HTTP responses and persistence, not for high-frequency
 * in-process pub/sub. Decoupling saves two array allocations per dispatch call.
 */
export class AcDispatchResult {
  continueOperation: boolean = true;
  hasResults: boolean = false;
  results: Record<string, any> = {};
  status: 'success' | 'failure' | 'exception' = 'success';
  exception?: any;

  /**
   * Shared flyweight sentinel returned from execute() when there are zero
   * subscribers. Avoids any allocation on the fast path.
   * Callers must treat this as read-only (it is frozen).
   */
  static readonly EMPTY: Readonly<AcDispatchResult> = Object.freeze(
    new AcDispatchResult()
  );

  setSuccess(): this {
    this.status = 'success';
    return this;
  }

  setException({ exception }: { exception: any }): this {
    this.status = 'exception';
    this.exception = exception;
    return this;
  }

  isFailure(): boolean {
    return this.status === 'failure';
  }

  isSuccess(): boolean {
    return this.status === 'success';
  }
}
