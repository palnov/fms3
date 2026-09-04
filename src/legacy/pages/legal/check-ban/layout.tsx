import type { Metadata } from 'next';
import ArticleLayout from '@/components/mdx/ArticleLayout';

export const metadata: Metadata = {
  title: 'Как проверить запрет на въезд в Россию',
  description: 'Официальная проверка запрета на въезд через сервис МВД: основания ФЗ-114, запрос решения, срок ограничения и дальнейшие действия.',
  alternates: { canonical: '/legal/check-ban' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
