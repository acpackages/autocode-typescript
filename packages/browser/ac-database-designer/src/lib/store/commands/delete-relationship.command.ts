import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbRelationship } from '../../models/ac-db-relationship.model';

export class DeleteRelationshipCommand implements AcDbCommand {
  readonly label = 'Delete relationship';
  private _snapshot: AcDbRelationship | null = null;

  constructor(private readonly relId: string) {}

  execute(store: AcDbStore): void {
    const rel = store.getRelationship(this.relId);
    if (!rel) return;
    this._snapshot = { ...rel };
    store.deleteRelationship(this.relId);
  }

  undo(store: AcDbStore): void {
    if (this._snapshot) store.addRelationship(this._snapshot);
  }
}
