import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { config } from '../types/env';
import { WebSocketMessage } from '../types';

type ClientMeta = {
  userId?: string;
  socket: WebSocket;
};

const clients = new Set<ClientMeta>();

/** Initialize a WebSocket server attached to an existing HTTP server */
export const initWebSocketServer = (server: http.Server): WebSocketServer => {
  const wss = new WebSocketServer({
    server,
    path: config.websocket.path,
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const meta: ClientMeta = { socket: ws };
    clients.add(meta);

    // attempt to authenticate from query token
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || req.headers['sec-websocket-protocol'] as string | undefined;
      if (token) {
        const payload = jwt.verify(token, config.jwt.secret) as any;
        if (payload && payload.sub) {
          meta.userId = payload.sub as string;
        }
      }
    } catch (e) {
      // ignore - unauthenticated socket
    }

    ws.on('message', (data) => {
      try {
        const msg: WebSocketMessage = typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString());
        handleMessage(meta, msg);
      } catch (err) {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      clients.delete(meta);
      // notify others that this user went offline
      if (meta.userId) {
        broadcast({ type: 'offline', payload: { userId: meta.userId }, timestamp: Date.now() });
      }
    });

    // notify online
    if (meta.userId) {
      broadcast({ type: 'online', payload: { userId: meta.userId }, timestamp: Date.now() });
    }
  });

  return wss;
};

/** Broadcast a message to all connected clients (optionally filter) */
export const broadcast = (message: WebSocketMessage, filter?: (meta: ClientMeta) => boolean) => {
  const data = JSON.stringify(message);
  for (const c of clients) {
    if (filter && !filter(c)) continue;
    if (c.socket.readyState === WebSocket.OPEN) {
      c.socket.send(data);
    }
  }
};

/** Send a message to a specific userId */
export const sendToUser = (userId: string, message: WebSocketMessage) => {
  broadcast(message, (c) => c.userId === userId);
};

/** Basic message handler for common types */
const handleMessage = (meta: ClientMeta, msg: WebSocketMessage) => {
  switch (msg.type) {
    case 'typing':
      // propagate typing indicator to conversation participants
  broadcast({ type: 'typing', payload: msg.payload, timestamp: Date.now() }, (c) => Boolean(c.userId) && c.userId !== meta.userId);
      break;
    case 'read':
  broadcast({ type: 'read', payload: msg.payload, timestamp: Date.now() }, (c) => Boolean(c.userId) && c.userId !== meta.userId);
      break;
    case 'message':
      // message payload should contain recipientId or conversationId
      if (msg.payload?.recipientId) {
        sendToUser(msg.payload.recipientId, { ...msg, timestamp: Date.now() });
      } else {
        // fallback: broadcast to all except sender
  broadcast({ ...msg, timestamp: Date.now() }, (c) => Boolean(c.userId) && c.userId !== meta.userId);
      }
      break;
    default:
      // other messages - ignore or extend
      break;
  }
};

export default {
  initWebSocketServer,
  broadcast,
  sendToUser,
};
