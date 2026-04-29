"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    citySlug: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/cities")
      .then((response) => response.json())
      .then((data) => {
        const cityList = data.cities || [];
        setCities(cityList);
        if (cityList.length) {
          setForm((prev) => ({ ...prev, citySlug: cityList[0].slug }));
        }
      })
      .catch(() => setCities([]));
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }
      router.push("/user-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {error && <p style={{ color: "#991b1b" }}>{error}</p>}
      <div className="form-grid">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Create Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        <select value={form.citySlug} onChange={(e) => setForm((prev) => ({ ...prev, citySlug: e.target.value }))}>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={loading}>
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}
