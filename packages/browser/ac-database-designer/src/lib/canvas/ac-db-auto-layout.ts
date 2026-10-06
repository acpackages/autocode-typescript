import { AcDbLayout, AcDbNodeLayout } from '../models/ac-db-layout.model';
import { AcDbRelationship } from '../models/ac-db-relationship.model';

export type AcDbAutoLayoutMode = 'grid' | 'layered' | 'force';

/**
 * Built-in auto-layout algorithms.
 * No external dependencies — pure geometry.
 *
 * Modes:
 *  grid    — simple N-column grid (fast, predictable)
 *  layered — topological sort by FK relationships (best for ERDs)
 *  force   — simple spring-based force-directed (iterative)
 */
export class AcDbAutoLayout {
  static readonly NODE_W = 260;
  static readonly NODE_H = 220;  // approximate, varies by column count
  static readonly GAP_X  = 60;
  static readonly GAP_Y  = 60;

  /** Arrange all tables in a regular N-column grid. */
  static grid(
    tableIds: string[],
    cols = Math.ceil(Math.sqrt(tableIds.length)),
    offsetX = 40,
    offsetY = 40,
  ): Record<string, { x: number; y: number }> {
    const result: Record<string, { x: number; y: number }> = {};
    const stride = AcDbAutoLayout.NODE_W + AcDbAutoLayout.GAP_X;
    const rowH   = AcDbAutoLayout.NODE_H + AcDbAutoLayout.GAP_Y;
    tableIds.forEach((id, i) => {
      result[id] = {
        x: offsetX + (i % cols)  * stride,
        y: offsetY + Math.floor(i / cols) * rowH,
      };
    });
    return result;
  }

  /**
   * Layered layout: tables with no incoming FKs go on the left,
   * tables that depend on them go further right.
   * Produces a left-to-right ERD layout.
   */
  static layered(
    tableIds: string[],
    relationships: AcDbRelationship[],
    offsetX = 40,
    offsetY = 40,
  ): Record<string, { x: number; y: number }> {
    // Build adjacency: fromTableId → toTableId (FK points from child to parent)
    const inDegree = new Map<string, number>();
    const adj      = new Map<string, string[]>();
    for (const id of tableIds) { inDegree.set(id, 0); adj.set(id, []); }
    for (const rel of relationships) {
      if (!inDegree.has(rel.fromTableId) || !inDegree.has(rel.toTableId)) continue;
      adj.get(rel.toTableId)!.push(rel.fromTableId);
      inDegree.set(rel.fromTableId, (inDegree.get(rel.fromTableId) ?? 0) + 1);
    }

    // Kahn's topological sort to assign layers
    const layer   = new Map<string, number>();
    const queue   = tableIds.filter(id => (inDegree.get(id) ?? 0) === 0);
    let   maxLayer = 0;
    for (const id of queue) layer.set(id, 0);

    let head = 0;
    while (head < queue.length) {
      const id = queue[head++];
      const l  = layer.get(id) ?? 0;
      for (const next of (adj.get(id) ?? [])) {
        const nextLayer = Math.max(layer.get(next) ?? 0, l + 1);
        layer.set(next, nextLayer);
        maxLayer = Math.max(maxLayer, nextLayer);
        inDegree.set(next, (inDegree.get(next) ?? 1) - 1);
        if ((inDegree.get(next) ?? 0) === 0) queue.push(next);
      }
    }
    // Assign any unvisited (cycles) to maxLayer+1
    for (const id of tableIds) {
      if (!layer.has(id)) layer.set(id, maxLayer + 1);
    }

    // Place nodes by layer (x) and position within layer (y)
    const byLayer = new Map<number, string[]>();
    for (const [id, l] of layer) {
      if (!byLayer.has(l)) byLayer.set(l, []);
      byLayer.get(l)!.push(id);
    }

    const result: Record<string, { x: number; y: number }> = {};
    for (const [l, ids] of byLayer) {
      ids.forEach((id, i) => {
        result[id] = {
          x: offsetX + l * (AcDbAutoLayout.NODE_W + AcDbAutoLayout.GAP_X),
          y: offsetY + i * (AcDbAutoLayout.NODE_H + AcDbAutoLayout.GAP_Y),
        };
      });
    }
    return result;
  }

  /**
   * Apply computed positions to a layout object.
   * Preserves collapsed state.
   */
  static applyPositions(
    positions: Record<string, { x: number; y: number }>,
    layout: AcDbLayout,
  ): void {
    for (const [id, pos] of Object.entries(positions)) {
      if (!layout.nodes[id]) {
        layout.nodes[id] = { x: pos.x, y: pos.y, collapsed: false };
      } else {
        layout.nodes[id].x = pos.x;
        layout.nodes[id].y = pos.y;
      }
    }
  }
}
