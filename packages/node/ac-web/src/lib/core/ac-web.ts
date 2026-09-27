/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acHooks, AcLogger, AcEnumLogType, AcFileUtils, AcJsonUtils } from '@autocode-ts/autocode';
import { acWebDetectedControllers } from '../annotations/ac-web-controller.annotation';
import { AcWebRouteDefinition } from '../models/ac-web-route-definition.model';
import { AcWebRequest } from '../models/ac-web-request.model';
import { AcWebResponse } from '../models/ac-web-response.model';
import { AcWebConfig } from '../models/ac-web-config.model';
import { AcEnumWebHook } from '../enums/ac-enum-web-hook.enum';
import { AcApiDoc } from '../api-docs/models/ac-api-doc.model';
import { AcApiDocPath } from '../api-docs/models/ac-api-doc-path.model';
import { AcApiDocRoute } from '../api-docs/models/ac-api-doc-route.model';
import { AcApiDocServer } from '../api-docs/models/ac-api-doc-server.model';
import { AcApiSwagger } from '../api-docs/swagger/ac-api-swagger';
import { AcSwaggerResources } from '../api-docs/swagger/ac-swagger-resources';
import { AcEnumApiDocRenderer } from '../api-docs/enums/ac-enum-api-doc-renderer.enum';
import { AcEnumApiDocAssetSource } from '../api-docs/enums/ac-enum-api-doc-asset-source.enum';
import { AcApiDocUiOptions } from '../api-docs/models/ac-api-doc-ui-options.model';
import { AcApiDocUiHandler } from '../api-docs/utils/ac-api-doc-ui-handler.utility';
import { IAcWebRequestHandlerArgs } from '../interfaces/ac-web-request-handler-args.interface';

export class AcWeb {
  acApiDoc: AcApiDoc;
  apiDocUiOptions: AcApiDocUiOptions;
  private _webConfig: AcWebConfig = AcWebConfig.getInstance();

  get webConfig(): AcWebConfig {
    return this._webConfig;
  }

  set webConfig(value: AcWebConfig) {
    this._webConfig = value;
    if (value.exposeFilesController) {
      this.staticFilesDirectory({ directory: value.filesControllerConfig.uploadDirectory });
    }
  }

  routeDefinitions: Record<string, AcWebRouteDefinition> = {};
  staticFilesRoutes: Record<string, any>[] = [];
  assetFilesRoutes: Record<string, any>[] = [];
  rawContentMaps: Record<string, any>[] = [];

  port: number = 0;
  sslPort: number = 0;
  sslCertificateChainPath: string = '';
  sslPrivateKeyPath: string = '';
  forceHttps: boolean = false;

  logger: AcLogger = new AcLogger({ logMessages: false, logDirectory: 'logs/ac-web', logType: AcEnumLogType.Console, logFileName: 'ac-web.log' });
  urlPrefixes: string[] = [];

  get urlPrefix(): string {
    return this.urlPrefixes.length > 0 ? this.urlPrefixes[0] : '';
  }

  set urlPrefix(value: string) {
    this.urlPrefixes = value ? [value] : [];
  }

  constructor({ paths = [], apiDocUiOptions }: { paths?: string[]; apiDocUiOptions?: AcApiDocUiOptions } = {}) {
    this.urlPrefixes = paths;
    this.acApiDoc = new AcApiDoc();
    this.apiDocUiOptions = apiDocUiOptions ?? new AcApiDocUiOptions();
    acHooks.execute({ hook: AcEnumWebHook.AcWebCreated, args: [this] });
    this.setupApiDocumentation();
  }

