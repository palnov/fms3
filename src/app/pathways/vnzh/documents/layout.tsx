import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Документы на ВНЖ в 2026 году: полный список',
  description: 'Какие документы нужны для ВНЖ: заявление, паспорт, перевод, доход, медицина и дополнительные подтверждения по основанию.',
  alternates: { canonical: '/pathways/vnzh/documents' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
