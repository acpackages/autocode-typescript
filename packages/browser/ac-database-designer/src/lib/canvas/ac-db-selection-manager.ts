export interface AcDbRubberBand {
  startX: number; startY: number;
  endX:   number; endY:   number;
  active: boolean;
}

/**
 * Manages table card selection state.
 * Rubber-band selection computed in world space.
 * Single/Ctrl-click selection handled externally by calling select().
 */
export class AcDbSelectionManager {
  private _selected = new Set<string>();
  private _rubberBand: AcDbRubberBand = { startX: 0, startY: 0, endX: 0, endY: 0, active: false };

  get selected(): ReadonlySet<string> { return this._selected; }
  get rubberBand(): Readonly<AcDbRubberBand> { return this._rubberBand; }

  isSelected(tableId: string): boolean { return this._selected.has(tableId); }

  /** Select a single table, clearing others unless additive. */
  select(tableId: string, additive = false): void {
    if (!additive) this._selected.clear();
    this._selected.add(tableId);
  }

  /** Toggle selection of a single table. */
  toggle(tableId: string): void {
    if (this._selected.has(tableId)) this._selected.delete(tableId);
    else this._selected.add(tableId);
  }

  /** Deselect all. */
  clearSelection(): void { this._selected.clear(); }

  /** Select multiple (additive = merge with existing). */
  selectMany(ids: string[], additive = false): void {
    if (!additive) this._selected.clear();
    for (const id of ids) this._selected.add(id);
  }

  // ── Rubber-band ─────────────────────────────────────────────────────────────

  startRubberBand(worldX: number, worldY: number): void {
    this._rubberBand = { startX: worldX, startY: worldY, endX: worldX, endY: worldY, active: true };
  }

  updateRubberBand(worldX: number, worldY: number): void {
    this._rubberBand.endX = worldX;
    this._rubberBand.endY = worldY;
  }

  /**
   * End rubber-band, compute selected nodes, update selection.
   * @param nodes  Record<tableId, {x,y,w,h}> — bounding boxes in world space
   * @param additive add to existing selection
   */
  endRubberBand(
    nodes: Record<string, { x: number; y: number; w: number; h: number }>,
    additive = false,
  ): string[] {
    const rb   = this._rubberBand;
    rb.active  = false;
    const minX = Math.min(rb.startX, rb.endX);
    const maxX = Math.max(rb.startX, rb.endX);
    const minY = Math.min(rb.startY, rb.endY);
    const maxY = Math.max(rb.startY, rb.endY);
    const hit: string[] = [];
    for (const [id, n] of Object.entries(nodes)) {
      const overlaps =
        n.x     < maxX && n.x + n.w > minX &&
        n.y     < maxY && n.y + n.h > minY;
      if (overlaps) hit.push(id);
    }
    this.selectMany(hit, additive);
    return hit;
  }

  /** Rectangle CSS for the rubber-band overlay. */
  getRubberBandRect(): { left: number; top: number; width: number; height: number } {
    const rb = this._rubberBand;
    return {
      left:   Math.min(rb.startX, rb.endX),
      top:    Math.min(rb.startY, rb.endY),
      width:  Math.abs(rb.endX - rb.startX),
      height: Math.abs(rb.endY - rb.startY),
    };
  }
}
