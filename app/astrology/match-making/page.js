import MatchMakingForm from "@/components/astrology/MatchMakingForm";

export const metadata = {
  title: "Match Making | ShraddhaSetu"
};

export default function MatchMakingPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Match Making</h1>
          <p>Compare kundali details with simple form-based inputs.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <MatchMakingForm />
        </div>
      </section>
    </>
  );
}
