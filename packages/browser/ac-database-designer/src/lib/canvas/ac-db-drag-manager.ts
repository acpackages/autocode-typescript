import { AcDbViewport } from './ac-db-viewport';
import { AcDbLayout } from '../models/ac-db-layout.model';
import { AcDbEventBus } from '../store/ac-db-event-bus';

const GRID_SIZE = 20;
/** Snap a value to the nearest grid increment. */
function snap(v: number): number { return Math.round(v / GRID_SIZE) * GRID_SIZE; }

export interface AcDbDragState {
  tableId: string;
  startWorldX: number;
  startWorldY: number;
  startLayoutX: number;
  startLayoutY: number;
}

/**
 * Handles table card drag — single and multi (when multiple are selected).
 * Uses pointer events with setPointerCapture for reliable tracking outside the element.
 *
 * Event delegation: the CANVAS element adds one pointermove/pointerup listener.
 * Individual card headers call startDrag() on pointerdown.
 */
export class AcDbDragManager {
  private _dragging = false;
  private _states: AcDbDragState[] = [];
  private _startScreenX = 0;
  private _startScreenY = 0;

  constructor(
    private readonly viewport: AcDbViewport,
    private readonly layout: AcDbLayout,
    private readonly bus: AcDbEventBus,
  ) {}

  get isDragging(): boolean { return this._dragging; }

  /**
   * Call from the card header's pointerdown handler.
   * @param tableIds IDs of all tables to drag (selected set, or just the one clicked)
   * @param screenX  pointer screen X at drag start
   * @param screenY  pointer screen Y at drag start
   */
  startDrag(tableIds: string[], screenX: number, screenY: number): void {
    this._dragging = true;
    this._startScreenX = screenX;
    this._startScreenY = screenY;
    this._states = tableIds.map(tableId => {
      const node = this.layout.nodes[tableId] ?? { x: 0, y: 0, collapsed: false };
      return {
        tableId,
        startWorldX: this.viewport.screenToWorld(screenX, screenY).x,
        startWorldY: this.viewport.screenToWorld(screenX, screenY).y,
        startLayoutX: node.x,
        startLayoutY: node.y,
      };
    });
  }

  /**
   * Call from canvas pointermove. Returns true if dragging occurred.
   */
  onPointerMove(screenX: number, screenY: number): boolean {
    if (!this._dragging || !this._states.length) return false;
    const world = this.viewport.screenToWorld(screenX, screenY);
    const dx    = world.x - this._states[0].startWorldX;
    const dy    = world.y - this._states[0].startWorldY;
    for (const s of this._states) {
      if (!this.layout.nodes[s.tableId]) {
        this.layout.nodes[s.tableId] = { x: 0, y: 0, collapsed: false };
      }
      this.layout.nodes[s.tableId].x = snap(s.startLayoutX + dx);
      this.layout.nodes[s.tableId].y = snap(s.startLayoutY + dy);
    }
    this.bus.emit('layout:changed', this.layout);
    return true;
  }

  /**
   * Call from canvas pointerup.
   * Returns the list of moves (for MoveNodesCommand undo data).
   */
  endDrag(screenX: number, screenY: number): { tableId: string; fromX: number; fromY: number; toX: number; toY: number }[] {
    if (!this._dragging) return [];
    const moves = this._states.map(s => ({
      tableId: s.tableId,
      fromX: s.startLayoutX,
      fromY: s.startLayoutY,
      toX:   this.layout.nodes[s.tableId]?.x ?? s.startLayoutX,
      toY:   this.layout.nodes[s.tableId]?.y ?? s.startLayoutY,
    }));
    this._dragging = false;
    this._states = [];
    return moves;
  }

  cancelDrag(): void {
    // Restore original positions
    for (const s of this._states) {
      if (this.layout.nodes[s.tableId]) {
        this.layout.nodes[s.tableId].x = s.startLayoutX;
        this.layout.nodes[s.tableId].y = s.startLayoutY;
      }
    }
    this._dragging = false;
    this._states = [];
    this.bus.emit('layout:changed', this.layout);
  }
}
