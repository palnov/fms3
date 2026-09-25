export const PARTNER_PHONE = "8 (800) 700-27-36";
const PREVIOUS_PARTNER_PHONE_DIGITS = "88003508413";

export function resolvePartnerPhone(configuredPhone?: string | null) {
  if (!configuredPhone) return PARTNER_PHONE;

  return configuredPhone.replace(/\D/g, "") === PREVIOUS_PARTNER_PHONE_DIGITS
    ? PARTNER_PHONE
    : configuredPhone;
}

export function getPhoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("8")) {
    return `tel:+7${digits.slice(1)}`;
  }

  return `tel:${digits}`;
}
