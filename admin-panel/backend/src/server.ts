import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

import { connectMongoDB } from './config/db';
import apiRouter from './routes';
import { errorHandler } from './middleware/error';

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*', // In production, restrict to admin panel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local upload assets
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Root status check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'Admin Panel API', time: new Date() });
});

// Map main API routers
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Socket.IO configuration
let io: SocketServer | null = null;

export const initSocket = (httpServer: http.Server): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Admin client connected: SocketId=${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`🔌 Admin client disconnected: SocketId=${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

// Start Server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Connect MongoDB
  await connectMongoDB();

  // Initialize Socket.io
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 E-commerce Admin Backend running on http://localhost:${PORT}`);
  });
};

startServer();
