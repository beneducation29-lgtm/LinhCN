import { createHmac, randomBytes, randomUUID, scrypt } from "node:crypto";

let sql: typeof import("@vercel/postgres").sql | null = null;
let sqlLoad: Promise<typeof import("@vercel/postgres").sql | null> | null = null;

function databaseUrl() {
  return process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || "";
}

async function getSql() {
  if (sql) return sql;
  if (!sqlLoad) {
    sqlLoad = import("@vercel/postgres").then((m) => {
      sql = m.sql;
      return sql;
    }).catch((error) => {
      console.error("Auth Postgres load failed:", error?.message || error);
      return null;
    });
  }
  return sqlLoad;
}

function email(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function credentials(emailValue: unknown, passwordValue: unknown) {
  const e = email(emailValue);
  const p = String(passwordValue ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Email không hợp lệ.";
  if (p.length < 8) return "Mật khẩu cần tối thiểu 8 ký tự.";
  return null;
}

function tokenFrom(req: any) {
  const cookie = req.headers?.cookie || "";
  const match = cookie.split(";").map((v: string) => v.trim()).find((v: string) => v.startsWith("linh_session="));
  return match ? decodeURIComponent(match.slice("linh_session=".length)) : "";
}

function secret() {
  return process.env.AUTH_SECRET || databaseUrl() || "linhcn-development-auth-secret";
}

function tokenHash(token: string) {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

function passwordHash(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(key.toString("hex")));
  });
}

async function authDb() {
  const url = databaseUrl();
  const db = await getSql();
  if (!url || !db) throw new Error("POSTGRES_URL is not configured");
  await db`CREATE TABLE IF NOT EXISTS linh_users (
    id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    password_hash TEXT NOT NULL, password_salt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await db`CREATE TABLE IF NOT EXISTS linh_sessions (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES linh_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await db`CREATE INDEX IF NOT EXISTS linh_sessions_user_idx ON linh_sessions(user_id)`;
  return db;
}

function setCookie(res: any, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `linh_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`);
}

async function authHandler(req: any, res: any, route: string) {
  if (route === "/api/auth/me" && req.method === "GET") {
    if (!tokenFrom(req)) return res.status(200).json({ authenticated: false, user: null });
    try {
      const db = await authDb();
      const hash = tokenHash(tokenFrom(req));
      const result = await db`SELECT u.id, u.email, u.name FROM linh_sessions s JOIN linh_users u ON u.id = s.user_id WHERE s.token_hash = ${hash} AND s.expires_at > NOW() LIMIT 1`;
      return res.status(200).json({ authenticated: Boolean(result.rows[0]), user: result.rows[0] || null });
    } catch (error: any) {
      console.error("Auth /me failed:", error?.message || error);
      return res.status(503).json({ error: "Cơ sở dữ liệu tài khoản chưa sẵn sàng. Vui lòng kiểm tra Postgres trên Vercel." });
    }
  }

  if (route === "/api/auth/register" && req.method === "POST") {
    try {
      if (!databaseUrl()) return res.status(503).json({ error: "Hệ thống tài khoản chưa được kết nối cơ sở dữ liệu. Hãy cấu hình POSTGRES_URL." });
      const { name = "", email: rawEmail = "", password = "" } = req.body || {};
      const validation = credentials(rawEmail, password);
      if (validation) return res.status(400).json({ error: validation });
      const cleanName = String(name).trim();
      if (cleanName.length < 2 || cleanName.length > 80) return res.status(400).json({ error: "Tên hiển thị cần từ 2 đến 80 ký tự." });
      const normalizedEmail = email(rawEmail);
      const db = await authDb();
      const existing = await db`SELECT id FROM linh_users WHERE email = ${normalizedEmail} LIMIT 1`;
      if (existing.rows.length) return res.status(409).json({ error: "Email này đã được đăng ký." });
      const salt = randomBytes(16).toString("hex");
      const hash = await passwordHash(String(password), salt);
      const id = randomUUID();
      await db`INSERT INTO linh_users (id, email, name, password_hash, password_salt) VALUES (${id}, ${normalizedEmail}, ${cleanName}, ${hash}, ${salt})`;
      const session = randomBytes(32).toString("base64url");
      await db`INSERT INTO linh_sessions (token_hash, user_id, expires_at) VALUES (${tokenHash(session)}, ${id}, NOW() + INTERVAL '30 days')`;
      setCookie(res, session);
      return res.status(201).json({ user: { id, email: normalizedEmail, name: cleanName } });
    } catch (error: any) {
      console.error("Register failed:", error?.message || error);
      return res.status(503).json({ error: "Không thể kết nối cơ sở dữ liệu tài khoản. Vui lòng kiểm tra Postgres trên Vercel." });
    }
  }

  if (route === "/api/auth/login" && req.method === "POST") {
    try {
      if (!databaseUrl()) return res.status(503).json({ error: "Hệ thống tài khoản chưa được kết nối cơ sở dữ liệu. Hãy cấu hình POSTGRES_URL." });
      const { email: rawEmail = "", password = "" } = req.body || {};
      const validation = credentials(rawEmail, password);
      if (validation) return res.status(400).json({ error: validation });
      const normalizedEmail = email(rawEmail);
      const db = await authDb();
      const result = await db`SELECT id, email, name, password_hash, password_salt FROM linh_users WHERE email = ${normalizedEmail} LIMIT 1`;
      const user = result.rows[0];
      if (!user) return res.status(401).json({ error: "Email hoặc mật khẩu chưa đúng." });
      const hash = await passwordHash(String(password), user.password_salt);
      if (hash !== user.password_hash) return res.status(401).json({ error: "Email hoặc mật khẩu chưa đúng." });
      const session = randomBytes(32).toString("base64url");
      await db`INSERT INTO linh_sessions (token_hash, user_id, expires_at) VALUES (${tokenHash(session)}, ${user.id}, NOW() + INTERVAL '30 days')`;
      setCookie(res, session);
      return res.status(200).json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
      console.error("Login failed:", error?.message || error);
      return res.status(503).json({ error: "Không thể kết nối cơ sở dữ liệu tài khoản. Vui lòng kiểm tra Postgres trên Vercel." });
    }
  }

  if (route.startsWith("/api/auth/")) return res.status(405).json({ error: "Method Not Allowed" });
  return null;
}

export default async function handler(req: any, res: any) {
  const route = (req.url || "").split("?")[0];
  if (route === "/api/auth/me" || route === "/api/auth/register" || route === "/api/auth/login") {
    return authHandler(req, res, route);
  }

  const { default: app } = await import("../server");
  if (typeof req.url === "string" && !req.url.startsWith("/api/")) {
    req.url = req.url.startsWith("/") ? `/api${req.url}` : `/api/${req.url}`;
  }
  return app(req, res);
}
