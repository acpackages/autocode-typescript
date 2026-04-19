import { AcEvents } from "@autocode-ts/autocode";

export class App {
  private static events: AcEvents = new AcEvents();

  static getActiveRoute(): string {
    let route = window.location.href;
    if (route.indexOf("#") > 0) {
      route = route.substring(route.indexOf("#") + 1);
    }
    else {
      route = "/";
    }
    if (route.indexOf("?") > 0) {
      route = route.substring(0, route.indexOf("?"));
    }
    return route;
  }

  static navigateByUrl(url: string) {
    document.location.href = "#" + url;
  }

  static notify({ event, args }: { event: string, args?: any }) {
    App.events.execute({ event: event, args: args });
  }

  static on({ event, callback }: { event: string, callback: any }): string {
    return App.events.subscribe({ event: event, callback: callback });
  }

}

window.addEventListener('hashchange', () => {
  const route = App.getActiveRoute();
  App.notify({ event: 'routeChange', args: { route } });
});
