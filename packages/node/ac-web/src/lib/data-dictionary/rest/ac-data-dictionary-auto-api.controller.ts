/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDataDictionary, AcDDTable } from '@autocode-ts/ac-data-dictionary';
import { AcLogger, AcEnumLogType, AcResult } from '@autocode-ts/autocode';
import { AcSqlDbTable } from '@autocode-ts/ac-sql';
import { AcWeb } from '../../core/ac-web';
import { AcWebRequest } from '../../models/ac-web-request.model';
import { AcApiDocTag } from '../../api-docs/models/ac-api-doc-tag.model';
import { AcDataDictionaryAutoDelete } from './ac-data-dictionary-auto-delete.controller';
import { AcDataDictionaryAutoInsert } from './ac-data-dictionary-auto-insert.controller';
import { AcDataDictionaryAutoSave } from './ac-data-dictionary-auto-save.controller';
import { AcDataDictionaryAutoSelect } from './ac-data-dictionary-auto-select.controller';
import { AcDataDictionaryAutoSelectDistinct } from './ac-data-dictionary-auto-select-distinct.controller';
import { AcDataDictionaryAutoUpdate } from './ac-data-dictionary-auto-update.controller';

export class AcDataDictionaryAutoApi {
  acWeb: AcWeb;
  dataDictionaryName: string = 'default';
  excludeTables: Record<string, Record<string, boolean>> = {};
  includeTables: Record<string, Record<string, boolean>> = {};
  urlPrefix: string = '';
  acDataDictionary: AcDataDictionary;
  logger: AcLogger = new AcLogger({ logType: AcEnumLogType.Console, logMessages: false });

  getAcSqlDbTable: (args: { request: AcWebRequest, acDDTable: AcDDTable }) => Promise<AcResult> = async ({ acDDTable }) => {
    const result = new AcResult();
    result.setSuccess({ value: new AcSqlDbTable({ tableName: acDDTable.tableName }) });
    return result;
  };

  constructor({ acWeb, dataDictionaryName = 'default' }: { acWeb: AcWeb, dataDictionaryName?: string }) {
    this.acWeb = acWeb;
    this.dataDictionaryName = dataDictionaryName;
    this.acDataDictionary = AcDataDictionary.getInstance({ dataDictionaryName });
  }

  excludeTable({
    tableName,
    delete: del,
    insert,
    save,
    select,
    selectDistinct,
    selectRow,
    update,
  }: {
    tableName: string;
    delete?: boolean;
    insert?: boolean;
    save?: boolean;
    select?: boolean;
    selectDistinct?: boolean;
    selectRow?: boolean;
    update?: boolean;
  }): this {
    if (del === undefined && insert === undefined && save === undefined && select === undefined && selectDistinct === undefined && selectRow === undefined && update === undefined) {
      del = insert = save = select = selectDistinct = selectRow = update = true;
    } else {
      del ??= false; insert ??= false; save ??= false; select ??= false; selectDistinct ??= false; selectRow ??= false; update ??= false;
    }
    this.excludeTables[tableName] = {
      delete: del!, insert: insert!, save: save!, select: select!, selectDistinct: selectDistinct!, selectRow: selectRow!, update: update!,
    };
    return this;
  }

  includeTable({
    tableName,
    delete: del,
    insert,
    save,
    select,
    selectDistinct,
    selectRow,
    update,
  }: {
    tableName: string;
    delete?: boolean;
    insert?: boolean;
    save?: boolean;
    select?: boolean;
    selectDistinct?: boolean;
    selectRow?: boolean;
    update?: boolean;
  }): this {
    if (del === undefined && insert === undefined && save === undefined && select === undefined && selectDistinct === undefined && selectRow === undefined && update === undefined) {
      del = insert = save = select = selectDistinct = selectRow = update = true;
    } else {
      del ??= false; insert ??= false; save ??= false; select ??= false; selectDistinct ??= false; selectRow ??= false; update ??= false;
    }
    this.includeTables[tableName] = {
      delete: del!, insert: insert!, save: save!, select: select!, selectDistinct: selectDistinct!, selectRow: selectRow!, update: update!,
    };
    return this;
  }

