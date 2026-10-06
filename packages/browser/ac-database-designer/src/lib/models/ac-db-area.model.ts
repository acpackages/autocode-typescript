/** Canvas subject area — a colored rectangular region for visually grouping tables. */
export interface AcDbArea {
  areaId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createArea(partial: Partial<AcDbArea> & { areaId: string }): AcDbArea {
  return {
    areaId: partial.areaId,
    name: partial.name ?? 'Area',
    color: partial.color ?? 'rgba(51,154,240,0.08)',
    x: partial.x ?? 50,
    y: partial.y ?? 50,
    width: partial.width ?? 400,
    height: partial.height ?? 300,
  };
}
