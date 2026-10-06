/**
 * Manages the SVG overlay that draws FK relationship bezier curves.
 * Owned by ac-db-canvas — not a custom element itself, just a helper class
 * that writes into an existing <svg> element.
 *
 * Supports:
 *  - Curved bezier connections between column sockets
 *  - Cardinality markers (1 / ∞) rendered at line endpoints
 *  - Hover tooltips showing "table.column → table.column"
 *  - Rubber line while drawing a new connection
 *  - Click-to-select relationship
 */
import { AcDbStore } from '../../store/ac-db-store';
import { AcDbLayout } from '../../models/ac-db-layout.model';
import { AcDbViewport } from '../../canvas/ac-db-viewport';
import { AcDbRelationship } from '../../models/ac-db-relationship.model';
import { AcEnumDbRelationType } from '../../enums/ac-enum-db-relation-type';

export interface AcDbSocketPosition {
  tableId: string;
  columnId: string;
  /** screen-space X of the socket */
  x: number;
  y: number;
  side: 'left' | 'right';
}

/** Cardinality label at a line endpoint. */
interface CardinalityLabels { from: string; to: string; }

function getCardinality(type: AcEnumDbRelationType): CardinalityLabels {
  switch (type) {
    case AcEnumDbRelationType.OneToOne:  return { from: '1', to: '1' };
    case AcEnumDbRelationType.OneToMany: return { from: '1', to: '∞' };
    case AcEnumDbRelationType.ManyToMany: return { from: '∞', to: '∞' };
    default: return { from: '1', to: '∞' };
  }
}

export class AcDbRelationSvgRenderer {
  private _selectedRelId: string | null = null;
  private _store: AcDbStore | null = null;

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly viewport: AcDbViewport,
  ) {}

  get selectedRelId(): string | null { return this._selectedRelId; }

  setStore(store: AcDbStore): void { this._store = store; }

  selectRelationship(relId: string | null): void {
    this._selectedRelId = relId;
  }

  /**
   * Full redraw of all relationship paths.
   * Called after any layout or schema change.
   *
   * @param relationships   all relationships to render
   * @param socketPositions map from `tableId:columnId` to screen-space socket positions
   * @param rubberLinePath  optional SVG path string for the in-progress rubber line
   */
  render(
    relationships: AcDbRelationship[],
    socketPositions: Map<string, { x: number; y: number }>,
    rubberLinePath?: string,
  ): void {
    const paths: string[] = [];

    for (const rel of relationships) {
      // Source (Parent, PK, '1' side) is toTable; Destination (Child, FK, '∞' side) is fromTable
      const srcKey = `${rel.toTableId}:${rel.toColumnId}:right`;
      const dstKey = `${rel.fromTableId}:${rel.fromColumnId}:left`;
      const src = socketPositions.get(srcKey) ?? socketPositions.get(`${rel.toTableId}:${rel.toColumnId}`);
      const dst = socketPositions.get(dstKey) ?? socketPositions.get(`${rel.fromTableId}:${rel.fromColumnId}`);
      if (!src || !dst) continue;

      const d   = this._bezierPath(src.x, src.y, dst.x, dst.y);
      const sel = this._selectedRelId === rel.relationshipId ? ' selected' : '';
      const { from: srcLabel, to: dstLabel } = getCardinality(rel.type);

      // Build tooltip text: Source (Parent) → Destination (Child)
      const srcTable = this._store?.getTable(rel.toTableId);
      const dstTable = this._store?.getTable(rel.fromTableId);
      const srcCol   = this._store?.getColumn(rel.toColumnId);
      const dstCol   = this._store?.getColumn(rel.fromColumnId);
      const tooltip   = `${srcTable?.tableName ?? '?'}.${srcCol?.columnName ?? '?'} → ${dstTable?.tableName ?? '?'}.${dstCol?.columnName ?? '?'}`;

      // Path with click target and tooltip
      paths.push(
        `<path class="acd-rel-path${sel}" d="${d}"
              data-rel-id="${rel.relationshipId}">
          <title>${tooltip}</title>
        </path>`
      );

      // Cardinality markers at endpoints: 1 at Source, ∞ at Destination
      const offset = 14;
      paths.push(
        `<text class="acd-rel-cardinality" x="${src.x + offset}" y="${src.y - 6}"
              data-rel-id="${rel.relationshipId}">${srcLabel}</text>`
      );
      paths.push(
        `<text class="acd-rel-cardinality" x="${dst.x - offset}" y="${dst.y - 6}"
              text-anchor="end"
              data-rel-id="${rel.relationshipId}">${dstLabel}</text>`
      );
    }

    // Rubber line (when drawing a new connection)
    if (rubberLinePath) {
      paths.push(`<path class="acd-rel-rubber" d="${rubberLinePath}"/>`);
    }

    this.svg.innerHTML = paths.join('\n');
  }

  private _bezierPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = Math.abs(x2 - x1) * 0.5;
    return [
      `M ${x1} ${y1}`,
      `C ${x1 + dx} ${y1},`,
      `  ${x2 - dx} ${y2},`,
      `  ${x2} ${y2}`,
    ].join(' ');
  }
}
