import { describe, it, expect, beforeEach } from 'vitest';
import { AcDbEventBus } from '../src/lib/store/ac-db-event-bus';
import { AcDbViewport } from '../src/lib/canvas/ac-db-viewport';
import { AcDbDragManager } from '../src/lib/canvas/ac-db-drag-manager';
import { AcDbSelectionManager } from '../src/lib/canvas/ac-db-selection-manager';
import { AcDbConnectionManager } from '../src/lib/canvas/ac-db-connection-manager';
import { AcDbAutoLayout } from '../src/lib/canvas/ac-db-auto-layout';
import { createLayout } from '../src/lib/models/ac-db-layout.model';
import { AcEnumDbRelationType } from '../src/lib/enums/ac-enum-db-relation-type';
import { AcEnumDbFkAction } from '../src/lib/enums/ac-enum-db-fk-action';

// ── AcDbViewport ─────────────────────────────────────────────────────────────
describe('AcDbViewport', () => {
  let bus: AcDbEventBus;
  let vp: AcDbViewport;

  beforeEach(() => {
    bus = new AcDbEventBus();
    vp  = new AcDbViewport(bus);
    vp.setSize(800, 600);
  });

  it('starts at identity transform', () => {
    expect(vp.x).toBe(0);
    expect(vp.y).toBe(0);
    expect(vp.scale).toBe(1);
  });

  it('pan() shifts translate', () => {
    vp.pan(50, 30);
    expect(vp.x).toBe(50);
    expect(vp.y).toBe(30);
  });

  it('zoom() changes scale and keeps focal point fixed', () => {
    // Before zoom: world coord of screen (400,300) at scale=1, translate=(0,0)
    const worldBefore = vp.screenToWorld(400, 300);
    vp.zoom(1, 400, 300);
    expect(vp.scale).toBeGreaterThan(1);
    // After zoom: same screen point must still map to same world coord
    const worldAfter = vp.screenToWorld(400, 300);
    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 1);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 1);
  });

  it('zoom clamps to min/max', () => {
    for (let i = 0; i < 100; i++) vp.zoom(-1, 0, 0);
    expect(vp.scale).toBeGreaterThanOrEqual(vp.minScale);
    for (let i = 0; i < 100; i++) vp.zoom(1, 0, 0);
    expect(vp.scale).toBeLessThanOrEqual(vp.maxScale);
  });

  it('screenToWorld / worldToScreen are inverses', () => {
    vp.pan(100, 50);
    vp.zoom(1, 400, 300);
    const world  = vp.screenToWorld(300, 200);
    const screen = vp.worldToScreen(world.x, world.y);
    expect(screen.x).toBeCloseTo(300, 1);
    expect(screen.y).toBeCloseTo(200, 1);
  });

  it('fromLayout() / toLayout() round-trip', () => {
    const layout = createLayout();
    layout.scrollX = 120; layout.scrollY = 80; layout.zoom = 1.5;
    vp.fromLayout(layout);
    expect(vp.x).toBe(120);
    expect(vp.scale).toBe(1.5);
    const layout2 = createLayout();
    vp.toLayout(layout2);
    expect(layout2.scrollX).toBe(120);
    expect(layout2.zoom).toBe(1.5);
  });

  it('getVisibleNodes returns only overlapping nodes', () => {
    vp.setSize(800, 600);
    const nodes = {
      a: { x: 0,    y: 0,    collapsed: false },
      b: { x: 5000, y: 5000, collapsed: false }, // far off-screen
    };
    const visible = vp.getVisibleNodes(nodes, 260, 200);
    expect(visible.has('a')).toBe(true);
    expect(visible.has('b')).toBe(false);
  });

  it('fitAll() adjusts transform so all nodes are visible', () => {
    const nodes = {
      a: { x:   0, y:   0, collapsed: false },
      b: { x: 800, y: 600, collapsed: false },
    };
    vp.fitAll(nodes);
    expect(vp.scale).toBeGreaterThan(0);
    expect(vp.scale).toBeLessThanOrEqual(1);
  });

  it('getWorldAABB() covers full viewport', () => {
    const aabb = vp.getWorldAABB();
    expect(aabb.right - aabb.left).toBeCloseTo(800, 0);
    expect(aabb.bottom - aabb.top).toBeCloseTo(600, 0);
  });

  it('emits layout:changed on pan', () => {
    let fired = false;
    bus.on('layout:changed', () => { fired = true; });
    vp.pan(10, 10);
    expect(fired).toBe(true);
  });
});

