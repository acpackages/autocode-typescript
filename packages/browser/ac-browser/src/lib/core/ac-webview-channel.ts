/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AcEvents, AcHooks, Autocode } from "@autocode-ts/autocode";

export class AcWebviewChannel {
  events: AcEvents = new AcEvents();
  webviewEvents: AcEvents = new AcEvents();
  private actions: AcHooks = new AcHooks();
  private callbacks: any = {};
  type: 'cefBrowser' | 'webviewBrowser' | 'inappWebview' | undefined = undefined;
  webviewBrowser: any;
  cefBrowser: any;

  isAppBrowser() {
    return this.isCefBrowser() || this.isWebviewBrowser() || this.isInappWebview();
  }

  isCefBrowser() {
    let result = false;
    if (typeof this.cefBrowser != "undefined") {
      result = true;
      this.type = 'cefBrowser';
    }
    return result;
  }

  isWebviewBrowser() {
    let result = false;
    try {
      // Original webview_flutter style: checks for global acWebviewJavascriptChannel
      if ((window as any).acWebviewJavascriptChannel) {
        result = true;
        this.webviewBrowser = (window as any).acWebviewJavascriptChannel;
        this.type = 'webviewBrowser';
      }
    } catch (ex) {
      //
    }
    return result;
  }

  isInappWebview() {
    let result = false;
    try {
      // Detect flutter_inappwebview bridge object
      if ((window as any).flutter_inappwebview) {
        result = true;
        this.type = 'inappWebview';
      }
    } catch (ex) {
      //
    }
    return result;
  }

  on({ event, callback }: { event: string; callback: any }): string {
    return this.events.subscribe({ event, callback });
  }

  off({ event, callback, subscriptionId, subscriptionIds }: { event?: string; callback?: any, subscriptionId?:string, subscriptionIds?:string[]  }): boolean {
    return this.events.unsubscribe({ event, callback, subscriptionId, subscriptionIds });
  }

  offEvent({ event, callback, subscriptionId, subscriptionIds }: { event?: string; callback?: any, subscriptionId?:string, subscriptionIds?:string[]  }): boolean {
    return this.webviewEvents.unsubscribe({ event, callback, subscriptionId, subscriptionIds });
  }

  onEvent({ event, callback }: { event: string; callback: any }): string {
    return this.webviewEvents.subscribe({ event, callback });
  }

  performAction({ name, data = {}, callback }: { name: string; data?: any; callback?: any }) {
    this.send({ data: { action: name, data: data }, callback: callback });
  }

  receive({ data = {} }: { data?: any }) {
    if (data["callbackId"] != undefined) {
      const functionId = data["callbackId"];
      if (this.callbacks[functionId] != undefined) {
        let actionResponse = data["actionResponse"];
        if (actionResponse == undefined) {
          actionResponse = data;
        }
        this.callbacks[functionId](actionResponse);
        delete this.callbacks[functionId];
      }
    } else if (data["event"] != undefined) {
      const event = data["event"];
      const eventData = data["data"];
      this.webviewEvents.execute({ event: event, args: eventData });
      this.events.execute({ event: 'receive', args: data });
    } else {
      const action: string = data["action"];
      if (action != undefined) {
        this.actions.execute({ hook: action, args: data });
      }
      this.events.execute({ event: 'receive', args: data });
    }
  }

  send({ data, callback }: { data: any; callback?: any }) {
    let dataResult: any = {};
    if (typeof data != "object") {
      dataResult["message"] = data;
    } else {
      dataResult = data;
    }
    if (callback) {
      const functionId = Autocode.uniqueId();
      dataResult["callbackId"] = functionId;
      this.callbacks[functionId] = callback;
    }

    if (this.type === "cefBrowser") {
      this.cefBrowser({
        request: JSON.stringify(dataResult),
        onSuccess: function (response: any) {
          //
        },
        onFailure: function () {
          console.error("Error ");
        }
      });
    } else if (this.type === 'webviewBrowser') {
      this.webviewBrowser.postMessage(JSON.stringify(dataResult));
    } else if (this.type === 'inappWebview') {
      // flutter_inappwebview: call the handler with JSON string as single arg
      (window as any).flutter_inappwebview.callHandler(
        'acWebviewJavascriptChannel',
        JSON.stringify(dataResult)
      );
    }

    this.events.execute({ event: 'send', args: dataResult });
  }
}

export const acWebviewChannel = new AcWebviewChannel();

window.addEventListener('acWebviewChannelReady',()=>{
  acWebviewChannel.isAppBrowser();
});
acWebviewChannel.isAppBrowser();
// Auto-detect the browser type as soon as possible

// Also expose globally for backward compatibility
const _window: any = window;
_window["acWebviewChannel"] = acWebviewChannel;
