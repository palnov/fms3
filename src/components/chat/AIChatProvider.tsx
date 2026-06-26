"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type LeadIntent = "none" | "soft_prompt" | "qualify" | "show_form";

export interface ChatSource {
  name: string;
  parent_url?: string | null;
  download_url?: string | null;
}

export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  sources?: ChatSource[];
  showLeadForm?: boolean;
  leadIntent?: LeadIntent;
  suggestedReplies?: string[];
  timestamp: Date;
}

interface SendQuestionOptions {
  context?: string;
  forceLeadForm?: boolean;
}

interface AIChatContextValue {
  messages: ChatMessage[];
  language: string;
  isTyping: boolean;
  errorMsg: string | null;
  remainingRequests: number | null;
  setLanguage: (language: string) => void;
  sendQuestion: (question: string, options?: SendQuestionOptions) => Promise<void>;
  addAssistantMessage: (text: string, options?: { id?: string; once?: boolean }) => void;
  clearError: () => void;
}

const DAILY_REQUEST_LIMIT = 10;
const CHAT_STORAGE_KEY = "fms3_shared_ai_chat";
const LEGACY_CHAT_STORAGE_KEYS = ["fms3_ai_consultant_page_chat", "ai_requests_left"];
const CHAT_STORAGE_VERSION = 1;
const ALLOWED_LANGUAGES = new Set(["ru", "en", "tg", "uz", "ro", "kk"]);
const AIChatContext = createContext<AIChatContextValue | null>(null);

function getRequestHistory(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.text.trim())
    .slice(-6)
    .map((message) => ({
      sender: message.sender,
      text: message.text.slice(0, 300),
    }));
}

function restoreStoredMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): ChatMessage | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const sender = record.sender === "ai" || record.sender === "user" ? record.sender : null;
      const text = typeof record.text === "string" ? record.text : "";
      const id = typeof record.id === "string" ? record.id : crypto.randomUUID();
      if (!sender || !text.trim()) return null;

      return {
        id,
        sender,
        text,
        sources: Array.isArray(record.sources) ? record.sources as ChatSource[] : undefined,
        showLeadForm: Boolean(record.showLeadForm),
        leadIntent: record.leadIntent === "none" || record.leadIntent === "soft_prompt" || record.leadIntent === "qualify" || record.leadIntent === "show_form"
          ? record.leadIntent
          : undefined,
        suggestedReplies: Array.isArray(record.suggestedReplies)
          ? record.suggestedReplies.filter((reply): reply is string => typeof reply === "string")
          : undefined,
        timestamp: typeof record.timestamp === "string" || typeof record.timestamp === "number"
          ? new Date(record.timestamp)
          : new Date(),
      };
    })
    .filter((message): message is ChatMessage => Boolean(message));
}

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [language, setLanguage] = useState("ru");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(DAILY_REQUEST_LIMIT);
  const messageIdRef = useRef(0);
  const oneTimeMessagesRef = useRef(new Set<string>());
  const hasRestoredStorageRef = useRef(false);

  const createMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return `shared-ai-chat-${messageIdRef.current}`;
  }, []);

  const syncLimitStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/consultant", {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      if (!response.ok) return;

      const data = await response.json() as { remainingRequests?: unknown };
      if (typeof data.remainingRequests === "number" && data.remainingRequests >= 0 && data.remainingRequests <= DAILY_REQUEST_LIMIT) {
        setRemainingRequests(data.remainingRequests);
      }
    } catch (error) {
      console.warn("Failed to sync consultant limit status", error);
    }
  }, []);

  const addAssistantMessage = useCallback((text: string, options?: { id?: string; once?: boolean }) => {
    if (options?.once) {
      const key = options.id || text;
      if (oneTimeMessagesRef.current.has(key)) return;
      oneTimeMessagesRef.current.add(key);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: options?.id || createMessageId(),
        sender: "ai",
        text,
        timestamp: new Date(),
      },
    ]);
  }, [createMessageId]);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        LEGACY_CHAT_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
        const stored = window.localStorage.getItem(CHAT_STORAGE_KEY);
        if (!stored) {
          hasRestoredStorageRef.current = true;
          return;
        }

        const parsed = JSON.parse(stored) as { version?: unknown; messages?: unknown; language?: unknown; remainingRequests?: unknown };
        if (parsed.version !== CHAT_STORAGE_VERSION) {
          window.localStorage.removeItem(CHAT_STORAGE_KEY);
          hasRestoredStorageRef.current = true;
          return;
        }

        const storedMessages = restoreStoredMessages(parsed.messages);
        if (storedMessages.length > 0) {
          setMessages(storedMessages);
        }
        if (typeof parsed.language === "string" && ALLOWED_LANGUAGES.has(parsed.language)) {
          setLanguage(parsed.language);
        }
        if (typeof parsed.remainingRequests === "number" && parsed.remainingRequests >= 0 && parsed.remainingRequests <= DAILY_REQUEST_LIMIT) {
          setRemainingRequests(parsed.remainingRequests);
        }
      } catch {
        window.localStorage.removeItem(CHAT_STORAGE_KEY);
      } finally {
        hasRestoredStorageRef.current = true;
        void syncLimitStatus();
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [syncLimitStatus]);

  useEffect(() => {
    if (!hasRestoredStorageRef.current) return;

    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      version: CHAT_STORAGE_VERSION,
      messages: messages.slice(-20),
      language,
      remainingRequests,
    }));
  }, [language, messages, remainingRequests]);

  const sendQuestion = useCallback(async (question: string, options?: SendQuestionOptions) => {
    const text = question.trim();
    if (!text || isTyping) return;

    const requestHistory = getRequestHistory(messages);
    setErrorMsg(null);
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        sender: "user",
        text,
        timestamp: new Date(),
      },
    ]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, language, context: options?.context, history: requestHistory }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setRemainingRequests(0);
          setMessages((prev) => [
            ...prev,
            {
              id: createMessageId(),
              sender: "ai",
              text: data.text || data.error || "Вы исчерпали лимит вопросов.",
              showLeadForm: true,
              leadIntent: "show_form",
              timestamp: new Date(),
            },
          ]);
          return;
        }

        setErrorMsg(data.error || "Произошла ошибка при получении ответа.");
        return;
      }

      const leadIntent = (data.leadIntent || "none") as LeadIntent;
      const shouldShowLeadForm =
        options?.forceLeadForm ||
        data.showLeadForm;
      const msgId = createMessageId();

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: "ai",
          text: "",
          sources: data.sources || [],
          showLeadForm: false,
          leadIntent,
          suggestedReplies: data.suggestedReplies || [],
          timestamp: new Date(),
        },
      ]);

      const fullText = String(data.text || "");
      const words = fullText.split(" ");
      let currentText = "";
      let wordIndex = 0;

      await new Promise<void>((resolve) => {
        const interval = window.setInterval(() => {
          if (wordIndex < words.length) {
            currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
            setMessages((prev) => prev.map((message) => message.id === msgId ? { ...message, text: currentText } : message));
            wordIndex++;
            return;
          }

          window.clearInterval(interval);
          if (shouldShowLeadForm) {
            window.setTimeout(() => {
              setMessages((prev) => prev.map((message) => message.id === msgId ? { ...message, showLeadForm: true } : message));
            }, 700);
          }
          resolve();
        }, 30);
      });

      if (typeof data.remainingRequests === "number") {
        setRemainingRequests(data.remainingRequests);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Ошибка сети. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
    } finally {
      setIsTyping(false);
    }
  }, [createMessageId, isTyping, language, messages]);

  const value = useMemo<AIChatContextValue>(() => ({
    messages,
    language,
    isTyping,
    errorMsg,
    remainingRequests,
    setLanguage,
    sendQuestion,
    addAssistantMessage,
    clearError: () => setErrorMsg(null),
  }), [addAssistantMessage, errorMsg, isTyping, language, messages, remainingRequests, sendQuestion]);

  return <AIChatContext.Provider value={value}>{children}</AIChatContext.Provider>;
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error("useAIChat must be used within AIChatProvider.");
  }
  return context;
}
