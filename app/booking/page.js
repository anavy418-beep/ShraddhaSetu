import BookingFlow from "@/components/BookingFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book Now | ShraddhaSetu"
};

export default async function BookingPage({ searchParams }) {
  const params = await searchParams;
  const initialPuja = params?.puja || "";
  const initialCity = params?.city || "";

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Book a Pandit</h1>
          <p>Complete your booking in 5 steps with transparent pricing.</p>
        </div>
      </section>
      <BookingFlow initialPuja={initialPuja} initialCity={initialCity} />
    </>
  );
}
