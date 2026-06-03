"use client";

import React, { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";

export default function FloatingLawyerWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 hover:scale-105 transition-all z-50 flex items-center justify-center ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Задать вопрос юристу"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </button>

      {/* Modal / Popup Chat */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:bottom-6 sm:right-6 sm:p-0 bg-black/50 sm:bg-transparent transition-opacity">
          <div className="bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:w-[400px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gray-800/80 backdrop-blur border-b border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">Дежурный юрист</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> В сети
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto max-h-[80vh] sm:max-h-[600px]">
              <div className="mb-4 text-sm text-gray-300">
                <p>
                  Здравствуйте! Я дежурный миграционный юрист. Опишите вашу ситуацию или оставьте номер, 
                  и мы перезвоним в течение 15 минут для бесплатной консультации.
                </p>
              </div>
              
              <LeadForm 
                sourceContext="Виджет юриста (Сайт)" 
                onSuccess={() => setTimeout(() => setIsOpen(false), 3000)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
