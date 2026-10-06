import { createHmac, randomBytes, randomUUID, scrypt } from "node:crypto";

type SqlTag = typeof import("@vercel/postgres").sql;
let sql: SqlTag | null = null;
let dbLoad: Promise<SqlTag | null> | null = null;

function getDatabaseUrl() {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

async function getSql() {
  if (sql) return sql;
  if (!dbLoad) {
    dbLoad = import("@vercel/postgres")
      .then((mod) => {
        sql = mod.sql;
        return sql;
      })
      .catch((error) => {
        console.error("Auth Postgres load failed:", error?.message || error);
        return null;
      });
  }
  return dbLoad;
}

export function normalizeEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

export function validateCredentials(email: unknown, password: unknown) {
  const normalized = normalizeEmail(email);
  const pass = String(password ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return "Email không hợp lệ.";
  if (pass.length < 8) return "Mật khẩu cần tối thiểu 8 ký tự.";
  return null;
}

export function readSessionToken(req: any) {
  const cookie = req.headers?.cookie || "";
  const match = cookie
    .split(";")
    .map((v: string) => v.trim())
    .find((v: string) => v.startsWith("linh_session="));
  return match ? decodeURIComponent(match.slice("linh_session=".length)) : "";
}

function authSecret() {
  return process.env.AUTH_SECRET || getDatabaseUrl() || "linhcn-development-auth-secret";
}

export function hashSessionToken(token: string) {
  return createHmac("sha256", authSecret()).update(token).digest("hex");
}

export function hashPassword(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

export async function ensureAuthDb() {
  const dbUrl = getDatabaseUrl();
  const db = await getSql();
  if (!dbUrl || !db) {
    throw new Error("POSTGRES_URL is not configured");
  }

  await db`CREATE TABLE IF NOT EXISTS linh_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS linh_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES linh_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await db`CREATE INDEX IF NOT EXISTS linh_sessions_user_idx ON linh_sessions(user_id)`;
  return db;
}

export async function getCurrentUser(req: any) {
  const token = readSessionToken(req);
  if (!token) return null;

  const db = await ensureAuthDb();
  const tokenHash = hashSessionToken(token);
  const result = await db`SELECT u.id, u.email, u.name
    FROM linh_sessions s
    JOIN linh_users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > NOW()
    LIMIT 1`;

  return result.rows[0] || null;
}

export async function createSession(db: SqlTag, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  await db`INSERT INTO linh_sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, NOW() + INTERVAL '30 days')`;
  return token;
}

export function setSessionCookie(res: any, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `linh_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`
  );
}

export { randomUUID, getDatabaseUrl };
