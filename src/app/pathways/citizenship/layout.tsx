import type { Metadata } from 'next';
import ArticleLayout from '@/components/mdx/ArticleLayout';

export const metadata: Metadata = {
  title: 'Как получить гражданство РФ в 2026 году',
  description: 'Общий и упрощённый порядок гражданства России: основания, документы, ФЗ-138, подача, присяга и причины отклонения.',
  alternates: { canonical: '/pathways/citizenship' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
