import { AcDbViewport } from './ac-db-viewport';

export interface AcDbSocketInfo {
  tableId: string;
  columnId: string;
  /** Screen-space X of the socket centre (relative to canvas element). */
  screenX: number;
  /** Screen-space Y of the socket centre (relative to canvas element). */
  screenY: number;
}

export interface AcDbPendingConnection {
  from: AcDbSocketInfo;
  toX: number;  // current cursor screen X (for rubber line)
  toY: number;  // current cursor screen Y (for rubber line)
  active: boolean;
}

/**
 * Manages drawing FK connections by dragging from column socket dots.
 * All coordinates are in screen space (relative to the canvas host element)
 * to match the SVG overlay coordinate system.
 */
export class AcDbConnectionManager {
  private _pending: AcDbPendingConnection | null = null;

  constructor(private readonly viewport: AcDbViewport) {}

  get pending(): AcDbPendingConnection | null { return this._pending; }
  get isDrawing(): boolean { return this._pending !== null && this._pending.active; }

  /** Call when user starts dragging a socket dot. Pass screen-space coords. */
  startConnection(from: AcDbSocketInfo): void {
    this._pending = { from, toX: from.screenX, toY: from.screenY, active: true };
  }

  /** Call on canvas pointermove while drawing a connection. Pass screen-space coords. */
  updateConnection(screenX: number, screenY: number): void {
    if (!this._pending) return;
    this._pending.toX = screenX;
    this._pending.toY = screenY;
  }

  /**
   * Call when user drops on a target socket.
   * @returns the completed connection pair, or null if dropped on empty space.
   */
  finishConnection(to: AcDbSocketInfo | null): { from: AcDbSocketInfo; to: AcDbSocketInfo } | null {
    const pending = this._pending;
    this._pending = null;
    if (!pending || !to) return null;
    if (pending.from.columnId === to.columnId) return null; // self-connect
    return { from: pending.from, to };
  }

  cancelConnection(): void {
    this._pending = null;
  }

  /** Returns SVG path data for the rubber line (cubic bezier) in screen space. */
  getRubberLinePath(): string {
    if (!this._pending) return '';
    const { from, toX, toY } = this._pending;
    const dx = Math.abs(toX - from.screenX) * 0.5;
    return [
      `M ${from.screenX} ${from.screenY}`,
      `C ${from.screenX + dx} ${from.screenY},`,
      `  ${toX - dx} ${toY},`,
      `  ${toX} ${toY}`,
    ].join(' ');
  }
}
