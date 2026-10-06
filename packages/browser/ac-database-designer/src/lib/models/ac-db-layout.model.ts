export interface AcDbNodeLayout {
  x: number;
  y: number;
  collapsed: boolean;
}

export interface AcDbLayout {
  nodes: Record<string, AcDbNodeLayout>;
  zoom: number;
  scrollX: number;
  scrollY: number;
}

export function createLayout(): AcDbLayout {
  return { nodes: {}, zoom: 1, scrollX: 0, scrollY: 0 };
}
