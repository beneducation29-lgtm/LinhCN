import { GoogleGenAI, Type } from "@google/genai";
// PostgreSQL is optional at module-load time. Vercel can invoke auth endpoints
// before database environment variables are configured; do not let the optional
// dependency crash the entire serverless function during import.
let sql: typeof import("@vercel/postgres").sql | null = null;
import { createHmac, randomBytes, randomUUID, scrypt } from "node:crypto";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Normalize Postgres connection variables before loading @vercel/postgres.
const databaseUrl =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";
if (databaseUrl && !process.env.POSTGRES_URL) process.env.POSTGRES_URL = databaseUrl;

// @vercel/postgres reads connection settings when the module is loaded.
// Only import it when a database URL is actually configured. This keeps
// /api/auth/me and the auth endpoints healthy even before Postgres is added.
if (databaseUrl) {
  ({ sql } = await import("@vercel/postgres"));
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "15mb" }));


type AuthUser = { id: string; email: string; name: string };

// Prefer an explicit AUTH_SECRET. If it is absent, use the private DB URL as a
// stable fallback so production registration is not blocked by a missing secret.
const authSecret = process.env.AUTH_SECRET || databaseUrl || "linhcn-development-auth-secret";
const authDbAvailable = Boolean(databaseUrl);
const sessionCookieName = "linh_session";
const memoryUsers = new Map<string, { id: string; email: string; name: string; passwordHash: string; salt: string }>();
const memorySessions = new Map<string, string>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDbUrlConfigured() {
  return authDbAvailable;
}

function hashSessionToken(token: string) {
  return createHmac("sha256", authSecret || "development-only-secret").update(token).digest("hex");
}

