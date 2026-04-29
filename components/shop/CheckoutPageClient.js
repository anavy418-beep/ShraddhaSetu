"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

export default function CheckoutPageClient() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, paymentMethod })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Order creation failed.");
      }

      const paymentOrderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "ORDER",
          entityId: orderData.order.id,
          paymentMethod
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
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            router.push(`/payment-success?orderId=${orderData.order.orderId}`);
          } catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : "Payment verification failed.");
            router.push("/payment-failure");
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
          router.push("/payment-failure");
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      router.push("/payment-failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        {error && <p style={{ color: "#991b1b" }}>{error}</p>}
        <div className="form-grid">
          <input type="text" placeholder="Full Name" />
          <input type="tel" placeholder="Phone" />
          <input type="email" placeholder="Email" />
          <textarea rows={4} placeholder="Shipping Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option>UPI</option>
            <option>Card</option>
            <option>Net Banking</option>
          </select>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={placeOrder} disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </button>
          <Link className="btn btn-outline" href="/cart">
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
