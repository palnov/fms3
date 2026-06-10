import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вид на жительство (ВНЖ) в России 2026: как получить без РВП, список документов',
  description: 'Подробное руководство по оформлению ВНЖ в РФ в 2026 году. Кто имеет право получить ВНЖ без РВП (Республика Беларусь, Казахстан, Молдова, брак с детьми), размер госпошлины и сроки.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
