import { AcBaseSqlDao, AcSqlDbSchemaManager } from '@autocode-ts/ac-sql';
import { AcSqliteDao, AcMysqlDao, AcPostgresDao } from '@autocode-ts/ac-sql-node';
import { AcWeb } from '@autocode-ts/ac-web';

import {
  kAcExceptorServerDataDictionaryName,
  kAcExceptorServerDataDictionaryJson,
  registerExceptorServerDataDictionary,
} from './lib/data-dictionary/ac-exceptor-server-data-dictionary';
import { AcExceptorServerTables } from './lib/data-dictionary/ac-exceptor-server-tables';
import { TblExceptions, TblExceptionOccurrences } from './lib/data-dictionary/ac-exceptor-server-columns';
import { AcEnumExceptionStatus } from './lib/enums/ac-enum-exception-status.enum';
import { AcEnumExceptionSeverity } from './lib/enums/ac-enum-exception-severity.enum';
import { AcExceptionReportItem } from './lib/models/ac-exception-report-item.model';
import { AcExceptionReportRequest } from './lib/models/ac-exception-report-request.model';
import { AcExceptionBatchRequest } from './lib/models/ac-exception-batch-request.model';
import { AcExceptionQueryFilter } from './lib/models/ac-exception-query-filter.model';
import { AcExceptionSummary, IDailyTrendItem } from './lib/models/ac-exception-summary.model';
import { AcExceptorServerConfig } from './lib/models/ac-exceptor-server-config.model';
import { AcExceptorIngestionService, IIngestionResult, IBatchIngestionResult } from './lib/services/ac-exceptor-ingestion.service';
import { AcExceptorQueryService, IPaginatedResult, IExceptionDetails } from './lib/services/ac-exceptor-query.service';
import { AcExceptorIngestController } from './lib/controllers/ac-exceptor-ingest.controller';
import { AcExceptorQueryController } from './lib/controllers/ac-exceptor-query.controller';

// Re-exports
export * from './lib/enums/ac-enum-exception-status.enum';
export * from './lib/enums/ac-enum-exception-severity.enum';
export * from './lib/data-dictionary/ac-exceptor-server-tables';
export * from './lib/data-dictionary/ac-exceptor-server-columns';
export * from './lib/data-dictionary/ac-exceptor-server-data-dictionary';
export * from './lib/models/ac-exception-report-item.model';
export * from './lib/models/ac-exception-report-request.model';
export * from './lib/models/ac-exception-batch-request.model';
export * from './lib/models/ac-exception-query-filter.model';
export * from './lib/models/ac-exception-summary.model';
export * from './lib/models/ac-exceptor-server-config.model';
export * from './lib/services/ac-exceptor-ingestion.service';
export * from './lib/services/ac-exceptor-query.service';
export * from './lib/controllers/ac-exceptor-ingest.controller';
export * from './lib/controllers/ac-exceptor-query.controller';

export class AcExceptorServer {
  static dao: AcBaseSqlDao;
  static dataDictionaryName: string = kAcExceptorServerDataDictionaryName;
  static ingestionService: AcExceptorIngestionService;
  static queryService: AcExceptorQueryService;
  static isInitialized: boolean = false;

  /**
   * Initializes the Exceptor Server:
   * 1. Registers the Data Dictionary.
   * 2. Runs AcSqlDbSchemaManager to create/migrate tables idempotently.
   * 3. Ensures composite unique key index exists.
   * 4. Initializes ingestion and query services.
   * 5. Registers controllers with AcWeb if provided.
   */
  static async initialize({
    dao,
    dataDictionaryName = kAcExceptorServerDataDictionaryName,
    acWeb,
  }: {
    dao: AcSqliteDao | AcMysqlDao | AcPostgresDao | AcBaseSqlDao;
    dataDictionaryName?: string;
    acWeb?: AcWeb;
  }): Promise<void> {
    this.dao = dao;
    this.dataDictionaryName = dataDictionaryName;

    // 1. Register Data Dictionary
    registerExceptorServerDataDictionary({ dataDictionaryName });

    // 2. Initialize database schema
    const schemaManager = new AcSqlDbSchemaManager({
      dataDictionaryName,
      dao,
    });
    schemaManager.logger.logMessages = false;

    const schemaResult = await schemaManager.initDatabase();
    if (schemaResult.isFailure()) {
      // Fallback: create tables directly if initDatabase couldn't verify schema differences
      await schemaManager.createDatabaseTables();
    }

    // 3. Ensure composite unique key index exists
    try {
      await dao.executeStatement({
        statement: `CREATE UNIQUE INDEX IF NOT EXISTS idx_exceptions_app_env_fp ON ${AcExceptorServerTables.Exceptions}(${TblExceptions.AppId}, ${TblExceptions.Environment}, ${TblExceptions.Fingerprint})`,
      });
    } catch {
      // Unique index may already exist or table constraint handles it
    }

    // 4. Initialize services
    this.ingestionService = new AcExceptorIngestionService({
      dao,
      dataDictionaryName,
    });
    this.queryService = new AcExceptorQueryService({
      dao,
      dataDictionaryName,
    });

    // 5. Register controllers with AcWeb if provided
    if (acWeb) {
      acWeb.registerController({ controllerClass: AcExceptorIngestController });
      acWeb.registerController({ controllerClass: AcExceptorQueryController });
    }

    this.isInitialized = true;
  }
}
