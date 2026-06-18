import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ВНЖ по браку в России в 2026 году',
  description: 'Когда брак позволяет получить ВНЖ, нужен ли этап РВП, какие документы подтверждают семейное основание и как проходит проверка.',
  alternates: { canonical: '/pathways/vnzh/by-marriage' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
