import crypto from "crypto";
import path from "path";
import Database from "better-sqlite3";

const DEFAULT_RETENTION_DAYS = 60;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_METADATA_LENGTH = 8_000;
const AI_CHAT_LOG_DB_PATH = process.env.AI_CHAT_LOG_DB_PATH || path.join(process.cwd(), "ai-chat-log.db");

export const AI_CONVERSATION_COOKIE = "ai_conversation_id";

type ConversationRow = {
  id: string;
  anonymous_id: string;
  language: string;
  page_context: string | null;
  first_question: string | null;
  created_at: number;
  updated_at: number;
  last_message_at: number;
  message_count: number;
  has_lead_form: number;
  has_error: number;
  last_error: string | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: number;
  metadata: string | null;
};

export type AdminConversation = {
  id: string;
  anonymousId: string;
  language: string;
  pageContext: string;
  firstQuestion: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  messageCount: number;
  hasLeadForm: boolean;
  hasError: boolean;
  lastError: string;
};

export type AdminMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  metadata: Record<string, unknown>;
};

export type AdminConversationDetail = AdminConversation & {
  messages: AdminMessage[];
};

let db: Database.Database | null = null;

function getDb() {
  if (!db) {
    db = new Database(AI_CHAT_LOG_DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS ai_conversations (
          id TEXT PRIMARY KEY,
          anonymous_id TEXT NOT NULL,
          language TEXT NOT NULL,
          page_context TEXT,
          first_question TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          last_message_at INTEGER NOT NULL,
          message_count INTEGER NOT NULL DEFAULT 0,
          has_lead_form INTEGER NOT NULL DEFAULT 0,
          has_error INTEGER NOT NULL DEFAULT 0,
          last_error TEXT
        )`,
      )
      .run();
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS ai_messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          metadata TEXT,
          FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
        )`,
      )
      .run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_message_at ON ai_conversations(last_message_at DESC)").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_conversations_anonymous_id ON ai_conversations(anonymous_id)").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id, created_at)").run();
  }

  return db;
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function normalizeText(value: string, maxLength = MAX_MESSAGE_LENGTH) {
  return truncate(value.trim(), maxLength);
}

function serializeMetadata(metadata: Record<string, unknown>) {
  return truncate(JSON.stringify(metadata), MAX_METADATA_LENGTH);
}

function parseMetadata(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function getRetentionMs() {
  const configured = Number(process.env.AI_CHAT_LOG_RETENTION_DAYS);
  const days = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_RETENTION_DAYS;
  return days * 24 * 60 * 60 * 1000;
}

function mapConversation(row: ConversationRow): AdminConversation {
  return {
    id: row.id,
    anonymousId: row.anonymous_id,
    language: row.language,
    pageContext: row.page_context || "",
    firstQuestion: row.first_question || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastMessageAt: row.last_message_at,
    messageCount: row.message_count,
    hasLeadForm: row.has_lead_form === 1,
    hasError: row.has_error === 1,
    lastError: row.last_error || "",
  };
}

function mapMessage(row: MessageRow): AdminMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
    metadata: parseMetadata(row.metadata),
  };
}

function ensureConversation(
  database: Database.Database,
  params: {
    conversationId: string;
    anonymousId: string;
    language: string;
    pageContext: string;
    firstQuestion?: string;
    now: number;
  },
) {
  database
    .prepare(
      `INSERT INTO ai_conversations (
        id, anonymous_id, language, page_context, first_question, created_at, updated_at, last_message_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        anonymous_id = excluded.anonymous_id,
        language = excluded.language,
        page_context = COALESCE(NULLIF(excluded.page_context, ''), ai_conversations.page_context),
        updated_at = excluded.updated_at,
        last_message_at = excluded.last_message_at`,
    )
    .run(
      params.conversationId,
      params.anonymousId,
      params.language,
      params.pageContext || null,
      params.firstQuestion || null,
      params.now,
      params.now,
      params.now,
    );
}

