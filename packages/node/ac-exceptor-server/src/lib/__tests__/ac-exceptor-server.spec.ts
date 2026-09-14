import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AcSqlConnection, AcSqlDatabase } from '@autocode-ts/ac-sql';
import { AcSqliteDao } from '@autocode-ts/ac-sql-node';
import { AcEnumSqlDatabaseType } from '@autocode-ts/autocode';
import { AcWeb } from '@autocode-ts/ac-web';

import {
  AcExceptorServer,
  AcExceptionReportItem,
  AcExceptionBatchRequest,
  AcEnumExceptionStatus,
  AcEnumExceptionSeverity,
  AcExceptionQueryFilter,
  AcExceptorIngestController,
  AcExceptorQueryController,
  TblExceptions,
  TblExceptionOccurrences,
} from '../../ac-exceptor-server';

describe('AcExceptorServer Test Suite', () => {
  const dbPath = path.join(__dirname, 'test-exceptor.sqlite');
  let dao: AcSqliteDao;
  let acWeb: AcWeb;

  beforeAll(async () => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    const connection = new AcSqlConnection();
    connection.database = dbPath;

    AcSqlDatabase.databaseType = AcEnumSqlDatabaseType.Sqlite;
    AcSqlDatabase.sqlConnection = connection;

    dao = new AcSqliteDao();
    dao.logger.logMessages = false;
    await dao.setSqlConnection({ sqlConnection: connection });

    acWeb = new AcWeb();

    await AcExceptorServer.initialize({
      dao,
      acWeb,
      dataDictionaryName: 'ac_exceptor_server_test',
    });
  });

  afterAll(async () => {
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch {
        // file handle may close with slight delay
      }
    }
  });

  describe('1. Ingestion Service', () => {
    it('should create a grouped exception record and an occurrence record for a single exception', async () => {
      const item = AcExceptionReportItem.instanceFromJson({
        jsonData: {
          app_id: 'test_app',
          environment: 'production',
          exception_type: 'NullPointerException',
          exception_message: 'Variable user is null in auth.service.ts',
          stack_trace: 'at AuthService.login (auth.service.ts:42:10)\nat main.ts:15:5',
          device_id: 'device-abc-1',
          os_name: 'Android',
          os_version: '14.0',
          app_version: '1.2.0',
          is_handled: false,
          metadata: { breadcrumbs: ['clicked_login', 'entered_credentials'] },
        },
      });

      const res = await AcExceptorServer.ingestionService.ingestException({ item });

      expect(res.success).toBe(true);
      expect(res.exceptionId).toBeGreaterThan(0);
      expect(res.occurrenceId).toBeGreaterThan(0);

      // Verify grouped record
      const details = await AcExceptorServer.queryService.getExceptionById(res.exceptionId);
      expect(details).not.toBeNull();
      expect(details?.exception[TblExceptions.ExceptionType]).toBe('NullPointerException');
      expect(details?.exception[TblExceptions.OccurrenceCount]).toBe(1);
      expect(details?.exception[TblExceptions.AffectedDevicesCount]).toBe(1);
      expect(details?.exception[TblExceptions.Status]).toBe(AcEnumExceptionStatus.Open);
      expect(details?.exception[TblExceptions.IsHandled]).toBe(0);

      // Verify occurrence record
      const occurrences = await AcExceptorServer.queryService.listOccurrences({
        exceptionId: res.exceptionId,
      });
      expect(occurrences.totalCount).toBe(1);
      expect(occurrences.items[0][TblExceptionOccurrences.DeviceId]).toBe('device-abc-1');
      expect(occurrences.items[0][TblExceptionOccurrences.OsName]).toBe('Android');
    });

    it('should deduplicate and increment occurrence_count and update last_occurred_at for matching exceptions', async () => {
      const item1 = AcExceptionReportItem.instanceFromJson({
        jsonData: {
          app_id: 'test_app',
          environment: 'production',
          exception_type: 'TypeError',
          exception_message: 'Cannot read properties of undefined (reading name)',
          stack_trace: 'at ProfileComponent.render (profile.ts:88:12)',
          device_id: 'device-user-1',
          occurred_at: '2026-09-01T10:00:00.000Z',
        },
      });

      const res1 = await AcExceptorServer.ingestionService.ingestException({ item: item1 });

      const item2 = AcExceptionReportItem.instanceFromJson({
        jsonData: {
          app_id: 'test_app',
          environment: 'production',
          exception_type: 'TypeError',
          exception_message: 'Cannot read properties of undefined (reading name)',
          stack_trace: 'at ProfileComponent.render (profile.ts:88:12)',
          device_id: 'device-user-2', // different device
          occurred_at: '2026-09-02T12:00:00.000Z',
        },
      });

      const res2 = await AcExceptorServer.ingestionService.ingestException({ item: item2 });

      // Must be grouped under the SAME exception_id
      expect(res2.exceptionId).toBe(res1.exceptionId);
      expect(res2.occurrenceId).toBeGreaterThan(res1.occurrenceId);

      const details = await AcExceptorServer.queryService.getExceptionById(res1.exceptionId);
      expect(details?.exception[TblExceptions.OccurrenceCount]).toBe(2);
      expect(details?.exception[TblExceptions.AffectedDevicesCount]).toBe(2);
      expect(details?.exception[TblExceptions.LastOccurredAt]).toBe('2026-09-02T12:00:00.000Z');

      // Occurrences list should now have 2 items
      const occurrences = await AcExceptorServer.queryService.listOccurrences({
        exceptionId: res1.exceptionId,
      });
      expect(occurrences.totalCount).toBe(2);
    });

    it('should process batch offline exceptions in a single sync operation', async () => {
      const batch = AcExceptionBatchRequest.instanceFromJson({
        jsonData: {
          exceptions: [
            {
              app_id: 'test_app',
              environment: 'production',
              exception_type: 'NetworkTimeoutException',
              exception_message: 'Connection timed out to api.example.com',
              device_id: 'mobile-offline-1',
              occurred_at: '2026-09-03T01:00:00.000Z',
            },
            {
              app_id: 'test_app',
              environment: 'production',
              exception_type: 'SocketException',
              exception_message: 'Failed host lookup',
              device_id: 'mobile-offline-1',
              occurred_at: '2026-09-03T01:05:00.000Z',
            },
            {
              app_id: 'test_app',
              environment: 'production',
              exception_type: 'NetworkTimeoutException',
              exception_message: 'Connection timed out to api.example.com',
              device_id: 'mobile-offline-1',
              occurred_at: '2026-09-03T01:10:00.000Z',
            },
          ],
        },
      });

      const batchResult = await AcExceptorServer.ingestionService.ingestBatch({ batch });

      expect(batchResult.success).toBe(true);
      expect(batchResult.processedCount).toBe(3);
      expect(batchResult.results.length).toBe(3);

      // The two NetworkTimeoutException items should be grouped together
      expect(batchResult.results[0].exceptionId).toBe(batchResult.results[2].exceptionId);
      expect(batchResult.results[1].exceptionId).not.toBe(batchResult.results[0].exceptionId);
    });
  });

  describe('2. Query & Status Management Service', () => {
    it('should update exception status to investigating, resolved, and ignored', async () => {
      const list = await AcExceptorServer.queryService.listExceptions(new AcExceptionQueryFilter());
      expect(list.items.length).toBeGreaterThan(0);

      const targetId = Number(list.items[0][TblExceptions.Id]);

      // 1. Update to investigating
      const res1 = await AcExceptorServer.queryService.updateExceptionStatus({
        id: targetId,
        status: AcEnumExceptionStatus.Investigating,
      });
      expect(res1.status).toBe(AcEnumExceptionStatus.Investigating);

      let detail = await AcExceptorServer.queryService.getExceptionById(targetId);
      expect(detail?.exception[TblExceptions.Status]).toBe(AcEnumExceptionStatus.Investigating);

      // 2. Update to resolved
      await AcExceptorServer.queryService.updateExceptionStatus({
        id: targetId,
        status: AcEnumExceptionStatus.Resolved,
      });
      detail = await AcExceptorServer.queryService.getExceptionById(targetId);
      expect(detail?.exception[TblExceptions.Status]).toBe(AcEnumExceptionStatus.Resolved);

      // 3. Update to ignored
      await AcExceptorServer.queryService.updateExceptionStatus({
        id: targetId,
        status: AcEnumExceptionStatus.Ignored,
      });
      detail = await AcExceptorServer.queryService.getExceptionById(targetId);
      expect(detail?.exception[TblExceptions.Status]).toBe(AcEnumExceptionStatus.Ignored);
    });

    it('should throw when updating with an invalid status', async () => {
      const list = await AcExceptorServer.queryService.listExceptions(new AcExceptionQueryFilter());
      const targetId = Number(list.items[0][TblExceptions.Id]);

      await expect(
        AcExceptorServer.queryService.updateExceptionStatus({
          id: targetId,
          status: 'invalid_status_xyz',
        })
      ).rejects.toThrow();
    });

    it('should filter exceptions by search query, status, and pagination', async () => {
      // Search
      const searchRes = await AcExceptorServer.queryService.listExceptions(
        AcExceptionQueryFilter.instanceFromJson({
          jsonData: { search: 'NullPointer' },
        })
      );
      expect(searchRes.items.length).toBeGreaterThanOrEqual(1);
      expect(searchRes.items[0][TblExceptions.ExceptionType]).toContain('NullPointer');

      // Pagination
      const pageRes = await AcExceptorServer.queryService.listExceptions(
        AcExceptionQueryFilter.instanceFromJson({
          jsonData: { page: 1, pageSize: 2 },
        })
      );
      expect(pageRes.items.length).toBeLessThanOrEqual(2);
      expect(pageRes.pageSize).toBe(2);
      expect(pageRes.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should compute summary statistics including top exceptions and daily trends', async () => {
      const summary = await AcExceptorServer.queryService.getSummaryStats();

      expect(summary.totalExceptions).toBeGreaterThan(0);
      expect(summary.totalOccurrences).toBeGreaterThan(0);
      expect(summary.topExceptions.length).toBeGreaterThan(0);
      expect(summary.dailyTrends.length).toBeGreaterThan(0);
      expect(summary.crashFreeSessionRate).toBeGreaterThanOrEqual(0);
      expect(summary.crashFreeSessionRate).toBeLessThanOrEqual(100);
    });
  });

  describe('3. Controllers Integration', () => {
    it('AcExceptorIngestController should process /report and extract IP and UserAgent', async () => {
      const controller = new AcExceptorIngestController(AcExceptorServer.ingestionService);

      const response = await controller.report(
        {
          appId: 'web_app',
          environment: 'staging',
          exceptionType: 'ReferenceError',
          exceptionMessage: 'config is not defined',
        },
        '192.168.1.100, 10.0.0.1', // x-forwarded-for
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' // user-agent
      );

      expect(response.isSuccess()).toBe(true);
      expect(response.data.success).toBe(true);
      expect(response.data.exceptionId).toBeGreaterThan(0);
      expect(response.data.occurrenceId).toBeGreaterThan(0);

      // Verify recorded occurrence received the forwarded IP and User-Agent
      const occurrences = await AcExceptorServer.queryService.listOccurrences({
        exceptionId: response.data.exceptionId,
      });
      expect(occurrences.items[0][TblExceptionOccurrences.IpAddress]).toBe('192.168.1.100');
      expect(occurrences.items[0][TblExceptionOccurrences.UserAgent]).toContain('Mozilla');
    });

    it('AcExceptorIngestController should process /batch', async () => {
      const controller = new AcExceptorIngestController(AcExceptorServer.ingestionService);

      const response = await controller.batch({
        exceptions: [
          {
            appId: 'batch_app',
            exceptionType: 'BatchError1',
            exceptionMessage: 'Msg 1',
          },
          {
            appId: 'batch_app',
            exceptionType: 'BatchError2',
            exceptionMessage: 'Msg 2',
          },
        ],
      });

      expect(response.isSuccess()).toBe(true);
      expect(response.data.success).toBe(true);
      expect(response.data.processedCount).toBe(2);
    });

    it('AcExceptorQueryController should return summary stats, list exceptions, occurrences, and update status', async () => {
      const controller = new AcExceptorQueryController(AcExceptorServer.queryService);

      // 1. Summary stats
      const statsRes = await controller.getSummaryStats();
      expect(statsRes.isSuccess()).toBe(true);
      expect(statsRes.data.totalExceptions).toBeGreaterThan(0);

      // 2. List exceptions
      const listRes = await controller.listExceptions(1, 10);
      expect(listRes.isSuccess()).toBe(true);
      expect(listRes.data.items.length).toBeGreaterThan(0);

      const testId = listRes.data.items[0][TblExceptions.Id];

      // 3. Get exception details
      const detailRes = await controller.getExceptionById(testId);
      expect(detailRes.isSuccess()).toBe(true);
      expect(detailRes.data.exception[TblExceptions.Id]).toBe(testId);

      // 4. Get occurrences
      const occRes = await controller.getOccurrences(testId, 1, 10);
      expect(occRes.isSuccess()).toBe(true);
      expect(occRes.data.items.length).toBeGreaterThan(0);

      // 5. Update status
      const statusRes = await controller.updateStatus(testId, 'investigating');
      expect(statusRes.isSuccess()).toBe(true);
      expect(statusRes.data.status).toBe('investigating');
    });
  });
});
