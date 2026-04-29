"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const steps = ["Select Puja", "Schedule", "Customer Details", "Choose Package", "Payment & Confirm"];

const packageOptions = [
  { id: "standard", name: "Standard", price: 0, note: "Pandit visit + core puja vidhi" },
  { id: "premium", name: "Premium", price: 1500, note: "Includes expanded ritual guidance and support" },
  { id: "temple", name: "Temple Ritual", price: 3000, note: "Extended jaap and additional sankalp support" }
];

export default function BookingFlow({ initialPuja = "", initialCity = "" }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    puja: "",
    city: "",
    date: "",
    time: "",
    language: "Hindi",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    packageId: "standard",
    paymentMode: "UPI"
  });

  useEffect(() => {
    async function loadData() {
      const [servicesRes, citiesRes] = await Promise.all([fetch("/api/services"), fetch("/api/cities")]);
      const [servicesData, citiesData] = await Promise.all([servicesRes.json(), citiesRes.json()]);
      const allServices = servicesData.services || [];
      const allCities = citiesData.cities || [];
      setServices(allServices);
      setCities(allCities);
      setForm((prev) => ({
        ...prev,
        puja: initialPuja || allServices[0]?.slug || "",
        city: initialCity || allCities[0]?.slug || ""
      }));
    }
    loadData().catch(() => setError("Unable to load booking options right now."));
  }, [initialPuja, initialCity]);

  const chosenPuja = useMemo(() => services.find((item) => item.slug === form.puja) || services[0], [form.puja, services]);
  const chosenPackage = useMemo(
    () => packageOptions.find((item) => item.id === form.packageId) || packageOptions[0],
    [form.packageId]
  );
  const totalAmount = (chosenPuja?.priceFrom || 0) + chosenPackage.price;

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const nextStep = () => setStep((prev) => Math.min(5, prev + 1));
  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const confirmBooking = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: form.puja,
          citySlug: form.city,
          date: form.date,
          time: form.time,
          language: form.language,
          address: form.address,
          packageName: chosenPackage.name,
          packagePrice: chosenPackage.price,
          notes: `Booked by ${form.fullName || "Customer"} | Phone: ${form.phone || "N/A"} | Email: ${form.email || "N/A"}`
        })
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        throw new Error(bookingData.error || "Booking failed.");
      }

      const paymentOrderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "BOOKING",
          entityId: bookingData.booking.id
        })
      });
      const paymentOrderData = await paymentOrderRes.json();
      if (!paymentOrderRes.ok) {
        throw new Error(paymentOrderData.error || "Payment initialization failed.");
      }

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentOrderData.paymentId,
          status: "paid"
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment confirmation failed.");
      }

      router.push(`/confirmation?bookingId=${bookingData.booking.bookingId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to complete booking.";
      if (message.toLowerCase().includes("login")) {
        router.push("/login?redirect=/booking");
        return;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!services.length || !cities.length) {
    return (
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">Loading booking options...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            {steps.map((label, index) => (
              <span
                key={label}
                className="step-pill"
                style={{
                  background: step >= index + 1 ? "#f9deb0" : "#fff8eb",
                  borderColor: step >= index + 1 ? "#ad6b1d" : "#d6b586"
                }}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {error && (
              <p style={{ color: "#991b1b", background: "#fee2e2", padding: "10px 12px", borderRadius: 10 }}>{error}</p>
            )}
            {step === 1 && (
              <>
                <h2>Select Puja</h2>
                <div className="form-grid">
                  <select value={form.puja} onChange={(event) => setValue("puja", event.target.value)}>
                    {services.map((puja) => (
                      <option key={puja.slug} value={puja.slug}>
                        {puja.title} (Rs {puja.priceFrom.toLocaleString("en-IN")} onwards)
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Select city, date and time</h2>
                <div className="form-grid">
                  <select value={form.city} onChange={(event) => setValue("city", event.target.value)}>
                    {cities.map((city) => (
                      <option key={city.id} value={city.slug}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <input type="date" value={form.date} onChange={(event) => setValue("date", event.target.value)} />
                  <input type="time" value={form.time} onChange={(event) => setValue("time", event.target.value)} />
                  <select value={form.language} onChange={(event) => setValue("language", event.target.value)}>
                    {(chosenPuja?.language || ["Hindi"]).map((language) => (
                      <option key={language}>{language}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2>Enter customer details</h2>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.fullName}
                    onChange={(event) => setValue("fullName", event.target.value)}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(event) => setValue("phone", event.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(event) => setValue("email", event.target.value)}
                  />
                  <textarea
                    placeholder="Puja location / address"
                    rows={4}
                    value={form.address}
                    onChange={(event) => setValue("address", event.target.value)}
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2>Choose package</h2>
                <div className="card-grid">
                  {packageOptions.map((option) => (
                    <article key={option.id} className="card">
                      <div className="card-body">
                        <h3 style={{ marginTop: 0 }}>{option.name}</h3>
                        <p>{option.note}</p>
                        <p>
                          Additional: <strong>Rs {option.price.toLocaleString("en-IN")}</strong>
                        </p>
                        <button
                          className={form.packageId === option.id ? "btn btn-primary" : "btn btn-outline"}
                          onClick={() => setValue("packageId", option.id)}
                        >
                          {form.packageId === option.id ? "Selected" : "Select Package"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <h2>Payment and confirmation</h2>
                <div className="form-grid">
                  <select value={form.paymentMode} onChange={(event) => setValue("paymentMode", event.target.value)}>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Net Banking</option>
                    <option>Cash on Service</option>
                  </select>
                </div>
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card-body">
                    <h3 style={{ marginTop: 0 }}>Booking Summary</h3>
                    <p>
                      <strong>Puja:</strong> {chosenPuja?.title}
                    </p>
                    <p>
                      <strong>City:</strong> {cities.find((city) => city.slug === form.city)?.name}
                    </p>
                    <p>
                      <strong>Date and Time:</strong> {form.date || "To be confirmed"} | {form.time || "TBC"}
                    </p>
                    <p>
                      <strong>Language:</strong> {form.language}
                    </p>
                    <p>
                      <strong>Package:</strong> {chosenPackage.name}
                    </p>
                    <p>
                      <strong>Total:</strong> Rs {totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="row" style={{ marginTop: 22 }}>
              {step > 1 && (
                <button className="btn btn-outline" onClick={prevStep} disabled={isSubmitting}>
                  Back
                </button>
              )}
              {step < 5 && (
                <button className="btn btn-primary" onClick={nextStep} disabled={isSubmitting}>
                  Continue
                </button>
              )}
              {step === 5 && (
                <button className="btn btn-primary" onClick={confirmBooking} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Pay and Confirm Booking"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
