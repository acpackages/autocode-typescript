import crypto from 'crypto';
import { AcBaseSqlDao, AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcEnumDDSelectMode } from '@autocode-ts/ac-data-dictionary';
import { AcLogger, AcEnumLogType } from '@autocode-ts/autocode';
import { AcExceptorServerTables } from '../data-dictionary/ac-exceptor-server-tables';
import { TblExceptions, TblExceptionOccurrences } from '../data-dictionary/ac-exceptor-server-columns';
import { kAcExceptorServerDataDictionaryName } from '../data-dictionary/ac-exceptor-server-data-dictionary';
import { AcEnumExceptionStatus } from '../enums/ac-enum-exception-status.enum';
import { AcEnumExceptionSeverity } from '../enums/ac-enum-exception-severity.enum';
import { AcExceptionReportItem } from '../models/ac-exception-report-item.model';
import { AcExceptionBatchRequest } from '../models/ac-exception-batch-request.model';

export interface IIngestionResult {
  success: boolean;
  exceptionId: number;
  occurrenceId: number;
}

export interface IBatchIngestionResult {
  success: boolean;
  processedCount: number;
  results: IIngestionResult[];
}

export class AcExceptorIngestionService {
  readonly dao: AcBaseSqlDao;
  readonly dataDictionaryName: string;
  readonly exceptionsTable: AcSqlDbTable;
  readonly occurrencesTable: AcSqlDbTable;
  logger: AcLogger = new AcLogger({ logType: AcEnumLogType.Console, logMessages: false });

  constructor({
    dao,
    dataDictionaryName = kAcExceptorServerDataDictionaryName,
  }: {
    dao: AcBaseSqlDao;
    dataDictionaryName?: string;
  }) {
    this.dao = dao;
    this.dataDictionaryName = dataDictionaryName;
    this.exceptionsTable = new AcSqlDbTable({
      tableName: AcExceptorServerTables.Exceptions,
      dataDictionaryName,
    });
    this.exceptionsTable.dao = this.dao;
    this.occurrencesTable = new AcSqlDbTable({
      tableName: AcExceptorServerTables.ExceptionOccurrences,
      dataDictionaryName,
    });
    this.occurrencesTable.dao = this.dao;
  }

