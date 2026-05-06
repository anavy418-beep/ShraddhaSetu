"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

const steps = ["Select Puja", "Schedule", "Customer Details", "Choose Package", "Payment & Confirm"];

const standardPackageOptions = [
  { id: "standard", name: "Standard", price: 0, note: "Pandit visit + core puja vidhi" },
  { id: "premium", name: "Premium", price: 1500, note: "Includes expanded ritual guidance and support" },
  { id: "temple", name: "Temple Ritual", price: 3000, note: "Extended jaap and additional sankalp support" }
];

const ePujaPackageOptions = [
  { id: "basic", name: "Basic E-Puja", price: 499, note: "Online sankalp and digital confirmation." },
  {
    id: "standard",
    name: "Standard E-Puja",
    price: 999,
    note: "Live video puja, sankalp by pandit and WhatsApp coordination."
  },
  {
    id: "premium",
    name: "Premium E-Puja",
    price: 1499,
    note: "Live video puja, prasad delivery support and priority scheduling."
  }
];

const isValidEPujaPackage = (packageId) => ePujaPackageOptions.some((item) => item.id === packageId);
const isValidStandardPackage = (packageId) => standardPackageOptions.some((item) => item.id === packageId);

export default function BookingFlow({
  initialPuja = "",
  initialCity = "",
  initialMode = "",
  initialPackage = "",
  selectedPanditName = "",
  showEPujaGuidance = false,
  hasInitialPackageQuery = false
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    puja: "",
    city: "",
    pujaMode: "AT_HOME",
    date: "",
    time: "",
    language: "Hindi",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    packageId: "standard",
    devoteeName: "",
    gotra: "",
    sankalpPurpose: "",
    whatsappNumber: "",
    prasadDeliveryRequired: "NO",
    deliveryAddress: "",
    paymentMode: "UPI",
    paymentOption: "ADVANCE"
  });

  useEffect(() => {
    async function loadData() {
      const [servicesRes, citiesRes] = await Promise.all([fetch("/api/services"), fetch("/api/cities")]);
      const [servicesData, citiesData] = await Promise.all([servicesRes.json(), citiesRes.json()]);
      const allServices = servicesData.services || [];
      const allCities = citiesData.cities || [];
      const requestedMode = initialMode === "e-puja" ? "ONLINE_E_PUJA" : "AT_HOME";
      const requestedPackage =
        requestedMode === "ONLINE_E_PUJA" && isValidEPujaPackage(initialPackage) ? initialPackage : "standard";
      setServices(allServices);
      setCities(allCities);
      setForm((prev) => ({
        ...prev,
        puja: initialPuja || allServices[0]?.slug || "",
        city: initialCity || allCities[0]?.slug || "",
        pujaMode: requestedMode,
        packageId: requestedPackage
      }));
    }
    loadData().catch(() => setError("Unable to load booking options right now."));
  }, [initialPuja, initialCity, initialMode, initialPackage]);

  const chosenPuja = useMemo(() => services.find((item) => item.slug === form.puja) || services[0], [form.puja, services]);
  const isOnlineEPuja = form.pujaMode === "ONLINE_E_PUJA";
  const activePackageOptions = isOnlineEPuja ? ePujaPackageOptions : standardPackageOptions;

  useEffect(() => {
    setForm((prev) => {
      if (prev.pujaMode === "ONLINE_E_PUJA" && !isValidEPujaPackage(prev.packageId)) {
        return { ...prev, packageId: isValidEPujaPackage(initialPackage) ? initialPackage : "standard" };
      }
      if (prev.pujaMode !== "ONLINE_E_PUJA" && !isValidStandardPackage(prev.packageId)) {
        return { ...prev, packageId: "standard" };
      }
      return prev;
    });
  }, [form.pujaMode, form.packageId, initialPackage]);

  const chosenPackage = useMemo(
    () => activePackageOptions.find((item) => item.id === form.packageId) || activePackageOptions[0],
    [activePackageOptions, form.packageId]
  );
  const totalAmount = (chosenPuja?.priceFrom || 0) + chosenPackage.price;
  const advanceAmount = Math.min(totalAmount, Math.max(501, Math.round(totalAmount * 0.3)));
  const payableAmount = form.paymentOption === "ADVANCE" ? advanceAmount : totalAmount;

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setValidationError("");
  };

  const getFieldErrorStyle = (key) =>
    fieldErrors[key]
      ? {
          borderColor: "#dc2626",
          background: "#fff7f7"
        }
      : {};

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValidPhone = (value) => String(value || "").replace(/\D/g, "").length >= 10;

  const validateStepTwo = () => {
    const nextErrors = {};

    if (!form.pujaMode) nextErrors.pujaMode = "Please select puja mode.";
    if (!form.city) nextErrors.city = "Please select city.";
    if (!form.date) nextErrors.date = "Please select date.";
    if (!form.time) nextErrors.time = "Please select time.";
    if (!form.language) nextErrors.language = "Please select language.";

    if (Object.keys(nextErrors).length) {
      setFieldErrors((prev) => ({ ...prev, ...nextErrors }));
      setValidationError("Please select date and time before continuing.");
      return false;
    }
    return true;
  };

  const validateStepThree = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Please enter full name.";
    if (!form.email.trim()) {
      nextErrors.email = "Please enter email address.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!isOnlineEPuja) {
      if (!form.phone.trim()) {
        nextErrors.phone = "Please enter phone number.";
      } else if (!hasValidPhone(form.phone)) {
        nextErrors.phone = "Please enter a valid phone number.";
      }
      if (!form.address.trim()) nextErrors.address = "Please enter puja location/address.";
    } else {
      if (!form.devoteeName.trim()) nextErrors.devoteeName = "Please enter devotee name.";
      if (!form.whatsappNumber.trim()) {
        nextErrors.whatsappNumber = "Please enter WhatsApp number.";
      } else if (!hasValidPhone(form.whatsappNumber)) {
        nextErrors.whatsappNumber = "Please enter a valid phone number.";
      }
      if (form.prasadDeliveryRequired === "YES" && !form.deliveryAddress.trim()) {
        nextErrors.deliveryAddress = "Please enter delivery address.";
      }
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors((prev) => ({ ...prev, ...nextErrors }));
      setValidationError("Please fill all customer details before continuing.");
      return false;
    }
    return true;
  };

  const nextStep = () => setStep((prev) => Math.min(5, prev + 1));
  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const onContinue = () => {
    if (step === 2 && !validateStepTwo()) {
      return;
    }
    if (step === 3 && !validateStepThree()) {
      return;
    }
    setValidationError("");
    nextStep();
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    try {
      const bookingAddress = isOnlineEPuja
        ? form.prasadDeliveryRequired === "YES"
          ? form.deliveryAddress || "Online E-Puja"
          : "Online E-Puja"
        : form.address;

      const ePujaDetails = isOnlineEPuja
        ? {
            devoteeName: form.devoteeName || form.fullName,
            gotra: form.gotra,
            sankalpPurpose: form.sankalpPurpose,
            preferredDate: form.date,
            preferredTime: form.time,
            whatsappNumber: form.whatsappNumber || form.phone,
            email: form.email,
            prasadDeliveryRequired: form.prasadDeliveryRequired === "YES",
            deliveryAddress: form.prasadDeliveryRequired === "YES" ? form.deliveryAddress : ""
          }
        : null;

      const notes = isOnlineEPuja
        ? [
            `Mode: Online E-Puja`,
            `Selected Pandit: ${selectedPanditName || "Auto Assign"}`,
            `Devotee: ${ePujaDetails?.devoteeName || "N/A"}`,
            `Gotra: ${ePujaDetails?.gotra || "N/A"}`,
            `Sankalp: ${ePujaDetails?.sankalpPurpose || "N/A"}`,
            `WhatsApp: ${ePujaDetails?.whatsappNumber || "N/A"}`,
            `Email: ${ePujaDetails?.email || "N/A"}`,
            `Prasad Delivery: ${ePujaDetails?.prasadDeliveryRequired ? "Yes" : "No"}`,
            `Delivery Address: ${ePujaDetails?.deliveryAddress || "N/A"}`
          ].join(" | ")
        : `Booked by ${form.fullName || "Customer"} | Phone: ${form.phone || "N/A"} | Email: ${form.email || "N/A"} | Selected Pandit: ${selectedPanditName || "Auto Assign"}`;

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: form.puja,
          citySlug: form.city,
          date: form.date,
          time: form.time,
          language: form.language,
          address: bookingAddress,
          packageName: chosenPackage.name,
          packagePrice: chosenPackage.price,
          customerName: isOnlineEPuja ? form.devoteeName || form.fullName : form.fullName,
          customerPhone: isOnlineEPuja ? form.whatsappNumber || form.phone : form.phone,
          customerEmail: form.email,
          pujaMode: form.pujaMode,
          ePujaPackage: isOnlineEPuja ? form.packageId : null,
          ePujaDetails,
          notes
        })
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        throw new Error(bookingData.error || "Booking failed.");
      }
      setSuccessMessage("Booking created successfully. Opening payment gateway...");

      const paymentOrderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "BOOKING",
          entityId: bookingData.booking.id,
          paymentOption: form.paymentOption,
          paymentMethod: form.paymentMode
        })
      });
      const paymentOrderData = await paymentOrderRes.json();
      if (!paymentOrderRes.ok) {
        throw new Error(paymentOrderData.error || "Payment initialization failed.");
      }

      await openRazorpayCheckout({
        orderConfig: paymentOrderData.razorpay,
        onSuccess: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: paymentOrderData.paymentId,
                status: "paid",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment confirmation failed.");
            }
            router.push(`/confirmation?bookingId=${bookingData.booking.bookingId}`);
          } catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : "Payment confirmation failed.");
            router.push(`/payment-failure?bookingId=${bookingData.booking.bookingId}`);
          }
        },
        onFailure: async () => {
          await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: paymentOrderData.paymentId,
              status: "failed"
            })
          });
          router.push(`/payment-failure?bookingId=${bookingData.booking.bookingId}`);
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to complete booking.";
      if (message.toLowerCase().includes("login")) {
        router.push("/login?redirect=/booking");
        return;
      }
      setError(message);
      setSuccessMessage("");
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
            {selectedPanditName ? (
              <div
                style={{
                  marginTop: 12,
                  background: "#fff8eb",
                  border: "1px solid #ecd8ba",
                  borderRadius: 12,
                  padding: "10px 12px",
                  color: "#4d2d1a",
                  fontWeight: 700
                }}
              >
                Selected Pandit: {selectedPanditName}
              </div>
            ) : null}
            {showEPujaGuidance && isOnlineEPuja ? (
              <div
                style={{
                  marginTop: 14,
                  background: "#fff5e5",
                  border: "1px solid #f2d4a1",
                  borderRadius: 12,
                  padding: "10px 12px",
                  color: "#6f5b4d",
                  fontWeight: 600
                }}
              >
                After booking, our team will confirm your slot and share live puja joining details on WhatsApp/Email.
              </div>
            ) : null}
            {showEPujaGuidance && hasInitialPackageQuery && isOnlineEPuja ? (
              <div
                style={{
                  marginTop: 10,
                  background: "#fffdf8",
                  border: "1px solid #eadcc8",
                  borderRadius: 12,
                  padding: "10px 12px",
                  color: "#4d2d1a",
                  fontWeight: 700
                }}
              >
                Selected Package: {chosenPackage.name} - Rs {chosenPackage.price.toLocaleString("en-IN")}
              </div>
            ) : null}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {error && (
              <p style={{ color: "#991b1b", background: "#fee2e2", padding: "10px 12px", borderRadius: 10 }}>{error}</p>
            )}
            {validationError && (
              <p style={{ color: "#991b1b", background: "#fee2e2", padding: "10px 12px", borderRadius: 10 }}>
                {validationError}
              </p>
            )}
            {successMessage && (
              <p style={{ color: "#166534", background: "#dcfce7", padding: "10px 12px", borderRadius: 10 }}>
                {successMessage}
              </p>
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
                  <div>
                    <select
                      value={form.pujaMode}
                      onChange={(event) => setValue("pujaMode", event.target.value)}
                      style={getFieldErrorStyle("pujaMode")}
                    >
                      <option value="AT_HOME">At Home</option>
                      <option value="AT_TEMPLE">At Temple</option>
                      <option value="ONLINE_E_PUJA">Online E-Puja</option>
                    </select>
                    {fieldErrors.pujaMode ? <p className="field-error">{fieldErrors.pujaMode}</p> : null}
                  </div>
                  <div>
                    <select value={form.city} onChange={(event) => setValue("city", event.target.value)} style={getFieldErrorStyle("city")}>
                      {cities.map((city) => (
                        <option key={city.id} value={city.slug}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.city ? <p className="field-error">{fieldErrors.city}</p> : null}
                  </div>
                  <div>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) => setValue("date", event.target.value)}
                      style={getFieldErrorStyle("date")}
                    />
                    {fieldErrors.date ? <p className="field-error">{fieldErrors.date}</p> : null}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(event) => setValue("time", event.target.value)}
                      style={getFieldErrorStyle("time")}
                    />
                    {fieldErrors.time ? <p className="field-error">{fieldErrors.time}</p> : null}
                  </div>
                  <div>
                    <select
                      value={form.language}
                      onChange={(event) => setValue("language", event.target.value)}
                      style={getFieldErrorStyle("language")}
                    >
                      {(chosenPuja?.language || ["Hindi"]).map((language) => (
                        <option key={language}>{language}</option>
                      ))}
                    </select>
                    {fieldErrors.language ? <p className="field-error">{fieldErrors.language}</p> : null}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2>Enter customer details</h2>
                {!isOnlineEPuja ? (
                  <div className="form-grid">
                    <div>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={form.fullName}
                        onChange={(event) => setValue("fullName", event.target.value)}
                        style={getFieldErrorStyle("fullName")}
                      />
                      {fieldErrors.fullName ? <p className="field-error">{fieldErrors.fullName}</p> : null}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={(event) => setValue("phone", event.target.value)}
                        style={getFieldErrorStyle("phone")}
                      />
                      {fieldErrors.phone ? <p className="field-error">{fieldErrors.phone}</p> : null}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={(event) => setValue("email", event.target.value)}
                        style={getFieldErrorStyle("email")}
                      />
                      {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
                    </div>
                    <div>
                      <textarea
                        placeholder="Puja location / address"
                        rows={4}
                        value={form.address}
                        onChange={(event) => setValue("address", event.target.value)}
                        style={getFieldErrorStyle("address")}
                      />
                      {fieldErrors.address ? <p className="field-error">{fieldErrors.address}</p> : null}
                    </div>
                  </div>
                ) : (
                  <div className="form-grid">
                    <div>
                      <input
                        type="text"
                        placeholder="Primary contact name"
                        value={form.fullName}
                        onChange={(event) => setValue("fullName", event.target.value)}
                        style={getFieldErrorStyle("fullName")}
                      />
                      {fieldErrors.fullName ? <p className="field-error">{fieldErrors.fullName}</p> : null}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Devotee name"
                        value={form.devoteeName}
                        onChange={(event) => setValue("devoteeName", event.target.value)}
                        style={getFieldErrorStyle("devoteeName")}
                      />
                      {fieldErrors.devoteeName ? <p className="field-error">{fieldErrors.devoteeName}</p> : null}
                    </div>
                    <input type="text" placeholder="Gotra" value={form.gotra} onChange={(event) => setValue("gotra", event.target.value)} />
                    <input
                      type="text"
                      placeholder="Sankalp purpose"
                      value={form.sankalpPurpose}
                      onChange={(event) => setValue("sankalpPurpose", event.target.value)}
                    />
                    <input
                      type="date"
                      placeholder="Preferred date"
                      value={form.date}
                      onChange={(event) => setValue("date", event.target.value)}
                    />
                    <input
                      type="time"
                      placeholder="Preferred time"
                      value={form.time}
                      onChange={(event) => setValue("time", event.target.value)}
                    />
                    <div>
                      <input
                        type="tel"
                        placeholder="WhatsApp number"
                        value={form.whatsappNumber}
                        onChange={(event) => setValue("whatsappNumber", event.target.value)}
                        style={getFieldErrorStyle("whatsappNumber")}
                      />
                      {fieldErrors.whatsappNumber ? <p className="field-error">{fieldErrors.whatsappNumber}</p> : null}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={(event) => setValue("email", event.target.value)}
                        style={getFieldErrorStyle("email")}
                      />
                      {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
                    </div>
                    <select
                      value={form.prasadDeliveryRequired}
                      onChange={(event) => setValue("prasadDeliveryRequired", event.target.value)}
                    >
                      <option value="NO">Prasad Delivery Required? No</option>
                      <option value="YES">Prasad Delivery Required? Yes</option>
                    </select>
                    {form.prasadDeliveryRequired === "YES" ? (
                      <div>
                        <textarea
                          placeholder="Delivery address"
                          rows={4}
                          value={form.deliveryAddress}
                          onChange={(event) => setValue("deliveryAddress", event.target.value)}
                          style={getFieldErrorStyle("deliveryAddress")}
                        />
                        {fieldErrors.deliveryAddress ? <p className="field-error">{fieldErrors.deliveryAddress}</p> : null}
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <h2>Choose package</h2>
                <div className="card-grid">
                  {activePackageOptions.map((option) => (
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
                  <select value={form.paymentOption} onChange={(event) => setValue("paymentOption", event.target.value)}>
                    <option value="ADVANCE">Pay Advance (30%)</option>
                    <option value="FULL">Pay Full Amount</option>
                  </select>
                  <select value={form.paymentMode} onChange={(event) => setValue("paymentMode", event.target.value)}>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Net Banking</option>
                  </select>
                </div>
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card-body">
                    <h3 style={{ marginTop: 0 }}>Booking Summary</h3>
                    <p>
                      <strong>Puja:</strong> {chosenPuja?.title}
                    </p>
                    {selectedPanditName ? (
                      <p>
                        <strong>Selected Pandit:</strong> {selectedPanditName}
                      </p>
                    ) : null}
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
                      <strong>Puja Mode:</strong>{" "}
                      {form.pujaMode === "ONLINE_E_PUJA"
                        ? "Online E-Puja"
                        : form.pujaMode === "AT_TEMPLE"
                          ? "At Temple"
                          : "At Home"}
                    </p>
                    <p>
                      <strong>Package:</strong> {chosenPackage.name}
                    </p>
                    {isOnlineEPuja ? (
                      <>
                        <p>
                          <strong>Devotee Name:</strong> {form.devoteeName || form.fullName || "N/A"}
                        </p>
                        <p>
                          <strong>Gotra:</strong> {form.gotra || "N/A"}
                        </p>
                        <p>
                          <strong>Sankalp Purpose:</strong> {form.sankalpPurpose || "N/A"}
                        </p>
                        <p>
                          <strong>WhatsApp:</strong> {form.whatsappNumber || "N/A"}
                        </p>
                        <p>
                          <strong>Prasad Delivery:</strong> {form.prasadDeliveryRequired === "YES" ? "Yes" : "No"}
                        </p>
                      </>
                    ) : null}
                    <p>
                      <strong>Total:</strong> Rs {totalAmount.toLocaleString("en-IN")}
                    </p>
                    <p>
                      <strong>Payable Now:</strong> Rs {payableAmount.toLocaleString("en-IN")} ({form.paymentOption})
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
                <button className="btn btn-primary" onClick={onContinue} disabled={isSubmitting}>
                  Continue
                </button>
              )}
              {step === 5 && (
                <button className="btn btn-primary" onClick={confirmBooking} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : isOnlineEPuja ? "Confirm E-Puja Booking" : "Pay and Confirm Booking"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
