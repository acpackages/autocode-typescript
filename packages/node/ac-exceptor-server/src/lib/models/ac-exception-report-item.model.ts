import { AcBindJsonProperty, AcJsonUtils } from '@autocode-ts/autocode';
import { AcEnumExceptionSeverity } from '../enums/ac-enum-exception-severity.enum';

export class AcExceptionReportItem {
  @AcBindJsonProperty({ key: 'app_id' })
  appId: string = 'default';

  @AcBindJsonProperty({ key: 'environment' })
  environment: string = 'production';

  @AcBindJsonProperty({ key: 'fingerprint' })
  fingerprint?: string;

  @AcBindJsonProperty({ key: 'exception_type' })
  exceptionType: string = '';

  @AcBindJsonProperty({ key: 'exception_message' })
  exceptionMessage: string = '';

  @AcBindJsonProperty({ key: 'stack_trace' })
  stackTrace?: string;

  @AcBindJsonProperty({ key: 'occurred_at' })
  occurredAt?: string;

  @AcBindJsonProperty({ key: 'severity' })
  severity: string = AcEnumExceptionSeverity.Error;

  @AcBindJsonProperty({ key: 'is_handled' })
  isHandled: boolean | number = 0;

  @AcBindJsonProperty({ key: 'device_id' })
  deviceId?: string;

  @AcBindJsonProperty({ key: 'device_model' })
  deviceModel?: string;

  @AcBindJsonProperty({ key: 'os_name' })
  osName?: string;

  @AcBindJsonProperty({ key: 'os_version' })
  osVersion?: string;

  @AcBindJsonProperty({ key: 'app_version' })
  appVersion?: string;

  @AcBindJsonProperty({ key: 'app_build_number' })
  appBuildNumber?: string;

  @AcBindJsonProperty({ key: 'user_id' })
  userId?: string;

  @AcBindJsonProperty({ key: 'session_id' })
  sessionId?: string;

  @AcBindJsonProperty({ key: 'ip_address' })
  ipAddress?: string;

  @AcBindJsonProperty({ key: 'user_agent' })
  userAgent?: string;

  @AcBindJsonProperty({ key: 'metadata' })
  metadata?: Record<string, any> | string;

  static instanceFromJson({ jsonData }: { jsonData: any }): AcExceptionReportItem {
    const item = new AcExceptionReportItem();
    item.fromJson({ jsonData });
    return item;
  }

  fromJson({ jsonData }: { jsonData: any }): this {
    if (!jsonData || typeof jsonData !== 'object') return this;
    // Map camelCase properties if present
    const mappedData = { ...jsonData };
    if (jsonData.appId !== undefined && mappedData.app_id === undefined) mappedData.app_id = jsonData.appId;
    if (jsonData.exceptionType !== undefined && mappedData.exception_type === undefined) mappedData.exception_type = jsonData.exceptionType;
    if (jsonData.exceptionMessage !== undefined && mappedData.exception_message === undefined) mappedData.exception_message = jsonData.exceptionMessage;
    if (jsonData.stackTrace !== undefined && mappedData.stack_trace === undefined) mappedData.stack_trace = jsonData.stackTrace;
    if (jsonData.occurredAt !== undefined && mappedData.occurred_at === undefined) mappedData.occurred_at = jsonData.occurredAt;
    if (jsonData.isHandled !== undefined && mappedData.is_handled === undefined) mappedData.is_handled = jsonData.isHandled;
    if (jsonData.deviceId !== undefined && mappedData.device_id === undefined) mappedData.device_id = jsonData.deviceId;
    if (jsonData.deviceModel !== undefined && mappedData.device_model === undefined) mappedData.device_model = jsonData.deviceModel;
    if (jsonData.osName !== undefined && mappedData.os_name === undefined) mappedData.os_name = jsonData.osName;
    if (jsonData.osVersion !== undefined && mappedData.os_version === undefined) mappedData.os_version = jsonData.osVersion;
    if (jsonData.appVersion !== undefined && mappedData.app_version === undefined) mappedData.app_version = jsonData.appVersion;
    if (jsonData.appBuildNumber !== undefined && mappedData.app_build_number === undefined) mappedData.app_build_number = jsonData.appBuildNumber;
    if (jsonData.userId !== undefined && mappedData.user_id === undefined) mappedData.user_id = jsonData.userId;
    if (jsonData.sessionId !== undefined && mappedData.session_id === undefined) mappedData.session_id = jsonData.sessionId;
    if (jsonData.ipAddress !== undefined && mappedData.ip_address === undefined) mappedData.ip_address = jsonData.ipAddress;
    if (jsonData.userAgent !== undefined && mappedData.user_agent === undefined) mappedData.user_agent = jsonData.userAgent;

    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: mappedData });
    return this;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }
}
