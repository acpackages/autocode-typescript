import { AcEvents } from "@autocode-ts/autocode";
import { AcRouter } from "@autocode-ts/ac-runtime-router";

export class App {
  private static events: AcEvents = new AcEvents();
  private static routerInitialized = false;

  private static initRouter() {
    if (this.routerInitialized) return;
    AcRouter.getInstance().subscribe((url) => {
      this.notify({ event: 'routeChange', args: { route: url } });
    });
    this.routerInitialized = true;
  }

  static getActiveRoute(): string {
    return window.location.pathname;
  }

  static navigateByUrl(url: string) {
    this.initRouter();
    AcRouter.getInstance().navigateTo({path:url});
  }

  static notify({ event, args }: { event: string, args?: any }) {
    App.events.execute({ event: event, args: args });
  }

  static on({ event, callback }: { event: string, callback: any }): string {
    this.initRouter();
    return App.events.subscribe({ event: event, callback: callback });
  }
}
