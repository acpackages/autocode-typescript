import { v4 as uuidv4 } from 'uuid';

export class Autocode {
  private static _consoleColors: Record<string, string> = {
    Black: '\x1B[30m',
    Red: '\x1B[31m',
    Green: '\x1B[32m',
    Yellow: '\x1B[33m',
    Blue: '\x1B[34m',
    Magenta: '\x1B[35m',
    Cyan: '\x1B[36m',
    White: '\x1B[37m',
    Reset: '\x1B[0m',
  };

  // Phase 1 (Task 1.1): Replaced crypto-heavy uniqueId with a monotonic counter.
  // Old implementation called crypto.getRandomValues() 10 times per call and stored
  // every generated ID in a static Set that grew forever (memory leak).
  private static readonly _sessionPrefix: string = Math.random().toString(36).slice(2, 8);
  private static _idCounter: number = 0;

  static enumToObject<T>({ enumType }: { enumType: any }): Record<string, T[keyof T]> {
    return Object.keys(enumType)
      .filter((key) => isNaN(Number(key)))
      .reduce((obj, key) => {
        obj[key] = enumType[key as keyof T];
        return obj;
      }, {} as Record<string, T[keyof T]>);
  }

  static isBrowser(): boolean {
    return typeof window !== 'undefined' || typeof self !== 'undefined';
  }

  /**
   * Returns a session-unique, monotonically increasing ID string.
   * O(1), zero crypto calls, zero static memory growth.
   */
  static uniqueId(): string {
    return `ac_${Autocode._sessionPrefix}_${++Autocode._idCounter}`;
  }

  static getClassNameFromInstance({ instance }: { instance: object }): string {
    return instance.constructor.name;
  }

  static getExceptionMessage({ exception, stackTrace }: { exception: any; stackTrace?: any }): string {
    if (stackTrace) {
      console.error(this._consoleColors['Red'] + stackTrace.toString() + this._consoleColors['Reset']);
    }
    console.error(this._consoleColors['Red'] + exception.toString() + this._consoleColors['Reset']);
    return exception.toString();
  }

  static validPrimaryKey({ value }: { value: any }): boolean {
    if (value != null && value !== '') {
      if (typeof value === 'string' && value !== '0') return true;
      if (typeof value === 'number' && value !== 0) return true;
    }
    return false;
  }

  static validValue({ value }: { value: any }): boolean {
    return value != null;
  }

  static uuid(): string {
    return uuidv4();
  }
}
