import { AcWebSocket } from '@autocode-ts/ac-web-socket';
import { AcWeb, AcWebRequest, AcWebResponse, AcWebRouteDefinition, AcWebFile } from '@autocode-ts/ac-web';
import { AcLogger, AcEnumLogType } from '@autocode-ts/autocode';
import { AcWebOnWsParams } from './models/ac-web-on-ws-params.model';


export class AcWebOnWs {
  public socket: AcWebSocket;
  public app: AcWeb;
  public eventName: string;

  public logger: AcLogger = new AcLogger({
    logMessages: true,
    logDirectory: 'logs',
    logType: AcEnumLogType.Console,
    logFileName: 'ac-web-on-ws.log',
  });

  constructor({ socket, app, eventName = 'web_request' }: {
    socket: AcWebSocket;
    app: AcWeb;
    eventName?: string;
  }) {
    this.socket = socket;
    this.app = app;
    this.eventName = eventName;
    this._setupWsHandlers();
  }

  private _setupWsHandlers() {
    this.socket.on({
      event: this.eventName,
      handler: async ({ data, callback }) => {
        try {
          const requestData = typeof data === 'string' ? JSON.parse(data) : data;

          const method = (requestData['method'] || 'GET').toString().toLowerCase();
          const url = (requestData['url'] || '').toString();
          const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

          let routeDefinition: AcWebRouteDefinition | undefined;
          let pathParams: Record<string, string> = {};

          for (const entry of Object.values(this.app.routeDefinitions)) {
            const routeMethod = entry.method.toLowerCase();
            const routePath = entry.url;
            const cleanRoutePath = routePath.startsWith('/') ? routePath.substring(1) : routePath;

            if (routeMethod === method) {
              if (cleanRoutePath === cleanUrl) {
                routeDefinition = entry;
                break;
              } else {
                const extracted = this._extractPathParams(cleanRoutePath, cleanUrl);
                if (extracted) {
                  routeDefinition = entry;
                  pathParams = extracted;
                  break;
                }
              }
            }
          }

          if (!routeDefinition) {
            // Check dynamic resolvers if available on app
            const runtimeResolvers = (this.app as any).runtimeRouteResolvers;
            if (runtimeResolvers && typeof runtimeResolvers === 'object') {
              let resolverDefinition: any;
              for (const entry of Object.values(runtimeResolvers) as any[]) {
                const routeMethod = (entry.method?.value || entry.method || '').toLowerCase();
                const routePath = entry.prefix || '';
                const cleanRoutePath = routePath.startsWith('/') ? routePath.substring(1) : routePath;

                if (routeMethod === method && cleanUrl.startsWith(cleanRoutePath)) {
                  resolverDefinition = entry;
                  break;
                }
              }

              if (resolverDefinition) {
                const acWebRequest = this._createAcWebRequestFromWsData(requestData, this.socket);
                acWebRequest.pathParameters = pathParams;
                acWebRequest.internalParams['ac_web_on_ws'] = new AcWebOnWsParams({ socket: this.socket });
                acWebRequest.internalParams['socket'] = this.socket;

                const webResponse = await resolverDefinition.resolver({
                  path: cleanUrl,
                  method: resolverDefinition.method,
                  webRequest: acWebRequest,
                });

                if (callback) {
                  const response = webResponse || AcWebResponse.notFound();
                  callback({ response: this._createWsResponseFromAcWebResponse(response) });
                }
                return;
              }
            }

            this.logger.error({ message: `Route not found: ${method}>${url}` });
            if (callback) {
              const response = AcWebResponse.notFound();
              callback({ response: this._createWsResponseFromAcWebResponse(response) });
            }
            return;
          }

          const acWebRequest = this._createAcWebRequestFromWsData(requestData, this.socket);
          acWebRequest.pathParameters = pathParams;
          acWebRequest.internalParams['ac_web_on_ws'] = new AcWebOnWsParams({ socket: this.socket });
          acWebRequest.internalParams['socket'] = this.socket;

          const webResponse = await this.app.handleWebRequest({ request: acWebRequest, routeDefinition });
          if (callback) {
            callback({ response: this._createWsResponseFromAcWebResponse(webResponse) });
          }

        } catch (e: any) {
          this.logger.error({ message: `Error handling ${this.eventName}: ${e}` });
          if (callback) {
            const response = AcWebResponse.internalError({ data: e.toString() });
            callback({ response: this._createWsResponseFromAcWebResponse(response) });
          }
        }
      }
    });
  }

  private _extractPathParams(routePath: string, uri: string): Record<string, string> | null {
    try {
      const pattern = new RegExp(
        '^' +
        routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{(\w+)\\\}/g, (_, name) => `(?<${name}>[^/]+)`) +
        '$'
      );
      const match = pattern.exec(uri);
      if (!match || !match.groups) return null;
      return { ...match.groups };
    } catch (e) {
      return null;
    }
  }

  private _createAcWebRequestFromWsData(data: Record<string, any>, socket: AcWebSocket): AcWebRequest {
    const request = new AcWebRequest();
    request.method = (data['method'] || 'GET').toString().toUpperCase();
    request.url = (data['url'] || '').toString();
    if (request.url.startsWith('/')) {
      request.url = request.url.substring(1);
    }

    const headersMap = data['headers'];
    if (headersMap && typeof headersMap === 'object') {
      Object.entries(headersMap).forEach(([k, v]) => request.headers[k.toString()] = v);
    }

    const queryMap = data['query'] || data['get'] || data['queryParams'];
    if (queryMap && typeof queryMap === 'object') {
      Object.entries(queryMap).forEach(([k, v]) => request.get[k.toString()] = v);
    }

    const postMap = data['post'] || data['form'];
    if (postMap && typeof postMap === 'object') {
      Object.entries(postMap).forEach(([k, v]) => request.post[k.toString()] = v);
    }

    const body = data['body'] || data['data'];
    if (body !== undefined) {
      if (typeof body === 'object' && body !== null) {
        Object.assign(request.body, body);
        if (Object.keys(request.post).length === 0) Object.assign(request.post, body);
      } else if (typeof body === 'string') {
        try {
          const decoded = JSON.parse(body);
          if (typeof decoded === 'object' && decoded !== null) Object.assign(request.body, decoded);
        } catch (_) {}
      }
    }

    const cookiesMap = data['cookies'];
    if (cookiesMap && typeof cookiesMap === 'object') {
      Object.entries(cookiesMap).forEach(([k, v]) => request.cookies[k.toString()] = v);
    }

    const sessionMap = data['session'];
    if (sessionMap && typeof sessionMap === 'object') {
      Object.entries(sessionMap).forEach(([k, v]) => request.session[k.toString()] = v);
    }

    const filesMap = data['files'];
    if (filesMap && typeof filesMap === 'object') {
      Object.entries(filesMap).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          request.files[k.toString()] = AcWebFile.instanceFromJson(v as Record<string, any>);
        }
      });
    }

    const pathMap = data['pathParameters'] || data['params'];
    if (pathMap && typeof pathMap === 'object') {
      Object.entries(pathMap).forEach(([k, v]) => request.pathParameters[k.toString()] = v);
    }

    request.headers['x-socket-id'] = socket.id;
    request.headers['x-socket-nsp'] = socket.nsp;

    return request;
  }

  private _createWsResponseFromAcWebResponse(response: AcWebResponse): Record<string, any> {
    return {
      'status': response.responseCode,
      'type': response.responseType.toString(),
      'data': response.content,
      'headers': response.headers,
    };
  }
}
