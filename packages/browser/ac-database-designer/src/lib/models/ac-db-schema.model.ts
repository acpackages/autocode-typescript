import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcDbLayout, createLayout } from './ac-db-layout.model';

export interface AcDbSchemaConfig {
  insertTimestampColumn: string;
  updateTimestampColumn: string;
  deleteTimestampColumn: string;
}

export interface AcDbSchemaMeta {
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface AcDbSchema {
  schemaId: string;
  schemaName: string;
  description: string;
  dialect: AcEnumDbDialect;
  version: number;
  config: AcDbSchemaConfig;
  layout: AcDbLayout;
  meta: AcDbSchemaMeta;
}

export function createSchema(partial: Partial<AcDbSchema> & { schemaId: string; schemaName: string }): AcDbSchema {
  const now = new Date().toISOString();
  return {
    schemaId: partial.schemaId,
    schemaName: partial.schemaName,
    description: partial.description ?? '',
    dialect: partial.dialect ?? AcEnumDbDialect.MySQL,
    version: partial.version ?? 1,
    config: partial.config ?? { insertTimestampColumn: 'created_at', updateTimestampColumn: 'updated_at', deleteTimestampColumn: '' },
    layout: partial.layout ?? createLayout(),
    meta: partial.meta ?? { author: '', createdAt: now, updatedAt: now, tags: [] },
  };
}
