import KundliForm from "@/components/astrology/KundliForm";

export const metadata = {
  title: "Kundali | ShraddhaSetu",
  description: "Generate Kundli online with birth details and view rashi, nakshatra, lagna, planets and houses."
};

export default function KundaliPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Kundali</h1>
          <p>Enter birth details to generate your Kundli with API-backed astrology data.</p>
        </div>
      </section>
      <KundliForm />
    </>
  );
}
