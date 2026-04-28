/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcEnumLogType, AcEnumSqlDatabaseType, AcEvents, AcLogger } from "@autocode-ts/autocode";
import { AcDataDictionary } from "@autocode-ts/ac-data-dictionary";
import { AcBaseSqlDao } from "../daos/ac-base-sql-dao";
import { AcSqlConnection } from "../models/ac-sql-connection.model";
import { AcSqlDatabase } from "./ac-sql-database";
import { AC_DB_TYPE_DAO_MAP } from "../consts/ac-database-type-dao-class-map.const";

export class AcSqlDbBase {
  acDataDictionary!: AcDataDictionary;
  dao: AcBaseSqlDao | null = null;
  databaseType: string = AcEnumSqlDatabaseType.Unknown;
  dataDictionaryName: string = 'default';
  events!: AcEvents;
  logger!: AcLogger;
  sqlConnection: AcSqlConnection | null = null;

  constructor({ dataDictionaryName = 'default',dao }: { dataDictionaryName?: string, dao?:AcBaseSqlDao } = {}) {
    this.databaseType = AcSqlDatabase.databaseType;
    this.sqlConnection = AcSqlDatabase.sqlConnection;
    if(dao){
      this.dao = dao;
    }
    else{
      if(AC_DB_TYPE_DAO_MAP[this.databaseType] != undefined){
      this.dao = new AC_DB_TYPE_DAO_MAP[this.databaseType]();
      if(this.dao && this,this.sqlConnection){
        this.dao!.setSqlConnection({ sqlConnection: this.sqlConnection! });
      }

    }
    }

    this.useDataDictionary({ dataDictionaryName });
    this.logger = new AcLogger({ logType: AcEnumLogType.Console, logMessages: true });
  }

  useDataDictionary({ dataDictionaryName = 'default' }: { dataDictionaryName?: string }) {
    this.dataDictionaryName = dataDictionaryName;
    this.acDataDictionary = AcDataDictionary.getInstance({ dataDictionaryName });
  }
}