  setupApiDocumentation(): void {
    if (!this.apiDocUiOptions.enabled) return;

    const openApiHandler = (args: IAcWebRequestHandlerArgs) => {
      const acApiSwagger = new AcApiSwagger();
      this.acApiDoc.paths = [];
      const paths: Record<string, AcApiDocPath> = {};

      for (const routeDefinition of Object.values(this.routeDefinitions)) {
        const url = routeDefinition.url;
        if (!url.includes('/swagger/') && !url.includes('/docs/')) {
          if (!paths[url]) {
            const pathObj = new AcApiDocPath();
            pathObj.url = url;
            paths[url] = pathObj;
          }
          const acApiDocPath = paths[url];
          const acApiDocRoute = routeDefinition.documentation;
          switch (routeDefinition.method.toUpperCase()) {
            case 'CONNECT': acApiDocPath.connect = acApiDocRoute; break;
            case 'DELETE': acApiDocPath.delete = acApiDocRoute; break;
            case 'GET': acApiDocPath.get = acApiDocRoute; break;
            case 'HEAD': acApiDocPath.head = acApiDocRoute; break;
            case 'OPTIONS': acApiDocPath.options = acApiDocRoute; break;
            case 'PATCH': acApiDocPath.patch = acApiDocRoute; break;
            case 'POST': acApiDocPath.post = acApiDocRoute; break;
            case 'PUT': acApiDocPath.put = acApiDocRoute; break;
            case 'TRACE': acApiDocPath.trace = acApiDocRoute; break;
          }
        }
      }

      this.acApiDoc.paths = Object.values(paths);
      acApiSwagger.acApiDoc = this.acApiDoc;
      return AcWebResponse.json({ data: acApiSwagger.generateJson() });
    };

    // 1. Primary OpenAPI route
    this.get({
      url: this.apiDocUiOptions.jsonPath,
      handler: openApiHandler,
    });

    // 2. Backward compatibility OpenAPI route (/swagger/swagger.json)
    if (this.apiDocUiOptions.swaggerJsonPath !== this.apiDocUiOptions.jsonPath) {
      this.get({
        url: this.apiDocUiOptions.swaggerJsonPath,
        handler: openApiHandler,
      });
    }

    // 3. UI Handler (Scalar, Swagger UI, Redoc, RapiDoc, Elements)
    const uiHandler = new AcApiDocUiHandler({ options: this.apiDocUiOptions });
    this.get({
      url: this.apiDocUiOptions.urlPath,
      handler: () => {
        return AcWebResponse.html({ html: uiHandler.getHtml() });
      },
    });

    // 4. Backward compatibility UI route (/swagger)
    if (this.apiDocUiOptions.urlPath !== '/swagger') {
      this.get({
        url: '/swagger',
        handler: () => {
          return AcWebResponse.html({ html: uiHandler.getHtml() });
        },
      });
    }

    // 5. Injected or Directory assets if specified
    if (this.apiDocUiOptions.source === AcEnumApiDocAssetSource.InjectedMap && this.apiDocUiOptions.files) {
      for (const fileName of Object.keys(this.apiDocUiOptions.files)) {
        const routeUrl = fileName.startsWith('/') ? fileName : `/${fileName}`;
        this.get({
          url: `${this.apiDocUiOptions.urlPath}${routeUrl}`,
          handler: () => {
            const content = this.apiDocUiOptions.files![fileName];
            const mimeType = AcFileUtils.mimeFromPath({ path: fileName });
            return AcWebResponse.raw({ content, headers: { 'Content-Type': mimeType } });
          },
        });
      }
    }
  }

  _extractPathParams({ routePath, uri }: { routePath: string; uri: string }): Record<string, string> {
    const pattern = new RegExp('^' +
      routePath.replace(/\{(\w+)\}/g, (_, name) => `(?<${name}>[^/]+)`) +
      '$');
    const match = pattern.exec(uri);
    if (!match || !match.groups) return {};
    const result: Record<string, string> = {};
    for (const name in match.groups) {
      result[name] = match.groups[name] || '';
    }
    return result;
  }

  _matchPath({ routePath, uri }: { routePath: string; uri: string }): boolean {
    const pattern = new RegExp('^' +
      routePath.replace(/\{(\w+)\}/g, (_, name) => `(?<${name}>[^/]+)`) +
      '$');
    return pattern.test(uri);
  }

  private _interceptors: import('./ac-web-interceptor').AcWebInterceptor[] = [];

