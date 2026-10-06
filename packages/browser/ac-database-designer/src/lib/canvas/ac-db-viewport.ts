import { AcDbEventBus } from '../store/ac-db-event-bus';
import { AcDbLayout, AcDbNodeLayout } from '../models/ac-db-layout.model';

export interface AcDbAABB { left: number; top: number; right: number; bottom: number; }

/**
 * Manages pan/zoom state and AABB viewport culling.
 * No DOM coupling — receives a layout ref and fires events.
 * The element layer applies the transform.
 */
export class AcDbViewport {
  private _x = 0;       // translateX in px
  private _y = 0;       // translateY in px
  private _scale = 1;   // zoom scale

  /** Canvas element dimensions (updated on resize) */
  private _w = 800;
  private _h = 600;

  readonly minScale = 0.1;
  readonly maxScale = 3;

  constructor(private readonly bus: AcDbEventBus) {}

  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get scale(): number { return this._scale; }

  get transform(): string {
    return `translate(${this._x}px, ${this._y}px) scale(${this._scale})`;
  }

  /** Call when the canvas container is resized. */
  setSize(w: number, h: number): void {
    this._w = w;
    this._h = h;
  }

  /** Restore state from a saved layout. */
  fromLayout(layout: AcDbLayout): void {
    this._x = layout.scrollX;
    this._y = layout.scrollY;
    this._scale = layout.zoom;
  }

  /** Persist state back to a layout object. */
  toLayout(layout: AcDbLayout): void {
    layout.scrollX = this._x;
    layout.scrollY = this._y;
    layout.zoom    = this._scale;
  }

  /** Pan by a delta in screen pixels. */
  pan(dx: number, dy: number): void {
    this._x += dx;
    this._y += dy;
    this.bus.emit('layout:changed', {} as any);
  }

  /**
   * Zoom around a screen-space focal point (e.g. mouse position).
   * @param delta positive = zoom in, negative = zoom out
   * @param focalX screen x of zoom centre
   * @param focalY screen y of zoom centre
   */
  zoom(delta: number, focalX: number, focalY: number): void {
    const factor = delta > 0 ? 1.1 : 1 / 1.1;
    const next   = Math.min(this.maxScale, Math.max(this.minScale, this._scale * factor));
    const ratio  = next / this._scale;
    // Adjust translation so focal point stays fixed on screen
    this._x = focalX - ratio * (focalX - this._x);
    this._y = focalY - ratio * (focalY - this._y);
    this._scale = next;
    this.bus.emit('layout:changed', {} as any);
  }

  zoomIn(focalX = this._w / 2, focalY = this._h / 2): void  { this.zoom(1,  focalX, focalY); }
  zoomOut(focalX = this._w / 2, focalY = this._h / 2): void { this.zoom(-1, focalX, focalY); }

  /** Fit all nodes into the viewport with padding. */
  fitAll(nodes: Record<string, AcDbNodeLayout>, nodeW = 240, nodeH = 200, padding = 40): void {
    const entries = Object.values(nodes);
    if (!entries.length) return;
    const minX = Math.min(...entries.map(n => n.x)) - padding;
    const minY = Math.min(...entries.map(n => n.y)) - padding;
    const maxX = Math.max(...entries.map(n => n.x + nodeW)) + padding;
    const maxY = Math.max(...entries.map(n => n.y + nodeH)) + padding;
    const sw   = maxX - minX;
    const sh   = maxY - minY;
    const scale = Math.min(this._w / sw, this._h / sh, 1);
    this._scale = scale;
    this._x = (this._w - sw * scale) / 2 - minX * scale;
    this._y = (this._h - sh * scale) / 2 - minY * scale;
    this.bus.emit('layout:changed', {} as any);
  }

  /**
   * Returns the viewport AABB in canvas (world) space.
   * Used for AABB culling — nodes outside this rect are hidden.
   */
  getWorldAABB(): AcDbAABB {
    return {
      left:   (-this._x) / this._scale,
      top:    (-this._y) / this._scale,
      right:  (-this._x + this._w) / this._scale,
      bottom: (-this._y + this._h) / this._scale,
    };
  }

  /**
   * Returns IDs of nodes whose AABB overlaps the viewport.
   * O(n) — n = number of nodes.
   */
  getVisibleNodes(
    nodes: Record<string, AcDbNodeLayout>,
    nodeW: number,
    nodeH: number,
    margin = 50,   // extra margin so nodes don't pop-in at edges
  ): Set<string> {
    const vp  = this.getWorldAABB();
    const visible = new Set<string>();
    for (const [id, n] of Object.entries(nodes)) {
      const inView =
        n.x + nodeW + margin > vp.left  &&
        n.x          - margin < vp.right &&
        n.y + nodeH  + margin > vp.top   &&
        n.y          - margin < vp.bottom;
      if (inView) visible.add(id);
    }
    return visible;
  }

  /** Convert a screen-space point to world-space. */
  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this._x) / this._scale,
      y: (sy - this._y) / this._scale,
    };
  }

  /** Convert a world-space point to screen-space. */
  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: wx * this._scale + this._x,
      y: wy * this._scale + this._y,
    };
  }
}