function hashPassword(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

async function ensureAuthDb() {
  if (!authDbAvailable || !sql) return;
  await sql`CREATE TABLE IF NOT EXISTS linh_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS linh_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES linh_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS linh_sessions_user_idx ON linh_sessions(user_id)`;
}

let authDbInitialization: Promise<void> | null = null;

async function initAuthDb() {
  if (!authDbAvailable) return;
  if (!authDbInitialization) authDbInitialization = ensureAuthDb();
  await authDbInitialization;
}

function readSessionToken(req: express.Request) {
  const cookie = req.headers.cookie || "";
  const match = cookie.split(";").map((v) => v.trim()).find((v) => v.startsWith(sessionCookieName + "="));
  return match ? decodeURIComponent(match.slice(sessionCookieName.length + 1)) : "";
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  if (authDbAvailable && sql) {
    await sql`INSERT INTO linh_sessions (token_hash, user_id, expires_at) VALUES (${tokenHash}, ${userId}, NOW() + INTERVAL '30 days')`;
  } else {
    memorySessions.set(tokenHash, userId);
  }
  return token;
}

function setSessionCookie(res: express.Response, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`);
}

async function getAuthUser(req: express.Request): Promise<AuthUser | null> {
  const token = readSessionToken(req);
  if (!token) return null;
  if (authDbAvailable) await initAuthDb();
  const tokenHash = hashSessionToken(token);

  if (authDbAvailable && sql) {
    const result = await sql<AuthUser>`SELECT u.id, u.email, u.name
      FROM linh_sessions s JOIN linh_users u ON u.id = s.user_id
      WHERE s.token_hash = ${tokenHash} AND s.expires_at > NOW() LIMIT 1`;
    return result.rows[0] || null;
  }

  const userId = memorySessions.get(tokenHash);
  if (!userId) return null;
  for (const user of memoryUsers.values()) {
    if (user.id === userId) return { id: user.id, email: user.email, name: user.name };
  }
  return null;
}

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    if (authDbAvailable) await initAuthDb();
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Bạn cần đăng nhập để sử dụng Linh." });
      return;
    }
    (req as any).authUser = user;
    next();
  } catch (error: any) {
    console.error("Auth lookup failed:", error?.message || error);
    res.status(500).json({ error: "Không thể kiểm tra phiên đăng nhập." });
  }
}

function validateCredentials(email: string, password: string) {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return "Email không hợp lệ.";
  if (password.length < 8) return "Mật khẩu cần tối thiểu 8 ký tự.";
  return null;
}

app.get("/api/auth/me", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    res.json({ authenticated: Boolean(user), user });
  } catch (error: any) {
    console.error("Auth /me failed:", error?.message || error);
    res.status(500).json({ error: "Không thể kiểm tra tài khoản." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production" && !getDbUrlConfigured()) {
      res.status(503).json({ error: "Hệ thống tài khoản chưa được kết nối cơ sở dữ liệu. Hãy cấu hình POSTGRES_URL." });
      return;
    }
    if (authDbAvailable) await initAuthDb();
    const { name = "", email = "", password = "" } = req.body || {};
    const credentialError = validateCredentials(email, password);
    if (credentialError) { res.status(400).json({ error: credentialError }); return; }
    const cleanName = String(name).trim();
    if (cleanName.length < 2 || cleanName.length > 80) { res.status(400).json({ error: "Tên hiển thị cần từ 2 đến 80 ký tự." }); return; }
    const normalizedEmail = normalizeEmail(email);

    const salt = randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, salt);
    const id = randomUUID();

    if (authDbAvailable && sql) {
      const existing = await sql`SELECT id FROM linh_users WHERE email = ${normalizedEmail} LIMIT 1`;
      if (existing.rows.length) { res.status(409).json({ error: "Email này đã được đăng ký." }); return; }
      await sql`INSERT INTO linh_users (id, email, name, password_hash, password_salt) VALUES (${id}, ${normalizedEmail}, ${cleanName}, ${passwordHash}, ${salt})`;
    } else {
      if (memoryUsers.has(normalizedEmail)) { res.status(409).json({ error: "Email này đã được đăng ký." }); return; }
      memoryUsers.set(normalizedEmail, { id, email: normalizedEmail, name: cleanName, passwordHash, salt });
    }

    const token = await createSession(id);
    setSessionCookie(res, token);
    res.status(201).json({ user: { id, email: normalizedEmail, name: cleanName } });
  } catch (error: any) {
    console.error("Register failed:", error?.message || error);
    const message = error?.message || "";
    if (/POSTGRES|database|relation|connect|connection|ECONN|ENOTFOUND|timeout/i.test(message)) {
      res.status(503).json({ error: "Cơ sở dữ liệu tài khoản chưa sẵn sàng. Vui lòng kiểm tra cấu hình Postgres trên Vercel." });
      return;
    }
    res.status(500).json({ error: "Không thể tạo tài khoản. Vui lòng thử lại." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production" && !getDbUrlConfigured()) {
      res.status(503).json({ error: "Hệ thống tài khoản chưa được kết nối cơ sở dữ liệu. Hãy cấu hình POSTGRES_URL." });
      return;
    }
    if (authDbAvailable) await initAuthDb();
    const { email = "", password = "" } = req.body || {};
    const credentialError = validateCredentials(email, password);
    if (credentialError) { res.status(400).json({ error: credentialError }); return; }
    const normalizedEmail = normalizeEmail(email);

    let user: { id: string; email: string; name: string; passwordHash: string; salt: string } | null = null;
    if (authDbAvailable && sql) {
      const result = await sql<{ id: string; email: string; name: string; password_hash: string; password_salt: string }>`SELECT id, email, name, password_hash, password_salt FROM linh_users WHERE email = ${normalizedEmail} LIMIT 1`;
      const row = result.rows[0];
      if (row) user = { id: row.id, email: row.email, name: row.name, passwordHash: row.password_hash, salt: row.password_salt };
    } else {
      user = memoryUsers.get(normalizedEmail) || null;
    }

    if (!user) { res.status(401).json({ error: "Email hoặc mật khẩu chưa đúng." }); return; }
    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) { res.status(401).json({ error: "Email hoặc mật khẩu chưa đúng." }); return; }

    const token = await createSession(user.id);
    setSessionCookie(res, token);
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    console.error("Login failed:", error?.message || error);
    const message = error?.message || "";
    if (/POSTGRES|database|relation|connect|connection|ECONN|ENOTFOUND|timeout/i.test(message)) {
      res.status(503).json({ error: "Cơ sở dữ liệu tài khoản chưa sẵn sàng. Vui lòng kiểm tra cấu hình Postgres trên Vercel." });
      return;
    }
    res.status(500).json({ error: "Không thể đăng nhập. Vui lòng thử lại." });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    if (authDbAvailable) await initAuthDb();
    const token = readSessionToken(req);
    if (token) {
      const tokenHash = hashSessionToken(token);
      if (authDbAvailable && sql) await sql`DELETE FROM linh_sessions WHERE token_hash = ${tokenHash}`;
      else memorySessions.delete(tokenHash);
    }
    res.setHeader("Set-Cookie", `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: "Không thể đăng xuất." });
  }
});



