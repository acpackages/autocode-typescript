/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { AcDispatchResult } from '../models/ac-dispatch-result.model';
import { AcEventExecutionResult } from '../models/ac-event-execution-result.model';
import { acNullifyInstanceProperties } from '../utils/ac-utility-functions';
import { Autocode } from './autocode';

export class AcEvents {
  // Map<lowercaseEventName, Map<subscriptionId, callback>>
  private events = new Map<string, Map<string, Function>>();

  // Phase 4 (Task 4.1): Reverse index for O(1) unsubscribe by subscriptionId.
  // Maps subscriptionId → eventName so we can locate the correct inner map instantly.
  private _subToEvent = new Map<string, string>();

  // Phase 4 (Task 4.3): Replaced the generic internalEvents Map<string, Map<string, Function>>
  // (which only ever held 'beforeexecute') with a dedicated flat Map. Eliminates a nested
  // map lookup and loop inside execute() for the common case of no beforeExecute listeners.
  private _beforeExecuteCallbacks = new Map<string, Function>();

  // Map<subscriptionId, callback> for "all events" listeners
  private allEventCallbacks = new Map<string, Function>();

  /** Clear all subscriptions (useful for hot-reload, tests, cleanup) */
  clearSubscriptions() {
    this.events.clear();
    this.allEventCallbacks.clear();
    this._subToEvent.clear();
    this._beforeExecuteCallbacks.clear();
  }

  destroy() {
    acNullifyInstanceProperties({ instance: this });
  }

