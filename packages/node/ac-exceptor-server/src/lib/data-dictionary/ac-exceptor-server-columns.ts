export class TblExceptions {
  static readonly Id = 'id';
  static readonly AppId = 'app_id';
  static readonly Environment = 'environment';
  static readonly Fingerprint = 'fingerprint';
  static readonly ExceptionType = 'exception_type';
  static readonly ExceptionMessage = 'exception_message';
  static readonly LatestStackTrace = 'latest_stack_trace';
  static readonly FirstOccurredAt = 'first_occurred_at';
  static readonly LastOccurredAt = 'last_occurred_at';
  static readonly OccurrenceCount = 'occurrence_count';
  static readonly AffectedDevicesCount = 'affected_devices_count';
  static readonly Status = 'status';
  static readonly Severity = 'severity';
  static readonly IsHandled = 'is_handled';
}

export class TblExceptionOccurrences {
  static readonly Id = 'id';
  static readonly ExceptionId = 'exception_id';
  static readonly OccurredAt = 'occurred_at';
  static readonly ReceivedAt = 'received_at';
  static readonly DeviceId = 'device_id';
  static readonly DeviceModel = 'device_model';
  static readonly OsName = 'os_name';
  static readonly OsVersion = 'os_version';
  static readonly AppVersion = 'app_version';
  static readonly AppBuildNumber = 'app_build_number';
  static readonly UserId = 'user_id';
  static readonly SessionId = 'session_id';
  static readonly IpAddress = 'ip_address';
  static readonly UserAgent = 'user_agent';
  static readonly StackTrace = 'stack_trace';
  static readonly IsHandled = 'is_handled';
  static readonly Metadata = 'metadata';
}
