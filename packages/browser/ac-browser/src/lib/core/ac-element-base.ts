/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDelayedCallback, AcEvents, Autocode, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { acClearElement, acCloneEvent, acRegisterCustomElement } from "../utils/ac-element-functions";

export class AcElementBase extends HTMLElement {
  isInitialized:boolean = false;

  autoDestroyOnDisconnect:boolean = true;
  events: AcEvents = new AcEvents();
  acId:string = Autocode.uuid();
  protected delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  isDestroyed:boolean = false;

  constructor() {
    super();
    const originalDispatch = this.dispatchEvent;
    this.dispatchEvent = (event: Event): boolean => {
      if (!event) return false;
      if (this.events) {
        this.events.execute({ event: event.type, args: event });
      }
      try {
        const isBeingDispatched = typeof Event !== 'undefined' && event.eventPhase !== Event.NONE;
        const eventToDispatch = isBeingDispatched ? acCloneEvent(event) : event;
        return originalDispatch.call(this, eventToDispatch);
      } catch (err: any) {
        if (err && err.name === 'InvalidStateError') {
          try {
            return originalDispatch.call(this, acCloneEvent(event));
          } catch {
            return false;
          }
        }
        throw err;
      }
    };
  }

  connectedCallback(): void {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.init();
      const event: CustomEvent = new CustomEvent('init');
      this.dispatchEvent(event);
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.events.destroy();
    this.delayedCallback.destroy();
  }

  disconnectedCallback(): void {
    // Derived classes can perform cleanup in disconnectedCallback
  }

  init(): void {
    //
  }

  off({ event, callback, subscriptionId }: { event?: string; callback?: Function; subscriptionId?: string }): void {
    this.events.unsubscribe({ event, callback, subscriptionId });
  }

  on({ event, callback }: { event: string; callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

}

acRegisterCustomElement({tag:"ac-element-base",type: AcElementBase});
