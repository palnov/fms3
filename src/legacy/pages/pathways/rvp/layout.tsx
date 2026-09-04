import type { Metadata } from 'next';
import ArticleLayout from '@/components/mdx/ArticleLayout';

export const metadata: Metadata = {
  title: 'РВП в России в 2026 году: как получить',
  description: 'Как получить РВП по квоте и без неё: основания, документы, заявление, медкомиссия, подача и обязанности после выдачи.',
  alternates: { canonical: '/pathways/rvp' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
