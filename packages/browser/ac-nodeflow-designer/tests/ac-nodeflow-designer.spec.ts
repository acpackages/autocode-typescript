import { describe, it, expect } from 'vitest';
import { AcNode } from '../src/lib/models/ac-node.model';
import { AcSocket } from '../src/lib/models/ac-socket.model';
import { AcConnection } from '../src/lib/models/ac-connection.model';
import { AcNodeflowApi } from '../src/lib/core/ac-nodeflow-api';

describe('AcNodeflowDesigner Models and API', () => {
  it('should create AcNode and add socket ports', () => {
    const node = new AcNode('users', { tableId: '123' });
    expect(node.label).toBe('users');
    expect(node.data.tableId).toBe('123');

    const socket = new AcSocket('col_id', 'both', { columnId: 'col_1' });
    node.addSocketPort({ key: 'id', socket, side: 'both' });

    expect(node.inputs['id']).toBeDefined();
    expect(node.outputs['id']).toBeDefined();

    node.removeSocketPort('id');
    expect(node.inputs['id']).toBeUndefined();
    expect(node.outputs['id']).toBeUndefined();
  });

  it('should create AcConnection and detect self-loops', () => {
    const socket = new AcSocket('col');
    const node1 = new AcNode('users');
    node1.addSocketPort({ key: 'id', socket, side: 'both' });
    node1.addSocketPort({ key: 'manager_id', socket, side: 'both' });

    const node2 = new AcNode('orders');
    node2.addSocketPort({ key: 'user_id', socket, side: 'both' });

    const regularConn = new AcConnection(node1, 'id', node2, 'user_id');
    expect(regularConn.isLoop).toBe(false);

    // Self-reference (e.g. employee -> manager in same table)
    const loopConn = new AcConnection(node1, 'id', node1, 'manager_id');
    expect(loopConn.isLoop).toBe(true);
  });

  it('should instantiate AcNodeflowApi with events and hooks', () => {
    const api = new AcNodeflowApi();
    expect(api.events).toBeDefined();
    expect(api.hooks).toBeDefined();

    let eventFired = false;
    api.on({
      event: 'custom_event',
      callback: () => {
        eventFired = true;
      },
    });

    api.events.execute({ event: 'custom_event', args: {} });
    expect(eventFired).toBe(true);
  });
});
