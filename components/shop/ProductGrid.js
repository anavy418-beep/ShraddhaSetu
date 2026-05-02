"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProductGrid({ products }) {
  const [message, setMessage] = useState("");

  const addToCart = async (productSlug) => {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug, quantity: 1 })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to add item.");
      return;
    }
    setMessage("Added to cart.");
  };

  return (
    <>
      {message && <p style={{ color: "#14532d", fontWeight: 600 }}>{message}</p>}
      <div className="card-grid">
        {products.map((product) => (
          <article key={product.id} className="card">
            <img
              src={product.image || "/images/puja-placeholder.jpg"}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.src = "/images/puja-placeholder.jpg";
              }}
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />
            <div className="card-body">
              <h3 style={{ marginTop: 0 }}>{product.name}</h3>
              <p style={{ color: "#6f5b4d" }}>{product.description}</p>
              <p>
                <strong>Rs {product.price.toLocaleString("en-IN")}</strong>
              </p>
              <div className="row">
                <button className="btn btn-outline" onClick={() => addToCart(product.slug)}>
                  Add to Cart
                </button>
                <Link className="btn btn-primary" href="/cart">
                  Buy Now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
