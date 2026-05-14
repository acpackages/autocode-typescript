import { DevServer } from './dev-server.js';
import * as path from 'path';

const watchDir = process.argv[2] || process.cwd();
const port = parseInt(process.argv[3] || '3000');

const server = new DevServer({
  port,
  watchDir: path.resolve(watchDir)
});

server.start();
