/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { AcDispatchResult } from '../models/ac-dispatch-result.model';
import { AcHookExecutionResult } from '../models/ac-hook-execution-result.model';
import { acNullifyInstanceProperties } from '../utils/ac-utility-functions';
import { Autocode } from './autocode';

export class AcHooks {
  // Map<lowercaseHookName, Map<subscriptionId, callback>>
  private hooks = new Map<string, Map<string, Function>>();

  // Phase 4 (Task 4.2): Reverse index for O(1) unsubscribe by subscriptionId.
  private _subToHook = new Map<string, string>();

  // Phase 4 (Task 4.3): Replaced nested internalEvents map with a dedicated flat map.
  private _beforeExecuteCallbacks = new Map<string, Function>();

  // Global ("all hooks") listeners: subscriptionId → callback
  private allHookCallbacks = new Map<string, Function>();

  /** Clear all hook subscriptions (e.g. hot reload, tests, cleanup) */
  clearSubscriptions() {
    this.hooks.clear();
    this.allHookCallbacks.clear();
    this._subToHook.clear();
    this._beforeExecuteCallbacks.clear();
  }

  destroy() {
    acNullifyInstanceProperties({ instance: this });
  }

  hasSubscribers({ hook }: { hook: string }): boolean {
    const name = hook.toLowerCase();
    const hookListeners = this.hooks.get(name);
    return (hookListeners !== undefined && hookListeners.size > 0) || this.allHookCallbacks.size > 0;
  }

