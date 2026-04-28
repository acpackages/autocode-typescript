/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcEnumSqlDatabaseType,AcEnumSqlEntity, AcResult } from "@autocode-ts/autocode";
import { AcSqlDbBase } from "./ac-sql-db-base";
import { AcSchemaManagerTables, AcSMDataDictionary, SchemaDetails, TblSchemaDetails, TblSchemaLogs } from "./ac-schema-data-dictionary";
import { AcDataDictionary, AcDDFunction, AcDDStoredProcedure, AcDDTable, AcDDTableColumn, AcDDTrigger, AcDDView, AcDDViewColumn, AcEnumDDRowOperation, AcEnumDDSelectMode } from "@autocode-ts/ac-data-dictionary";
import { AcSqlDbTable } from "./ac-sql-db-table";
import { AcSqlDaoResult } from "../models/ac-sql-dao-result.model";
import { AcBaseSqlDao } from "../daos/ac-base-sql-dao";

export class AcSqlDbSchemaManager extends AcSqlDbBase {
  acSqlDDTableSchemaDetails = new AcSqlDbTable({
    tableName: AcSchemaManagerTables.SchemaDetails,
    dataDictionaryName: AcSMDataDictionary.DataDictionaryName,
  });
  acSqlDDTableSchemaLogs = new AcSqlDbTable({
    tableName: AcSchemaManagerTables.SchemaLogs,
    dataDictionaryName: AcSMDataDictionary.DataDictionaryName,
  });

  constructor({ dataDictionaryName,dao }: { dataDictionaryName?: string,dao?:AcBaseSqlDao } = {}) {
    super({ dataDictionaryName,dao });
  }

