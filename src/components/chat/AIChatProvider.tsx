"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

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
const HOT_QUERY_PATTERN =
  /(депортац|выдворен|запрет|отказ|суд|штраф|просроч|аннулиров|реадмисс|завтра|сегодня|срочно|не пустили|не впустили|истекает|истек|обжал|жалоб)/i;

const AIChatContext = createContext<AIChatContextValue | null>(null);

function isHotQuestion(question: string) {
  return HOT_QUERY_PATTERN.test(question);
}

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [language, setLanguage] = useState("ru");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(DAILY_REQUEST_LIMIT);
  const messageIdRef = useRef(0);
  const oneTimeMessagesRef = useRef(new Set<string>());

  const createMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return `shared-ai-chat-${messageIdRef.current}`;
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

  const sendQuestion = useCallback(async (question: string, options?: SendQuestionOptions) => {
    const text = question.trim();
    if (!text || isTyping) return;

    const hotQuestion = isHotQuestion(text);
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
        body: JSON.stringify({ question: text, language, context: options?.context }),
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
        data.showLeadForm ||
        leadIntent === "show_form" ||
        hotQuestion;
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
  }, [createMessageId, isTyping, language]);

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
