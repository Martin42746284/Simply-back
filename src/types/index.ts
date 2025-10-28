// Export de tous les types personnalisés
import { Prisma, Role, CreatorStatus, MessageStatus, MediaStatus, TransactionStatus, TransactionType } from '@prisma/client';

// ========== TYPES D'ENTITÉS ==========

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  creatorId?: string | null;
  twoFactorSecret?: string | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Creator {
  id: string;
  userId: string;
  displayName: string;
  subscriptionPrice: number;
  commissionRate: number;
  status: CreatorStatus;
  settings: Prisma.JsonValue;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  creatorId: string;
  subscriberId: string;
  lastMessageAt: Date;
  unreadCount: number;
  isVIP: boolean;
  tags: string[];
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  mediaIds: string[];
  status: MessageStatus;
  isVIP: boolean;
  timestamp: Date;
  updatedAt: Date;
}

export interface Media {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: bigint;
  url: string;
  thumbnailUrl?: string | null;
  status: MediaStatus;
  tags: string[];
  uploadedAt: Date;
}

export interface Transaction {
  id: string;
  creatorId: string;
  subscriberId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  stripePaymentId?: string | null;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  creatorId: string;
  subscriberId: string;
  isActive: boolean;
  cancelledAt?: Date | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ========== TYPES DE REQUÊTES ==========

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: Role;
}

export interface SendMessageRequest {
  conversationId: string;
  recipientId: string;
  content: string;
  mediaIds?: string[];
  isVIP?: boolean;
}

export interface CreateCreatorRequest {
  displayName: string;
  subscriptionPrice?: number;
  commissionRate?: number;
  settings?: Record<string, any>;
}

export interface UpdateUserRequest {
  email?: string;
  role?: Role;
  twoFactorEnabled?: boolean;
}

// ========== TYPES DE RÉPONSES ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: Role;
  };
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ========== TYPES DE DASHBOARD ==========

export interface DashboardMetrics {
  revenue: RevenueMetrics;
  subscribers: SubscriberMetrics;
  messages: MessageMetrics;
  team: TeamMetrics;
}

export interface RevenueMetrics {
  today: number;
  week: number;
  month: number;
  growth: number;
  forecast: number;
}

export interface SubscriberMetrics {
  total: number;
  active: number;
  newThisMonth: number;
  churnRate: number;
  engagementRate: number;
}

export interface MessageMetrics {
  sentToday: number;
  readToday: number;
  perMinute: number;
  avgResponseTime: number;
}

export interface TeamMetrics {
  members: TeamMember[];
  topPerformer: TeamMember | null;
}

export interface TeamMember {
  userId: string;
  email: string;
  messagesHandled: number;
  avgResponseTime: number;
}

// ========== TYPES WEBSOCKET ==========

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'notification' | 'online' | 'offline';
  payload: any;
  timestamp: number;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface ReadReceipt {
  messageId: string;
  conversationId: string;
  readBy: string;
  readAt: Date;
}

// ========== TYPES UTILITAIRES ==========

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface S3UploadResult {
  key: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
}

// ========== TYPES D'ERREURS ==========

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: string[]) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

// ========== TYPES STRIPE ==========

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
  amount: number;
  currency: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

// ========== TYPES ANALYTICS ==========

export interface AnalyticsEvent {
  userId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface RevenueReport {
  period: 'day' | 'week' | 'month' | 'year';
  total: number;
  breakdown: Array<{
    date: Date;
    amount: number;
    transactions: number;
  }>;
}

export interface UserGrowthReport {
  period: 'day' | 'week' | 'month' | 'year';
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
  growthRate: number;
}

// ========== ENUMS RÉEXPORTÉS ==========

export { Role, CreatorStatus, MessageStatus, MediaStatus, TransactionStatus, TransactionType };

// ========== TYPES DE CACHE ==========

export interface CacheOptions {
  ttl?: number; // Time to live en secondes
  prefix?: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// ========== TYPES DE LOGS ==========

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

// ========== EXPORT GLOBAL ==========

export * from './express.d';
export * from './db';
export * from './env';