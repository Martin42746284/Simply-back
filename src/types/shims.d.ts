declare module 'cors';
declare module 'compression';
declare module 'uuid';

// Allow importing JSON-ish Prisma runtime types when @prisma/client isn't generated
declare module '@prisma/client' {
  export const Prisma: any;
  export type JsonValue = any;
  // During local typecheck, treat PrismaClient as `any` so generated client model
  // properties (prisma.user, prisma.message, etc.) are allowed.
  export const PrismaClient: any;
  export type PrismaClient = any;
}
