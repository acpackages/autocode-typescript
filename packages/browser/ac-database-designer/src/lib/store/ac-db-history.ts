import type { AcDbStore } from './ac-db-store';
import type { AcDbEventBus } from './ac-db-event-bus';

export interface AcDbCommand {
  /** Human-readable label shown in the history panel */
  readonly label: string;
  execute(store: AcDbStore): void;
  undo(store: AcDbStore): void;
}

const MAX_DEPTH = 200;

export class AcDbHistory {
  private _stack: AcDbCommand[] = [];
  private _cursor = -1;

  constructor(private readonly store: AcDbStore, private readonly bus: AcDbEventBus) {}

  get canUndo(): boolean { return this._cursor >= 0; }
  get canRedo(): boolean { return this._cursor < this._stack.length - 1; }
  get currentLabel(): string { return this._cursor >= 0 ? this._stack[this._cursor].label : ''; }

  execute(cmd: AcDbCommand): void {
    // Discard any redo branch
    this._stack.splice(this._cursor + 1);
    this._stack.push(cmd);
    if (this._stack.length > MAX_DEPTH) this._stack.shift();
    else this._cursor++;
    cmd.execute(this.store);
    this._notifyChange();
  }

  undo(): void {
    if (!this.canUndo) return;
    this._stack[this._cursor--].undo(this.store);
    this._notifyChange();
  }

  redo(): void {
    if (!this.canRedo) return;
    this._stack[++this._cursor].execute(this.store);
    this._notifyChange();
  }

  /** Full list of labels for the history panel (newest last) */
  getSummary(): { label: string; isCurrent: boolean }[] {
    return this._stack.map((cmd, i) => ({
      label: cmd.label,
      isCurrent: i === this._cursor,
    }));
  }

  clear(): void {
    this._stack = [];
    this._cursor = -1;
    this._notifyChange();
  }

  /**
   * Push a command whose effect has already been applied (e.g. drag move).
   * Discards redo branch, notifies change — but does NOT call cmd.execute().
   */
  pushAlreadyExecuted(cmd: AcDbCommand): void {
    this._stack.splice(this._cursor + 1);
    this._stack.push(cmd);
    if (this._stack.length > MAX_DEPTH) this._stack.shift();
    else this._cursor++;
    this._notifyChange();
  }

  private _notifyChange(): void {
    this.bus.emit('history:changed', {
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      label: this.currentLabel,
    });
  }
}
