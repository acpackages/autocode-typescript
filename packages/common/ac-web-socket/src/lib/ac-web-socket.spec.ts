import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AcWsServer } from './ac-ws-server';
import { AcWsClient } from './ac-ws-client';
import { AcWebSocket } from './ac-web-socket';

describe('AcWebSocket', () => {
  let server: AcWsServer;
  let client: AcWsClient;
  const port = 3001;

  beforeAll(async () => {
    server = new AcWsServer();
    await server.start({ port });
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should connect and exchange messages', async () => {
    return new Promise<void>(async (resolve, reject) => {
      server.onConnection({
        handler: ({ socket }) => {
          socket.on({
            event: 'hello',
            handler: ({ data, callback }) => {
              expect(data).toBe('world');
              if (callback) {
                callback({ response: 'welcome' });
              }
            }
          });
        }
      });

      client = new AcWsClient({ url: `ws://localhost:${port}` });
      const socket = await client.connect();
      expect(socket).toBeDefined();

      if (socket) {
        const response = await socket.emit({ event: 'hello', data: 'world' });
        expect(response).toBe('welcome');
        await client.disconnect();
        resolve();
      } else {
        reject('Socket not connected');
      }
    });
  });

  it('should handle rooms', async () => {
    return new Promise<void>(async (resolve) => {
      server.of({ name: '/' }).onConnection({
        handler: ({ socket }) => {
          socket.on({
            event: 'join',
            handler: ({ data }) => {
              socket.join({ room: data });
              server.of({ name: '/' }).to({ room: data }).emit({ event: 'joined', data: 'success' });
            }
          });
        }
      });

      const client1 = new AcWsClient({ url: `ws://localhost:${port}` });
      const socket1 = await client1.connect();

      socket1?.on({
        event: 'joined',
        handler: async ({ data }) => {
          expect(data).toBe('success');
          await client1.disconnect();
          resolve();
        }
      });

      socket1?.emit({ event: 'join', data: 'room1' });
    });
  });

  it('should handle binary data', async () => {
    return new Promise<void>(async (resolve) => {
        const testData = new Uint8Array([1, 2, 3, 4]);
        
        server.onConnection({
            handler: ({ socket }) => {
                socket.on({
                    event: 'bin',
                    handler: ({ data }) => {
                        expect(data).toBeInstanceOf(Uint8Array);
                        expect(Array.from(data)).toEqual([1, 2, 3, 4]);
                        socket.sendBinary({ bytes: data });
                    }
                });
            }
        });

        const client1 = new AcWsClient({ url: `ws://localhost:${port}` });
        const socket1 = await client1.connect();

        socket1?.on({
            event: 'bin',
            handler: async ({ data }) => {
                expect(data).toBeInstanceOf(Uint8Array);
                expect(Array.from(data)).toEqual([1, 2, 3, 4]);
                await client1.disconnect();
                resolve();
            }
        });

        socket1?.sendBinary({ bytes: testData });
    });
  });
});
