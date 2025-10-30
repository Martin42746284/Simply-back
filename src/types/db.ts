import { PrismaClient } from '@prisma/client';

// Instance Prisma singleton
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Lightweight fallback types to avoid hard dependency on generated Prisma typings
export type UserCreateInput = any;
export type UserUpdateInput = any;
export type UserWhereInput = any;
export type UserWhereUniqueInput = any;

export type CreatorCreateInput = any;
export type CreatorUpdateInput = any;
export type CreatorWhereInput = any;

export type MessageCreateInput = any;
export type MessageUpdateInput = any;
export type MessageWhereInput = any;

export type ConversationCreateInput = any;
export type ConversationUpdateInput = any;
export type ConversationWhereInput = any;

export type MediaCreateInput = any;
export type MediaUpdateInput = any;
export type MediaWhereInput = any;

export type TransactionCreateInput = any;
export type TransactionUpdateInput = any;
export type TransactionWhereInput = any;

export type SubscriptionCreateInput = any;
export type SubscriptionUpdateInput = any;
export type SubscriptionWhereInput = any;

export type UserWithCreator = any;
export type UserWithMessages = any;
export type CreatorWithUser = any;
export type ConversationWithMessages = any;
export type MessageWithSender = any;
export type TransactionWithCreator = any;

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type FilterParams = {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type TransactionClient = PrismaClient;

export type UserStats = any;
export type CreatorStats = any;
export type MessageStats = any;

// `prisma` is exported above as `export const prisma` — no additional export needed here.
