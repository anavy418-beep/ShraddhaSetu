"use client";

import { useEffect, useState } from "react";

export default function UserDashboardClient() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    const [meRes, bookingsRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/bookings/my")]);
    const [meData, bookingsData] = await Promise.all([meRes.json(), bookingsRes.json()]);
    if (!meRes.ok || !meData.user) {
      setError("Please login as user to access dashboard.");
      setLoading(false);
      return;
    }
    setUser(meData.user);
    if (bookingsRes.ok) {
      setBookings(bookingsData.bookings || []);
    } else {
      setError(bookingsData.error || "Unable to fetch bookings.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => setError("Unable to load dashboard."));
  }, []);

  const updateBooking = async (bookingId, action) => {
    setMessage("");
    let payload = { action };
    if (action === "reschedule") {
      const date = window.prompt("Enter new date (YYYY-MM-DD):");
      const time = window.prompt("Enter new time (HH:MM):");
      if (!date || !time) {
        return;
      }
      payload = { ...payload, date, time };
    }
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Action failed.");
      return;
    }
    setMessage(data.message);
    await loadData();
  };

  return (
    <>
      {loading && <p>Loading your dashboard...</p>}
      {error && <p style={{ color: "#991b1b" }}>{error}</p>}
      {message && <p style={{ color: "#166534" }}>{message}</p>}
      <div className="card">
        <div className="card-body">
          <h2 style={{ marginTop: 0 }}>My Bookings</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Puja</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Paid / Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.bookingId}</td>
                    <td>{booking.puja}</td>
                    <td>{booking.city}</td>
                    <td>
                      {booking.date} {booking.time}
                    </td>
                    <td>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </td>
                    <td>
                      <span className={`status ${booking.paymentStatus}`}>{booking.paymentStatus}</span>
                    </td>
                    <td>
                      Rs {booking.amountPaid?.toLocaleString("en-IN") || 0} / Rs {booking.amount?.toLocaleString("en-IN") || 0}
                    </td>
                    <td>
                      <button className="btn btn-outline" onClick={() => updateBooking(booking.id, "cancel")}>
                        Cancel
                      </button>{" "}
                      <button className="btn btn-outline" onClick={() => updateBooking(booking.id, "reschedule")}>
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td colSpan={8}>No bookings yet. Start by booking a puja from the services page.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h2 style={{ marginTop: 0 }}>Profile Details</h2>
          <div className="form-grid">
            <input value={user?.name || ""} readOnly />
            <input value={user?.email || ""} readOnly />
            <input value={user?.role || ""} readOnly />
          </div>
        </div>
      </div>
    </>
  );
}
