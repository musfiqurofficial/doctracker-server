import http, { Server } from 'http';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSocket } from './socket';

let server: Server;

async function bootstrap() {
  try {
    await connectDB();
    
    server = http.createServer(app);
    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(`[Server] Doctor Tracker API running on http://localhost:${env.PORT}`);
      console.log(`[Socket.io] Real-time server listening on ws://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error('[Server] Initialization Error:', err);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled Rejection:', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

bootstrap();