  addInterceptor({ interceptor }: { interceptor: import('./ac-web-interceptor').AcWebInterceptor }): AcWeb {
    this._interceptors.push(interceptor);
    return this;
  }

  _findInterceptor({ name }: { name: string }): import('./ac-web-interceptor').AcWebInterceptor | undefined {
    return this._interceptors.find(i => i.name === name);
  }

  async handleWebRequest({ request, routeDefinition }: { request: AcWebRequest; routeDefinition: AcWebRouteDefinition }): Promise<AcWebResponse> {
    const chain = [...this._interceptors];
    const routeInterceptors = routeDefinition.interceptors || [];

    for (const name of routeInterceptors) {
      const interceptor = this._findInterceptor({ name });
      if (interceptor && !chain.includes(interceptor)) {
        chain.push(interceptor);
      } else if (!interceptor) {
        this.logger.log(`Warning: Interceptor '${name}' not found for route ${routeDefinition.method}>${routeDefinition.url}`);
      }
    }

    let shortCircuitResponse: AcWebResponse | null = null;
    const executedInterceptors: import('./ac-web-interceptor').AcWebInterceptor[] = [];

    for (const interceptor of chain) {
      try {
        shortCircuitResponse = await interceptor.onRequest({ request });
        executedInterceptors.push(interceptor);
        if (shortCircuitResponse) break;
      } catch (e: any) {
        this.logger.log(`Error in interceptor ${interceptor.name}.onRequest: ${e}`);
        shortCircuitResponse = AcWebResponse.internalError({ data: `Interceptor error: ${e}` });
        executedInterceptors.push(interceptor);
        break;
      }
    }

    let response: AcWebResponse;
    if (shortCircuitResponse) {
      response = shortCircuitResponse;
    } else {
      response = await this._executeHandler({ request, routeDefinition });
    }

    for (let i = executedInterceptors.length - 1; i >= 0; i--) {
      const interceptor = executedInterceptors[i];
      try {
        response = await interceptor.onResponse({ request, response });
      } catch (e: any) {
        this.logger.log(`Error in interceptor ${interceptor.name}.onResponse: ${e}`);
      }
    }

    return response;
  }

  async _executeHandler({ request, routeDefinition }: { request: AcWebRequest, routeDefinition: AcWebRouteDefinition }): Promise<AcWebResponse> {
    const requestLogger = new AcLogger({
      logFileName: `${request.url}.log`,
      logDirectory: 'logs/ac-web-requests',
      logMessages: true,
      logType: AcEnumLogType.Text,
    });

    try {
      if (routeDefinition.controller && typeof routeDefinition.handler === 'string') {
        this.logger.log('Handling controller route...');
        const ControllerClass = routeDefinition.controller;
        const controllerInstance = new ControllerClass();
        const methodName = routeDefinition.handler;
        this.logger.log(`Handler controller method name is : ${methodName}`);

        if (typeof controllerInstance[methodName] === 'function') {
          const args = this._resolveArguments({
            target: ControllerClass.prototype,
            methodName,
            request,
            requestLogger
          });

          if (args.length === 0 && (controllerInstance[methodName] as Function).length === 1) {
            const injectedArgs = {
              request,
              requestLogger,
              ...request.pathParameters,
              ...request.queryParameters,
              ...request.formFields,
              ...(typeof request.body === 'object' && request.body !== null ? request.body : {})
            };
            return await controllerInstance[methodName](injectedArgs);
          }

          return await controllerInstance[methodName](...args);
        }
      } else if (typeof routeDefinition.handler === 'function') {
        this.logger.log('Handling function route...');
        const handler = routeDefinition.handler as Function;

        const args = this._resolveArguments({
          target: handler,
          methodName: undefined,
          request,
          requestLogger
        });

        if (args.length === 0 && handler.length === 1) {
          const simpleArgs = { request, logger: requestLogger };
          return await handler(simpleArgs);
        }

        return await handler(...args);
      }
    } catch (e: any) {
      return AcWebResponse.internalError({ data: e.toString() });
    }

    return AcWebResponse.notFound();
  }

