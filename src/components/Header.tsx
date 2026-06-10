"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/pathways/vnzh", label: "ВНЖ" },
    { href: "/pathways/rvp", label: "РВП" },
    { href: "/pathways/citizenship", label: "Гражданство" },
    { href: "/tools/calculator", label: "Калькулятор шансов" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-200/40 dark:border-slate-800/30">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-slate-800 dark:from-primary-400 dark:to-slate-200 active:scale-95 transition-transform duration-100">
          Миграция РФ
        </Link>
        
        <nav className="hidden md:flex gap-8 text-sm font-semibold">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary-500 after:transition-all duration-300 ${
                  isActive 
                    ? "text-primary-500 after:w-full font-bold" 
                    : "text-slate-600 dark:text-slate-300 hover:text-primary-500 after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/tools/calculator" 
            className="hidden sm:inline-flex px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-sm active:scale-97 cursor-pointer"
          >
            Начать оценку
          </Link>
        </div>
      </div>
    </header>
  );
}

