import 'reflect-metadata';
export function AcWebValueFromBody(key?: string) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const metadataKey = 'ac:web:value-from-body';

    // Get existing metadata or initialize
    const existingParams: Record<number, string | undefined> =
      Reflect.getOwnMetadata(metadataKey, target, propertyKey) || {};

    // Assign the key to the parameter index
    existingParams[parameterIndex] = key;

    Reflect.defineMetadata(metadataKey, existingParams, target, propertyKey);
  };
}