  /**
   * Execute a hook with arguments.
   * Hook handlers can return AcHookExecutionResult or any value.
   * If any handler sets .continueOperation = false → execution stops early.
   *
   * Phase 3 (Task 3.3): Returns AcDispatchResult.EMPTY (frozen sentinel) when
   * there are zero subscribers — zero allocations on the fast path.
   */
  execute({ hook, args = [] }: { hook: string; args?: any }): AcHookExecutionResult {
    const name = hook.toLowerCase();

    // ── Zero-subscriber fast path (Phase 3) ───────────────────────────────────
    const hookListeners = this.hooks.get(name);
    const hasListeners =
      (hookListeners !== undefined && hookListeners.size > 0) ||
      this.allHookCallbacks.size > 0 ||
      this._beforeExecuteCallbacks.size > 0;

    if (!hasListeners) return AcDispatchResult.EMPTY as AcHookExecutionResult;
    // ──────────────────────────────────────────────────────────────────────────

    const result = new AcHookExecutionResult();
    // Phase 2 (Task 2.3): boolean flag instead of Object.keys() allocation
    let hasResults = false;
    const functionResults: Record<string, any> = {};
    let continueOperation = true;

    try {
      // Phase 4 (Task 4.3): direct map, no nested lookup
      if (this._beforeExecuteCallbacks.size > 0) {
        for (const callback of this._beforeExecuteCallbacks.values()) {
          try {
            callback({ hook: name, args });
          } catch (ex: any) {
            console.error(`beforeExecute internal handler failed:`, ex);
          }
        }
      }

      // Execute specific hook listeners
      if (hookListeners) {
        for (const [subId, callback] of hookListeners.entries()) {
          if (!continueOperation) break;

          try {
            // Phase 2 (Task 2.2): typeof guard removed — Map<string, Function> already typed
            const res = callback(args);

            if (res !== undefined && res !== null) {
              functionResults[subId] = res;
              hasResults = true; // Phase 2 (Task 2.3)

              // Support both AcHookExecutionResult and plain objects
              const isFailure = typeof (res as any).isFailure === 'function' && (res as any).isFailure();
              const shouldStop = (res as any).continueOperation === false;

              if (isFailure || shouldStop) {
                continueOperation = false;
                result.continueOperation = false;
              }
            }
          } catch (ex: any) {
            console.error(`Hook handler failed [${name}] (id: ${subId}):`, ex);
          }
        }
      }

      // Execute global ("all hooks") listeners
      for (const [subId, callback] of this.allHookCallbacks.entries()) {
        if (!continueOperation) break;

        try {
          // Phase 2 (Task 2.2): typeof guard removed
          const res = callback(name, args);

          if (res !== undefined && res !== null) {
            functionResults[subId] = res;
            hasResults = true; // Phase 2 (Task 2.3)

            const isFailure = typeof (res as any).isFailure === 'function' && (res as any).isFailure();
            const shouldStop = (res as any).continueOperation === false;

            if (isFailure || shouldStop) {
              continueOperation = false;
              result.continueOperation = false;
            }
          }
        } catch (ex: any) {
          console.error(`Global hook handler failed (id: ${subId}):`, ex);
        }
      }

      // Phase 2 (Task 2.3): boolean flag — no Object.keys() array allocation
      if (hasResults) {
        result.hasResults = true;
        result.results = functionResults;
      }

      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex });
      console.error('Critical error in AcHooks.execute():', ex);
    }
    // Phase 1 (Task 1.2): removed (args as any) = null — was a no-op
    return result;
  }

  /**
   * Subscribe to the beforeExecute internal lifecycle event.
   * Phase 4 (Task 4.3): now backed by _beforeExecuteCallbacks directly.
   * @returns subscriptionId
   */
  on({ event, callback }: { event: string; callback: Function }): string {
    const id = Autocode.uniqueId();
    if (event.toLowerCase() === 'beforeexecute') {
      this._beforeExecuteCallbacks.set(id, callback);
    }
    return id;
  }

  /**
   * Unsubscribe from the beforeExecute internal event.
   * @returns true if something was removed
   */
  off({
    event,
    callback,
    subscriptionId,
  }: {
    event?: string;
    callback?: Function;
    subscriptionId?: string;
  }): boolean {
    if (subscriptionId) {
      return this._beforeExecuteCallbacks.delete(subscriptionId);
    }
    if (callback) {
      for (const [id, cb] of this._beforeExecuteCallbacks.entries()) {
        if (cb === callback) {
          this._beforeExecuteCallbacks.delete(id);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Subscribe to a specific hook.
   * Phase 4 (Task 4.2): also registers in _subToHook reverse index.
   * @returns subscriptionId — save this to unsubscribe later!
   */
  subscribe({ hook, callback }: { hook: string; callback: Function }): string {
    const name = hook.toLowerCase();

    let hookMap = this.hooks.get(name);
    if (!hookMap) {
      hookMap = new Map<string, Function>();
      this.hooks.set(name, hookMap);
    }

    const subscriptionId = Autocode.uniqueId();
    hookMap.set(subscriptionId, callback);
    this._subToHook.set(subscriptionId, name); // Phase 4: reverse index
    return subscriptionId;
  }

  /**
   * Subscribe to ALL hooks (receives hook name + args).
   */
  subscribeAllHooks({ callback }: { callback: Function }): string {
    const subscriptionId = Autocode.uniqueId();
    this.allHookCallbacks.set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe using subscriptionId (only reliable way).
   * Phase 4 (Task 4.2): O(1) via reverse index when subscriptionId is provided.
   * Phase 2 (Task 2.4): (hook, callback) path now deletes directly from the correct map.
   */
  unsubscribe({ hook, callback, subscriptionId, subscriptionIds }: {
    hook?: string;
    callback?: Function;
    subscriptionId?: string;
    subscriptionIds?: string[];
  }): boolean {
    if (subscriptionIds && subscriptionIds.length > 0) {
      for (const id of subscriptionIds) {
        this.unsubscribe({ subscriptionId: id });
      }
      return true;
    }

    // Phase 2 (Task 2.4): direct delete — no second scan loop
    if (hook && callback) {
      const name = hook.toLowerCase();
      const hookMap = this.hooks.get(name);
      if (hookMap) {
        for (const [id, cb] of hookMap.entries()) {
          if (cb === callback) {
            hookMap.delete(id);
            this._subToHook.delete(id); // keep reverse index consistent
            return true;
          }
        }
      }
      return false;
    }

    if (!subscriptionId) return false;

    // Phase 4 (Task 4.2): O(1) reverse-index lookup
    const hookName = this._subToHook.get(subscriptionId);
    if (hookName !== undefined) {
      const removed = this.hooks.get(hookName)?.delete(subscriptionId) ?? false;
      if (removed) this._subToHook.delete(subscriptionId);
      return removed;
    }

    // Fallback: scan allHookCallbacks (not indexed)
    return this.allHookCallbacks.delete(subscriptionId);
  }

  unsubscribeAllHooks({ callback, subscriptionId }: { callback?: Function; subscriptionId?: string } = {}): boolean {
    if (callback) {
      for (const [id, cb] of this.allHookCallbacks.entries()) {
        if (cb === callback) {
          subscriptionId = id;
          break;
        }
      }
    }
    if (!subscriptionId) return false;
    return this.allHookCallbacks.delete(subscriptionId);
  }

  /**
   * Remove an entire hook and all its listeners.
   */
  removeHook({ hook }: { hook: string }): void {
    const name = hook.toLowerCase();
    const hookMap = this.hooks.get(name);
    if (hookMap) {
      // Clean up reverse index entries for this hook
      for (const subId of hookMap.keys()) {
        this._subToHook.delete(subId);
      }
    }
    this.hooks.delete(name);
  }

  /**
   * Debug: Get subscription stats.
   */
  getSubscriptionCount(): {
    total: number;
    perHook: Record<string, number>;
    allHooks: number;
  } {
    const perHook: Record<string, number> = {};
    let total = 0;

    for (const [hookName, map] of this.hooks.entries()) {
      perHook[hookName] = map.size;
      total += map.size;
    }

    return {
      total: total + this.allHookCallbacks.size,
      perHook,
      allHooks: this.allHookCallbacks.size,
    };
  }
}

/** Global singleton */
export const acHooks = new AcHooks();
