import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AcWsServer, AcWsClient } from '@autocode-ts/ac-web-socket';
import { AcWeb, AcWebResponse } from '@autocode-ts/ac-web';
import { AcWebOnWs } from './ac-web-on-ws';

describe('AcWebOnWs', () => {
  let server: AcWsServer;
  let client: AcWsClient;
  let app: AcWeb;
  const port = 3002;

  beforeAll(async () => {
    app = new AcWeb();
    app.get({
      url: '/test',
      handler: (args) => {
        return AcWebResponse.json({ data: { message: 'hello from web', query: args.request.queryParameters } });
      }
    });

    server = new AcWsServer();
    server.onConnection({
      handler: ({ socket }) => {
        new AcWebOnWs({ socket, app });
      }
    });
    await server.start({ port });
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should handle web request over websocket', async () => {
    client = new AcWsClient({ url: `ws://localhost:${port}` });
    const socket = await client.connect();
    expect(socket).toBeDefined();

    if (socket) {
      const response = await socket.emit({
        event: 'web_request',
        data: {
          method: 'GET',
          url: '/test',
          query: { name: 'test-user' }
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('hello from web');
      expect(response.data.query.name).toBe('test-user');
      
      await client.disconnect();
    }
  });
});
