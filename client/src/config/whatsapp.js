// ─────────────────────────────────────────────────────────────
//  WhatsApp business number — SINGLE SOURCE OF TRUTH
//
//  To change the WhatsApp number for the WHOLE site, edit ONLY
//  the value below. Use full international format: country code
//  + number, digits only (no +, no spaces, no leading 0).
//
//  Example: UK mobile 07960 695199  ->  '447960695199'
//
//  Leave it as an empty string ('') to hide the WhatsApp button
//  everywhere until you're ready.
// ─────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '447960695199';

// Message pre-filled when someone opens the chat (optional — set to '' for none).
export const WHATSAPP_DEFAULT_TEXT = "Hi A.L.S Trade, I'd like to make an enquiry.";

// Builds a WhatsApp click-to-chat link. Pass a custom message if you like.
export function whatsappLink(text = WHATSAPP_DEFAULT_TEXT) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
