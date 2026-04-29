function buildWaMessage({ bookingId, pujaName, city, date, time, customerName, phone }) {
  return [
    "ShraddhaSetu Booking Alert",
    `Booking ID: ${bookingId}`,
    `Puja: ${pujaName}`,
    `City: ${city}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Customer: ${customerName}`,
    `Phone: ${phone}`
  ].join("\n");
}

export function getWhatsAppChatLink(message = "") {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_ADMIN_PHONE || "").replace(/\D/g, "");
  if (!phone) {
    return "https://wa.me/";
  }
  const encoded = encodeURIComponent(message || "Chat on WhatsApp");
  return `https://wa.me/${phone}?text=${encoded}`;
}

export async function sendWhatsAppNotification(payload) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  const message = buildWaMessage(payload);
  const fallbackLink = getWhatsAppChatLink(message);

  if (!apiUrl || !token) {
    return {
      sent: false,
      fallbackLink,
      reason: "WhatsApp API is not configured."
    };
  }

  const targets = [process.env.WHATSAPP_ADMIN_PHONE, payload.phone]
    .filter(Boolean)
    .map((item) => item.replace(/\D/g, ""))
    .filter(Boolean);

  if (!targets.length) {
    return {
      sent: false,
      fallbackLink,
      reason: "No WhatsApp target phone numbers available."
    };
  }

  const outcomes = [];
  for (const to of targets) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ to, message })
      });
      outcomes.push({ to, ok: response.ok, status: response.status });
    } catch (error) {
      outcomes.push({ to, ok: false, status: 0, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  return {
    sent: outcomes.some((item) => item.ok),
    fallbackLink,
    outcomes
  };
}
