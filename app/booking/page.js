import BookingFlow from "@/components/BookingFlow";
import { getPanditBySlug } from "@/lib/pandits";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book Now | ShraddhaSetu"
};

export default async function BookingPage({ searchParams }) {
  const params = await searchParams;
  const initialPuja = params?.puja || "";
  const initialCity = params?.city || "";
  const initialMode = params?.mode || "";
  const initialPackage = params?.package || "";
  const initialPandit = params?.pandit || "";
  const selectedPandit = initialPandit ? getPanditBySlug(initialPandit) : null;
  const isEPujaMode = initialMode === "e-puja";

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>{isEPujaMode ? "Book E-Puja" : "Book a Pandit"}</h1>
          <p>
            {isEPujaMode
              ? "Fill Sankalp and online puja details to confirm your E-Puja booking."
              : "Complete your booking in 5 steps with transparent pricing."}
          </p>
        </div>
      </section>
      <BookingFlow
        initialPuja={initialPuja}
        initialCity={initialCity}
        initialMode={initialMode}
        initialPackage={initialPackage}
        selectedPanditName={selectedPandit?.name || ""}
        showEPujaGuidance={isEPujaMode}
        hasInitialPackageQuery={Boolean(initialPackage)}
      />
    </>
  );
}