  generate({
    delete: del = true,
    insert = true,
    save = true,
    select = true,
    selectDistinct = true,
    selectRow = true,
    update = true,
  }: {
    delete?: boolean;
    insert?: boolean;
    save?: boolean;
    select?: boolean;
    selectDistinct?: boolean;
    selectRow?: boolean;
    update?: boolean;
  } = {}): this {
    this.logger.log(`Generating apis for tables in data dictionary ${this.dataDictionaryName}...`);
    if (Object.keys(this.includeTables).length === 0 && Object.keys(this.excludeTables).length === 0) {
      this.logger.log("No include & exclude tables specified!");
    }

    const tables = AcDataDictionary.getTables({ dataDictionaryName: this.dataDictionaryName });
    for (const tableName of Object.keys(tables)) {
      const acDDTable = tables[tableName];
      let continueOperation = false;
      let generateDelete = true;
      let generateInsert = true;
      let generateSave = true;
      let generateSelect = true;
      let generateSelectDistinct = true;
      let generateSelectRow = true;
      let generateUpdate = true;

      this.logger.log(`Checking table ${acDDTable.tableName} for auto data dictionary...`);
      if (Object.keys(this.includeTables).length === 0 && Object.keys(this.excludeTables).length === 0) {
        continueOperation = true;
      } else if (Object.keys(this.includeTables).length > 0) {
        if (this.includeTables[tableName]) {
          continueOperation = true;
          this.logger.log(`Include tables list contains table ${acDDTable.tableName}`);
          const options = this.includeTables[tableName];
          generateDelete = options.delete;
          generateInsert = options.insert;
          generateSave = options.save;
          generateSelect = options.select;
          generateSelectDistinct = options.selectDistinct;
          generateSelectRow = options.selectRow;
          generateUpdate = options.update;
        } else {
          this.logger.log(`Include tables list does not contains table ${acDDTable.tableName}`);
        }
      } else if (!this.excludeTables[tableName]) {
        this.logger.log(`Exclude tables list does not contain table ${acDDTable.tableName}`);
        continueOperation = true;
      } else if (this.excludeTables[tableName]) {
        continueOperation = true;
        const options = this.excludeTables[tableName];
        generateDelete = !options.delete;
        generateInsert = !options.insert;
        generateSave = !options.save;
        generateSelect = !options.select;
        generateSelectDistinct = !options.selectDistinct;
        generateSelectRow = !options.selectRow;
        generateUpdate = !options.update;
      }

      if (continueOperation) {
        this.logger.log(`Generating apis for table ${acDDTable.tableName}...`);
        let apiAdded = false;

        if (generateDelete && del) {
          this.logger.log(`Generating delete api for table ${acDDTable.tableName}...`);
          new AcDataDictionaryAutoDelete({ acDDTable, acDataDictionaryAutoApi: this });
          apiAdded = true;
          this.logger.log(`Generated delete api for table ${acDDTable.tableName}!`);
        }
        if (generateInsert && insert) {
          this.logger.log(`Generating insert api for table ${acDDTable.tableName}...`);
          new AcDataDictionaryAutoInsert({ acDDTable, acDataDictionaryAutoApi: this });
          apiAdded = true;
          this.logger.log(`Generated insert api for table ${acDDTable.tableName}!`);
        }
        if (generateSave && save) {
          this.logger.log(`Generating save api for table ${acDDTable.tableName}...`);
          new AcDataDictionaryAutoSave({ acDDTable, acDataDictionaryAutoApi: this });
          apiAdded = true;
          this.logger.log(`Generated save api for table ${acDDTable.tableName}!`);
        }
        if (generateSelect && select) {
          this.logger.log(`Generating select api for table ${acDDTable.tableName}...`);
          new AcDataDictionaryAutoSelect({ acDDTable, acDataDictionaryAutoApi: this, includeSelectRow: generateSelectRow && selectRow });
          apiAdded = true;
          this.logger.log(`Generated select api for table ${acDDTable.tableName}!`);
        }
        if (generateSelectDistinct && selectDistinct) {
          this.logger.log(`Generating select distinct apis for fields in table ${acDDTable.tableName}...`);
          for (const distinctColumn of acDDTable.getSelectDistinctColumns()) {
            this.logger.log(`Generating select distinct api for field ${distinctColumn.columnName} in table ${acDDTable.tableName}...`);
            new AcDataDictionaryAutoSelectDistinct({ acDDTable, acDDTableColumn: distinctColumn, acDataDictionaryAutoApi: this });
            apiAdded = true;
            this.logger.log(`Generated select distinct api for field ${distinctColumn.columnName} in table ${acDDTable.tableName}!`);
          }
          this.logger.log(`Generated select distinct apis for table ${acDDTable.tableName}!`);
        }
        if (generateUpdate && update) {
          this.logger.log(`Generating update api for table ${acDDTable.tableName}...`);
          new AcDataDictionaryAutoUpdate({ acDDTable, acDataDictionaryAutoApi: this });
          apiAdded = true;
          this.logger.log(`Generated update api for table ${acDDTable.tableName}!`);
        }

        if (apiAdded) {
          const tag = new AcApiDocTag();
          tag.name = acDDTable.tableName;
          tag.description = `Database operations for table ${acDDTable.tableName}`;
          this.acWeb.acApiDoc.addTag(tag);
        }
      } else {
        this.logger.log(`Skipping apis for table ${acDDTable.tableName}!`);
      }
    }
    this.logger.log(`Generated apis for tables in data dictionary ${this.dataDictionaryName}!`);
    return this;
  }
}
