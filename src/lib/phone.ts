/**
 * Normalise a phone number to international digits for WhatsApp (no "+").
 * Lebanese local numbers (e.g. "70 123 456", "03 123 456") get the 961 prefix.
 */
export function toWhatsAppNumber(raw: string, defaultCountry = "961"): string | null {
  let d = raw.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith(defaultCountry)) {
    /* already international */
  } else if (d.startsWith("0")) d = defaultCountry + d.slice(1);
  else if (d.length <= 8) d = defaultCountry + d;
  return d.length >= 10 && d.length <= 15 ? d : null;
}
