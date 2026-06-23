require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = parseInt(process.env.PORT) || 5000;

const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Attacher io à l'app pour l'utiliser dans les contrôleurs
app.set('io', io);

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connecté: ${socket.id}`);

  socket.on('authenticate', (data) => {
    if (data?.userId) {
      socket.join(`user:${data.userId}`);
      connectedUsers.set(data.userId, socket.id);
      console.log(`[Socket.IO] Utilisateur authentifié: ${data.userId}`);
    }
    if (data?.uniteId) {
      socket.join(`unite:${data.uniteId}`);
    }
  });

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('send_message', (data) => {
    if (data.destinataireId) {
      io.to(`user:${data.destinataireId}`).emit('receive_message', data);
    }
  });

  socket.on('position_update', (data) => {
    socket.broadcast.emit('position_update', data);
  });

  socket.on('disconnect', () => {
    connectedUsers.forEach((sid, userId) => {
      if (sid === socket.id) connectedUsers.delete(userId);
    });
    console.log(`[Socket.IO] Client déconnecté: ${socket.id}`);
  });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║       MILSYS RDC - Serveur Backend           ║');
      console.log('╠══════════════════════════════════════════════╣');
      console.log(`║  Port     : ${PORT}                              ║`);
      console.log(`║  API      : http://localhost:${PORT}/api/v1      ║`);
      console.log(`║  Health   : http://localhost:${PORT}/health      ║`);
      console.log(`║  Env      : ${(process.env.NODE_ENV || 'development').padEnd(30)} ║`);
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('[Server] Erreur au démarrage:', error);
    process.exit(1);
  }
};

// ─── Gestion des erreurs non capturées ───────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('[Server] Rejet non géré:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Exception non capturée:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM reçu. Arrêt propre...');
  server.close(() => {
    console.log('[Server] Serveur arrêté');
    process.exit(0);
  });
});

start();
