import type { Metadata } from 'next';
import ArticleLayout from '@/components/mdx/ArticleLayout';

export const metadata: Metadata = {
  title: 'Программа переселения соотечественников 2026',
  description: 'Как участвовать в программе переселения в Россию: выбор региона, документы, этапы, выплаты, РВП и гражданство.',
  alternates: { canonical: '/pathways/repatriation' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