  _resolveArguments({ target, methodName, request, requestLogger }: {
    target: any;
    methodName: string | undefined;
    request: AcWebRequest;
    requestLogger: AcLogger;
  }): any[] {
    const propKey = methodName ?? '';
    const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', target, propKey) || [];

    const fromPathMeta: Record<number, string> = Reflect.getMetadata('ac:web:value-from-path', target, propKey) || {};
    const fromQueryMeta: Record<number, string> = Reflect.getMetadata('ac:web:value-from-query', target, propKey) || {};
    const fromBodyMeta: Record<number, string> = Reflect.getMetadata('ac:web:value-from-body', target, propKey) || {};
    const fromFormMeta: Record<number, string> = Reflect.getMetadata('ac:web:value-from-form', target, propKey) || {};
    const fromHeaderMeta: Record<number, string> = Reflect.getMetadata('ac:web:value-from-header', target, propKey) || {};
    const fromCookieMeta: Record<number, string> = Reflect.getMetadata('ac:web:value-from-cookie', target, propKey) || {};

    let paramCount = paramTypes.length;

    if (paramCount === 0) {
      const allIndices = [
        ...Object.keys(fromPathMeta),
        ...Object.keys(fromQueryMeta),
        ...Object.keys(fromBodyMeta),
        ...Object.keys(fromFormMeta),
        ...Object.keys(fromHeaderMeta),
        ...Object.keys(fromCookieMeta)
      ].map(k => parseInt(k)).filter(k => !isNaN(k));

      if (allIndices.length > 0) {
        paramCount = Math.max(...allIndices) + 1;
      }
    }

    const args: any[] = new Array(paramCount);

    for (let i = 0; i < paramCount; i++) {
      const paramType = paramTypes[i];
      let argValue: any = null;
      let valueSet = false;

      if (paramType === AcWebRequest) {
        argValue = request;
        valueSet = true;
      } else if (paramType === AcLogger) {
        argValue = requestLogger;
        valueSet = true;
      } else {
        if (fromPathMeta[i] !== undefined) {
          argValue = this._coerceValue({ value: request.pathParameters[fromPathMeta[i]], type: paramType });
          valueSet = true;
        } else if (fromQueryMeta[i] !== undefined) {
          argValue = this._coerceValue({ value: request.queryParameters[fromQueryMeta[i]], type: paramType });
          valueSet = true;
        } else if (fromFormMeta[i] !== undefined) {
          argValue = this._coerceValue({ value: request.formFields[fromFormMeta[i]], type: paramType });
          valueSet = true;
        } else if (fromHeaderMeta[i] !== undefined) {
          argValue = this._coerceValue({ value: request.headers[fromHeaderMeta[i]], type: paramType });
          valueSet = true;
        } else if (fromCookieMeta[i] !== undefined) {
          argValue = this._coerceValue({ value: request.cookies[fromCookieMeta[i]], type: paramType });
          valueSet = true;
        } else if (fromBodyMeta[i] !== undefined) {
          const key = fromBodyMeta[i];
          if (key) {
            const bodyVal = typeof request.body === 'object' && request.body !== null
              ? request.body[key]
              : undefined;
            argValue = this._coerceValue({ value: bodyVal, type: paramType });
          } else if (paramType) {
            try {
              const object = new paramType();
              AcJsonUtils.setInstancePropertiesFromJsonData({ instance: object, jsonData: request.body });
              argValue = object;
            } catch (e) {
              argValue = request.body;
            }
          } else {
            argValue = request.body;
          }
          valueSet = true;
        }
      }
      args[i] = valueSet ? argValue : undefined;
    }
    return args;
  }

  _coerceValue({ value, type }: { value: any; type: any }): any {
    if (value === undefined || value === null) return value;
    if (!type) return value;
    if (type === Number) {
      const num = Number(value);
      return isNaN(num) ? value : num;
    }
    if (type === Boolean) {
      if (typeof value === 'boolean') return value;
      return value === 'true' || value === '1' || value === 1;
    }
    if (type === String) return String(value);
    return value;
  }