// Initialize Google GenAI if valid key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim().length > 10) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Multi-Level Dynamic Fallback Database (HSK 1 to HSK 6)
// NO hardcoded HSK 2 default! Every level has its distinct length, depth and vocabulary.
const levelFallbackResponses: Record<
  string,
  Array<{
    keywords: string[];
    chinese: string;
    pinyin: string;
    vietnamese: string;
    correction: {
      hasCorrection: boolean;
      original: string;
      originalPinyin: string;
      originalVi: string;
      suggestion: string;
      suggestionPinyin: string;
      suggestionVi: string;
      explanation: string;
    };
    hints: Array<{ chinese: string; pinyin: string; vietnamese: string }>;
  }>
> = {
  "HSK 1": [
    {
      keywords: ["名字", "叫", "你好", "喝茶", "喝水"],
      chinese: "你好！我听懂了。你喜欢喝茶还是喝水？",
      pinyin: "Nǐ hǎo! Wǒ tīngdǒng le. Nǐ xǐhuān hē chá háishì hē shuǐ?",
      vietnamese: "Chào bạn! Mình hiểu rồi. Bạn thích uống trà hay uống nước lọc?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Câu của bạn rất tốt và chuẩn từ vựng cơ bản HSK 1!",
      },
      hints: [
        { chinese: "喝水", pinyin: "hē shuǐ", vietnamese: "uống nước" },
        { chinese: "茶", pinyin: "chá", vietnamese: "trà" },
        { chinese: "喜欢", pinyin: "xǐhuān", vietnamese: "thích" },
      ],
    },
    {
      keywords: ["学校", "吃", "家", "今天"],
      chinese: "真好！你平时喜欢去学校，还是喜欢在家里？",
      pinyin: "Zhēn hǎo! Nǐ píngshí xǐhuān qù xuéxiào, háishì xǐhuān zài jiā lǐ?",
      vietnamese: "Thật tốt! Bình thường bạn thích đến trường hay thích ở nhà?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Diễn đạt ngắn gọn và rất chuẩn ngữ pháp HSK 1.",
      },
      hints: [
        { chinese: "学校", pinyin: "xuéxiào", vietnamese: "trường học" },
        { chinese: "在家里", pinyin: "zài jiā lǐ", vietnamese: "ở nhà" },
        { chinese: "平时", pinyin: "píngshí", vietnamese: "bình thường" },
      ],
    },
  ],

  "HSK 2": [
    {
      keywords: ["咖啡店", "学校", "附近", "喜欢去"],
      chinese: "哦，学校附近的咖啡店应该很方便吧！那家店有什么特别推荐的吗？比如拿铁，还是其他的？",
      pinyin: "Ó, xuéxiào fùjìn de kāfēidiàn yīnggāi hěn fāngbiàn ba! Nà jiā diàn yǒu shénme tèbié tuījiàn de ma? Bǐrú nátiě, háishì qítā de?",
      vietnamese: "À, quán cà phê gần trường chắc tiện thật nhỉ! Quán có món gì đặc biệt bạn thích không? Ví dụ như latte, hay món khác?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Câu của bạn rất tự nhiên và chính xác theo chuẩn HSK 2!",
      },
      hints: [
        { chinese: "拿铁", pinyin: "nátiě", vietnamese: "latte" },
        { chinese: "好喝", pinyin: "hǎohē", vietnamese: "ngon (đồ uống)" },
        { chinese: "特别", pinyin: "tèbié", vietnamese: "đặc biệt" },
      ],
    },
    {
      keywords: ["拿铁", "香", "味道", "比较喜欢"],
      chinese: "听起来你真的很喜欢咖啡呢！你平时一个人去，还是和朋友一起去？",
      pinyin: "Tīng qǐlái nǐ zhēnde hěn xǐhuān kāfēi ne! Nǐ píngshí yí gè rén qù, háishì hé péngyou yìqǐ qù?",
      vietnamese: "Nghe có vẻ bạn thật sự rất thích cà phê! Bạn thường đi một mình, hay là đi cùng bạn bè?",
      correction: {
        hasCorrection: true,
        original: "我比较喜欢拿铁，味道很香。",
        originalPinyin: "Wǒ bǐjiào xǐhuān nátiě, wèidào hěn xiāng.",
        originalVi: "Tôi khá là thích latte, vị rất thơm.",
        suggestion: "我很喜欢喝拿铁，味道很香。",
        suggestionPinyin: "Wǒ hěn xǐhuān hē nátiě, wèidào hěn xiāng.",
        suggestionVi: "Tôi rất thích uống latte, vị rất thơm.",
        explanation: "Câu của bạn đã khá tốt rồi! Khẩu ngữ tiếng Trung dùng '我很喜欢喝拿铁' sẽ tự nhiên và gần gũi hơn.",
      },
      hints: [
        { chinese: "一个人", pinyin: "yí gè rén", vietnamese: "một mình" },
        { chinese: "朋友", pinyin: "péngyou", vietnamese: "bạn bè" },
        { chinese: "平时", pinyin: "píngshí", vietnamese: "bình thường / ngày thường" },
      ],
    },
    {
      keywords: ["朋友", "一起", "同学", "通常"],
      chinese: "那一定很有意思！你们一般周末去，还是放学以后去呢？",
      pinyin: "Nà yídìng hěn yǒu yìsi! Nǐmen yìbān zhōumò qù, háishì fàngxué yǐhòu qù ne?",
      vietnamese: "Thế thì chắc chắn vui lắm! Các bạn thường đi vào cuối tuần hay sau giờ tan học?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Cách dùng từ rất chuẩn và diễn đạt trôi chảy!",
      },
      hints: [
        { chinese: "周末", pinyin: "zhōumò", vietnamese: "cuối tuần" },
        { chinese: "放学", pinyin: "fàngxué", vietnamese: "tan học" },
        { chinese: "一般", pinyin: "yìbān", vietnamese: "thường thường" },
      ],
    },
    {
      keywords: ["周末", "下午", "晚上", "放学以后"],
      chinese: "周末下午去咖啡店真的很放松！除了喝咖啡，你们还喜欢做什么？",
      pinyin: "Zhōumò xiàwǔ qù kāfēidiàn zhēnde hěn fàngsōng! Chúle hē kāfēi, nǐmen hái xǐhuān zuò shénme?",
      vietnamese: "Chiều cuối tuần đi cà phê thật sự rất thư giãn! Ngoài uống cà phê ra, các bạn còn thích làm gì nữa?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Bạn diễn đạt thời gian rất chính xác!",
      },
      hints: [
        { chinese: "聊天", pinyin: "liáotiān", vietnamese: "trò chuyện" },
        { chinese: "看书", pinyin: "kànshū", vietnamese: "đọc sách" },
        { chinese: "放松", pinyin: "fàngsōng", vietnamese: "thư giãn" },
      ],
    },
    {
      keywords: ["聊天", "看书", "听音乐", "学习"],
      chinese: "真好！一边喝咖啡一边看书，生活非常充实。你最近在看什么书？",
      pinyin: "Zhēn hǎo! Yìbiān hē kāfēi yìbiān kànshū, shēnghuó fēicháng chōngshí. Nǐ zuìjìn zài kàn shénme shū?",
      vietnamese: "Thật tuyệt! Vừa uống cà phê vừa đọc sách, cuộc sống thật nhiều ý nghĩa. Dạo này bạn đang đọc sách gì thế?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Tuyệt vời! Cách diễn đạt của bạn hoàn toàn tự nhiên và đúng ngữ pháp HSK 2.",
      },
      hints: [
        { chinese: "一边", pinyin: "yìbiān", vietnamese: "vừa... vừa..." },
        { chinese: "最近", pinyin: "zuìjìn", vietnamese: "dạo gần đây" },
        { chinese: "很有意思", pinyin: "hěn yǒu yìsi", vietnamese: "rất thú vị" },
      ],
    },
  ],

  "HSK 3": [
    {
      keywords: ["学习", "习惯", "时间", "练习", "觉得"],
      chinese: "听了你的分享，我觉得这种学习习惯非常值得坚持！你平时每天大概会花多少时间在中文练习上呢？",
      pinyin: "Tīng le nǐ de fēnxiǎng, wǒ juéde zhè zhǒng xuéxí xíguàn fēicháng zhíde jiānchí! Nǐ píngshí měitiān dàgài huì huā duōshao shíjiān zài Zhōngwén liànxí shàng ne?",
      vietnamese: "Nghe bạn chia sẻ, mình thấy thói quen học tập này rất đáng duy trì! Bình thường mỗi ngày bạn dành khoảng bao nhiêu thời gian để luyện tiếng Trung?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Ngữ pháp và cách diễn đạt ý kiến cá nhân rất đúng chuẩn HSK 3!",
      },
      hints: [
        { chinese: "习惯", pinyin: "xíguàn", vietnamese: "thói quen" },
        { chinese: "值得", pinyin: "zhíde", vietnamese: "xứng đáng" },
        { chinese: "坚持", pinyin: "jiānchí", vietnamese: "kiên trì" },
      ],
    },
  ],

  "HSK 4": [
    {
      keywords: ["教育", "年轻人", "技术", "影响", "大学"],
      chinese: "这是一个非常客观且有见地的观点。现代教育不仅传授专业知识，更重要的是培养年轻人的批判性思维与解决问题的能力。你认为在未来的职场中，自学能力和人际沟通能力哪个更具有决定性？",
      pinyin: "Zhè shì yí gè fēicháng kèguān qiě yǒu jiàndì de guāndiǎn. Xiàndài jiàoyù bùjǐn chuánshòu zhuānyè zhīshi, gèng zhòngyào de shì péiyǎng niánqīngrén de pīpànxìng sīwéi yǔ jiějué wèntí de nénglì. Nǐ rènwéi zài wèilái de zhíchǎng zhōng, zìxué nénglì hé rénjì gōutōng nénglì nǎ gè gèng jùyǒu juédìngxìng?",
      vietnamese: "Đây là một quan điểm rất khách quan và có chiều sâu. Giáo dục hiện đại không chỉ truyền thụ kiến thức chuyên môn mà quan trọng hơn là bồi dưỡng tư duy phản biện cùng năng lực giải quyết vấn đề của người trẻ. Bạn nghĩ trong môi trường làm việc tương lai, năng lực tự học hay khả năng giao tiếp mang tính quyết định hơn?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Cấu trúc câu phức và vốn từ vựng HSK 4 được vận dụng rất linh hoạt và chính xác!",
      },
      hints: [
        { chinese: "批判性思维", pinyin: "pīpànxìng sīwéi", vietnamese: "tư duy phản biện" },
        { chinese: "决定性", pinyin: "juédìngxìng", vietnamese: "tính quyết định" },
        { chinese: "沟通", pinyin: "gōutōng", vietnamese: "giao tiếp" },
      ],
    },
  ],

  "HSK 5": [
    {
      keywords: ["挑战", "教育", "体制", "在线", "未来"],
      chinese: "从终身学习与社会发展的宏观角度来看，传统教育体制确实面临着知识快速迭代的严峻挑战。当数字化资源能够打破地域限制时，您认为未来实体学校最不可替代的核心价值究竟体现在哪里？",
      pinyin: "Cóng zhōngshēn xuéxí yǔ shèhuì fāzhǎn de hóngguān jiǎodù lái kàn, chuántǒng jiàoyù tǐzhì quēshí miànlín zhe zhīshi kuàisù diédài de yánjùn tiǎozhàn. Dāng shùzìhuà zīyuán nénggòu dǎpò dìyù xiànzhì shí, nín rènwéi wèilái shítǐ xuéxiào zuì bù kě tìdài de héxīn jiàzhí jiūjìng tǐxiàn zài nǎlǐ?",
      vietnamese: "Xét từ góc độ vĩ mô của việc học tập suốt đời và phát triển xã hội, thể chế giáo dục truyền thống quả thực đang đối mặt với thách thức gay gắt về sự cập nhật tri thức nhanh chóng. Khi tài nguyên số có thể xóa nhòa ranh giới địa lý, bạn cho rằng giá trị cốt lõi không thể thay thế của trường học truyền thống trong tương lai thể hiện ở đâu?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Khả năng phân tích logic và nghị luận học thuật HSK 5 rất xuất sắc!",
      },
      hints: [
        { chinese: "宏观角度", pinyin: "hóngguān jiǎodù", vietnamese: "góc độ vĩ mô" },
        { chinese: "迭代", pinyin: "diédài", vietnamese: "cập nhật / chuyển giao" },
        { chinese: "不可替代", pinyin: "bù kě tìdài", vietnamese: "không thể thay thế" },
      ],
    },
  ],

  "HSK 6": [
    {
      keywords: ["人工智能", "哲学", "本质", "重塑", "机器"],
      chinese: "您的剖析切中要害。人工智能对教育范式的颠覆，归根结底是一场关于人类主体性与认知边界的深刻哲学叩问。在算法能高效生成结构化知识的当下，您如何看待人文学科在维系人类同理心与道德判断力方面的终极使命？",
      pinyin: "Nín de pōuxī qièzhòng yàohài. Réngōng zhìnéng duì jiàoyù fànshì de diānfù, guīgēn-jiédǐ shì yì chǎng guānyú rénlèi zhǔtǐxìng yǔ rènzhī biānjiè de shēnkè zhéxué kòuwèn. Zài suànfǎ néng gāoxiào shēngchéng jiégòuhuà zhīshi de dāngxià, nín rúhé kàndài rénwén xuékē zài wéixì rénlèi tónglǐxīn yǔ dàodé pànduànlì fāngmiàn de zhōngjí shǐmìng?",
      vietnamese: "Phân tích của bạn rất trúng trọng tâm. Sự đảo lộn mô hình giáo dục của AI suy cho cùng là một chất vấn triết học sâu sắc về tính chủ thể và giới hạn nhận thức của con người. Trong bối cảnh thuật toán có thể tạo ra tri thức có cấu trúc một cách thần tốc, bạn nhìn nhận thế nào về sứ mệnh tối hậu của các ngành nhân văn trong việc duy trì sự đồng cảm và năng lực phán đoán đạo đức của nhân loại?",
      correction: {
        hasCorrection: false,
        original: "",
        originalPinyin: "",
        originalVi: "",
        suggestion: "",
        suggestionPinyin: "",
        suggestionVi: "",
        explanation: "Tư duy triết lý và vốn ngôn ngữ HSK 6 tiệm cận người bản xứ có học thức cao!",
      },
      hints: [
        { chinese: "切中要害", pinyin: "qièzhòng yàohài", vietnamese: "trúng điểm mấu chốt" },
        { chinese: "归根结底", pinyin: "guīgēn-jiédǐ", vietnamese: "suy cho cùng" },
        { chinese: "同理心", pinyin: "tónglǐxīn", vietnamese: "sự thấu cảm" },
      ],
    },
  ],
};

