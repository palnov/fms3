import type { Metadata } from 'next';
import ArticleLayout from '@/components/mdx/ArticleLayout';

export const metadata: Metadata = {
  title: 'ВНЖ в России в 2026 году: как получить',
  description: 'Как получить вид на жительство в России: основания через РВП и без него, документы, сроки, подача и обязанности после выдачи.',
  alternates: { canonical: '/pathways/vnzh' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
