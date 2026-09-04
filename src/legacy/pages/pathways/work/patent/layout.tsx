import type { Metadata } from 'next';
import ArticleLayout from '@/components/mdx/ArticleLayout';

export const metadata: Metadata = {
  title: 'Патент на работу в России в 2026 году',
  description: 'Как оформить патент иностранному гражданину: сроки, документы, медкомиссия, экзамен, регион работы и ежемесячная оплата.',
  alternates: { canonical: '/pathways/work/patent' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