function getFallbackForLevel(level: string, message: string, step = 1) {
  const list = levelFallbackResponses[level] || levelFallbackResponses["HSK 1"];
  const matched = list.find((r) => r.keywords.some((kw) => message.includes(kw)));
  return matched || list[Math.min(step - 1, list.length - 1)];
}

// Helper to construct fast rolling context
function formatRollingHistory(history: Array<{ role: string; content: string }>, maxTurns = 5) {
  const recent = history.slice(-maxTurns);
  return recent
    .map((item) => `${item.role === "user" ? "Student" : "Linh"}: ${item.content}`)
    .join("\n");
}

// POST /api/tutor/respond (Standard Fast JSON Endpoint)
app.post("/api/tutor/respond", requireAuth, async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      message,
      history = [],
      topic = "Một ngày của tôi",
      level = "HSK 1",
      currentStep = 1,
      recentQuestions = [],
    } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing message text" });
      return;
    }

    if (!ai) {
      const fallback = getFallbackForLevel(level, message, currentStep);
      res.json({ level, ...fallback, latencyMs: Date.now() - startTime });
      return;
    }

    const systemPrompt = `You are Linh (林老师), a warm, caring native Chinese speaking buddy and tutor for Vietnamese learners.
STUDENT LEVEL: ${level} (STRICT PEDAGOGICAL CONTROL - Do NOT overshoot or undershoot vocabulary and sentence complexity).
CURRENT TOPIC: ${topic}. STEP: [${currentStep}/5].
Level Guidance:
- HSK 1: Very short (1 short sentence + 1 simple question), elementary vocabulary only.
- HSK 2: Short (1-2 sentences + 1 follow-up question), daily routine.
- HSK 3: Medium (2-3 sentences), reasons, personal experiences, opinions.
- HSK 4: Detailed (2-4 sentences), explanation, comparisons, discussion on education/work/society.
- HSK 5-6: Extended natural discussion, deep analytical viewpoints, academic/philosophical vocabulary.

CRITICAL 3-LAYER RULES:
1. Provide:
   - "level": "${level}"
   - "chinese": Spoken Mandarin strictly matching ${level}.
   - "pinyin": Full Pinyin WITH ACCURATE TONE MARKS (e.g., kāfēi, xǐhuān, zhōumò, jiàoyù). NEVER use numbers for tones.
   - "vietnamese": Natural, authentic Vietnamese translation.
2. NEVER repeat questions from: ${JSON.stringify(recentQuestions)}.
3. Grammar correction must also have Chinese, Pinyin (with tone marks), and Vietnamese.`;

    const promptText = `Recent conversation:
${formatRollingHistory(history)}

Student: "${message}"

Respond strictly as JSON matching student level ${level}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING },
            chinese: { type: Type.STRING },
            pinyin: { type: Type.STRING },
            vietnamese: { type: Type.STRING },
            correction: {
              type: Type.OBJECT,
              properties: {
                hasCorrection: { type: Type.BOOLEAN },
                original: { type: Type.STRING },
                originalPinyin: { type: Type.STRING },
                originalVi: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                suggestionPinyin: { type: Type.STRING },
                suggestionVi: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["hasCorrection", "explanation"],
            },
            hints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chinese: { type: Type.STRING },
                  pinyin: { type: Type.STRING },
                  vietnamese: { type: Type.STRING },
                },
                required: ["chinese", "pinyin", "vietnamese"],
              },
            },
          },
          required: ["chinese", "pinyin", "vietnamese", "correction", "hints"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");

    const parsed = JSON.parse(text);
    res.json({ level, ...parsed, latencyMs: Date.now() - startTime });
  } catch (err: any) {
    console.warn("API fallback in /api/tutor/respond:", err.message);
    const fallback = getFallbackForLevel(req.body.level || "HSK 1", req.body.message || "", 1);
    res.json({ level: req.body.level || "HSK 1", ...fallback, latencyMs: Date.now() - startTime });
  }
});

// POST /api/tutor/respond-stream (Streaming Endpoint for ultra-low first token latency)
app.post("/api/tutor/respond-stream", requireAuth, async (req, res) => {
  const startTime = Date.now();
  const {
    message,
    history = [],
    topic = "Một ngày của tôi",
    level = "HSK 1",
    currentStep = 1,
    recentQuestions = [],
  } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  if (!message || typeof message !== "string") {
    sendEvent("error", { error: "Missing message" });
    res.end();
    return;
  }

  // If no live Gemini key, stream fallback response for the specific level seamlessly
  if (!ai) {
    const matched = getFallbackForLevel(level, message, currentStep);

    sendEvent("meta", { firstTokenMs: 40, level });

    const chars = matched.chinese.split("");
    let current = "";
    for (let i = 0; i < chars.length; i += 3) {
      const chunk = chars.slice(i, i + 3).join("");
      current += chunk;
      sendEvent("chunk", { text: chunk, currentChinese: current });
      await new Promise((r) => setTimeout(r, 25));
    }

    sendEvent("complete", {
      level,
      chinese: matched.chinese,
      pinyin: matched.pinyin,
      vietnamese: matched.vietnamese,
      correction: matched.correction,
      hints: matched.hints,
      totalLatencyMs: Date.now() - startTime,
    });
    res.end();
    return;
  }

  try {
    const systemPrompt = `You are Linh (林老师), a warm native Chinese tutor for Vietnamese learners.
