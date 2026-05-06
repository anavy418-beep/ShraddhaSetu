export default function WhatsAppButton() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
  const message = encodeURIComponent("Hi ShraddhaSetu, I want to book a puja");
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#25D366",
        color: "white",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        textDecoration: "none",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
      }}
    >
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.1-.2.2-.4.2-.8 0-.3-.2-1.3-.5-2.4-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.6.2-.2.2-.3.3-.6.1-.2 0-.5 0-.7 0-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.3 3.2 1.5 3.4c.2.2 2.5 3.8 6 5.2.8.4 1.5.6 2 .7.8.2 1.6.2 2.2.1.7-.1 1.8-.8 2.1-1.5.3-.8.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z" />
        <path d="M20.4 3.6A11.8 11.8 0 0 0 1.6 17.5L0 24l6.7-1.8A11.8 11.8 0 0 0 24 12c0-3.1-1.2-6.1-3.6-8.4zM12 21.6c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.9 1 1-3.8-.2-.4A9.6 9.6 0 1 1 12 21.6z" />
      </svg>
    </a>
  );
}
