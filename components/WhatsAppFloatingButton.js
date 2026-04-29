import { getWhatsAppChatLink } from "@/lib/whatsapp";

export default function WhatsAppFloatingButton() {
  const link = getWhatsAppChatLink("Namaste, I want help with ShraddhaSetu booking.");

  return (
    <a href={link} target="_blank" rel="noreferrer" className="wa-fab" aria-label="Chat on WhatsApp">
      Chat on WhatsApp
    </a>
  );
}
