import type { MDXComponents } from 'mdx/types'
import ConsultationBanner from '@/components/mdx/ConsultationBanner'
import {
  ArticleMeta,
  FaqAccordion,
  LegalSource,
  Notice,
  QuickAnswer,
  RelatedGuide,
  Warning,
} from '@/components/mdx/ContentBlocks'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ArticleMeta,
    ConsultationBanner,
    FaqAccordion,
    LegalSource,
    Notice,
    QuickAnswer,
    RelatedGuide,
    Warning,
    ...components,
  }
}
