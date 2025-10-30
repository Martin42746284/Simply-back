"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToUser = exports.broadcast = exports.initWebSocketServer = void 0;
const ws_1 = __importStar(require("ws"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../types/env");
const clients = new Set();
/** Initialize a WebSocket server attached to an existing HTTP server */
const initWebSocketServer = (server) => {
    const wss = new ws_1.WebSocketServer({
        server,
        path: env_1.config.websocket.path,
    });
    wss.on('connection', (ws, req) => {
        const meta = { socket: ws };
        clients.add(meta);
        // attempt to authenticate from query token
        try {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const token = url.searchParams.get('token') || req.headers['sec-websocket-protocol'];
            if (token) {
                const payload = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
                if (payload && payload.sub) {
                    meta.userId = payload.sub;
                }
            }
        }
        catch (e) {
            // ignore - unauthenticated socket
        }
        ws.on('message', (data) => {
            try {
                const msg = typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString());
                handleMessage(meta, msg);
            }
            catch (err) {
                // ignore malformed messages
            }
        });
        ws.on('close', () => {
            clients.delete(meta);
            // notify others that this user went offline
            if (meta.userId) {
                (0, exports.broadcast)({ type: 'offline', payload: { userId: meta.userId }, timestamp: Date.now() });
            }
        });
        // notify online
        if (meta.userId) {
            (0, exports.broadcast)({ type: 'online', payload: { userId: meta.userId }, timestamp: Date.now() });
        }
    });
    return wss;
};
exports.initWebSocketServer = initWebSocketServer;
/** Broadcast a message to all connected clients (optionally filter) */
const broadcast = (message, filter) => {
    const data = JSON.stringify(message);
    for (const c of clients) {
        if (filter && !filter(c))
            continue;
        if (c.socket.readyState === ws_1.default.OPEN) {
            c.socket.send(data);
        }
    }
};
exports.broadcast = broadcast;
/** Send a message to a specific userId */
const sendToUser = (userId, message) => {
    (0, exports.broadcast)(message, (c) => c.userId === userId);
};
exports.sendToUser = sendToUser;
/** Basic message handler for common types */
const handleMessage = (meta, msg) => {
    switch (msg.type) {
        case 'typing':
            // propagate typing indicator to conversation participants
            (0, exports.broadcast)({ type: 'typing', payload: msg.payload, timestamp: Date.now() }, (c) => Boolean(c.userId) && c.userId !== meta.userId);
            break;
        case 'read':
            (0, exports.broadcast)({ type: 'read', payload: msg.payload, timestamp: Date.now() }, (c) => Boolean(c.userId) && c.userId !== meta.userId);
            break;
        case 'message':
            // message payload should contain recipientId or conversationId
            if (msg.payload?.recipientId) {
                (0, exports.sendToUser)(msg.payload.recipientId, { ...msg, timestamp: Date.now() });
            }
            else {
                // fallback: broadcast to all except sender
                (0, exports.broadcast)({ ...msg, timestamp: Date.now() }, (c) => Boolean(c.userId) && c.userId !== meta.userId);
            }
            break;
        default:
            // other messages - ignore or extend
            break;
    }
};
exports.default = {
    initWebSocketServer: exports.initWebSocketServer,
    broadcast: exports.broadcast,
    sendToUser: exports.sendToUser,
};
