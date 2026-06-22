"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Menu, Search, X } from "lucide-react";

const links = [
  { href: "/pathways/vnzh", label: "ВНЖ" },
  { href: "/pathways/rvp", label: "РВП" },
  { href: "/pathways/citizenship", label: "Гражданство" },
  { href: "/pathways/work/patent", label: "Работа" },
  { href: "/pathways", label: "Все инструкции" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchOpen) {
      const focusTimer = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(focusTimer);
    }
  }, [searchOpen]);

  useEffect(() => {
    return () => {
      if (searchCloseTimerRef.current) {
        clearTimeout(searchCloseTimerRef.current);
      }
    };
  }, []);

  const openSearch = () => {
    if (searchCloseTimerRef.current) {
      clearTimeout(searchCloseTimerRef.current);
    }

    setSearchMounted(true);
    requestAnimationFrame(() => setSearchOpen(true));
  };

  const runSearch = () => {
    const query = searchQuery.trim();
    if (!query) {
      searchInputRef.current?.focus();
      return;
    }

    setOpen(false);
    setSearchOpen(false);
    searchCloseTimerRef.current = setTimeout(() => setSearchMounted(false), 260);
    setSearchQuery("");
    router.push(`/tools/ai-consultant?q=${encodeURIComponent(query)}`);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    searchCloseTimerRef.current = setTimeout(() => setSearchMounted(false), 260);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#d8dee7]/90 bg-[#f4f6fa]/92 backdrop-blur-xl">
      <div className="site-container flex min-h-20 items-center gap-5">
        <Link href="/" className="mr-auto flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1f2c41] text-sm font-black text-white">
            МС
          </span>
          <span className="leading-none">
            <strong className="block text-[15px] font-extrabold tracking-[-0.035em]">Миграционный</strong>
            <span className="text-[13px] font-bold text-[#ff2e32]">справочник</span>
          </span>
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/pathways" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 py-7 text-sm font-bold transition-colors ${
                  active
                    ? "border-[#ff2e32] text-[#1f2c41]"
                    : "border-transparent text-[#667287] hover:text-[#02629f]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center sm:flex">
          <div className={`header-search-morph ${searchOpen ? "is-open" : ""}`}>
            <button
              type="button"
              onClick={openSearch}
              className="header-search-trigger min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-[#d8dee7] bg-white px-4 text-sm font-bold text-[#1f2c41] transition-colors hover:border-[#02629f]/40 hover:text-[#02629f] sm:inline-flex"
              aria-hidden={searchOpen}
              tabIndex={searchOpen ? -1 : 0}
            >
              <Search className="h-4 w-4" />
              Найти ответ
            </button>
            {searchMounted && (
            <form
              onSubmit={submitSearch}
              className="header-search-form flex h-11 items-center gap-2 rounded-xl border border-[#d8dee7] bg-white px-3 shadow-sm"
            >
              <Search className="h-4 w-4 shrink-0 text-[#02629f]" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                maxLength={500}
                placeholder="Введите вопрос..."
                className="header-search-input min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#1f2c41] outline-none placeholder:text-[#8b95a5]"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#667287] transition-colors hover:bg-[#f4f6fa] hover:text-[#1f2c41]"
                aria-label="Закрыть поиск"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="submit"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#02629f] text-white transition-colors hover:bg-[#014f7f]"
                aria-label="Найти ответ"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
            )}
          </div>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-[#d8dee7] bg-white lg:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Мобильная навигация" className="motion-mobile-menu site-container grid gap-1 border-t border-[#d8dee7] py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-bold text-[#1f2c41] hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
          <form onSubmit={submitSearch} className="mt-2 flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              maxLength={500}
              placeholder="Введите вопрос..."
              className="header-search-input min-w-0 flex-1 rounded-xl border border-[#d8dee7] bg-white px-3 py-3 text-sm font-semibold text-[#1f2c41] outline-none"
            />
            <button type="submit" className="button-primary shrink-0 px-4" aria-label="Найти ответ">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