// ── AcDbDragManager ───────────────────────────────────────────────────────────
describe('AcDbDragManager', () => {
  let bus: AcDbEventBus;
  let vp: AcDbViewport;
  let layout: ReturnType<typeof createLayout>;
  let drag: AcDbDragManager;

  beforeEach(() => {
    bus = new AcDbEventBus();
    vp  = new AcDbViewport(bus);
    vp.setSize(800, 600);
    layout = createLayout();
    layout.nodes['t1'] = { x: 100, y: 100, collapsed: false };
    layout.nodes['t2'] = { x: 400, y: 200, collapsed: false };
    drag = new AcDbDragManager(vp, layout, bus);
  });

  it('isDragging is false initially', () => {
    expect(drag.isDragging).toBe(false);
  });

  it('startDrag/onPointerMove moves node', () => {
    drag.startDrag(['t1'], 100, 100);
    drag.onPointerMove(150, 100); // moved 50px right in screen coords
    expect(layout.nodes['t1'].x).toBeGreaterThan(100);
  });

  it('endDrag returns correct move deltas', () => {
    drag.startDrag(['t1'], 100, 100);
    drag.onPointerMove(200, 100);
    const moves = drag.endDrag(200, 100);
    expect(moves).toHaveLength(1);
    expect(moves[0].tableId).toBe('t1');
    expect(moves[0].fromX).toBe(100);
  });

  it('endDrag resets isDragging', () => {
    drag.startDrag(['t1'], 0, 0);
    drag.endDrag(0, 0);
    expect(drag.isDragging).toBe(false);
  });

  it('cancelDrag restores original positions', () => {
    drag.startDrag(['t1'], 100, 100);
    drag.onPointerMove(500, 500);
    drag.cancelDrag();
    expect(layout.nodes['t1'].x).toBe(100);
    expect(layout.nodes['t1'].y).toBe(100);
  });

  it('multi-drag moves all selected nodes', () => {
    drag.startDrag(['t1', 't2'], 100, 100);
    drag.onPointerMove(200, 100);
    expect(layout.nodes['t1'].x).toBeGreaterThan(100);
    expect(layout.nodes['t2'].x).toBeGreaterThan(400);
  });
});

// ── AcDbSelectionManager ──────────────────────────────────────────────────────
describe('AcDbSelectionManager', () => {
  let sel: AcDbSelectionManager;

  beforeEach(() => { sel = new AcDbSelectionManager(); });

  it('select() selects one and clears others', () => {
    sel.select('a');
    sel.select('b');
    expect(sel.isSelected('a')).toBe(false);
    expect(sel.isSelected('b')).toBe(true);
  });

  it('select() additive keeps both', () => {
    sel.select('a');
    sel.select('b', true);
    expect(sel.isSelected('a')).toBe(true);
    expect(sel.isSelected('b')).toBe(true);
  });

  it('toggle() flips selection', () => {
    sel.select('a');
    sel.toggle('a');
    expect(sel.isSelected('a')).toBe(false);
    sel.toggle('a');
    expect(sel.isSelected('a')).toBe(true);
  });

  it('clearSelection() empties selection', () => {
    sel.select('a'); sel.select('b', true);
    sel.clearSelection();
    expect(sel.selected.size).toBe(0);
  });

  it('rubber-band endRubberBand selects overlapping nodes', () => {
    sel.startRubberBand(0, 0);
    sel.updateRubberBand(300, 300);
    const nodes = {
      a: { x: 50,  y: 50,  w: 260, h: 200 },  // inside
      b: { x: 500, y: 500, w: 260, h: 200 },  // outside
    };
    const hit = sel.endRubberBand(nodes);
    expect(hit).toContain('a');
    expect(hit).not.toContain('b');
    expect(sel.isSelected('a')).toBe(true);
  });

  it('getRubberBandRect() handles reversed direction', () => {
    sel.startRubberBand(200, 200);
    sel.updateRubberBand(50, 80);
    const rect = sel.getRubberBandRect();
    expect(rect.left).toBe(50);
    expect(rect.top).toBe(80);
    expect(rect.width).toBe(150);
    expect(rect.height).toBe(120);
  });
});

