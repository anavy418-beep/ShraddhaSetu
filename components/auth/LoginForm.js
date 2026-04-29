"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ redirectTo = "" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "USER"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      if (data.user.role === "ADMIN") {
        router.push("/admin-dashboard");
      } else if (data.user.role === "PANDIT") {
        router.push("/pandits");
      } else {
        router.push("/user-dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {error && <p style={{ color: "#991b1b" }}>{error}</p>}
      <div className="form-grid">
        <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
          <option value="USER">User Login</option>
          <option value="PANDIT">Pandit Login</option>
          <option value="ADMIN">Admin Login</option>
        </select>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
