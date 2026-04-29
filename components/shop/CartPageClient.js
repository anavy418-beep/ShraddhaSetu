"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPageClient() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    setLoading(true);
    const response = await fetch("/api/cart");
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to load cart.");
      setLoading(false);
      return;
    }
    setItems(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadCart().catch(() => setError("Unable to load cart."));
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    const response = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity })
    });
    if (response.ok) {
      await loadCart();
    }
  };

  const removeItem = async (itemId) => {
    const response = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
    if (response.ok) {
      await loadCart();
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        {loading && <p>Loading cart...</p>}
        {error && <p style={{ color: "#991b1b" }}>{error}</p>}
        {!items.length && !error && <p>Your cart is empty.</p>}
        {items.map((item) => (
          <div key={item.id} style={{ borderBottom: "1px solid #eddcc5", paddingBottom: 12, marginBottom: 12 }}>
            <h3 style={{ marginTop: 0 }}>{item.productName}</h3>
            <p>Rs {item.price.toLocaleString("en-IN")}</p>
            <div className="row">
              <select
                value={item.quantity}
                onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                style={{ width: 90 }}
              >
                {[1, 2, 3, 4, 5].map((number) => (
                  <option key={number}>{number}</option>
                ))}
              </select>
              <button className="btn btn-outline" onClick={() => removeItem(item.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <p>
          <strong>Total:</strong> Rs {total.toLocaleString("en-IN")}
        </p>
        <div className="row">
          <Link className="btn btn-primary" href="/checkout">
            Proceed to Checkout
          </Link>
          <Link className="btn btn-outline" href="/shop">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
