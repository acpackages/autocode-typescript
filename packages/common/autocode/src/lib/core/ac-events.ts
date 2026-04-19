/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { AcEventExecutionResult } from "../models/ac-event-execution-result.model";
import { acNullifyInstanceProperties } from "../utils/ac-utility-functions";
import { AcHooks } from "./ac-hooks";
import { Autocode } from "./autocode";

interface Subscription {
  callback: Function;
}

export class AcEvents {
  // Map<lowercaseEventName, Map<subscriptionId, callback>>
  private events = new Map<string, Map<string, Function>>();
  private internalEvents = new Map<string, Map<string, Function>>();

  // Map<subscriptionId, callback> for "all events" listeners
  private allEventCallbacks = new Map<string, Function>();

  /** Clear all subscriptions (useful for hot-reload, tests, cleanup) */
  clearSubscriptions() {
    this.events.clear();
    this.allEventCallbacks.clear();
  }

  destroy() {
    acNullifyInstanceProperties({ instance: this });
  }

  /**
   * Execute an event and collect results
   */
  execute({ event, args }: { event: string; args?: any }): AcEventExecutionResult {
    const result = new AcEventExecutionResult();
    const name = event.toLowerCase();
    const functionResults: Record<string, AcEventExecutionResult> = {};
    try {
      const beforeListeners = this.internalEvents.get("beforeexecute");
      if (beforeListeners) {
        for (const callback of beforeListeners.values()) {
          try {
            callback({ event: name, args });
          } catch (ex: any) {
            console.error(`beforeExecute internal handler failed:`, ex);
          }
        }
      }
      // Execute specific event listeners
      const eventListeners = this.events.get(name);
      if (eventListeners) {
        for (const [subId, callback] of eventListeners.entries()) {
          try {
            if (typeof callback == 'function') {
              const res = callback(args);
              if (res instanceof AcEventExecutionResult && res.status === "success") {
                functionResults[subId] = res;
              }
            }

          } catch (ex: any) {
            console.error(`Event handler failed [${name}] (id: ${subId}):`, ex);
          }
        }
      }

      // Execute "all events" listeners
      for (const [subId, callback] of this.allEventCallbacks.entries()) {
        try {
          if (typeof callback == 'function') {
            const res = callback(name, args);
            if (res instanceof AcEventExecutionResult && res.status === "success") {
              functionResults[subId] = res;
            }
          }
        } catch (ex: any) {
          console.error(`Global event handler failed (id: ${subId}):`, ex);
        }
      }

      if (Object.keys(functionResults).length > 0) {
        result.hasResults = true;
        result.results = functionResults;
      }

      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex });
      console.error("Critical error in AcEvents.execute():", ex);
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
   * Subscribe to a specific event
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
    return subscriptionId;
  }

  /**
   * Subscribe to ALL events
   * @returns subscriptionId
   */
  subscribeAllEvents({ callback }: { callback: Function }): string {
    const subscriptionId = Autocode.uniqueId();
    this.allEventCallbacks.set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe using subscriptionId (recommended & safe)
   */
  unsubscribe({ event, callback, subscriptionId, subscriptionIds }: { event?: string; callback?: Function; subscriptionId?: string,subscriptionIds?:string[] }): boolean {
    if(subscriptionIds && subscriptionIds.length > 0){
      for(const id of subscriptionIds){
        this.unsubscribe({subscriptionId:id});
      }
      return true;
    }

    if (event && callback) {
      const name = event.toLowerCase();
      const eventMap = this.events.get(name);
      if (eventMap) {
        for (const [id, cb] of eventMap.entries()) {
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
    for (const eventMap of this.events.values()) {
      if (eventMap.delete(subscriptionId)) {
        removed = true;
      }
    }

    return removed;
  }

  /**
   * Unsubscribe from all events listeners (global only)
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
   * (Optional) Remove entire event and all its listeners
   */
  removeEvent({ event }: { event: string }): void {
    this.events.delete(event.toLowerCase());
  }

  /**
   * (Debug) Get current subscription count
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
