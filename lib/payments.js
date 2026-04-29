import crypto from "crypto";
import Razorpay from "razorpay";

const currency = "INR";
const advanceRatio = 0.3;
const minimumAdvance = 501;

let instance;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured.");
  }

  if (!instance) {
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  return instance;
}

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || "";
}

export function getCurrency() {
  return currency;
}

export function calculateAdvanceAmount(totalAmount) {
  const computed = Math.round(totalAmount * advanceRatio);
  return Math.min(totalAmount, Math.max(minimumAdvance, computed));
}

export function toPaise(amountInRupees) {
  return Math.max(1, Math.round(amountInRupees * 100));
}

export function verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay key secret is not configured.");
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  return expectedSignature === razorpaySignature;
}

export function verifyWebhookSignature({ rawBody, signature }) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret is not configured.");
  }

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return expected === signature;
}

export function mapPaymentEventStatus(eventName) {
  if (eventName === "payment.captured" || eventName === "order.paid") {
    return "paid";
  }
  if (eventName === "payment.failed") {
    return "failed";
  }
  return null;
}
