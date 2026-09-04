import type { ComponentType } from "react";
import ArticleLayout from "@/components/mdx/ArticleLayout";

import HomePage from "@/legacy/pages/home/page";
import EditorialPolicyPage from "@/legacy/pages/editorial-policy/page";
import KartaSaytaPage from "@/legacy/pages/karta-sayta/page";
import PathwaysPage from "@/legacy/pages/pathways/page";
import PrivacyPage from "@/legacy/pages/privacy/page";
import CheckBanPage from "@/legacy/pages/legal/check-ban/page.mdx";
import ControlledPersonsPage from "@/legacy/pages/legal/controlled-persons-register/page.mdx";
import ControlledPersonsRemovalPage from "@/legacy/pages/legal/controlled-persons-register/removal/page.mdx";
import DeportationPage from "@/legacy/pages/legal/deportation/page.mdx";
import LiftBanPage from "@/legacy/pages/legal/lift-ban/page.mdx";
import RegistrationExpiredPage from "@/legacy/pages/legal/registration-expired/page.mdx";
import RegistrationPage from "@/legacy/pages/legal/registration/page.mdx";
import MmcSaharovoPage from "@/legacy/pages/mmc-saharovo/page.mdx";
import CitizenshipBelarusPage from "@/legacy/pages/pathways/citizenship/belarus/page.mdx";
import CitizenshipNewLawPage from "@/legacy/pages/pathways/citizenship/new-law/page.mdx";
import CitizenshipOathPage from "@/legacy/pages/pathways/citizenship/oath/page.mdx";
import CitizenshipPage from "@/legacy/pages/pathways/citizenship/page.mdx";
import CitizenshipSimplifiedPage from "@/legacy/pages/pathways/citizenship/simplified/page.mdx";
import RepatriationPage from "@/legacy/pages/pathways/repatriation/page.mdx";
import RvpAfterReceivingPage from "@/legacy/pages/pathways/rvp/after-receiving/page.mdx";
import RvpApplicationFormPage from "@/legacy/pages/pathways/rvp/application-form/page.mdx";
import RvpMarriagePage from "@/legacy/pages/pathways/rvp/marriage/page.mdx";
import RvpMedicalExamPage from "@/legacy/pages/pathways/rvp/medical-exam/page.mdx";
import RvpNotificationPage from "@/legacy/pages/pathways/rvp/notification/page.mdx";
import RvpPage from "@/legacy/pages/pathways/rvp/page.mdx";
import RvpQuotaPage from "@/legacy/pages/pathways/rvp/quota/page.mdx";
import RvpoPage from "@/legacy/pages/pathways/rvpo/page.mdx";
import VnzhAfterReceivingPage from "@/legacy/pages/pathways/vnzh/after-receiving/page.mdx";
import VnzhByMarriagePage from "@/legacy/pages/pathways/vnzh/by-marriage/page.mdx";
import VnzhDocumentsPage from "@/legacy/pages/pathways/vnzh/documents/page.mdx";
import VnzhKazakhstanPage from "@/legacy/pages/pathways/vnzh/kazakhstan/page.mdx";
import VnzhNotificationPage from "@/legacy/pages/pathways/vnzh/notification/page.mdx";
import VnzhPage from "@/legacy/pages/pathways/vnzh/page.mdx";
import VnzhReplacementPage from "@/legacy/pages/pathways/vnzh/replacement/page.mdx";
import VnzhStatusCheckPage from "@/legacy/pages/pathways/vnzh/status-check/page.mdx";
import VnzhWithoutRvpPage from "@/legacy/pages/pathways/vnzh/without-rvp/page.mdx";
import EmployerNotificationPage from "@/legacy/pages/pathways/work/employer-notification/page.mdx";
import EmploymentContractPage from "@/legacy/pages/pathways/work/employment-contract/page.mdx";
import InnPage from "@/legacy/pages/pathways/work/inn/page.mdx";
import PatentEmploymentNoticePage from "@/legacy/pages/pathways/work/patent/employment-notice/page.mdx";
import PatentPage from "@/legacy/pages/pathways/work/patent/page.mdx";
import PatentPaymentPage from "@/legacy/pages/pathways/work/patent/payment/page.mdx";
import VksPage from "@/legacy/pages/pathways/work/vks/page.mdx";
import PoVoprosamMigraciiPage from "@/legacy/pages/po-voprosam-migracii/page.mdx";
import AiConsultantPage from "@/legacy/pages/tools/ai-consultant/page";
import CalculatorsPage from "@/legacy/pages/tools/calculators/page";
import CheckCitizenshipPage from "@/legacy/pages/tools/check-citizenship/page";
import CheckPassportPage from "@/legacy/pages/tools/check-passport/page";
import CheckPatentPage from "@/legacy/pages/tools/check-patent/page";
import CheckRvpPage from "@/legacy/pages/tools/check-rvp/page";
import CheckVnzhPage from "@/legacy/pages/tools/check-vnzh/page";
import ChecklistGeneratorPage from "@/legacy/pages/tools/checklist-generator/page";
import DocumentCheckPage from "@/legacy/pages/tools/document-check/page";
import PathFinderPage from "@/legacy/pages/tools/path-finder/page";

export type LegacyPageShell = "home" | "plain" | "article" | "tool";

