import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import { authSchema } from "@/db/schema";

const localOrigin = "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";

function getOrigin(value: string | undefined) {
  if (!value) return undefined;
  return new URL(value.includes("://") ? value : `https://${value}`).origin;
}

function isLocalOrigin(value: string) {
  const hostname = new URL(value).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

const configuredOrigin = getOrigin(process.env.BETTER_AUTH_URL);
const vercelDeploymentOrigin = getOrigin(process.env.VERCEL_URL);
const vercelProductionOrigin = getOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
const authOrigin =
  configuredOrigin && !(isProduction && isLocalOrigin(configuredOrigin))
    ? configuredOrigin
    : vercelProductionOrigin ?? vercelDeploymentOrigin ?? localOrigin;
const trustedOrigins = [...new Set([
  authOrigin,
  vercelProductionOrigin,
  vercelDeploymentOrigin,
  !isProduction ? localOrigin : undefined,
].filter((origin): origin is string => Boolean(origin)))];

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be set to a random value of at least 32 characters.");
}

export const auth = betterAuth({
  appName: "E&H Fabrics",
  baseURL: authOrigin,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  trustedOrigins,
});