TARGET LEVEL: ${level}.
TOPIC: ${topic}. STEP: [${currentStep}/5].
Level Guidance:
- HSK 1: Very short (1 short sentence + 1 simple question), very basic words.
- HSK 2: 1-2 sentences + 1 follow-up question.
- HSK 3: 2-3 sentences, experiences & reasons.
- HSK 4: 2-4 sentences, discussion & explanation.
- HSK 5-6: Extended natural discussion, deep perspective, academic vocabulary.
Do NOT repeat previously asked questions: ${JSON.stringify(recentQuestions)}.

CRITICAL 3-LAYER FORMAT:
[CHINESE]
<Chinese response matching ${level}>
[PINYIN]
<Full Pinyin WITH TONE MARKS, e.g., Nǐ hǎo! Wǒ yě xǐhuān hē kāfēi!>
[VIETNAMESE]
<Natural Vietnamese translation>
[CORRECTION]
<If user had mistakes: ORIGINAL: <hanzi> | ORIG_PINYIN: <pinyin> | ORIG_VI: <vietnamese> | SUGGESTION: <hanzi> | SUGG_PINYIN: <pinyin> | SUGG_VI: <vietnamese> | TIP: <Vietnamese tip>; If natural: NONE | TIP: Câu của bạn rất tự nhiên!>
[HINTS]
<word1 (pinyin) - meaning | word2 (pinyin) - meaning | word3 (pinyin) - meaning>`;

    const promptText = `Recent history:
