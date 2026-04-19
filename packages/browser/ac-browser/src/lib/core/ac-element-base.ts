/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDelayedCallback, AcEvents, Autocode, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { acCloneEvent, acRegisterCustomElement } from "../utils/ac-element-functions";

export class AcElementBase extends HTMLElement {
  private _isInitialized:boolean = false;
  get isInitialized():boolean{
    return this._isInitialized;
  }
  set isInitialized(value:boolean){
    this._isInitialized = value;
  }

  events: AcEvents = new AcEvents();
  acId:string = Autocode.uuid();
  protected delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  constructor(){
    super();
    const originalDispatch = this.dispatchEvent;
    this.dispatchEvent = (event: Event): boolean => {
      const e = acCloneEvent(event);
      if(this.events){
        this.events.execute({event:event.type,args:event});
      }
      return originalDispatch.call(this, e);
    };
  }

  connectedCallback(){
    if(!this.isInitialized){
      this.isInitialized = true;
      this.init();
      const event:CustomEvent = new CustomEvent('init');
      this.dispatchEvent(event)
    }
  }

  destroy(){
    this.events.destroy();
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({instance:this});
  }

  disconnectedCallback(){
    //
  }

  init(){
    //
  }

  off({ event, callback, subscriptionId }: { event?: string, callback?: Function, subscriptionId?: string }): void {
    this.events.unsubscribe({ event, callback, subscriptionId });
  }

  on({ event, callback }: { event: string; callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

}

acRegisterCustomElement({tag:"ac-element-base",type: AcElementBase});
