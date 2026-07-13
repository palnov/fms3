"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Menu, Phone, Search, X } from "lucide-react";
import { getPhoneHref, PARTNER_PHONE } from "@/lib/contact";

const links = [
  { href: "/pathways/vnzh", label: "ВНЖ" },
  { href: "/pathways/rvp", label: "РВП" },
  { href: "/pathways/citizenship", label: "Гражданство" },
  { href: "/pathways/work/patent", label: "Работа" },
  { href: "/pathways", label: "Все инструкции" },
];

export default function Header() {
  const pathname = usePathname();
  const isPublic = !pathname.startsWith("/admin");
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
    <header className={`sticky top-0 z-50 border-b border-[#d8dee7]/90 bg-[#f4f6fa]/92 backdrop-blur-xl ${isPublic ? "home-header" : ""}`}>
      <div className="site-container flex min-h-20 items-center gap-5">
        <Link href="/" className="mr-auto flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="header-brand-mark grid h-10 w-10 place-items-center rounded-xl bg-[#1f2c41] text-sm font-black text-white">
            МС
          </span>
          <span className="header-wordmark leading-none">
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
                    ? "header-nav-active border-[#ff2e32] text-[#1f2c41]"
                    : "header-nav-link border-transparent text-[#667287] hover:text-[#02629f]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <a
          href={getPhoneHref(PARTNER_PHONE)}
          className="header-hotline hidden min-h-11 items-center gap-2 px-1 text-left text-[#1f2c41] transition-colors hover:text-[#02629f] xl:flex"
          aria-label={`Горячая линия ${PARTNER_PHONE}`}
        >
          <Phone className="h-4 w-4" />
          <span className="text-sm font-extrabold tabular-nums">{PARTNER_PHONE}</span>
        </a>

        <div className="hidden items-center sm:flex">
          <div className="relative h-11 w-11">
            <button
              type="button"
              onClick={searchOpen ? closeSearch : openSearch}
              className="header-icon-button grid h-11 w-11 place-items-center rounded-xl border border-[#d8dee7] bg-white text-[#1f2c41] transition-colors hover:border-[#02629f]/40 hover:text-[#02629f]"
              aria-label="Найти ответ"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
            {searchMounted && (
            <form
              onSubmit={submitSearch}
              className={`motion-search-panel absolute right-0 top-full z-50 mt-3 flex h-12 w-[min(22rem,calc(100vw-2rem))] items-center gap-2 rounded-xl border border-[#d8dee7] bg-white px-3 shadow-[0_18px_48px_rgba(31,44,65,.14)] transition-opacity duration-150 ${searchOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
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

        <a
          href={getPhoneHref(PARTNER_PHONE)}
          className="header-icon-button grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#d8dee7] bg-white text-[#ff2e32] transition-colors hover:border-[#02629f]/40 hover:text-[#02629f] xl:hidden"
          aria-label={`Горячая линия ${PARTNER_PHONE}`}
        >
          <Phone className="h-5 w-5" />
        </a>

        <button
          type="button"
          className="header-icon-button grid h-11 w-11 place-items-center rounded-xl border border-[#d8dee7] bg-white lg:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Мобильная навигация" className="header-mobile-panel motion-mobile-menu site-container grid gap-1 border-t border-[#d8dee7] py-3 lg:hidden">
          <a
            href={getPhoneHref(PARTNER_PHONE)}
            onClick={() => setOpen(false)}
            className="header-hotline mb-2 flex min-h-11 items-center gap-3 border-b border-[#d8dee7] px-3 py-3 text-[#1f2c41]"
            aria-label={`Горячая линия ${PARTNER_PHONE}`}
          >
            <Phone className="h-4 w-4 shrink-0" />
            <span className="text-sm font-extrabold tabular-nums">{PARTNER_PHONE}</span>
          </a>
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
