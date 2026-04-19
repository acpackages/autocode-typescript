/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { AcHookExecutionResult } from "../models/ac-hook-execution-result.model";
import { acNullifyInstanceProperties } from "../utils/ac-utility-functions";
import { Autocode } from "./autocode";

export class AcHooks {
  // Map<lowercaseHookName, Map<subscriptionId, callback>>
  private hooks = new Map<string, Map<string, Function>>();
  private internalEvents = new Map<string, Map<string, Function>>();

  // Global ("all hooks") listeners: subscriptionId → callback
  private allHookCallbacks = new Map<string, Function>();

  /** Clear all hook subscriptions (e.g. hot reload, tests, cleanup) */
  clearSubscriptions() {
    this.hooks.clear();
    this.allHookCallbacks.clear();
  }

  destroy(){
    acNullifyInstanceProperties({instance:this});
  }

  hasSubscribers({ hook }: { hook: string }): boolean {
    const name = hook.toLowerCase();
    const hookListeners = this.hooks.get(name);
    return (hookListeners && hookListeners.size > 0) || this.allHookCallbacks.size > 0;
  }

  /**
   * Execute a hook with arguments
   * Hook handlers can return AcHookExecutionResult or any value
   * If any handler sets .continueOperation = false → execution stops early
   */
  execute({ hook, args = [] }: { hook: string; args?: any }): AcHookExecutionResult {
    const result = new AcHookExecutionResult();
    const name = hook.toLowerCase();
    const functionResults: Record<string, any> = {};
    let continueOperation = true;
    try {
      const beforeListeners = this.internalEvents.get("beforeexecute");
      if (beforeListeners) {
        for (const callback of beforeListeners.values()) {
          try {
            callback({ hook: name, args });
          } catch (ex: any) {
            console.error(`beforeExecute internal handler failed:`, ex);
          }
        }
      }

      // Execute specific hook listeners
      const hookListeners = this.hooks.get(name);
      if (hookListeners) {
        for (const [subId, callback] of hookListeners.entries()) {
          if (!continueOperation) break;

          try {
            if(typeof callback == 'function'){
            const res = callback(args);

            if (res !== undefined && res !== null) {
              functionResults[subId] = res;

              // Support both AcHookExecutionResult and plain objects
              const isFailure = typeof (res as any).isFailure === "function" && (res as any).isFailure();
              const shouldStop = (res as any).continueOperation === false;

              if (isFailure || shouldStop) {
                continueOperation = false;
                result.continueOperation = false;
              }
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
          if(typeof callback == 'function'){
          const res = callback(name, args);

          if (res !== undefined && res !== null) {
            functionResults[subId] = res;

            const isFailure = typeof (res as any).isFailure === "function" && (res as any).isFailure();
            const shouldStop = (res as any).continueOperation === false;

            if (isFailure || shouldStop) {
              continueOperation = false;
              result.continueOperation = false;
            }
          }
        }
        } catch (ex: any) {
          console.error(`Global hook handler failed (id: ${subId}):`, ex);
        }
      }

      if (Object.keys(functionResults).length > 0) {
        result.hasResults = true;
        result.results = functionResults;
      }

      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex });
      console.error("Critical error in AcHooks.execute():", ex);
    }
    (args as any) = null;
    return result;
  }

  /**
   * Subscribe to an internal event (e.g., "beforeexecute")
   * @returns subscriptionId
   */
  on({ event, callback }: { event: string; callback: Function }): string {
    const name = event.toLowerCase();
    let eventMap = this.internalEvents.get(name);
    if (!eventMap) {
      eventMap = new Map<string, Function>();
      this.internalEvents.set(name, eventMap);
    }

    const subscriptionId = Autocode.uniqueId();
    eventMap.set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from an internal event
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
    if (!subscriptionId && !event) return false;

    if (subscriptionId) {
      // Fast path: remove by ID from all internal events
      for (const map of this.internalEvents.values()) {
        if (map.delete(subscriptionId)) {
          return true;
        }
      }
      return false;
    }

    // Slower path: find by event + callback
    if (event) {
      const name = event.toLowerCase();
      const map = this.internalEvents.get(name);
      if (!map) return false;

      if (callback) {
        for (const [id, cb] of map.entries()) {
          if (cb === callback) {
            map.delete(id);
            return true;
          }
        }
      }
    }

    return false;
  }


  /**
   * Subscribe to a specific hook
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
    return subscriptionId;
  }

  /**
   * Subscribe to ALL hooks (receives hook name + args)
   */
  subscribeAllHooks({ callback }: { callback: Function }): string {
    const subscriptionId = Autocode.uniqueId();
    this.allHookCallbacks.set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe using subscriptionId (only reliable way)
   */
  unsubscribe({ hook, callback, subscriptionId, subscriptionIds }: { hook?: string; callback?: Function; subscriptionId?: string,subscriptionIds?: string[] }): boolean {
    if(subscriptionIds && subscriptionIds.length > 0){
      for(const id of subscriptionIds){
        this.unsubscribe({subscriptionId:id});
      }
      return true;
    }

    if (hook && callback) {
      const name = hook.toLowerCase();
      const hookMap = this.hooks.get(name);
      if (hookMap) {
        for (const [id, cb] of hookMap.entries()) {
          if (cb === callback) {
            subscriptionId = id;
            break;
          }
        }
      }
    }

    if (!subscriptionId) return false;

    let removed = false;

    // Remove from specific events
    for (const eventMap of this.hooks.values()) {
      if (eventMap.delete(subscriptionId)) {
        removed = true;
      }
    }


    return removed;
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
   * Remove an entire hook and all its listeners
   */
  removeHook({ hook }: { hook: string }): void {
    this.hooks.delete(hook.toLowerCase());
  }

  /**
   * Debug: Get subscription stats
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

/** Global singleton — safe now */
export const acHooks = new AcHooks();
