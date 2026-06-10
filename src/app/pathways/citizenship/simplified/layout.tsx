import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Упрощенное гражданство РФ 2026: основания и условия',
  description: 'Как получить гражданство Российской Федерации в упрощенном порядке по новому ФЗ-138 «О гражданстве РФ». Категории граждан и требования.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