  async checkSchemaUpdateAvailableFromVersion(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log(
        'Checking if database data dictionary version is the same as the current data dictionary version...'
      );

      const versionResult = await this.dao!.getRows({
        statement: this.acSqlDDTableSchemaDetails.getSelectStatement(),
        condition: `${TblSchemaDetails.AcSchemaDetailKey} = @key`,
        parameters: {
          '@key': `${SchemaDetails.KeyDataDictionaryVersion}[${this.dataDictionaryName}]`,
        },
        mode: AcEnumDDSelectMode.First, // important
      });

      if (versionResult.isSuccess()) {
        if (versionResult.rows.length > 0) {
          const databaseVersion = versionResult.rows[0][
            TblSchemaDetails.AcSchemaDetailNumericValue
          ] as number;

          if (this.acDataDictionary.version === databaseVersion) {
            this.logger.log(
              'Database data dictionary and current data dictionary version are the same.'
            );
            result.setSuccess({ value: false }); // No update available
          } else if (this.acDataDictionary.version < databaseVersion) {
            this.logger.log(
              'Database data dictionary version is greater than the current data dictionary version.'
            );
            result.setSuccess({ value: false }); // No update available
          } else {
            this.logger.log(
              'Database data dictionary version is less than the current data dictionary version.'
            );
            result.setSuccess({ value: true }); // Update available
          }
        } else {
          this.logger.log('No version detail row found in details table.');
          result.setSuccess({ value: true }); // Update available
        }
      } else {
        result.setFromResult({
          result: versionResult,
          message: 'Error checking schema version',
          logger: this.logger,
        });
      }
    } catch (ex: any) {
      result.setException({
        exception: ex,
        stackTrace: ex.stack,
        logger: this.logger,
      });
    }
    return result;
  }

  async createDatabaseFunctions(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log('Creating functions in database...');
      const functionList = AcDataDictionary.getFunctions({
        dataDictionaryName: this.dataDictionaryName,
      });

      let continueOperation: boolean = true;
      for (const acDDFunction of Object.values(functionList)) {
        if (continueOperation) {
          const dropStatement = AcDDFunction.getDropFunctionStatement({
            functionName: acDDFunction.functionName,
            databaseType: this.databaseType,
          });

          this.logger.log(`Executing drop function statement: ${dropStatement}`);

          const dropResult = await this.dao!.executeStatement({
            statement: dropStatement,
            operation: AcEnumDDRowOperation.Unknown,
          });

          if (dropResult.isSuccess()) {
            this.logger.log('Drop statement executed successfully.');
          } else {
            return result.setFromResult({
              result: dropResult,
              message: 'Error executing drop statement',
              logger: this.logger,
            });
          }

          const dropLogResponse = await this.saveSchemaLogEntry({
            row: {
              [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Function,
              [TblSchemaLogs.AcSchemaEntityName]: acDDFunction.functionName,
              [TblSchemaLogs.AcSchemaOperation]: 'drop',
              [TblSchemaLogs.AcSchemaOperationResult]: dropResult.status,
              [TblSchemaLogs.AcSchemaOperationStatement]: dropStatement,
              [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
            }
          });

          if (dropLogResponse.isFailure()) {
            continueOperation = false;
            result.setFromResult({ result: dropLogResponse, message: 'EWrror adding drop function log entry' });
          }

          if (continueOperation) {
            const createStatement = acDDFunction.getCreateFunctionStatement({ databaseType: this.databaseType });
            this.logger.log(`Creating function with statement: ${createStatement}`);

            const createResult = await this.dao!.executeStatement({
              statement: createStatement,
              operation: AcEnumDDRowOperation.Unknown,
            });

            if (createResult.isSuccess()) {
              this.logger.log('Function created successfully.');
            } else {
              return result.setFromResult({
                result: createResult,
                message: 'Error creating function',
                logger: this.logger,
              });
            }

            const createLogResponse = await this.saveSchemaLogEntry({
              row: {
                [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Function,
                [TblSchemaLogs.AcSchemaEntityName]: acDDFunction.functionName,
                [TblSchemaLogs.AcSchemaOperation]: 'create',
                [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
                [TblSchemaLogs.AcSchemaOperationStatement]: createStatement,
                [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
              }
            });

            if (createLogResponse.isFailure()) {
              continueOperation = false;
              result.setFromResult({ result: createLogResponse, message: 'error saving create function log entry' });
            }

          }


        }
      }

      if (continueOperation) {
        result.setSuccess({
          message: 'Functions created successfully',
          logger: this.logger,
        });
      }

    } catch (ex: any) {
      result.setException({
        exception: ex,
        stackTrace: ex.stack,
        logger: this.logger,
      });
    }
    return result;
  }

  async createDatabaseRelationships(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log('Creating database relationships...');

      if (this.databaseType === AcEnumSqlDatabaseType.MySql) {
        const disableCheckStatement = "SET FOREIGN_KEY_CHECKS = 0;";
        this.logger.log(`Executing disable check statement: ${disableCheckStatement}`);
        const setCheckResult = await this.dao!.executeStatement({ statement: disableCheckStatement, operation: AcEnumDDRowOperation.Unknown });
        if (setCheckResult.isFailure()) {
          return result.setFromResult({
            result: setCheckResult,
            message: 'Error disabling foreign key checks',
            logger: this.logger,
          });
        } else {
          this.logger.log('Disabled foreign key checks.');
        }
      }

      this.logger.log('Getting and dropping existing relationships...');
      const getDropRelationshipsStatements = `
      SELECT CONCAT('ALTER Table \`', table_name, '\` DROP FOREIGN KEY \`', constraint_name, '\`;') AS drop_query,
             constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = @databaseName`;
      const getResult = await this.dao!.getRows({ statement: getDropRelationshipsStatements, parameters: { "@databaseName": this.dao!.sqlConnection.database } });
      if (getResult.isSuccess()) {
        for (const row of getResult.rows) {
          const dropRelationshipStatement = row['drop_query'] as string;
          const constraintName = row['constraint_name'] as string;
          this.logger.log(`Executing drop relationship statement: ${dropRelationshipStatement}`);
          const dropResponse = await this.dao!.executeStatement({ statement: dropRelationshipStatement, operation: AcEnumDDRowOperation.Unknown });
          if (dropResponse.isFailure()) {
            return result.setFromResult({
              result: dropResponse,
              message: 'Error dropping relationship',
              logger: this.logger,
            });
          } else {
            this.logger.log('Executed drop relation statement successfully.');
          }
          await this.saveSchemaLogEntry({
            row: {
              [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Relationship,
              [TblSchemaLogs.AcSchemaEntityName]: constraintName,
              [TblSchemaLogs.AcSchemaOperation]: 'drop',
              [TblSchemaLogs.AcSchemaOperationResult]: dropResponse.status,
              [TblSchemaLogs.AcSchemaOperationStatement]: dropRelationshipStatement,
              [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
            }
          });
        }
      } else {
        return result.setFromResult({
          result: getResult,
          message: 'Error getting relationships to drop',
          logger: this.logger,
        });
      }

      const relationshipList = AcDataDictionary.getRelationships({ dataDictionaryName: this.dataDictionaryName });
      for (const acDDRelationship of relationshipList) {
        this.logger.log(`Creating relationship for: ${acDDRelationship}`);
        const createRelationshipStatement = acDDRelationship.getCreateRelationshipStatement();
        this.logger.log(`Create relationship statement: ${createRelationshipStatement}`);
        const createResult = await this.dao!.executeStatement({ statement: createRelationshipStatement });
        if (createResult.isFailure()) {
          return result.setFromResult({
            result: createResult,
            message: 'Error creating relationship',
            logger: this.logger,
          });
        } else {
          this.logger.log('Relationship created successfully.');
        }
        await this.saveSchemaLogEntry({
          row: {
            [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Relationship,
            [TblSchemaLogs.AcSchemaEntityName]: `${acDDRelationship.sourceTable}.${acDDRelationship.sourceColumn}>${acDDRelationship.destinationTable}.${acDDRelationship.destinationColumn}`,
            [TblSchemaLogs.AcSchemaOperation]: 'create',
            [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
            [TblSchemaLogs.AcSchemaOperationStatement]: createRelationshipStatement,
            [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          }
        });
      }

      result.setSuccess({ message: 'Relationships created successfully', logger: this.logger });
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger });
    }
    return result;
  }

  async createDatabaseStoredProcedures(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log('Creating stored procedures...');
      const storedProcedureList = AcDataDictionary.getStoredProcedures({ dataDictionaryName: this.dataDictionaryName });
      for (const acDDStoredProcedure of Object.values(storedProcedureList)) {
        const dropStatement = AcDDStoredProcedure.getDropStoredProcedureStatement({
          storedProcedureName: acDDStoredProcedure.storedProcedureName,
          databaseType: this.databaseType,
        });
        this.logger.log(`Executing drop stored procedure statement: ${dropStatement}`);
        const dropResult = await this.dao!.executeStatement({ statement: dropStatement });
        if (dropResult.isSuccess()) {
          this.logger.log('Drop statement executed successfully.');
        } else {
          return result.setFromResult({
            result: dropResult,
            message: 'Error executing drop statement',
            logger: this.logger,
          });
        }
        await this.saveSchemaLogEntry({
          row: {
            [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.StoredProcedure,
            [TblSchemaLogs.AcSchemaEntityName]: acDDStoredProcedure.storedProcedureName,
            [TblSchemaLogs.AcSchemaOperation]: 'drop',
            [TblSchemaLogs.AcSchemaOperationResult]: dropResult.status,
            [TblSchemaLogs.AcSchemaOperationStatement]: dropStatement,
            [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          }
        });

        const createStatement = acDDStoredProcedure.getCreateStoredProcedureStatement({ databaseType: this.databaseType });
        this.logger.log(`Create statement: ${createStatement}`);
        const createResult = await this.dao!.executeStatement({ statement: createStatement });
        if (createResult.isSuccess()) {
          this.logger.log('Stored procedure created successfully.');
        } else {
          return result.setFromResult({
            result: createResult,
            message: 'Error creating stored procedure',
            logger: this.logger,
          });
        }
        await this.saveSchemaLogEntry({
          row: {
            [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.StoredProcedure,
            [TblSchemaLogs.AcSchemaEntityName]: acDDStoredProcedure.storedProcedureName,
            [TblSchemaLogs.AcSchemaOperation]: 'create',
            [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
            [TblSchemaLogs.AcSchemaOperationStatement]: createStatement,
            [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          }
        });
      }
      result.setSuccess({ message: 'Stored procedures created successfully', logger: this.logger });
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger });
    }
    return result;
  }

  async createDatabaseTables(): Promise<AcResult> {
    const result = new AcResult();
    try {
      const tables = AcDataDictionary.getTables({ dataDictionaryName: this.dataDictionaryName });
      let continueOperation = true;
      for (const acDDTable of Object.values(tables)) {
        if (continueOperation) {
          this.logger.log(`Creating table ${acDDTable.tableName}`);
          const createStatement = acDDTable.getCreateTableStatement({ databaseType: this.databaseType });
          this.logger.log(`Executing create table statement: ${createStatement}`);
          const createResult = await this.dao!.executeStatement({ statement: createStatement });
          if (createResult.isSuccess()) {
            this.logger.log('Create statement executed successfully.');
          } else {
            return result.setFromResult({
              result: createResult,
              message: `Error creating table ${acDDTable.tableName}`,
              logger: this.logger,
            });
          }
          const logResponse = await this.saveSchemaLogEntry({
            row: {
              [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Table,
              [TblSchemaLogs.AcSchemaEntityName]: acDDTable.tableName,
              [TblSchemaLogs.AcSchemaOperation]: 'create',
              [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
              [TblSchemaLogs.AcSchemaOperationStatement]: createStatement,
              [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
            }
          });
          if (logResponse.isFailure()) {
            continueOperation = false;
            result.setFromResult({ result: logResponse, message: 'Error saving log response' });
          }
        }
      }
      if (continueOperation) {
        result.setSuccess({ message: 'Tables created successfully', logger: this.logger });
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger });
    }
    return result;
  }

  async createDatabaseTriggers(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log('Creating triggers...');
      const triggers = AcDataDictionary.getTriggers({ dataDictionaryName: this.dataDictionaryName });
      for (const acDDTrigger of Object.values(triggers)) {
        this.logger.log(`Creating trigger ${acDDTrigger.triggerName}`);

        const dropStatement = AcDDTrigger.getDropTriggerStatement({
          triggerName: acDDTrigger.triggerName,
          databaseType: this.databaseType,
        });
        this.logger.log(`Executing drop trigger statement: ${dropStatement}`);
        const dropResult = await this.dao!.executeStatement({ statement: dropStatement });
        if (dropResult.isSuccess()) {
          this.logger.log('Drop statement executed successfully.');
        } else {
          return result.setFromResult({
            result: dropResult,
            message: 'Error executing drop statement',
            logger: this.logger,
          });
        }
        await this.saveSchemaLogEntry({
          row: {
            [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Trigger,
            [TblSchemaLogs.AcSchemaEntityName]: acDDTrigger.triggerName,
            [TblSchemaLogs.AcSchemaOperation]: 'drop',
            [TblSchemaLogs.AcSchemaOperationResult]: dropResult.status,
            [TblSchemaLogs.AcSchemaOperationStatement]: dropStatement,
            [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          }
        });

        const createStatement = acDDTrigger.getCreateTriggerStatement({ databaseType: this.databaseType });
        this.logger.log(`Create statement: ${createStatement}`);
        const createResult = await this.dao!.executeStatement({ statement: createStatement });
        if (createResult.isSuccess()) {
          this.logger.log('Trigger created successfully.');
        } else {
          return result.setFromResult({
            result: createResult,
            message: 'Error creating trigger',
            logger: this.logger,
          });
        }
        await this.saveSchemaLogEntry({
          row: {
            [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Trigger,
            [TblSchemaLogs.AcSchemaEntityName]: acDDTrigger.triggerName,
            [TblSchemaLogs.AcSchemaOperation]: 'create',
            [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
            [TblSchemaLogs.AcSchemaOperationStatement]: createStatement,
            [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          }
        });
      }
      result.setSuccess({ message: 'Triggers created successfully', logger: this.logger });
    } catch (ex) {
      // You might want to type 'ex' or use 'unknown' and handle accordingly.
      result.setException({ exception: ex, stackTrace: (ex as any)?.stack, logger: this.logger });
    }
    return result;
  }

  async createDatabaseViews(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log('Creating views...');
      const viewList = AcDataDictionary.getViews({ dataDictionaryName: this.dataDictionaryName });
      let errorViews: AcDDView[] = [];

      for (const acDDView of Object.values(viewList)) {
        this.logger.log(`Creating view ${acDDView.viewName}`);

        const dropStatement = AcDDView.getDropViewStatement({
          viewName: acDDView.viewName,
          databaseType: this.databaseType,
        });
        this.logger.log(`Executing drop view statement: ${dropStatement}`);
        const dropResult = await this.dao!.executeStatement({ statement: dropStatement });
        if (dropResult.isSuccess()) {
          this.logger.log('Drop statement executed successfully.');
        } else {
          return result.setFromResult({
            result: dropResult,
            message: 'Error executing drop statement',
            logger: this.logger,
          });
        }
        await this.saveSchemaLogEntry({
          row: {
            [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.View,
            [TblSchemaLogs.AcSchemaEntityName]: acDDView.viewName,
            [TblSchemaLogs.AcSchemaOperation]: 'drop',
            [TblSchemaLogs.AcSchemaOperationResult]: dropResult.status,
            [TblSchemaLogs.AcSchemaOperationStatement]: dropStatement,
            [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          }
        });

        const createStatement = acDDView.getCreateViewStatement({ databaseType: this.databaseType });
        this.logger.log(`Create statement: ${createStatement}`);
        const createResult = await this.dao!.executeStatement({ statement: createStatement });
        if (createResult.isSuccess()) {
          this.logger.log('View created successfully.');
        } else {
          this.logger.error('Error creating view');
          errorViews.push(acDDView);
        }
        await this.saveSchemaLogEntry({
          row: {
            [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.View,
            [TblSchemaLogs.AcSchemaEntityName]: acDDView.viewName,
            [TblSchemaLogs.AcSchemaOperation]: 'create',
            [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
            [TblSchemaLogs.AcSchemaOperationStatement]: createStatement,
            [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          }
        });
      }

      if (errorViews.length > 0) {
        this.logger.log(`Retrying creating ${errorViews.length} views with errors`);
        let retryCount = 0;
        let retryViews: AcDDView[] = [];
        while (errorViews.length > 0 && retryCount < 10) {
          retryCount++;
          this.logger.log(`${errorViews.length} views with errors will be retried in iteration ${retryCount}`);
          for (const acDDView of errorViews) {
            const createStatement = acDDView.getCreateViewStatement({ databaseType: this.databaseType });
            this.logger.log(`Retrying creating view for ${acDDView.viewName}, ${createStatement}`);
            const createResult = await this.dao!.executeStatement({ statement: createStatement });
            if (createResult.isSuccess()) {
              this.logger.log('View created successfully');
            } else {
              this.logger.error('Error creating view');
              retryViews.push(acDDView);
            }
            await this.saveSchemaLogEntry({
              row: {
                [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.View,
                [TblSchemaLogs.AcSchemaEntityName]: acDDView.viewName,
                [TblSchemaLogs.AcSchemaOperation]: 'create',
                [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
                [TblSchemaLogs.AcSchemaOperationStatement]: createStatement,
                [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
              }
            });
          }
          this.logger.log(`After iteration ${retryCount}, ${retryViews.length} still has errors`);
          errorViews = retryViews;
          retryViews = [];
          this.logger.log(`Will try executing ${errorViews.length} in next iteration`);
        }
        this.logger.log(`After retrying creating error views, there are ${errorViews.length} with errors`);
        if (errorViews.length > 0) {
          const errorViewsList: Array<Record<string, string>> = [];
          for (const acDDView of errorViews) {
            const createStatement = acDDView.getCreateViewStatement({ databaseType: this.databaseType });
            const errorViewDetails = {
              [AcDDViewColumn.KeyColumnName]: acDDView.viewName,
              create_statement: createStatement,
            };
            this.logger.error(['Error in view', errorViewDetails]);
            errorViewsList.push(errorViewDetails);
          }
          result.setFailure({
            value: errorViewsList,
            message: 'Error creating views',
            logger: this.logger,
          });
        }
      }

      if (errorViews.length === 0) {
        result.setSuccess({ message: 'Views created successfully', logger: this.logger });
      }
    } catch (ex) {
      result.setException({ exception: ex, stackTrace: (ex as any)?.stack, logger: this.logger });
    }
    return result;
  }

  async createSchema(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log(`Creating schema in database for data dictionary ${this.dataDictionaryName}...`);
      this.logger.log(`Creating tables in database for data dictionary ${this.dataDictionaryName}...`);

      const createTablesResult = await this.createDatabaseTables();
      if (createTablesResult.isSuccess()) {
        this.logger.log('Tables created successfully');
      } else {
        return result.setFromResult({
          result: createTablesResult,
          message: 'Error creating schema database tables',
          logger: this.logger,
        });
      }

      const createViewsResult = await this.createDatabaseViews();
      if (createViewsResult.isSuccess()) {
        this.logger.log('Views created successfully');
      } else {
        return result.setFromResult({
          result: createViewsResult,
          message: 'Error creating schema database views',
          logger: this.logger,
        });
      }

      const createTriggersResult = await this.createDatabaseTriggers();
      if (createTriggersResult.isSuccess()) {
        this.logger.log('Triggers created successfully');
      } else {
        return result.setFromResult({
          result: createTriggersResult,
          message: 'Error creating schema database triggers',
          logger: this.logger,
        });
      }

      const createStoredProceduresResult = await this.createDatabaseStoredProcedures();
      if (createStoredProceduresResult.isSuccess()) {
        this.logger.log('Stored procedures created successfully');
      } else {
        return result.setFromResult({
          result: createStoredProceduresResult,
          message: 'Error creating schema database stored procedures',
          logger: this.logger,
        });
      }

      const createFunctionsResult = await this.createDatabaseFunctions();
      if (createFunctionsResult.isSuccess()) {
        this.logger.log('Functions created successfully');
      } else {
        return result.setFromResult({
          result: createFunctionsResult,
          message: 'Error creating schema database functions',
          logger: this.logger,
        });
      }

      result.setSuccess({ message: 'Schema created successfully', logger: this.logger });
    } catch (ex) {
      // in JS/TS, no built-in stack argument in catch, but ex.stack exists on Error
      result.setException({ exception: ex, stackTrace: (ex as Error).stack, logger: this.logger });
    }
    return result;
  }

  async getDatabaseSchemaDifference(): Promise<AcResult> {
    const result = new AcResult();
    try {
      const differenceResult: Record<string, any> = {};
      const getTablesResult = await this.dao!.getDatabaseTables();
      if (getTablesResult.isSuccess()) {
        const currentDataDictionaryTables: string[] = Object.keys(this.acDataDictionary.tables);
        const foundTables: string[] = [];
        const modifiedTables: Array<Record<string, any>> = [];
        const missingInDataDictionaryTables: string[] = [];

        for (const tableRow of getTablesResult.rows) {
          const tableName = tableRow[AcDDTable.KeyTableName];
          if (tableName !== AcSchemaManagerTables.SchemaDetails && tableName !== AcSchemaManagerTables.SchemaLogs) {
            if (currentDataDictionaryTables.includes(tableName)) {
              const tableDifferenceResult: Record<string, any> = {};
              foundTables.push(tableName);

              const getTableColumnsResult = await this.dao!.getTableColumns({ tableName });
              if (getTableColumnsResult.isSuccess()) {
                const currentDataDictionaryColumns: string[] = this.acDataDictionary.getTableColumnNames({ tableName });
                const foundColumns: string[] = [];
                const missingInDataDictionaryColumns: string[] = [];

                for (const columnRow of getTableColumnsResult.rows) {
                  const columnName = columnRow[AcDDTableColumn.KeyColumnName];
                  if (currentDataDictionaryColumns.includes(columnName)) {
                    foundColumns.push(columnName);
                  } else {
                    missingInDataDictionaryColumns.push(columnName);
                  }
                }

                tableDifferenceResult["missing_columns_in_database"] =
                  currentDataDictionaryColumns.filter(element => !foundColumns.includes(element));
                tableDifferenceResult["missing_columns_in_data_dictionary"] = missingInDataDictionaryColumns;

              } else {
                return result.setFromResult({
                  result: getTableColumnsResult,
                  message: `Error getting columns for table ${tableName}`,
                  logger: this.logger,
                });
              }

              if (tableDifferenceResult['missing_columns_in_database'].length > 0 ||
                tableDifferenceResult["missing_columns_in_data_dictionary"].length > 0) {
                modifiedTables.push({
                  [AcDDTable.KeyTableName]: tableName,
                  "difference_details": tableDifferenceResult
                });
              }
            } else {
              missingInDataDictionaryTables.push(tableName);
            }
          }
        }

        differenceResult["missing_tables_in_database"] =
          currentDataDictionaryTables.filter(element => !foundTables.includes(element));
        differenceResult["missing_tables_in_data_dictionary"] = missingInDataDictionaryTables;
        differenceResult["modified_tables_in_data_dictionary"] = modifiedTables;

        result.setSuccess();
        result.value = differenceResult;

      } else {
        return result.setFromResult({
          result: getTablesResult,
          message: 'Error getting current database tables',
          logger: this.logger,
        });
      }
    } catch (ex) {
      result.setException({ exception: ex, stackTrace: (ex as Error).stack, logger: this.logger });
    }
    return result;
  }

  async initDatabase(): Promise<AcResult> {
    const result = new AcResult();
    try {
      this.logger.log(`Initializing database for data dictionary ${this.dataDictionaryName}...`);
      const checkResult = await this.dao!.checkDatabaseExist();
      if (checkResult.isSuccess()) {
        const schemaResult = await this.initSchemaDataDictionary();
        if (schemaResult.isSuccess()) {
          let updateDataDictionaryVersion = false;
          if (checkResult.value === false) {
            this.logger.log("Creating database...");
            const createDbResult = await this.dao!.createDatabase();
            if (createDbResult.isSuccess()) {
              this.logger.log("Database created successfully");
              const createSchemaResult = await this.createSchema();
              if (createSchemaResult.isSuccess()) {
                updateDataDictionaryVersion = true;
                result.setSuccess({ message: 'Schema created successfully', logger: this.logger });
                const createdLogResponse = await this.saveSchemaDetail({
                  row: {
                    [TblSchemaDetails.AcSchemaDetailKey]: SchemaDetails.KeyCreatedOn,
                    [TblSchemaDetails.AcSchemaDetailStringValue]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
                  }
                });
                if (createdLogResponse.isFailure()) {
                  result.setFromResult({ result: createdLogResponse, message: 'error saving created schema detail' });
                }
              } else {
                return result.setFromResult({
                  result: createSchemaResult,
                  message: "Error creating database schema from data dictionary",
                  logger: this.logger,
                });
              }
            } else {
              return result.setFromResult({
                result: createDbResult,
                message: "Error creating database",
                logger: this.logger,
              });
            }
          } else {
            const checkUpdateResult = await this.checkSchemaUpdateAvailableFromVersion();
            if (checkUpdateResult.isSuccess()) {
              if (checkUpdateResult.value === true) {
                const updateSchemaResult = await this.updateSchema();
                if (updateSchemaResult.isSuccess()) {
                  updateDataDictionaryVersion = true;
                  result.setSuccess({ message: 'Schema updated successfully', logger: this.logger });
                  await this.saveSchemaDetail({
                    row: {
                      [TblSchemaDetails.AcSchemaDetailKey]: SchemaDetails.KeyLastUpdatedOn,
                      [TblSchemaDetails.AcSchemaDetailStringValue]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
                    }
                  });
                } else {
                  return result.setFromResult({
                    result: updateSchemaResult,
                    message: "Error updating database schema from data dictionary",
                    logger: this.logger,
                  });
                }
              } else {
                result.setSuccess({ message: 'Schema is latest. No changes required', logger: this.logger });
              }
            } else {
              return result.setFromResult({
                result: checkUpdateResult,
                message: "Error checking for schema updates",
                logger: this.logger,
              });
            }
          }
          if (updateDataDictionaryVersion) {
            const versionLogResponse = await this.saveSchemaDetail({
              row: {
                [TblSchemaDetails.AcSchemaDetailKey]: `${SchemaDetails.KeyDataDictionaryVersion}[${this.dataDictionaryName}]`,
                [TblSchemaDetails.AcSchemaDetailNumericValue]: this.acDataDictionary.version,
              }
            });
            if (versionLogResponse.isFailure()) {
              result.setFromResult({ result: versionLogResponse, message: 'error saving version schema detail' });
            }
          }
        } else {
          return result.setFromResult({
            result: schemaResult,
            message: "Error initializing schema data dictionary",
            logger: this.logger,
          });
        }
      } else {
        return result.setFromResult({
          result: checkResult,
          message: "Error checking if database exists",
          logger: this.logger,
        });
      }
    } catch (ex: any) {
      // Assuming this.logger.error accepts an error and stack trace
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger });
    }
    return result;
  }

  async initSchemaDataDictionary(): Promise<AcResult> {
    const result = new AcResult();
    try {
      if (!AcDataDictionary.dataDictionaries.hasOwnProperty(AcSMDataDictionary.DataDictionaryName)) {
        this.logger.log("Registering schema data dictionary...");
        AcDataDictionary.registerDataDictionary({
          jsonData: AcSMDataDictionary.DataDictionary,
          dataDictionaryName: AcSMDataDictionary.DataDictionaryName,
        });
        this.acSqlDDTableSchemaDetails = new AcSqlDbTable({
          tableName: AcSchemaManagerTables.SchemaDetails,
          dataDictionaryName: AcSMDataDictionary.DataDictionaryName,
        });
        this.acSqlDDTableSchemaLogs = new AcSqlDbTable({
          tableName: AcSchemaManagerTables.SchemaLogs,
          dataDictionaryName: AcSMDataDictionary.DataDictionaryName,
        });

        const acSchemaManager = new AcSqlDbSchemaManager({dataDictionaryName: AcSMDataDictionary.DataDictionaryName,dao:this.dao!});
        acSchemaManager.dao = this.dao;
        acSchemaManager.logger = this.logger;
        acSchemaManager.databaseType = this.databaseType;
        acSchemaManager.useDataDictionary({ dataDictionaryName: AcSMDataDictionary.DataDictionaryName });

        const initSchemaResult = await acSchemaManager.initDatabase();
        if (initSchemaResult.isSuccess()) {
          result.setSuccess({ message: 'Schema data dictionary initialized successfully', logger: this.logger });
        } else {
          return result.setFromResult({
            result: initSchemaResult,
            message: "Error setting schema entities in database",
            logger: this.logger,
          });
        }
      } else {
        result.setSuccess({ message: 'Schema data dictionary already initialized', logger: this.logger });
      }
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack, logger: this.logger });
    }
    return result;
  }

  async saveSchemaLogEntry({ row }: { row: Record<string, any> }): Promise<AcSqlDaoResult> {
    let result: AcSqlDaoResult = new AcSqlDaoResult();
    if (this.dataDictionaryName != AcSMDataDictionary.DataDictionaryName) {
      result = await this.acSqlDDTableSchemaLogs.insertRow({ row });
    }
    else {
      result.setSuccess();
    }
    return result;
  }

  async saveSchemaDetail({ row }: { row: Record<string, any> }): Promise<AcSqlDaoResult> {
    const result: AcSqlDaoResult = await this.acSqlDDTableSchemaDetails.saveRow({ row });
    if(result.isFailure()){
      console.error(result);
    }
    return result;
  }

  async updateDatabaseDifferences(): Promise<AcResult> {
    const result = new AcResult();
    try {
      const differenceResult = await this.getDatabaseSchemaDifference();
      if (differenceResult.isSuccess()) {
        const differences = differenceResult.value as Record<string, any>;
        const dropColumnStatements: string[] = [];
        const dropTableStatements: string[] = [];

        if (differences["missing_tables_in_database"]) {
          for (const tableName of differences["missing_tables_in_database"]) {
            const acDDTable = AcDDTable.getInstance({ tableName, dataDictionaryName: this.dataDictionaryName });
            this.logger.log(`Creating table ${acDDTable.tableName} for type ${this.databaseType} in data dictionary ${this.dataDictionaryName}`);
            const createStatement = acDDTable.getCreateTableStatement({databaseType:this.databaseType});
            this.logger.log(["Executing create table statement...", createStatement]);
            const createResult = await this.dao!.executeStatement({ statement: createStatement });
            if (createResult.isSuccess()) {
              this.logger.log("Create statement executed successfully");
            } else {
              return result.setFromResult({ result: createResult, logger: this.logger });
            }
            await this.saveSchemaLogEntry({
              row: {
                [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Table,
                [TblSchemaLogs.AcSchemaEntityName]: tableName,
                [TblSchemaLogs.AcSchemaOperation]: "create",
                [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
                [TblSchemaLogs.AcSchemaOperationStatement]: createStatement,
                [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
              },
            });
          }
        }

        if (differences["modified_tables_in_data_dictionary"]) {
          for (const modificationDetails of differences["modified_tables_in_data_dictionary"]) {
            const tableName = modificationDetails[AcDDTable.KeyTableName];
            const tableDifferenceDetails = modificationDetails["difference_details"] as Record<string, any>;

            if (tableDifferenceDetails["missing_columns_in_database"]) {
              for (const columnName of tableDifferenceDetails["missing_columns_in_database"]) {
                this.logger.log(`Adding table column ${columnName}`);
                const acDDTableColumn = AcDDTableColumn.getInstance({
                  tableName,
                  columnName,
                  dataDictionaryName: this.dataDictionaryName,
                });
                const addStatement = acDDTableColumn.getAddColumnStatement({ tableName,databaseType:this.databaseType });
                this.logger.log(["Executing add table column statement...", addStatement]);
                const createResult = await this.dao!.executeStatement({ statement: addStatement });
                if (createResult.isSuccess()) {
                  this.logger.log("Add statement executed successfully");
                } else {
                  return result.setFromResult({ result: createResult, logger: this.logger });
                }
                await this.saveSchemaLogEntry({
                  row: {
                    [TblSchemaLogs.AcSchemaEntityType]: AcEnumSqlEntity.Table,
                    [TblSchemaLogs.AcSchemaEntityName]: tableName,
                    [TblSchemaLogs.AcSchemaOperation]: "modify",
                    [TblSchemaLogs.AcSchemaOperationResult]: createResult.status,
                    [TblSchemaLogs.AcSchemaOperationStatement]: addStatement,
                    [TblSchemaLogs.AcSchemaOperationTimestamp]: new Date().toISOString().replace('T', ' ').replace('Z', ''),
                  },
                });
              }
            }
            if (tableDifferenceDetails["missing_columns_in_data_dictionary"]) {
              for (const columnName of tableDifferenceDetails["missing_columns_in_data_dictionary"]) {
                const dropColumnStatement = AcDDTableColumn.getDropColumnStatement({
                  tableName,
                  columnName,
                  databaseType: this.databaseType,
                });
                dropColumnStatements.push(dropColumnStatement);
              }
            }
          }
        }

        if (differences["missing_tables_in_data_dictionary"]) {
          for (const tableName of differences["missing_tables_in_data_dictionary"]) {
            dropTableStatements.push(
              AcDDTable.getDropTableStatement({ tableName, databaseType: this.databaseType })
            );
          }
        }

        result.setSuccess();

        if (dropColumnStatements.length > 0 || dropTableStatements.length > 0) {
          this.logger.warn(
            "There are columns and tables that are not defined in data dictionary. Here are drop statements for dropping them."
          );
          for (const dropColumnStatement of dropColumnStatements) {
            this.logger.warn(dropColumnStatement);
          }
          for (const dropTableStatement of dropTableStatements) {
            this.logger.warn(dropTableStatement);
          }
        }
      } else {
        return result.setFromResult({ result: differenceResult });
      }
    } catch (ex: unknown) {
      if (ex instanceof Error) {
        result.setException({ exception: ex, logger: this.logger });
      }
    }
    return result;
  }

  async updateSchema(): Promise<AcResult> {
    const result = new AcResult();
    let continueOperation = true;

    const updateDifferenceResult = await this.updateDatabaseDifferences();
    if (!updateDifferenceResult.isSuccess()) {
      continueOperation = false;
      result.setFromResult({
        result: updateDifferenceResult,
        message: "Error updating differences",
        logger: this.logger,
      });
    }

    if (continueOperation) {
      const createViewsResult = await this.createDatabaseViews();
      if (!createViewsResult.isSuccess()) {
        continueOperation = false;
        result.setFromResult({
          result: createViewsResult,
          message: "Error updating schema database views",
          logger: this.logger,
        });
      }
    }

    if (continueOperation) {
      const createTriggersResult = await this.createDatabaseTriggers();
      if (!createTriggersResult.isSuccess()) {
        continueOperation = false;
        result.setFromResult({
          result: createTriggersResult,
          message: "Error updating schema database triggers",
          logger: this.logger,
        });
      }
    }

    if (continueOperation) {
      const createStoredProceduresResult = await this.createDatabaseStoredProcedures();
      if (!createStoredProceduresResult.isSuccess()) {
        continueOperation = false;
        result.setFromResult({
          result: createStoredProceduresResult,
          message: "Error updating schema database stored procedures",
          logger: this.logger,
        });
      }
    }

    if (continueOperation) {
      const createFunctionsResult = await this.createDatabaseFunctions();
      if (!createFunctionsResult.isSuccess()) {
        continueOperation = false;
        result.setFromResult({
          result: createFunctionsResult,
          message: "Error updating schema database functions",
          logger: this.logger,
        });
      }
    }

    if (continueOperation) {
      result.setSuccess({ message: "Schema updated successfully", logger: this.logger });
    }
    return result;
  }


}
