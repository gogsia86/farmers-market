// Type declarations for external modules without type definitions

declare module "@sentry/nextjs" {
  export * from "@sentry/nextjs/types";

  export interface SentryConfig {
    dsn?: string;
    tracesSampleRate?: number;
    debug?: boolean;
    replaysOnErrorSampleRate?: number;
    replaysSessionSampleRate?: number;
    integrations?: any[];
    environment?: string;
    enabled?: boolean;
  }

  export function init(config: SentryConfig): void;
  export function captureException(error: Error | unknown): string;
  export function captureMessage(message: string): string;
  export function withSentryConfig<T>(config: T, options?: any): T;
}

declare module "next-auth/react" {
  import { Session } from "next-auth";

  export interface SessionContextValue {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
    update: (data?: any) => Promise<Session | null>;
  }

  export function useSession(): SessionContextValue;
  export function signIn(provider?: string, options?: any): Promise<any>;
  export function signOut(options?: any): Promise<void>;
  export function getCsrfToken(): Promise<string | undefined>;
  export function getProviders(): Promise<any>;
  export function getSession(): Promise<Session | null>;

  export interface SessionProviderProps {
    children: React.ReactNode;
    session?: Session | null;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }

  export function SessionProvider(props: SessionProviderProps): JSX.Element;
}

declare module "@prisma/client" {
  export * from "@prisma/client/index";

  // Re-export common types
  export type {
    User,
    Farm,
    Product,
    Order,
    OrderItem,
    Category,
    Review,
    Cart,
    CartItem,
    Address,
    Notification,
    UserRole,
    OrderStatus,
    FarmStatus,
    ProductStatus,
    Prisma,
    PrismaClient,
  } from "@prisma/client/index";
}

declare module "@hookform/resolvers/zod" {
  import {
    FieldValues,
    ResolverOptions,
    ResolverResult,
  } from "react-hook-form";
  import { z } from "zod";

  export function zodResolver<T extends z.ZodType<any, any, any>>(
    schema: T,
    schemaOptions?: Partial<z.ParseParams>,
    resolverOptions?: {
      mode?: "async" | "sync";
      rawValues?: boolean;
    },
  ): <TFieldValues extends FieldValues, TContext>(
    values: TFieldValues,
    context: TContext | undefined,
    options: ResolverOptions<TFieldValues>,
  ) => Promise<ResolverResult<TFieldValues>>;
}

// Global type augmentations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      SENTRY_DSN: string;
      REDIS_URL?: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
