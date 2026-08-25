/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty } from "../annotations/ac-bind-json-property.annotation";
import { AcLogger } from "../core/ac-logger";
import { AcJsonUtils } from "../utils/ac-json-utils";

export class AcResult {
  static readonly CodeNothingExecuted = 0;
  static readonly CodeSuccess = 1;
  static readonly CodeFailure = -1;
  static readonly CodeException = -2;

  static readonly KeyCode = 'code';
  static readonly KeyException = 'exception';
  static readonly KeyLog = 'log';
  static readonly KeyMesssage = 'message';
  static readonly KeyOtherDetails = 'otherDetails';
  static readonly KeyPreviousResult = 'previousResult';
  static readonly KeyStackTrace = 'stackTrace';
  static readonly KeyStatus = 'status';
  static readonly KeyValue = 'value';

  logger?: AcLogger;
  code: number = AcResult.CodeNothingExecuted;
  exception: any = null;
  log: any[] = [];
  message: string = 'Nothing executed';

  @AcBindJsonProperty({ key: AcResult.KeyOtherDetails })
  otherDetails: any[] = [];

  @AcBindJsonProperty({ key: AcResult.KeyStackTrace })
  stackTrace: any;

  status: string = 'failure';
  value: any;

  static instanceFromJson({ jsonData }: { jsonData: any }): AcResult {
    const instance = new AcResult();
    return instance.fromJson({ jsonData });
  }

  fromJson({ jsonData }: { jsonData: any }): AcResult {
    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData });
    return this;
  }

  isException(): boolean {
    return this.status === 'failure' && this.code === AcResult.CodeException;
  }

  isFailure(): boolean {
    return this.status === 'failure';
  }

  isSuccess(): boolean {
    return this.status === 'success';
  }

  appendResultLog({ result }: { result: AcResult }): AcResult {
    this.log.push(...result.log);
    return this;
  }

  prependResultLog({ result }: { result: AcResult }): AcResult {
    this.log.unshift(...result.log);
    return this;
  }

  setFromResult({
    result,
    message,
    logger
  }: {
    result: AcResult;
    message?: string;
    logger?: AcLogger;
  }): AcResult {
    this.status = result.status;
    this.message = result.message;
    this.code = result.code;

    if (this.isException()) {
      this.exception = result.exception;
      this.message = result.message;
    } else if (this.isSuccess()) {
      this.value = result.value;
    }

    return this;
  }

  setSuccess({
    value,
    message,
    logger
  }: {
    value?: any;
    message?: string;
    logger?: AcLogger;
  }= {}): AcResult {
    this.status = 'success';
    this.code = AcResult.CodeSuccess;

    if (value !== undefined) {
      this.value = value;
    }
    if (message) {
      this.message = message;
      logger?.success?.(this.message);
      this.logger?.success?.(this.message);
    }

    return this;
  }

  setFailure({
    value,
    message,
    logger
  }: {
    value?: any;
    message?: string;
    logger?: AcLogger;
  }): AcResult {
    this.status = 'failure';
    this.code = AcResult.CodeFailure;

    if (message) {
      this.message = message;
      logger?.error?.(this.message);
      this.logger?.error?.(this.message);
    }

    return this;
  }

  setException({
    exception,
    message,
    logger,
    logException = false,
    stackTrace
  }: {
    exception: any;
    message?: string;
    logger?: AcLogger;
    logException?: boolean;
    stackTrace?: any;
  }): AcResult {
    this.code = AcResult.CodeException;
    this.exception = exception;
    if(exception.stack){
      this.stackTrace = exception.stack;
    }
    this.message = message ?? `Exception : ${exception.toString()}\nStacktrace: ${this.stackTrace}`;

    if (logException) {
      logger?.error?.([this.exception?.toString?.(), this.stackTrace]);
      this.logger?.error?.([this.exception?.toString?.(), this.stackTrace]);
    }

    return this;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return AcJsonUtils.prettyEncode({object:this.toJson()});
  }
}