  autoRegisterControllers(): void {
    // Statically retrieve the controllers tracked by the @AcWebController annotation
    for (const controller of acWebDetectedControllers) {
      this.registerController({ controllerClass: controller });
    }
  }

  registerController({ controllerClass, routePrefix = '' }: { controllerClass: any; routePrefix?: string }): AcWeb {
    this.logger.log(`Registering controller class...`);
    let classRoute = routePrefix;

    // Check for route metadata on the controller class itself
    const classMetadata = (controllerClass as any)._acWebRoute;
    if (classMetadata) {
      classRoute = classMetadata.path || classRoute;
    }
    this.logger.log(`Class route is : ${classRoute}`);

    // Flush the TypeScript 5 method decorator initializers by briefly bootstrapping the class.
    // In standard ECMAScript decorators, method decorators cannot access the class prototype
    // immediately; they defer metadata binding until an instance is created via addInitializer().
    try {
      new controllerClass();
    } catch (e) {
      this.logger.log(`Warning: Failed to bootstrap controller class ${controllerClass?.name} during discovery. Ignore if expected.`);
    }

    // Check for route metadata on the controller's methods
    const methodMetadata = (controllerClass as any)._acWebRoutes;
    if (methodMetadata) {
      for (const routeMeta of methodMetadata) {
        const controllerPath = `${classRoute}/${routeMeta.path.trim()}`.replace(/\/\//g, '/');
        const httpMethod = routeMeta.method.toLowerCase();

        // Retrieve interceptors from reflection
        const methodInterceptors = Reflect.getMetadata('ac:web:use-interceptor', controllerClass.prototype, routeMeta.handlerName) || [];
        const classInterceptors = Reflect.getMetadata('ac:web:use-interceptor', controllerClass) || [];
        const combinedInterceptors = [...classInterceptors, ...methodInterceptors];

        const prefixes = this.urlPrefixes.length > 0 ? this.urlPrefixes : [''];
        for (const prefix of prefixes) {
          const fullPath = `${prefix}/${controllerPath}`.replace(/\/\//g, '/');
          const routeKey = `${httpMethod}>${fullPath}`;
          this.logger.log(`Method route details > Method: ${httpMethod}, Path : ${fullPath}, RouteKey : ${routeKey}`);

          const routeDefinition = AcWebRouteDefinition.instanceFromJson({
            [AcWebRouteDefinition.KEY_URL]: fullPath,
            [AcWebRouteDefinition.KEY_METHOD]: httpMethod,
            [AcWebRouteDefinition.KEY_CONTROLLER]: controllerClass,
            [AcWebRouteDefinition.KEY_HANDLER]: routeMeta.handlerName,
            [AcWebRouteDefinition.KEY_DOCUMENTATION]: routeMeta.documentation || new AcApiDocRoute(),
          });
          routeDefinition.interceptors = combinedInterceptors;

          this.routeDefinitions[routeKey] = routeDefinition;
        }
      }
    }
    this.logger.log('Controller registered.');
    return this;
  }

  route({ url, handler, method, acApiDocRoute }: {
    url: string;
    handler: (args: IAcWebRequestHandlerArgs) => any;
    method: string;
    acApiDocRoute?: AcApiDocRoute;
  }): AcWeb {
    const prefixes = this.urlPrefixes.length > 0 ? this.urlPrefixes : [''];
    for (const prefix of prefixes) {
      const fullUrl = `${prefix}/${url}`.replace(/\/\//g, '/');
      const routeKey = `${method.toLowerCase()}>${fullUrl}`;
      this.routeDefinitions[routeKey] = AcWebRouteDefinition.instanceFromJson({
        [AcWebRouteDefinition.KEY_URL]: fullUrl,
        [AcWebRouteDefinition.KEY_METHOD]: method.toLowerCase(),
        [AcWebRouteDefinition.KEY_HANDLER]: handler,
        [AcWebRouteDefinition.KEY_DOCUMENTATION]: acApiDocRoute ?? new AcApiDocRoute(),
      });
    }
    return this;
  }

  addHostUrl({ url }: { url: string }): AcWeb {
    const server = new AcApiDocServer();
    server.url = url;
    this.acApiDoc.addServer(server);
    return this;
  }

  assetFiles({ assetDirectory, prefix = '' }: { assetDirectory: string; prefix?: string }): AcWeb {
    this.logger.log(`Registering asset files directory : ${assetDirectory}`);
    const prefixes = this.urlPrefixes.length > 0 ? this.urlPrefixes : [''];
    for (const p of prefixes) {
      const fullPrefix = `${p}/${prefix}`.replace(/\/\//g, '/');
      this.assetFilesRoutes.push({ prefix: fullPrefix, directory: assetDirectory });
    }
    return this;
  }

  rawContentMap({ map, prefix = '', fallbackUrl = '' }: { map: Record<string, any>; prefix?: string; fallbackUrl?: string }): AcWeb {
    const prefixes = this.urlPrefixes.length > 0 ? this.urlPrefixes : [''];
    for (const p of prefixes) {
      const fullPrefix = `${p}/${prefix}`.replace(/\/\//g, '/');
      this.rawContentMaps.push({ prefix: fullPrefix, map, fallbackUrl });
    }
    return this;
  }

  staticFilesDirectory({ directory, prefix = '' }: { directory: string; prefix?: string }): AcWeb {
    this.logger.log(`Registering static files directory : ${directory}`);
    const fs = require('fs');
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const prefixes = this.urlPrefixes.length > 0 ? this.urlPrefixes : [''];
    for (const p of prefixes) {
      const fullPrefix = `${p}/${prefix}`.replace(/\/\//g, '/');
      this.staticFilesRoutes.push({ prefix: fullPrefix, directory });
    }
    return this;
  }

  // --- Standard HTTP method helpers ---

  connect({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'CONNECT', acApiDocRoute });
  }

  delete({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'DELETE', acApiDocRoute });
  }

  get({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'GET', acApiDocRoute });
  }

  head({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'HEAD', acApiDocRoute });
  }

  options({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'OPTIONS', acApiDocRoute });
  }

  patch({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'PATCH', acApiDocRoute });
  }

