"use client";

import { useEffect, useState } from "react";

export default function AdminDashboardClient({ stats }) {
  const [bookings, setBookings] = useState([]);
  const [pandits, setPandits] = useState([]);
  const [approvalList, setApprovalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const [bookingsRes, panditsRes] = await Promise.all([fetch("/api/admin/bookings"), fetch("/api/admin/pandits")]);
    const [bookingsData, panditsData] = await Promise.all([bookingsRes.json(), panditsRes.json()]);
    if (!bookingsRes.ok) {
      setError(bookingsData.error || "Unable to load admin bookings.");
      return;
    }
    if (!panditsRes.ok) {
      setError(panditsData.error || "Unable to load pandits.");
      return;
    }
    setBookings(bookingsData.bookings || []);
    setPandits(bookingsData.pandits || []);
    setApprovalList(panditsData.pandits || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setError("Unable to load admin dashboard."));
  }, []);

  const updateBooking = async (booking, updates) => {
    const response = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to update booking.");
      return;
    }
    setMessage("Booking updated.");
    await load();
  };

  const updatePanditApproval = async (panditId, action) => {
    const response = await fetch(`/api/admin/pandits/${panditId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to update pandit.");
      return;
    }
    setMessage(data.message);
    await load();
  };

  return (
    <>
      {loading && <p>Loading admin data...</p>}
      {error && <p style={{ color: "#991b1b" }}>{error}</p>}
      {message && <p style={{ color: "#166534" }}>{message}</p>}
      <div className="card">
        <div className="card-body">
          <h2 style={{ marginTop: 0 }}>Manage Bookings</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Puja</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Pandit</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.bookingId}</td>
                    <td>{booking.customer}</td>
                    <td>{booking.puja}</td>
                    <td>{booking.city}</td>
                    <td>{booking.date}</td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBooking(booking, { status: e.target.value, panditId: booking.panditId })}
                      >
                        <option>pending</option>
                        <option>confirmed</option>
                        <option>completed</option>
                        <option>cancelled</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={booking.panditId || ""}
                        onChange={(e) => updateBooking(booking, { status: booking.status, panditId: e.target.value || null })}
                      >
                        <option value="">Unassigned</option>
                        {pandits.map((pandit) => (
                          <option value={pandit.userId} key={pandit.userId}>
                            {pandit.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{booking.paymentStatus}</td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td colSpan={8}>No bookings found. User bookings will appear here once created.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h2 style={{ marginTop: 0 }}>Pandit Approval Queue</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvalList.map((pandit) => (
                  <tr key={pandit.id}>
                    <td>{pandit.name}</td>
                    <td>{pandit.email}</td>
                    <td>{pandit.city}</td>
                    <td>{pandit.experience} years</td>
                    <td>{pandit.verificationStatus}</td>
                    <td>
                      <button className="btn btn-outline" onClick={() => updatePanditApproval(pandit.id, "approve")}>
                        Approve
                      </button>{" "}
                      <button className="btn btn-outline" onClick={() => updatePanditApproval(pandit.id, "reject")}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {!approvalList.length && (
                  <tr>
                    <td colSpan={6}>No pandit registrations found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: 16 }}>
        <article className="card">
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Manage Puja Services</h3>
            <p>{stats.services} listed services</p>
          </div>
        </article>
        <article className="card">
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Manage Cities</h3>
            <p>{stats.cities} active cities</p>
          </div>
        </article>
        <article className="card">
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Manage Pandits</h3>
            <p>{approvalList.length} total registrations</p>
          </div>
        </article>
        <article className="card">
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Manage Reviews</h3>
            <p>{stats.reviews} published testimonials</p>
          </div>
        </article>
        <article className="card">
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Manage Blog</h3>
            <p>Create and publish SEO-ready spiritual content.</p>
          </div>
        </article>
      </div>
    </>
  );
}