function insertMessage(params: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const database = getDb();
  const now = Date.now();
  database
    .prepare(
      `INSERT INTO ai_messages (id, conversation_id, role, content, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      crypto.randomUUID(),
      params.conversationId,
      params.role,
      normalizeText(params.content),
      now,
      params.metadata ? serializeMetadata(params.metadata) : null,
    );

  database
    .prepare(
      `UPDATE ai_conversations
       SET updated_at = ?, last_message_at = ?, message_count = message_count + 1
       WHERE id = ?`,
    )
    .run(now, now, params.conversationId);
}

export function getOrCreateConversationId(rawValue: string | null | undefined) {
  return rawValue && /^[a-f0-9-]{32,64}$/i.test(rawValue) ? rawValue : crypto.randomUUID();
}

export function createConversationCookie(name: string, value: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Max-Age=${DEFAULT_RETENTION_DAYS * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

export function cleanupOldAiChatLogs() {
  const database = getDb();
  const cutoff = Date.now() - getRetentionMs();
  database.prepare("DELETE FROM ai_conversations WHERE last_message_at < ?").run(cutoff);
}

export function logAiUserMessage(params: {
  conversationId: string;
  anonymousId: string;
  question: string;
  language: string;
  pageContext: string;
}) {
  const database = getDb();
  const now = Date.now();
  cleanupOldAiChatLogs();
  ensureConversation(database, {
    conversationId: params.conversationId,
    anonymousId: params.anonymousId,
    language: params.language,
    pageContext: params.pageContext,
    firstQuestion: normalizeText(params.question, 1_000),
    now,
  });
  insertMessage({
    conversationId: params.conversationId,
    role: "user",
    content: params.question,
    metadata: {
      language: params.language,
      pageContext: params.pageContext,
    },
  });
}

export function logAiAssistantMessage(params: {
  conversationId: string;
  anonymousId: string;
  answer: string;
  language: string;
  pageContext: string;
  sources: Array<{ name: string; parent_url?: string | null; download_url?: string | null }>;
  leadIntent: string;
  showLeadForm: boolean;
  remainingRequests: number;
  model: string;
}) {
  const database = getDb();
  const now = Date.now();
  ensureConversation(database, {
    conversationId: params.conversationId,
    anonymousId: params.anonymousId,
    language: params.language,
    pageContext: params.pageContext,
    now,
  });
  insertMessage({
    conversationId: params.conversationId,
    role: "assistant",
    content: params.answer,
    metadata: {
      sources: params.sources.map((source) => source.name),
      leadIntent: params.leadIntent,
      showLeadForm: params.showLeadForm,
      remainingRequests: params.remainingRequests,
      model: params.model,
    },
  });

  database
    .prepare(
      `UPDATE ai_conversations
       SET has_lead_form = MAX(has_lead_form, ?)
       WHERE id = ?`,
    )
    .run(params.showLeadForm ? 1 : 0, params.conversationId);
}

export function logAiSystemMessage(params: {
  conversationId: string;
  anonymousId: string;
  content: string;
  language: string;
  pageContext: string;
  metadata?: Record<string, unknown>;
}) {
  const database = getDb();
  const now = Date.now();
  ensureConversation(database, {
    conversationId: params.conversationId,
    anonymousId: params.anonymousId,
    language: params.language,
    pageContext: params.pageContext,
    now,
  });
  insertMessage({
    conversationId: params.conversationId,
    role: "system",
    content: params.content,
    metadata: params.metadata,
  });
}

export function logAiError(params: {
  conversationId: string;
  anonymousId: string;
  question?: string;
  language: string;
  pageContext: string;
  errorMessage: string;
}) {
  const database = getDb();
  const now = Date.now();
  ensureConversation(database, {
    conversationId: params.conversationId,
    anonymousId: params.anonymousId,
    language: params.language,
    pageContext: params.pageContext,
    firstQuestion: params.question ? normalizeText(params.question, 1_000) : undefined,
    now,
  });
  insertMessage({
    conversationId: params.conversationId,
    role: "system",
    content: `Ошибка: ${params.errorMessage}`,
    metadata: { type: "error" },
  });
  database
    .prepare(
      `UPDATE ai_conversations
       SET has_error = 1, last_error = ?
       WHERE id = ?`,
    )
    .run(normalizeText(params.errorMessage, 1_000), params.conversationId);
}

export function listAiConversations(params: {
  query?: string;
  filter?: "all" | "lead" | "error";
  limit?: number;
  offset?: number;
}) {
  const database = getDb();
  cleanupOldAiChatLogs();

  const limit = Math.min(Math.max(params.limit || 30, 1), 100);
  const offset = Math.max(params.offset || 0, 0);
  const where: string[] = [];
  const values: Array<string | number> = [];
  const query = params.query?.trim();

  if (query) {
    where.push("(first_question LIKE ? OR id LIKE ? OR anonymous_id LIKE ?)");
    values.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  if (params.filter === "lead") {
    where.push("has_lead_form = 1");
  } else if (params.filter === "error") {
    where.push("has_error = 1");
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (database.prepare(`SELECT COUNT(*) as count FROM ai_conversations ${whereSql}`).get(...values) as { count: number }).count;
  const rows = database
    .prepare(
      `SELECT * FROM ai_conversations
       ${whereSql}
       ORDER BY last_message_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...values, limit, offset) as ConversationRow[];

  return {
    items: rows.map(mapConversation),
    total,
    limit,
    offset,
  };
}

export function getAiConversation(id: string): AdminConversationDetail | null {
  const database = getDb();
  const row = database.prepare("SELECT * FROM ai_conversations WHERE id = ?").get(id) as ConversationRow | undefined;
  if (!row) return null;

  const messages = database
    .prepare("SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC")
    .all(id) as MessageRow[];

  return {
    ...mapConversation(row),
    messages: messages.map(mapMessage),
  };
}

export function deleteAiConversation(id: string) {
  getDb().prepare("DELETE FROM ai_conversations WHERE id = ?").run(id);
}
