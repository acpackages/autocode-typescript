import 'reflect-metadata';

export function AcWebRoute({ path, method }: { path: string; method?: string }) {
  return function (target: any, propertyKey?: string | any, descriptor?: PropertyDescriptor | any) {
    const metadataKey = 'ac:web:route';
    const routeMeta = {
      path,
      method: method || 'get',
    };

    // Check if being executed as a TS 5.0 Standard Decorator
    const isStandardDecorator = typeof propertyKey === 'object' && propertyKey !== null && 'kind' in propertyKey;

    if (isStandardDecorator) {
      const context = propertyKey as any;
      if (context.kind === 'class') {
         target._acWebRoute = routeMeta;
         Reflect.defineMetadata(metadataKey, routeMeta, target);
         return;
      } else if (context.kind === 'method') {
         const actualPropertyKey = String(context.name);
         context.addInitializer(function(this: any) {
           const constructor = this.constructor || this;
           if (!constructor._acWebRoutes) {
             constructor._acWebRoutes = [];
           }
           constructor._acWebRoutes.push({
             handlerName: actualPropertyKey,
             ...routeMeta
           });
           Reflect.defineMetadata(metadataKey, routeMeta, this, actualPropertyKey);
         });
         return;
      }
    } else {
      // Experimental Decorators
      const actualPropertyKey = propertyKey as string | undefined;
      if (actualPropertyKey) {
        const constructor = target.constructor || target;
        if (!constructor._acWebRoutes) {
          constructor._acWebRoutes = [];
        }
        constructor._acWebRoutes.push({
          handlerName: actualPropertyKey,
          ...routeMeta
        });
        Reflect.defineMetadata(metadataKey, routeMeta, target, actualPropertyKey);
      } else {
        target._acWebRoute = routeMeta;
        Reflect.defineMetadata(metadataKey, routeMeta, target);
      }
    }
  };
}
