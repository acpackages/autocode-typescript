import { AcBaseSqlDao, AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcEnumDDSelectMode } from '@autocode-ts/ac-data-dictionary';
import { AcExceptorServerTables } from '../data-dictionary/ac-exceptor-server-tables';
import { TblExceptions, TblExceptionOccurrences } from '../data-dictionary/ac-exceptor-server-columns';
import { kAcExceptorServerDataDictionaryName } from '../data-dictionary/ac-exceptor-server-data-dictionary';
import { AcEnumExceptionStatus } from '../enums/ac-enum-exception-status.enum';
import { AcExceptionQueryFilter } from '../models/ac-exception-query-filter.model';
import { AcExceptionSummary, IDailyTrendItem } from '../models/ac-exception-summary.model';

export interface IPaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IExceptionDetails {
  exception: Record<string, any>;
  recentOccurrences: Record<string, any>[];
  osBreakdown: Array<{ osName: string; count: number }>;
  versionBreakdown: Array<{ appVersion: string; count: number }>;
}

export class AcExceptorQueryService {
  readonly dao: AcBaseSqlDao;
  readonly dataDictionaryName: string;
  readonly exceptionsTable: AcSqlDbTable;
  readonly occurrencesTable: AcSqlDbTable;

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
   * Lists grouped exceptions with pagination, filters, and sorting.
   */
  async listExceptions(filter: AcExceptionQueryFilter): Promise<IPaginatedResult<Record<string, any>>> {
    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (filter.appId) {
      conditions.push(`${TblExceptions.AppId} = :appId`);
      parameters[':appId'] = filter.appId;
    }

    if (filter.environment) {
      conditions.push(`${TblExceptions.Environment} = :environment`);
      parameters[':environment'] = filter.environment;
    }

    if (filter.status) {
      conditions.push(`${TblExceptions.Status} = :status`);
      parameters[':status'] = filter.status;
    }

    if (filter.severity) {
      conditions.push(`${TblExceptions.Severity} = :severity`);
      parameters[':severity'] = filter.severity;
    }

    if (filter.isHandled !== undefined) {
      conditions.push(`${TblExceptions.IsHandled} = :isHandled`);
      parameters[':isHandled'] = filter.isHandled ? 1 : 0;
    }

    if (filter.search && filter.search.trim().length > 0) {
      conditions.push(`(${TblExceptions.ExceptionType} LIKE :search OR ${TblExceptions.ExceptionMessage} LIKE :search)`);
      parameters[':search'] = `%${filter.search.trim()}%`;
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '';

    // Count total matching items
    const countCondition = whereClause ? `WHERE ${whereClause}` : '';
    const countSql = `SELECT COUNT(1) AS total FROM ${AcExceptorServerTables.Exceptions} ${countCondition}`;
    const countRes = await this.dao.getRows({
      statement: countSql,
      parameters,
      mode: AcEnumDDSelectMode.First,
    });

    const totalCount =
      countRes.isSuccess() && countRes.rows && countRes.rows.length > 0
        ? Number(countRes.rows[0]['total']) || 0
        : 0;

    // Fetch paginated rows
    const page = Math.max(1, filter.page);
    const pageSize = Math.max(1, filter.pageSize);
    const offset = (page - 1) * pageSize;
    const sortBy = filter.sortBy || TblExceptions.LastOccurredAt;
    const sortOrder = filter.sortOrder || 'DESC';

    const listSql = `SELECT * FROM ${AcExceptorServerTables.Exceptions} ${countCondition} ORDER BY ${sortBy} ${sortOrder} LIMIT ${pageSize} OFFSET ${offset}`;
    const listRes = await this.dao.getRows({
      statement: listSql,
      parameters,
      mode: AcEnumDDSelectMode.List,
    });

    const items = listRes.isSuccess() && listRes.rows ? listRes.rows : [];
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Retrieves single grouped exception details by ID along with breakdown metrics.
   */
  async getExceptionById(id: number): Promise<IExceptionDetails | null> {
    const res = await this.exceptionsTable.getRows({
      condition: `${TblExceptions.Id} = :id`,
      parameters: { ':id': id },
      mode: AcEnumDDSelectMode.First,
    });

    if (!res.isSuccess() || !res.rows || res.rows.length === 0) {
      return null;
    }

    const exception = res.rows[0];

    // Recent 10 occurrences
    const recentRes = await this.dao.getRows({
      statement: `SELECT * FROM ${AcExceptorServerTables.ExceptionOccurrences} WHERE ${TblExceptionOccurrences.ExceptionId} = :id ORDER BY ${TblExceptionOccurrences.OccurredAt} DESC LIMIT 10`,
      parameters: { ':id': id },
      mode: AcEnumDDSelectMode.List,
    });
    const recentOccurrences = recentRes.isSuccess() && recentRes.rows ? recentRes.rows : [];

    // OS distribution
    const osRes = await this.dao.getRows({
      statement: `SELECT ${TblExceptionOccurrences.OsName} AS osName, COUNT(1) AS count FROM ${AcExceptorServerTables.ExceptionOccurrences} WHERE ${TblExceptionOccurrences.ExceptionId} = :id GROUP BY ${TblExceptionOccurrences.OsName} ORDER BY count DESC`,
      parameters: { ':id': id },
      mode: AcEnumDDSelectMode.List,
    });
    const osBreakdown = (osRes.isSuccess() && osRes.rows ? osRes.rows : []).map((r) => ({
      osName: r.osName || 'Unknown',
      count: Number(r.count) || 0,
    }));

    // App Version distribution
    const verRes = await this.dao.getRows({
      statement: `SELECT ${TblExceptionOccurrences.AppVersion} AS appVersion, COUNT(1) AS count FROM ${AcExceptorServerTables.ExceptionOccurrences} WHERE ${TblExceptionOccurrences.ExceptionId} = :id GROUP BY ${TblExceptionOccurrences.AppVersion} ORDER BY count DESC`,
      parameters: { ':id': id },
      mode: AcEnumDDSelectMode.List,
    });
    const versionBreakdown = (verRes.isSuccess() && verRes.rows ? verRes.rows : []).map((r) => ({
      appVersion: r.appVersion || 'Unknown',
      count: Number(r.count) || 0,
    }));

    return {
      exception,
      recentOccurrences,
      osBreakdown,
      versionBreakdown,
    };
  }

  /**
   * Lists occurrence events for a grouped exception with pagination.
   */
  async listOccurrences({
    exceptionId,
    deviceId,
    page = 1,
    pageSize = 20,
  }: {
    exceptionId: number;
    deviceId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<IPaginatedResult<Record<string, any>>> {
    const conditions: string[] = [`${TblExceptionOccurrences.ExceptionId} = :exceptionId`];
    const parameters: Record<string, any> = { ':exceptionId': exceptionId };

    if (deviceId && deviceId.trim().length > 0) {
      conditions.push(`${TblExceptionOccurrences.DeviceId} = :deviceId`);
      parameters[':deviceId'] = deviceId.trim();
    }

    const whereClause = conditions.join(' AND ');

    // Count
    const countSql = `SELECT COUNT(1) AS total FROM ${AcExceptorServerTables.ExceptionOccurrences} WHERE ${whereClause}`;
    const countRes = await this.dao.getRows({
      statement: countSql,
      parameters,
      mode: AcEnumDDSelectMode.First,
    });
    const totalCount =
      countRes.isSuccess() && countRes.rows && countRes.rows.length > 0
        ? Number(countRes.rows[0]['total']) || 0
        : 0;

    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    const offset = (safePage - 1) * safePageSize;

    const listSql = `SELECT * FROM ${AcExceptorServerTables.ExceptionOccurrences} WHERE ${whereClause} ORDER BY ${TblExceptionOccurrences.OccurredAt} DESC LIMIT ${safePageSize} OFFSET ${offset}`;
    const listRes = await this.dao.getRows({
      statement: listSql,
      parameters,
      mode: AcEnumDDSelectMode.List,
    });

    const items = listRes.isSuccess() && listRes.rows ? listRes.rows : [];
    const totalPages = Math.ceil(totalCount / safePageSize);

    return {
      items,
      totalCount,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    };
  }

  /**
   * Updates triage status of an exception (open, investigating, resolved, ignored).
   */
  async updateExceptionStatus({
    id,
    status,
  }: {
    id: number;
    status: string;
  }): Promise<{ success: boolean; id: number; status: string }> {
    const validStatuses = Object.values(AcEnumExceptionStatus) as string[];
    const normalizedStatus = status.toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateRes = await this.exceptionsTable.updateRow({
      row: { [TblExceptions.Status]: normalizedStatus },
      condition: `${TblExceptions.Id} = :id`,
      parameters: { ':id': id },
    });

    if (!updateRes.isSuccess()) {
      throw new Error(`Failed to update status: ${updateRes.message}`);
    }

    return {
      success: true,
      id,
      status: normalizedStatus,
    };
  }

  /**
   * Returns aggregated dashboard summary statistics:
   * total exceptions, total occurrences, unresolved errors, top 10 crashes,
   * daily trend histogram, and crash-free session rate estimation.
   */
  async getSummaryStats({
    appId,
    environment,
  }: {
    appId?: string;
    environment?: string;
  } = {}): Promise<AcExceptionSummary> {
    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (appId) {
      conditions.push(`${TblExceptions.AppId} = :appId`);
      parameters[':appId'] = appId;
    }
    if (environment) {
      conditions.push(`${TblExceptions.Environment} = :environment`);
      parameters[':environment'] = environment;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total unique grouped exceptions
    const countSql = `SELECT COUNT(1) AS totalExceptions, SUM(${TblExceptions.OccurrenceCount}) AS totalOccurrences FROM ${AcExceptorServerTables.Exceptions} ${whereClause}`;
    const countRes = await this.dao.getRows({
      statement: countSql,
      parameters,
      mode: AcEnumDDSelectMode.First,
    });

    let totalExceptions = 0;
    let totalOccurrences = 0;
    if (countRes.isSuccess() && countRes.rows && countRes.rows.length > 0) {
      totalExceptions = Number(countRes.rows[0]['totalExceptions']) || 0;
      totalOccurrences = Number(countRes.rows[0]['totalOccurrences']) || 0;
    }

    // Unresolved exceptions
    const unresolvedWhere = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')} AND ${TblExceptions.Status} IN ('open', 'investigating')`
      : `WHERE ${TblExceptions.Status} IN ('open', 'investigating')`;
    const unresolvedSql = `SELECT COUNT(1) AS unresolved FROM ${AcExceptorServerTables.Exceptions} ${unresolvedWhere}`;
    const unresolvedRes = await this.dao.getRows({
      statement: unresolvedSql,
      parameters,
      mode: AcEnumDDSelectMode.First,
    });
    const unresolvedCount =
      unresolvedRes.isSuccess() && unresolvedRes.rows && unresolvedRes.rows.length > 0
        ? Number(unresolvedRes.rows[0]['unresolved']) || 0
        : 0;

    // Top 10 exceptions
    const topSql = `SELECT * FROM ${AcExceptorServerTables.Exceptions} ${whereClause} ORDER BY ${TblExceptions.OccurrenceCount} DESC LIMIT 10`;
    const topRes = await this.dao.getRows({
      statement: topSql,
      parameters,
      mode: AcEnumDDSelectMode.List,
    });
    const topExceptions = topRes.isSuccess() && topRes.rows ? topRes.rows : [];

    // Daily trends histogram: Group by substring(occurred_at, 1, 10)
    const trendSql = `
      SELECT SUBSTR(${TblExceptionOccurrences.OccurredAt}, 1, 10) AS date, COUNT(1) AS count
      FROM ${AcExceptorServerTables.ExceptionOccurrences}
      GROUP BY SUBSTR(${TblExceptionOccurrences.OccurredAt}, 1, 10)
      ORDER BY date ASC
      LIMIT 30
    `;
    const trendRes = await this.dao.getRows({
      statement: trendSql,
      mode: AcEnumDDSelectMode.List,
    });

    const dailyTrends: IDailyTrendItem[] = (trendRes.isSuccess() && trendRes.rows ? trendRes.rows : []).map(
      (r) => ({
        date: String(r.date || ''),
        count: Number(r.count) || 0,
      })
    );

    // Estimate crash-free session rate
    let crashFreeSessionRate = 100;
    const sessionSql = `
      SELECT
        COUNT(DISTINCT ${TblExceptionOccurrences.SessionId}) AS crashedSessions,
        COUNT(1) AS totalOccurrences
      FROM ${AcExceptorServerTables.ExceptionOccurrences}
      WHERE ${TblExceptionOccurrences.SessionId} IS NOT NULL AND ${TblExceptionOccurrences.SessionId} != ''
    `;
    const sessionRes = await this.dao.getRows({
      statement: sessionSql,
      mode: AcEnumDDSelectMode.First,
    });

    if (sessionRes.isSuccess() && sessionRes.rows && sessionRes.rows.length > 0) {
      const crashed = Number(sessionRes.rows[0]['crashedSessions']) || 0;
      const total = Number(sessionRes.rows[0]['totalOccurrences']) || 0;
      if (total > 0 && crashed > 0) {
        // Simple heuristic estimate based on recorded sessions
        crashFreeSessionRate = Math.max(0, Math.min(100, Math.round(((total - crashed) / total) * 10000) / 100));
      }
    }

    return AcExceptionSummary.instanceFromJson({
      jsonData: {
        totalExceptions,
        totalOccurrences,
        unresolvedCount,
        topExceptions,
        dailyTrends,
        crashFreeSessionRate,
      },
    });
  }
}
