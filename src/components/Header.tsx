"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);

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

        <Link
          href="/tools/ai-consultant"
          className="hidden min-h-11 items-center gap-2 rounded-xl border border-[#d8dee7] bg-white px-4 text-sm font-bold text-[#1f2c41] transition-colors hover:border-[#02629f]/40 hover:text-[#02629f] sm:inline-flex"
        >
          <Search className="h-4 w-4" />
          Найти ответ
        </Link>

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
        <nav aria-label="Мобильная навигация" className="site-container grid gap-1 border-t border-[#d8dee7] py-3 lg:hidden">
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
          <Link href="/tools/ai-consultant" onClick={() => setOpen(false)} className="button-primary mt-2">
            Задать вопрос справочнику
          </Link>
        </nav>
      )}
    </header>
  );
}
