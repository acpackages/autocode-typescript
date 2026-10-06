import { AcEnumDbRelationType } from '../enums/ac-enum-db-relation-type';
import { AcEnumDbFkAction } from '../enums/ac-enum-db-fk-action';

export interface AcDbRelationship {
  relationshipId: string;
  schemaId: string;
  label: string;
  type: AcEnumDbRelationType;
  fromTableId: string;
  fromColumnId: string;
  toTableId: string;
  toColumnId: string;
  onDelete: AcEnumDbFkAction;
  onUpdate: AcEnumDbFkAction;
}

export function createRelationship(
  partial: Partial<AcDbRelationship> & {
    relationshipId: string; schemaId: string;
    fromTableId: string; fromColumnId: string;
    toTableId: string; toColumnId: string;
  }
): AcDbRelationship {
  return {
    relationshipId: partial.relationshipId,
    schemaId: partial.schemaId,
    label: partial.label ?? '',
    type: partial.type ?? AcEnumDbRelationType.OneToMany,
    fromTableId: partial.fromTableId,
    fromColumnId: partial.fromColumnId,
    toTableId: partial.toTableId,
    toColumnId: partial.toColumnId,
    onDelete: partial.onDelete ?? AcEnumDbFkAction.NoAction,
    onUpdate: partial.onUpdate ?? AcEnumDbFkAction.NoAction,
  };
}
