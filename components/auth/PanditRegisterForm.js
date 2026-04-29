"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PanditRegisterForm() {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    citySlug: "",
    experienceYears: "",
    languages: "",
    specialization: "",
    bio: ""
  });

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

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register-pandit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Pandit registration failed.");
      }
      router.push("/user-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <p style={{ color: "#991b1b" }}>{error}</p>}
      <div className="form-grid">
        <input required type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input required type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input
          required
          type="password"
          placeholder="Create Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <select required value={form.citySlug} onChange={(e) => setForm((p) => ({ ...p, citySlug: e.target.value }))}>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
        <input
          required
          type="number"
          placeholder="Experience (years)"
          value={form.experienceYears}
          onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))}
        />
        <input
          required
          type="text"
          placeholder="Languages (e.g. Hindi,Sanskrit)"
          value={form.languages}
          onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))}
        />
        <input
          required
          type="text"
          placeholder="Specialization Areas"
          value={form.specialization}
          onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
        />
        <textarea
          rows={4}
          placeholder="Short bio"
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
        />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={loading}>
        {loading ? "Submitting..." : "Submit Registration"}
      </button>
    </form>
  );
}