// ── AcDbConnectionManager ─────────────────────────────────────────────────────
describe('AcDbConnectionManager', () => {
  let bus: AcDbEventBus;
  let vp: AcDbViewport;
  let conn: AcDbConnectionManager;

  beforeEach(() => {
    bus = new AcDbEventBus();
    vp  = new AcDbViewport(bus);
    vp.setSize(800, 600);
    conn = new AcDbConnectionManager(vp);
  });

  it('not drawing initially', () => {
    expect(conn.isDrawing).toBe(false);
  });

  it('startConnection sets drawing state', () => {
    conn.startConnection({ tableId: 't1', columnId: 'c1', worldX: 100, worldY: 100 });
    expect(conn.isDrawing).toBe(true);
  });

  it('finishConnection returns pair when target provided', () => {
    conn.startConnection({ tableId: 't1', columnId: 'c1', worldX: 100, worldY: 100 });
    const result = conn.finishConnection({ tableId: 't2', columnId: 'c2', worldX: 300, worldY: 200 });
    expect(result).not.toBeNull();
    expect(result!.from.columnId).toBe('c1');
    expect(result!.to.columnId).toBe('c2');
    expect(conn.isDrawing).toBe(false);
  });

  it('finishConnection returns null when dropped on empty space', () => {
    conn.startConnection({ tableId: 't1', columnId: 'c1', worldX: 100, worldY: 100 });
    const result = conn.finishConnection(null);
    expect(result).toBeNull();
  });

  it('finishConnection returns null for self-connection', () => {
    conn.startConnection({ tableId: 't1', columnId: 'c1', worldX: 100, worldY: 100 });
    const result = conn.finishConnection({ tableId: 't1', columnId: 'c1', worldX: 200, worldY: 100 });
    expect(result).toBeNull();
  });

  it('cancelConnection ends drawing state', () => {
    conn.startConnection({ tableId: 't1', columnId: 'c1', worldX: 0, worldY: 0 });
    conn.cancelConnection();
    expect(conn.isDrawing).toBe(false);
  });

  it('getRubberLinePath returns non-empty string while drawing', () => {
    conn.startConnection({ tableId: 't1', columnId: 'c1', worldX: 100, worldY: 100 });
    conn.updateConnection(300, 250); // screen coords
    const path = conn.getRubberLinePath();
    expect(path.length).toBeGreaterThan(0);
    expect(path).toContain('M');
    expect(path).toContain('C');
  });
});

// ── AcDbAutoLayout ────────────────────────────────────────────────────────────
describe('AcDbAutoLayout', () => {
  it('grid() arranges N tables in columns', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const pos = AcDbAutoLayout.grid(ids, 2);
    // 2 columns → items 0,2 same column (x=0), items 1,3 same column (x=stride)
    expect(pos['a'].x).toBe(pos['c'].x);
    expect(pos['b'].x).toBe(pos['d'].x);
    expect(pos['a'].y).toBe(40);
    expect(pos['c'].y).toBeGreaterThan(pos['a'].y);
  });

  it('grid() spreads horizontally by NODE_W + GAP_X', () => {
    const pos = AcDbAutoLayout.grid(['a', 'b'], 2);
    const expected = AcDbAutoLayout.NODE_W + AcDbAutoLayout.GAP_X;
    expect(pos['b'].x - pos['a'].x).toBe(expected);
  });

  it('layered() places tables with no incoming FK on leftmost layer', () => {
    const rels = [{ fromTableId: 'orders', toTableId: 'users', relationshipId: 'r1', schemaId: 's1', label: '', type: AcEnumDbRelationType.OneToMany, fromColumnId: 'c1', toColumnId: 'c2', onDelete: AcEnumDbFkAction.NoAction, onUpdate: AcEnumDbFkAction.NoAction }];
    const pos = AcDbAutoLayout.layered(['users', 'orders'], rels);
    // users has no incoming FKs (it's the parent), orders has 1
    // users should be on layer 0 (leftmost x), orders on layer 1
    expect(pos['orders'].x).toBeGreaterThan(pos['users'].x);
  });

  it('layered() handles empty relationships (all on layer 0)', () => {
    const pos = AcDbAutoLayout.layered(['a', 'b', 'c'], []);
    expect(pos['a'].x).toBe(pos['b'].x);
  });

  it('applyPositions() updates layout.nodes', () => {
    const layout = createLayout();
    AcDbAutoLayout.applyPositions({ t1: { x: 100, y: 200 } }, layout);
    expect(layout.nodes['t1'].x).toBe(100);
    expect(layout.nodes['t1'].y).toBe(200);
    expect(layout.nodes['t1'].collapsed).toBe(false);
  });

  it('applyPositions() preserves collapsed state', () => {
    const layout = createLayout();
    layout.nodes['t1'] = { x: 0, y: 0, collapsed: true };
    AcDbAutoLayout.applyPositions({ t1: { x: 50, y: 80 } }, layout);
    expect(layout.nodes['t1'].collapsed).toBe(true);
  });
});
