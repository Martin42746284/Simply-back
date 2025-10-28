import { PrismaClient, Prisma } from '@prisma/client';

// Instance Prisma singleton
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Types d'entrée Prisma pour les opérations CRUD
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserWhereInput = Prisma.UserWhereInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;

export type CreatorCreateInput = Prisma.CreatorCreateInput;
export type CreatorUpdateInput = Prisma.CreatorUpdateInput;
export type CreatorWhereInput = Prisma.CreatorWhereInput;

export type MessageCreateInput = Prisma.MessageCreateInput;
export type MessageUpdateInput = Prisma.MessageUpdateInput;
export type MessageWhereInput = Prisma.MessageWhereInput;

export type ConversationCreateInput = Prisma.ConversationCreateInput;
export type ConversationUpdateInput = Prisma.ConversationUpdateInput;
export type ConversationWhereInput = Prisma.ConversationWhereInput;

export type MediaCreateInput = Prisma.MediaCreateInput;
export type MediaUpdateInput = Prisma.MediaUpdateInput;
export type MediaWhereInput = Prisma.MediaWhereInput;

export type TransactionCreateInput = Prisma.TransactionCreateInput;
export type TransactionUpdateInput = Prisma.TransactionUpdateInput;
export type TransactionWhereInput = Prisma.TransactionWhereInput;

export type SubscriptionCreateInput = Prisma.SubscriptionCreateInput;
export type SubscriptionUpdateInput = Prisma.SubscriptionUpdateInput;
export type SubscriptionWhereInput = Prisma.SubscriptionWhereInput;

// Types de résultat avec relations
export type UserWithCreator = Prisma.UserGetPayload<{
  include: { creator: true };
}>;

export type UserWithMessages = Prisma.UserGetPayload<{
  include: { messages: true };
}>;

export type CreatorWithUser = Prisma.CreatorGetPayload<{
  include: { user: true };
}>;

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: { messages: true };
}>;

export type MessageWithSender = Prisma.MessageGetPayload<{
  include: { sender: true };
}>;

export type TransactionWithCreator = Prisma.TransactionGetPayload<{
  include: { creator: true; subscriber: true };
}>;

// Types pour les requêtes complexes
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

// Type pour les résultats paginés
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

// Types pour les transactions de base de données
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

// Types pour les agrégations
export type UserStats = {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
};

export type CreatorStats = {
  totalRevenue: number;
  totalSubscribers: number;
  averageSubscriptionPrice: number;
  topCreators: Array<{
    id: string;
    displayName: string;
    revenue: number;
  }>;
};

export type MessageStats = {
  totalMessages: number;
  messagesPerDay: number;
  averageResponseTime: number;
  unreadCount: number;
};

// Export de l'instance Prisma
export { prisma };