  post({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'POST', acApiDocRoute });
  }

  put({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'PUT', acApiDocRoute });
  }

  trace({ url, handler, acApiDocRoute }: { url: string; handler: (args: IAcWebRequestHandlerArgs) => any; acApiDocRoute?: AcApiDocRoute }): AcWeb {
    return this.route({ url, handler, method: 'TRACE', acApiDocRoute });
  }

  getUrlJson(): Record<string, any> {
    const urls = Object.keys(this.routeDefinitions);
    const result: Record<string, any> = {};

    for (let url of urls) {
      url = url.substring(url.indexOf('>') + 1);
      url = url.replace(/\{.*?\}/g, '');
      url = url.trim();
      if (url.charAt(url.length - 1) === '/') {
        url = url.substring(0, url.length - 1);
      }
      const parts = url.replace(/^\//, '').split('/');

      let current = result;
      for (let i = 0; i < parts.length; i++) {
        const key = parts[i].replace(/\{.*?\}/g, '');
        // simple camelCase conversion
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (i === parts.length - 1) {
          current[camelKey] = url;
        } else {
          if (!current[camelKey]) {
            current[camelKey] = {};
          }
          if (typeof current[camelKey] === 'object' && !Array.isArray(current[camelKey])) {
            current = current[camelKey];
          }
        }
      }
    }

    // Recursively delete swagger keys
    const removeSwagger = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;
      delete obj['swagger'];
      for (const key in obj) {
        removeSwagger(obj[key]);
      }
    };
    removeSwagger(result);

    const deepSort = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return obj;
      }

      const sortedKeys = Object.keys(obj).sort();
      const newObj: Record<string, any> = {};

      for (const key of sortedKeys) {
        newObj[key] = deepSort(obj[key]);
      }

      return newObj;
    };

    return deepSort(result);
  }
}
