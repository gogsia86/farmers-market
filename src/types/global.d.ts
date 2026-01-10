// ============================================================================
// GLOBAL TYPE DECLARATIONS - Farmers Market Platform
// ============================================================================
// This file provides comprehensive type declarations for external modules
// and global types used throughout the application.

// ============================================================================
// PRISMA CLIENT TYPE DECLARATIONS
// ============================================================================

// Re-export all Prisma Client types
declare module "@prisma/client" {
  export * from "../../node_modules/.prisma/client";
}

// Ensure default export works
declare module "@prisma/client/default" {
  export * from "@prisma/client";
}

// ============================================================================
// NEXT AUTH TYPE DECLARATIONS
// ============================================================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    image?: string | null;
  }

  interface Account {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    email?: string;
  }
}

declare module "next-auth/react" {
  export function useSession(): {
    data: import("next-auth").Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  export function signIn(
    provider?: string,
    options?: any,
    authorizationParams?: any,
  ): Promise<any>;
  export function signOut(options?: any): Promise<void>;
  export const SessionProvider: any;
}

// ============================================================================
// SENTRY TYPE DECLARATIONS
// ============================================================================

declare module "@sentry/nextjs" {
  export function init(options: {
    dsn?: string;
    tracesSampleRate?: number;
    debug?: boolean;
    replaysOnErrorSampleRate?: number;
    replaysSessionSampleRate?: number;
    integrations?: any[];
    environment?: string;
    enabled?: boolean;
    [key: string]: any;
  }): void;

  export function captureException(
    exception: any,
    captureContext?: any,
  ): string;

  export function captureMessage(message: string, captureContext?: any): string;

  export function configureScope(callback: (scope: any) => void): void;

  export function withSentryConfig(config: any, options?: any): any;

  export const Integrations: any;
  export const BrowserTracing: any;
  export const Replay: any;
}

// ============================================================================
// NEXT.JS TYPE EXTENSIONS
// ============================================================================

declare module "next" {
  // Extended PageProps for Next.js 15 with async params
  export interface PageProps<
    TParams extends Record<string, string | string[]> = Record<
      string,
      string | string[]
    >,
    TSearchParams extends Record<string, string | string[] | undefined> =
      Record<string, string | string[] | undefined>,
  > {
    params: Promise<TParams>;
    searchParams: Promise<TSearchParams>;
  }
}

// ============================================================================
// GLOBAL NAMESPACE EXTENSIONS
// ============================================================================

declare global {
  // ============================================================================
  // Node.js Environment Variables
  // ============================================================================
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DATABASE_URL: string;

      // NextAuth
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL_INTERNAL?: string;

      // OAuth Providers
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      GITHUB_CLIENT_ID?: string;
      GITHUB_CLIENT_SECRET?: string;

      // File Upload
      UPLOADTHING_SECRET?: string;
      UPLOADTHING_APP_ID?: string;

      // Payment
      STRIPE_SECRET_KEY?: string;
      STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;

      // Monitoring
      SENTRY_DSN?: string;
      SENTRY_AUTH_TOKEN?: string;
      SENTRY_ORG?: string;
      SENTRY_PROJECT?: string;

      // Cache
      REDIS_URL?: string;
      REDIS_HOST?: string;
      REDIS_PORT?: string;
      REDIS_PASSWORD?: string;

      // Application
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_APP_URL?: string;
      NEXT_PUBLIC_API_URL?: string;

      // Feature Flags
      ENABLE_ANALYTICS?: string;
      ENABLE_NOTIFICATIONS?: string;
    }
  }

  // ============================================================================
  // Prisma Client Singleton (for dev hot reload)
  // ============================================================================
  var prisma: import("@prisma/client").PrismaClient | undefined;

  // ============================================================================
  // Global Type Utilities
  // ============================================================================

  // Awaited type (for async function return types)
  type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

  // Deep Partial (make all nested properties optional)
  type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

  // Deep Readonly (make all nested properties readonly)
  type DeepReadonly<T> = T extends object
    ? {
        readonly [P in keyof T]: DeepReadonly<T[P]>;
      }
    : T;

  // Nullable type helper
  type Nullable<T> = T | null;

  // Optional type helper
  type Optional<T> = T | undefined;

  // Extract non-nullable type
  type NonNullable<T> = T extends null | undefined ? never : T;

  // Require at least one property
  type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
  > &
    {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

  // Require only one property
  type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
  > &
    {
      [K in Keys]-?: Required<Pick<T, K>> &
        Partial<Record<Exclude<Keys, K>, undefined>>;
    }[Keys];

  // Make specific keys optional
  type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  // Make specific keys required
  type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

  // ============================================================================
  // API Response Types
  // ============================================================================

  interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: any;
    };
    meta?: {
      page?: number;
      pageSize?: number;
      total?: number;
      requestId?: string;
    };
  }

  // ============================================================================
  // Common Entity Types
  // ============================================================================

  interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }

  interface FilterParams {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: any;
  }

  // ============================================================================
  // Utility Types for Prisma
  // ============================================================================

  // Extract the payload type from a Prisma query
  type PrismaPayload<T> = T extends { [K in keyof T]: infer U } ? U : never;

  // Make Prisma Decimal fields numbers
  type DecimalToNumber<T> = T extends import("decimal.js").Decimal
    ? number
    : T extends object
      ? { [K in keyof T]: DecimalToNumber<T[K]> }
      : T;
}

// ============================================================================
// EXPORT EMPTY OBJECT TO MAKE THIS A MODULE
// ============================================================================

export {};