  /**
   * Execute an event and collect results.
   *
   * Phase 3 (Task 3.3): Returns a shared frozen sentinel (AcDispatchResult.EMPTY)
   * when there are zero subscribers — zero allocations on the fast path.
   */
  execute({ event, args }: { event: string; args?: any }): AcEventExecutionResult {
    const name = event.toLowerCase();

    // ── Zero-subscriber fast path (Phase 3) ───────────────────────────────────
    const specific = this.events.get(name);
    const hasListeners =
      (specific !== undefined && specific.size > 0) ||
      this.allEventCallbacks.size > 0 ||
      this._beforeExecuteCallbacks.size > 0;

    if (!hasListeners) return AcDispatchResult.EMPTY as AcEventExecutionResult;
    // ──────────────────────────────────────────────────────────────────────────

    const result = new AcEventExecutionResult();
    // Phase 2 (Task 2.3): boolean flag instead of Object.keys() allocation
    let hasResults = false;
    const functionResults: Record<string, any> = {};

    try {
      // Phase 4 (Task 4.3): direct map, no nested lookup
      if (this._beforeExecuteCallbacks.size > 0) {
        for (const callback of this._beforeExecuteCallbacks.values()) {
          try {
            callback({ event: name, args });
          } catch (ex: any) {
            console.error(`beforeExecute internal handler failed:`, ex);
          }
        }
      }

      // Execute specific event listeners
      if (specific) {
        for (const [subId, callback] of specific.entries()) {
          try {
            // Phase 2 (Task 2.2): typeof guard removed — Map<string, Function> already typed
            const res = callback(args);
            if (res instanceof AcEventExecutionResult && res.status === 'success') {
              functionResults[subId] = res;
              hasResults = true; // Phase 2 (Task 2.3)
            }
          } catch (ex: any) {
            console.error(`Event handler failed [${name}] (id: ${subId}):`, ex);
          }
        }
      }

      // Execute "all events" listeners
      for (const [subId, callback] of this.allEventCallbacks.entries()) {
        try {
          // Phase 2 (Task 2.2): typeof guard removed
          const res = callback(name, args);
          if (res instanceof AcEventExecutionResult && res.status === 'success') {
            functionResults[subId] = res;
            hasResults = true; // Phase 2 (Task 2.3)
          }
        } catch (ex: any) {
          console.error(`Global event handler failed (id: ${subId}):`, ex);
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
      console.error('Critical error in AcEvents.execute():', ex);
    }
    // Phase 1 (Task 1.2): removed (args as any) = null — was a no-op (local param reassignment)
    return result;
  }

  /**
   * Subscribe to the beforeExecute internal lifecycle event.
   * Phase 4 (Task 4.3): now backed by _beforeExecuteCallbacks directly.
   * @returns subscriptionId
   */
  on({ event, callback }: { event: string; callback: Function }): string {
    // Only 'beforeexecute' is supported as an internal event
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
   * Subscribe to a specific event.
   * Phase 4 (Task 4.1): also registers in _subToEvent reverse index.
   * @returns subscriptionId — use this to unsubscribe
   */
  subscribe({ event, callback }: { event: string; callback: Function }): string {
    const name = event.toLowerCase();
    let eventMap = this.events.get(name);
    if (!eventMap) {
      eventMap = new Map<string, Function>();
      this.events.set(name, eventMap);
    }

    const subscriptionId = Autocode.uniqueId();
    eventMap.set(subscriptionId, callback);
    this._subToEvent.set(subscriptionId, name); // Phase 4: reverse index
    return subscriptionId;
  }

  /**
   * Subscribe to ALL events.
   * @returns subscriptionId
   */
  subscribeAllEvents({ callback }: { callback: Function }): string {
    const subscriptionId = Autocode.uniqueId();
    this.allEventCallbacks.set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe using subscriptionId (recommended & safe).
   * Phase 4 (Task 4.1): O(1) via reverse index when subscriptionId is provided.
   * Phase 2 (Task 2.4): (hook, callback) path now deletes directly from the correct map.
   */
  unsubscribe({ event, callback, subscriptionId, subscriptionIds }: {
    event?: string;
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
    if (event && callback) {
      const name = event.toLowerCase();
      const eventMap = this.events.get(name);
      if (eventMap) {
        for (const [id, cb] of eventMap.entries()) {
          if (cb === callback) {
            eventMap.delete(id);
            this._subToEvent.delete(id); // keep reverse index consistent
            return true;
          }
        }
      }
      return false;
    }

    if (!subscriptionId) return false;

    // Phase 4 (Task 4.1): O(1) reverse-index lookup
    const eventName = this._subToEvent.get(subscriptionId);
    if (eventName !== undefined) {
      const removed = this.events.get(eventName)?.delete(subscriptionId) ?? false;
      if (removed) this._subToEvent.delete(subscriptionId);
      return removed;
    }

    // Fallback: scan allEventCallbacks (not indexed)
    return this.allEventCallbacks.delete(subscriptionId);
  }

  /**
   * Unsubscribe from all-events listeners (global only).
   */
  unsubscribeAllEvents({ callback, subscriptionId }: { callback?: Function; subscriptionId?: string } = {}): boolean {
    if (callback) {
      for (const [id, cb] of this.allEventCallbacks.entries()) {
        if (cb === callback) {
          subscriptionId = id;
          break;
        }
      }
    }
    if (!subscriptionId) return false;
    return this.allEventCallbacks.delete(subscriptionId);
  }

  /**
   * Remove entire event and all its listeners.
   */
  removeEvent({ event }: { event: string }): void {
    const name = event.toLowerCase();
    const eventMap = this.events.get(name);
    if (eventMap) {
      // Clean up reverse index entries for this event
      for (const subId of eventMap.keys()) {
        this._subToEvent.delete(subId);
      }
    }
    this.events.delete(name);
  }

  /**
   * (Debug) Get current subscription count.
   */
  getSubscriptionCount(): { total: number; perEvent: Record<string, number>; allEvents: number } {
    const perEvent: Record<string, number> = {};
    let total = 0;

    for (const [event, map] of this.events.entries()) {
      perEvent[event] = map.size;
      total += map.size;
    }

    return {
      total: total + this.allEventCallbacks.size,
      perEvent,
      allEvents: this.allEventCallbacks.size,
    };
  }
}