${formatRollingHistory(history)}

Student: "${message}"

Output:`;

    const streamPromise = ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI response timeout, switching to fast fallback")), 3800)
    );

    const streamResponse = await Promise.race([streamPromise, timeoutPromise]);

    let fullAccumulated = "";
    let firstTokenReported = false;

    for await (const chunk of streamResponse) {
      const text = chunk.text || "";
      if (text) {
        if (!firstTokenReported) {
          firstTokenReported = true;
          sendEvent("meta", { firstTokenMs: Date.now() - startTime, level });
        }
        fullAccumulated += text;

        if (fullAccumulated.includes("[CHINESE]")) {
          const afterChinese = fullAccumulated.split("[CHINESE]")[1] || "";
          const chineseOnly = afterChinese.split("[PINYIN]")[0]?.split("[VIETNAMESE]")[0]?.trim();
          sendEvent("chunk", { text, currentChinese: chineseOnly });
        } else {
          sendEvent("chunk", { text, currentChinese: fullAccumulated });
        }
      }
    }

    let chinese = "";
    let pinyin = "";
    let vietnamese = "";
    let correction: any = {
      hasCorrection: false,
      explanation: "Câu của bạn rất tự nhiên và chính xác!",
    };
    let hints: Array<{ chinese: string; pinyin: string; vietnamese: string }> = [];

    if (fullAccumulated.includes("[CHINESE]")) {
      chinese = fullAccumulated.split("[CHINESE]")[1]?.split("[PINYIN]")[0]?.split("[VIETNAMESE]")[0]?.trim() || "";
    }
    if (!chinese) chinese = fullAccumulated.slice(0, 100);

    if (fullAccumulated.includes("[PINYIN]")) {
      pinyin = fullAccumulated.split("[PINYIN]")[1]?.split("[VIETNAMESE]")[0]?.split("[CORRECTION]")[0]?.trim() || "";
    }

    if (fullAccumulated.includes("[VIETNAMESE]")) {
      vietnamese = fullAccumulated.split("[VIETNAMESE]")[1]?.split("[CORRECTION]")[0]?.split("[HINTS]")[0]?.trim() || "";
    }

    if (fullAccumulated.includes("[CORRECTION]")) {
      const corrPart = fullAccumulated.split("[CORRECTION]")[1]?.split("[HINTS]")[0]?.trim() || "";
      if (corrPart.includes("NONE")) {
        correction.hasCorrection = false;
        correction.explanation = corrPart.split("TIP:")[1]?.trim() || "Câu của bạn rất tự nhiên và chính xác!";
      } else if (corrPart.includes("SUGGESTION:")) {
        correction.hasCorrection = true;
        correction.original = corrPart.split("ORIGINAL:")[1]?.split("|")[0]?.trim() || "";
        correction.originalPinyin = corrPart.split("ORIG_PINYIN:")[1]?.split("|")[0]?.trim() || "";
        correction.originalVi = corrPart.split("ORIG_VI:")[1]?.split("|")[0]?.trim() || "";
        correction.suggestion = corrPart.split("SUGGESTION:")[1]?.split("|")[0]?.trim() || "";
        correction.suggestionPinyin = corrPart.split("SUGG_PINYIN:")[1]?.split("|")[0]?.trim() || "";
        correction.suggestionVi = corrPart.split("SUGG_VI:")[1]?.split("|")[0]?.trim() || "";
        correction.explanation = corrPart.split("TIP:")[1]?.trim() || "Gợi ý tự nhiên hơn cho bạn";
      }
    }

    sendEvent("complete", {
      level,
      chinese,
      pinyin: pinyin || "Nǐ shuō de hěn hǎo!",
      vietnamese: vietnamese || "Bạn nói rất hay!",
      correction,
      hints: hints.length ? hints : getFallbackForLevel(level, message, 1).hints,
      totalLatencyMs: Date.now() - startTime,
    });
    res.end();
  } catch (err: any) {
    console.warn("Streaming API notice, switching to instant contextual fallback:", err.message);

    const matched = getFallbackForLevel(level, message, currentStep);

    sendEvent("meta", { firstTokenMs: 80, level });

    const chars = matched.chinese.split("");
    let current = "";
    for (let i = 0; i < chars.length; i += 3) {
      const chunk = chars.slice(i, i + 3).join("");
      current += chunk;
      sendEvent("chunk", { text: chunk, currentChinese: current });
      await new Promise((r) => setTimeout(r, 25));
    }

    sendEvent("complete", {
      level,
      chinese: matched.chinese,
      pinyin: matched.pinyin,
      vietnamese: matched.vietnamese,
      correction: matched.correction,
      hints: matched.hints,
      totalLatencyMs: Date.now() - startTime,
    });
    res.end();
  }
});

// POST /api/tutor/tts
app.post("/api/tutor/tts", requireAuth, async (req, res) => {
  const startTime = Date.now();
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Missing text" });
      return;
    }

    if (!ai) {
      res.json({ fallback: true, message: "Use client speech synthesis" });
      return;
    }

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: text,
              speechMetadata: {
                style: "Friendly, gentle, standard Mandarin Chinese female language teacher speaking clearly at comfortable pace",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({
        audioBase64: base64Audio,
        format: "audio/wav",
        ttsLatencyMs: Date.now() - startTime,
      });
    } else {
      res.json({ fallback: true, ttsLatencyMs: Date.now() - startTime });
    }
  } catch (err: any) {
    console.warn("TTS generation fallback:", err.message);
    res.json({ fallback: true, error: err.message, ttsLatencyMs: Date.now() - startTime });
  }
});

// Mount Vite middleware for dev or static files for prod
if (process.env.NODE_ENV !== "production") {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}



const PORT = Number(process.env.PORT) || 3000;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is ready on port ${PORT}`);
  });
}

export default app;
