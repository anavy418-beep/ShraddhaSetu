import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shraddhasetu.in";

export const metadata = {
  title: "ShraddhaSetu | Book Verified Pandits Online",
  description:
    "ShraddhaSetu is a premium online platform to book verified pandits for pooja, havan, sanskar and e-puja across India.",
  icons: {
    icon: "/images/brand/shraddha-setu-icon.png",
    shortcut: "/images/brand/shraddha-setu-icon.png",
    apple: "/images/brand/shraddha-setu-icon.png"
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "ShraddhaSetu",
    description: "Book verified pandits online for pooja, havan and sanskar across India.",
    url: siteUrl,
    siteName: "ShraddhaSetu",
    locale: "en_IN",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
