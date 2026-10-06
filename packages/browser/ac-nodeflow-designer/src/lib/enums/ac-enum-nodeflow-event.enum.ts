export const AcEnumNodeflowEvent = {
  NodeCreated: 'NODE_CREATED',
  NodeRemoved: 'NODE_REMOVED',
  NodeSelected: 'NODE_SELECTED',
  NodeTranslated: 'NODE_TRANSLATED',
  ConnectionCreated: 'CONNECTION_CREATED',
  ConnectionRemoved: 'CONNECTION_REMOVED',
  ConnectionSelected: 'CONNECTION_SELECTED',
  CanvasTranslated: 'CANVAS_TRANSLATED',
  CanvasZoomed: 'CANVAS_ZOOMED',
} as const;

export type AcEnumNodeflowEvent = typeof AcEnumNodeflowEvent[keyof typeof AcEnumNodeflowEvent];
