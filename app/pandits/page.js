import PanditsDirectory from "@/components/pandits/PanditsDirectory";
import { getPandits } from "@/lib/pandits";

export const metadata = {
  title: "Verified Pandits | ShraddhaSetu"
};

export default async function PanditsPage() {
  const pandits = getPandits();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Verified Pandits</h1>
          <p>Choose your own pandit for puja, havan and sanskar rituals.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <PanditsDirectory pandits={pandits} />
        </div>
      </section>
    </>
  );
}