  /**
   * Computes a deterministic SHA-256 fingerprint for grouping exception occurrences.
   */
  static computeFingerprint({
    exceptionType,
    exceptionMessage,
    stackTrace,
  }: {
    exceptionType: string;
    exceptionMessage: string;
    stackTrace?: string;
  }): string {
    const cleanType = (exceptionType || 'UnknownException').trim();
    // Normalize message: trim and collapse dynamic whitespace
    const cleanMessage = (exceptionMessage || '')
      .trim()
      .replace(/\s+/g, ' ');

    let normalizedSource = `${cleanType}:${cleanMessage}`;

    // If stack trace is available, extract the first non-empty application frame to improve grouping accuracy
    if (stackTrace) {
      const frames = stackTrace
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && !f.startsWith('Error') && !f.startsWith('Exception'));
      if (frames.length > 0) {
        // Strip line and column numbers to group crashes across trivial line shifts
        const normalizedFrame = frames[0].replace(/:\d+(:\d+)?\)?$/, '');
        normalizedSource += `:${normalizedFrame}`;
      }
    }

    return crypto.createHash('sha256').update(normalizedSource).digest('hex');
  }

  /**
   * Ingests a single exception occurrence report, automatically deduplicating
   * and grouping into the `exceptions` table and recording the occurrence.
   */
  async ingestException({
    item,
    defaultIpAddress,
    defaultUserAgent,
  }: {
    item: AcExceptionReportItem;
    defaultIpAddress?: string;
    defaultUserAgent?: string;
  }): Promise<IIngestionResult> {
    const appId = item.appId || 'default';
    const environment = item.environment || 'production';
    const clientTimestamp = item.occurredAt || new Date().toISOString();
    const serverTimestamp = new Date().toISOString();
    const isHandledNum = item.isHandled ? 1 : 0;
    const severity = item.severity || AcEnumExceptionSeverity.Error;

    // Fingerprint calculation or use client-provided fingerprint
    const fingerprint =
      item.fingerprint && item.fingerprint.trim().length > 0
        ? item.fingerprint.trim()
        : AcExceptorIngestionService.computeFingerprint({
            exceptionType: item.exceptionType,
            exceptionMessage: item.exceptionMessage,
            stackTrace: item.stackTrace,
          });

    // 1. Check for existing grouped exception
    const selectCondition = `${TblExceptions.AppId} = :appId AND ${TblExceptions.Environment} = :env AND ${TblExceptions.Fingerprint} = :fingerprint`;
    const selectParams = {
      ':appId': appId,
      ':env': environment,
      ':fingerprint': fingerprint,
    };

    const existingResult = await this.exceptionsTable.getRows({
      condition: selectCondition,
      parameters: selectParams,
      mode: AcEnumDDSelectMode.First,
    });

    let exceptionId: number;

    if (existingResult.isSuccess() && existingResult.rows && existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      exceptionId = Number(existing[TblExceptions.Id]);

      const currentCount = Number(existing[TblExceptions.OccurrenceCount]) || 1;
      let affectedDevices = Number(existing[TblExceptions.AffectedDevicesCount]) || 1;

      // Check if device_id is new for this exception
      if (item.deviceId && item.deviceId.trim().length > 0) {
        const deviceCheck = await this.occurrencesTable.getRows({
          condition: `${TblExceptionOccurrences.ExceptionId} = :exceptionId AND ${TblExceptionOccurrences.DeviceId} = :deviceId`,
          parameters: {
            ':exceptionId': exceptionId,
            ':deviceId': item.deviceId,
          },
          mode: AcEnumDDSelectMode.First,
        });

        if (!deviceCheck.isSuccess() || !deviceCheck.rows || deviceCheck.rows.length === 0) {
          affectedDevices += 1;
        }
      }

      // If incoming error is unhandled/fatal, it overrides handled status (0 = unhandled takes precedence)
      const existingHandled = Number(existing[TblExceptions.IsHandled]) || 0;
      const finalHandled = isHandledNum === 0 ? 0 : existingHandled;

      // If the exception was marked resolved, reopen it since a new occurrence was reported
      const currentStatus = existing[TblExceptions.Status];
      const newStatus =
        currentStatus === AcEnumExceptionStatus.Resolved
          ? AcEnumExceptionStatus.Open
          : currentStatus;

      const updateRow: Record<string, any> = {
        [TblExceptions.OccurrenceCount]: currentCount + 1,
        [TblExceptions.AffectedDevicesCount]: affectedDevices,
        [TblExceptions.LastOccurredAt]: clientTimestamp,
        [TblExceptions.IsHandled]: finalHandled,
        [TblExceptions.Status]: newStatus,
      };

      if (item.stackTrace && item.stackTrace.trim().length > 0) {
        updateRow[TblExceptions.LatestStackTrace] = item.stackTrace;
      }

      await this.exceptionsTable.updateRow({
        row: updateRow,
        condition: `${TblExceptions.Id} = :id`,
        parameters: { ':id': exceptionId },
      });
    } else {
      // Insert new grouped exception
      const newExceptionRow: Record<string, any> = {
        [TblExceptions.AppId]: appId,
        [TblExceptions.Environment]: environment,
        [TblExceptions.Fingerprint]: fingerprint,
        [TblExceptions.ExceptionType]: item.exceptionType || 'UnknownException',
        [TblExceptions.ExceptionMessage]: item.exceptionMessage || 'No message provided',
        [TblExceptions.LatestStackTrace]: item.stackTrace || '',
        [TblExceptions.FirstOccurredAt]: clientTimestamp,
        [TblExceptions.LastOccurredAt]: clientTimestamp,
        [TblExceptions.OccurrenceCount]: 1,
        [TblExceptions.AffectedDevicesCount]: 1,
        [TblExceptions.Status]: AcEnumExceptionStatus.Open,
        [TblExceptions.Severity]: severity,
        [TblExceptions.IsHandled]: isHandledNum,
      };

      const insertResult = await this.exceptionsTable.insertRow({ row: newExceptionRow });
      if (insertResult.isSuccess()) {
        exceptionId = Number(insertResult.lastInsertedId);
        if (isNaN(exceptionId) && insertResult.rows && insertResult.rows.length > 0) {
          exceptionId = Number(insertResult.rows[0][TblExceptions.Id]);
        }
      } else {
        throw new Error(`Failed to create exception record: ${insertResult.message}`);
      }
    }

    // 2. Insert occurrence event
    const ipAddress = item.ipAddress || defaultIpAddress || '';
    const userAgent = item.userAgent || defaultUserAgent || '';
    let metadataStr = '';
    if (typeof item.metadata === 'string') {
      metadataStr = item.metadata;
    } else if (typeof item.metadata === 'object' && item.metadata !== null) {
      metadataStr = JSON.stringify(item.metadata);
    }

    const occurrenceRow: Record<string, any> = {
      [TblExceptionOccurrences.ExceptionId]: exceptionId,
      [TblExceptionOccurrences.OccurredAt]: clientTimestamp,
      [TblExceptionOccurrences.ReceivedAt]: serverTimestamp,
      [TblExceptionOccurrences.DeviceId]: item.deviceId || '',
      [TblExceptionOccurrences.DeviceModel]: item.deviceModel || '',
      [TblExceptionOccurrences.OsName]: item.osName || '',
      [TblExceptionOccurrences.OsVersion]: item.osVersion || '',
      [TblExceptionOccurrences.AppVersion]: item.appVersion || '',
      [TblExceptionOccurrences.AppBuildNumber]: item.appBuildNumber || '',
      [TblExceptionOccurrences.UserId]: item.userId || '',
      [TblExceptionOccurrences.SessionId]: item.sessionId || '',
      [TblExceptionOccurrences.IpAddress]: ipAddress,
      [TblExceptionOccurrences.UserAgent]: userAgent,
      [TblExceptionOccurrences.StackTrace]: item.stackTrace || '',
      [TblExceptionOccurrences.IsHandled]: isHandledNum,
      [TblExceptionOccurrences.Metadata]: metadataStr,
    };

    const occurrenceResult = await this.occurrencesTable.insertRow({ row: occurrenceRow });
    let occurrenceId = 0;
    if (occurrenceResult.isSuccess()) {
      occurrenceId = Number(occurrenceResult.lastInsertedId);
      if (isNaN(occurrenceId) && occurrenceResult.rows && occurrenceResult.rows.length > 0) {
        occurrenceId = Number(occurrenceResult.rows[0][TblExceptionOccurrences.Id]);
      }
    } else {
      console.error('OCCURRENCE INSERT FAILED:', occurrenceResult.message, occurrenceResult.exception);
    }

    return {
      success: true,
      exceptionId,
      occurrenceId,
    };
  }

  /**
   * Ingests a batch of offline/queued exceptions from mobile or desktop clients.
   * Runs operations in a transaction when supported by the underlying DAO.
   */
  async ingestBatch({
    batch,
    defaultIpAddress,
    defaultUserAgent,
  }: {
    batch: AcExceptionBatchRequest | AcExceptionReportItem[];
    defaultIpAddress?: string;
    defaultUserAgent?: string;
  }): Promise<IBatchIngestionResult> {
    const items = batch instanceof AcExceptionBatchRequest ? batch.exceptions : batch;
    const results: IIngestionResult[] = [];

    // Begin transaction
    try {
      await this.dao.executeStatement({ statement: 'BEGIN' });
    } catch {
      // Transaction support is best-effort depending on DAO driver
    }

    try {
      for (const item of items) {
        const res = await this.ingestException({
          item,
          defaultIpAddress,
          defaultUserAgent,
        });
        results.push(res);
      }

      try {
        await this.dao.executeStatement({ statement: 'COMMIT' });
      } catch {
        // Best-effort commit
      }

      return {
        success: true,
        processedCount: results.length,
        results,
      };
    } catch (error) {
      try {
        await this.dao.executeStatement({ statement: 'ROLLBACK' });
      } catch {
        // Best-effort rollback
      }
      throw error;
    }
  }
}
