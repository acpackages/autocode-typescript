/* eslint-disable @typescript-eslint/no-this-alias */
export interface ObjectChangeEntry<T = any> {
  old?: T;
  new?: T;
  change: 'add' | 'modify' | 'remove';
}

export type ObjectChangesResult = Record<string, ObjectChangeEntry>;

/**
 * Utility functions for Object manipulation.
 * Do NOT extend Object.prototype directly. Use these as standalone functions.
 * WARNING: This version uses 'any' extensively, reducing TypeScript's type safety benefits.
 */

/**
 * Determines the differences between two objects.
 * It identifies added, modified, and removed properties at the top level.
 * Performs a shallow comparison for modifications.
 *
 * @param oldObject The original object.
 * @param newObject The new object to compare against.
 * @returns An object detailing the changes, or an empty object if no changes.
 */
export function objectChanges(oldObject: any, newObject: any): any { // Return type also 'any' now
    const changes: any = {}; // 'changes' also 'any'

    const isPlainObject = (value: any): boolean => { // Return type of helper is boolean
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    };

    const actualOldObject = isPlainObject(oldObject) ? oldObject : {};
    const actualNewObject = isPlainObject(newObject) ? newObject : {};

    for (const key in actualNewObject) {
        if (Object.prototype.hasOwnProperty.call(actualNewObject, key)) {
            if (!Object.prototype.hasOwnProperty.call(actualOldObject, key)) {
                changes[key] = { old: undefined, new: actualNewObject[key], change: 'add' };
            } else if (actualOldObject[key] !== actualNewObject[key]) {
                changes[key] = { old: actualOldObject[key], new: actualNewObject[key], change: 'modify' };
            }
        }
    }

    for (const key in actualOldObject) {
        if (Object.prototype.hasOwnProperty.call(actualOldObject, key)) {
            if (!Object.prototype.hasOwnProperty.call(actualNewObject, key)) {
                changes[key] = { new: undefined, old: actualOldObject[key], change: 'remove' };
            }
        }
    }
    return changes;
}


/**
 * Performs a deep clone of an object using JSON serialization.
 * NOTE: This method has limitations: it cannot clone functions, Date objects, RegExps,
 * undefined values, or circular references.
 * For more robust deep cloning, consider a dedicated library (e.g., Lodash's _.cloneDeep)
 * or a more complex custom implementation that handles various types.
 *
 * @param obj The object to clone.
 * @returns A new, deeply cloned object.
 */
export function objectClone<T>(obj: T): T { // Keeping T here for some generic hint, but the body is 'any' based
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        console.warn("objectClone: JSON.stringify failed. Falling back to less robust clone. Error:", e);
        if (Array.isArray(obj)) {
            return [...obj] as T;
        }
        if (typeof obj === 'object' && obj.constructor === Object) {
            const newObj: any = {}; // Explicitly 'any'
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    newObj[key] = objectClone(obj[key]);
                }
            }
            return newObj as T;
        }
        return obj;
    }
}


/**
 * Checks if an object has a specific own, enumerable property.
 * @param obj The object to check.
 * @param key The key to look for.
 * @returns True if the object has the key as its own property, false otherwise.
 */
export function objectContainsKey(obj: any, key: string): boolean { // obj as 'any'
  if (obj === null || typeof obj !== 'object') {
      return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Copies enumerable own properties from a source object to a destination object.
 * Modifies the destination object in place.
 *
 * @param destination The object to copy properties into.
 * @param source The object to copy properties from.
 * @returns The modified destination object.
 */
export function objectCopyFrom(destination: any, source: any): any { // All 'any'
    if (destination === null || typeof destination !== 'object') {
        throw new TypeError('Destination must be a non-null object.');
    }
    if (source === null || typeof source !== 'object') {
        return destination;
    }
    Object.keys(source).forEach((key) => {
        destination[key] = source[key];
    });
    return destination;
}

export function objectCopyKeyValues({source,destination,keys}:{source:any,destination:any,keys:string[]}){
  for(const key of keys){
    if(source[key]){
      destination[key] = JSON.parse(JSON.stringify(source[key]));
    }
  }
  return destination;
}

export function objectCopyTo(source: any,destination:any): any { // All 'any'
    return objectCopyFrom(destination,source);
}


/**
 * Checks if an object has no own, enumerable properties.
 * @param obj The object to check.
 * @returns True if the object has no enumerable properties, false otherwise.
 */
export function objectIsEmpty(obj: any): boolean { // obj as 'any'
    if (obj === null || typeof obj !== 'object') {
        return true;
    }
    return Object.keys(obj).length === 0;
}

/**
 * Checks if an object has one or more own, enumerable properties.
 * @param obj The object to check.
 * @returns True if the object has at least one enumerable property, false otherwise.
 */
export function objectIsNotEmpty(obj: any): boolean { // obj as 'any'
    return !objectIsEmpty(obj);
}

/**
 * Performs a deep comparison between two objects to check if they are structurally the same.
 * This function handles nested objects and arrays but avoids circular references.
 *
 * @param obj1 The first object to compare.
 * @param obj2 The second object to compare.
 * @returns True if the objects are deeply equal, false otherwise.
 */
export function objectIsSame(obj1: any, obj2: any): boolean { // All 'any'
    if (obj1 === obj2) {
        return true;
    }

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (let i = 0; i < obj1.length; i++) {
            if (!objectIsSame(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!Object.prototype.hasOwnProperty.call(obj2, key) || !objectIsSame(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}


/**
 * Creates a new object containing only the properties that satisfy the filter function.
 * @param obj The original object.
 * @param filterFunction A callback function that returns true for properties to keep.
 * Receives (key, value) as arguments.
 * @returns A new object with filtered properties.
 */
export function objectFilter(
  obj: any, // obj as 'any'
  filterFunction: (key: string, value: any) => boolean // value in callback as 'any'
): any { // Return type 'any'
  const result: any = {}; // 'result' as 'any'
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return result;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (filterFunction(key, obj[key])) {
        result[key] = obj[key];
      }
    }
  }
  return result;
}


/**
 * Converts an object's enumerable own properties into a URL query string.
 * @param obj The object to convert.
 * @returns A URL query string (e.g., "key1=value1&key2=value2").
 */
export function objectToQueryString(obj: any): string { // obj as 'any'
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return '';
    }

    const params: string[] = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (value !== '' && value !== undefined && value !== null) {
                params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        }
    }
    return params.join('&');
}
