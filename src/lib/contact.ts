export const PARTNER_PHONE = process.env.NEXT_PUBLIC_PARTNER_PHONE || "8 (800) 350-84-13";

export function getPhoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("8")) {
    return `tel:+7${digits.slice(1)}`;
  }

  return `tel:${digits}`;
}
