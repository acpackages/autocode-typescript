import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';

export class AddRelationshipCommand implements AcDbCommand {
  readonly label: string;
  private _relId: string | undefined;

  constructor(private readonly args: Omit<Parameters<AcDbStore['addRelationship']>[0], 'relationshipId'>) {
    this.label = `Add relationship`;
  }

  execute(store: AcDbStore): void {
    const id = this._relId ?? crypto.randomUUID();
    this._relId = id;
    store.addRelationship({ relationshipId: id, ...this.args });
  }

  undo(store: AcDbStore): void {
    if (this._relId) store.deleteRelationship(this._relId);
  }
}
