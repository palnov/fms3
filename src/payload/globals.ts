import type { GlobalConfig } from "payload";
import { canAccessAdmin, canEditContent } from "./access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  access: { read: () => true, readVersions: canAccessAdmin, update: canEditContent },
  versions: { drafts: true, max: 10 },
  fields: [
    { name: "siteName", type: "text", required: true, label: "Название сайта" },
    { name: "siteDescription", type: "textarea", required: true, label: "Описание сайта" },
    { name: "siteUrl", type: "text", required: true, label: "Основной URL" },
    { name: "defaultTitle", type: "text", required: true, label: "Заголовок по умолчанию" },
    { name: "defaultDescription", type: "textarea", required: true, label: "Описание по умолчанию" },
    { name: "partnerPhone", type: "text", label: "Телефон партнёра" },
    { name: "organizationName", type: "text", label: "Название организации" },
    { name: "organizationDescription", type: "textarea", label: "Описание организации" },
    { name: "defaultOgImage", type: "upload", relationTo: "media", label: "OG-изображение по умолчанию" },
  ],
};