export type LegacyPageEntry = {
  component: ComponentType;
  shell: LegacyPageShell;
};

export const LEGACY_PAGE_MAP: Record<string, LegacyPageEntry> = {
  "/": { component: HomePage, shell: "home" },
  "/editorial-policy": { component: EditorialPolicyPage, shell: "plain" },
  "/karta-sayta": { component: KartaSaytaPage, shell: "plain" },
  "/pathways": { component: PathwaysPage, shell: "plain" },
  "/privacy": { component: PrivacyPage, shell: "plain" },
  "/legal/check-ban": { component: CheckBanPage, shell: "article" },
  "/legal/controlled-persons-register": { component: ControlledPersonsPage, shell: "article" },
  "/legal/controlled-persons-register/removal": { component: ControlledPersonsRemovalPage, shell: "article" },
  "/legal/deportation": { component: DeportationPage, shell: "article" },
  "/legal/lift-ban": { component: LiftBanPage, shell: "article" },
  "/legal/registration-expired": { component: RegistrationExpiredPage, shell: "article" },
  "/legal/registration": { component: RegistrationPage, shell: "article" },
  "/mmc-saharovo": { component: MmcSaharovoPage, shell: "article" },
  "/pathways/citizenship/belarus": { component: CitizenshipBelarusPage, shell: "article" },
  "/pathways/citizenship/new-law": { component: CitizenshipNewLawPage, shell: "article" },
  "/pathways/citizenship/oath": { component: CitizenshipOathPage, shell: "article" },
  "/pathways/citizenship": { component: CitizenshipPage, shell: "article" },
  "/pathways/citizenship/simplified": { component: CitizenshipSimplifiedPage, shell: "article" },
  "/pathways/repatriation": { component: RepatriationPage, shell: "article" },
  "/pathways/rvp/after-receiving": { component: RvpAfterReceivingPage, shell: "article" },
  "/pathways/rvp/application-form": { component: RvpApplicationFormPage, shell: "article" },
  "/pathways/rvp/marriage": { component: RvpMarriagePage, shell: "article" },
  "/pathways/rvp/medical-exam": { component: RvpMedicalExamPage, shell: "article" },
  "/pathways/rvp/notification": { component: RvpNotificationPage, shell: "article" },
  "/pathways/rvp": { component: RvpPage, shell: "article" },
  "/pathways/rvp/quota": { component: RvpQuotaPage, shell: "article" },
  "/pathways/rvpo": { component: RvpoPage, shell: "article" },
  "/pathways/vnzh/after-receiving": { component: VnzhAfterReceivingPage, shell: "article" },
  "/pathways/vnzh/by-marriage": { component: VnzhByMarriagePage, shell: "article" },
  "/pathways/vnzh/documents": { component: VnzhDocumentsPage, shell: "article" },
  "/pathways/vnzh/kazakhstan": { component: VnzhKazakhstanPage, shell: "article" },
  "/pathways/vnzh/notification": { component: VnzhNotificationPage, shell: "article" },
  "/pathways/vnzh": { component: VnzhPage, shell: "article" },
  "/pathways/vnzh/replacement": { component: VnzhReplacementPage, shell: "article" },
  "/pathways/vnzh/status-check": { component: VnzhStatusCheckPage, shell: "article" },
  "/pathways/vnzh/without-rvp": { component: VnzhWithoutRvpPage, shell: "article" },
  "/pathways/work/employer-notification": { component: EmployerNotificationPage, shell: "article" },
  "/pathways/work/employment-contract": { component: EmploymentContractPage, shell: "article" },
  "/pathways/work/inn": { component: InnPage, shell: "article" },
  "/pathways/work/patent/employment-notice": { component: PatentEmploymentNoticePage, shell: "article" },
  "/pathways/work/patent": { component: PatentPage, shell: "article" },
  "/pathways/work/patent/payment": { component: PatentPaymentPage, shell: "article" },
  "/pathways/work/vks": { component: VksPage, shell: "article" },
  "/po-voprosam-migracii": { component: PoVoprosamMigraciiPage, shell: "article" },
  "/tools/ai-consultant": { component: AiConsultantPage, shell: "tool" },
  "/tools/calculators": { component: CalculatorsPage, shell: "tool" },
  "/tools/check-citizenship": { component: CheckCitizenshipPage, shell: "tool" },
  "/tools/check-passport": { component: CheckPassportPage, shell: "tool" },
  "/tools/check-patent": { component: CheckPatentPage, shell: "tool" },
  "/tools/check-rvp": { component: CheckRvpPage, shell: "tool" },
  "/tools/check-vnzh": { component: CheckVnzhPage, shell: "tool" },
  "/tools/checklist-generator": { component: ChecklistGeneratorPage, shell: "tool" },
  "/tools/document-check": { component: DocumentCheckPage, shell: "tool" },
  "/tools/path-finder": { component: PathFinderPage, shell: "tool" },
};

export function LegacyPage({ path }: { path: string }) {
  const entry = LEGACY_PAGE_MAP[path];
  if (!entry) return null;

  const Page = entry.component;
  if (entry.shell === "article") {
    return <ArticleLayout><Page /></ArticleLayout>;
  }
  if (entry.shell === "tool") {
    return <div className="tool-page"><Page /></div>;
  }
  return <Page />;
}
