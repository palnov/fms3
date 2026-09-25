export const PARTNER_PHONE = "8 (800) 700-27-36";

export function getPhoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("8")) {
    return `tel:+7${digits.slice(1)}`;
  }

  return `tel:${digits}`;
}
