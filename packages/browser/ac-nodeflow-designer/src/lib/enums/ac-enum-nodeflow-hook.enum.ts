export const AcEnumNodeflowHook = {
  ConnectionValidate: 'CONNECTION_VALIDATE',
  BeforeNodeRemove: 'BEFORE_NODE_REMOVE',
  BeforeConnectionRemove: 'BEFORE_CONNECTION_REMOVE',
  NodeRender: 'NODE_RENDER',
  ConnectionRender: 'CONNECTION_RENDER',
} as const;

export type AcEnumNodeflowHook = typeof AcEnumNodeflowHook[keyof typeof AcEnumNodeflowHook];
