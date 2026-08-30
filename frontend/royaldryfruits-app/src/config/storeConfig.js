export const STORE_PHONE = import.meta.env.VITE_STORE_PHONE || '9014060329';
export const STORE_WHATSAPP = import.meta.env.VITE_STORE_WHATSAPP || STORE_PHONE;
export const STORE_EMAIL = import.meta.env.VITE_STORE_EMAIL || 'contact@royaldryfruits.com';
export const STORE_ADDRESS = import.meta.env.VITE_STORE_ADDRESS || 'Royal Dry Fruits Experience Store, Main Road, Pippara, Andhra Pradesh, India';
export const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Royal Dry Fruits';

/**
 * Returns formatted WhatsApp link with international country code (default: 91 for India)
 */
export function getWhatsAppLink(message = '', phone = STORE_WHATSAPP) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 
    ? cleanPhone 
    : `91${cleanPhone.replace(/^0+/, '')}`;
  
  if (!message) {
    return `https://wa.me/${fullPhone}`;
  }
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns displayable formatted phone number (+91 90140 60329)
 */
export function formatDisplayPhone(phone = STORE_PHONE) {
  const digits = String(phone).replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}
