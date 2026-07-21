import Razorpay from "npm:razorpay@2.9.4";
import crypto from "node:crypto";

/**
 * Creates a Razorpay client using an organization's credentials.
 */
export function getRazorpayClient(
  keyId: string,
  keySecret: string
) {
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Create a Razorpay Order.
 */
export async function createOrder(
  keyId: string,
  keySecret: string,
  amount: number,
  receipt: string
) {
  const razorpay = getRazorpayClient(keyId, keySecret);

  return await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt,
    payment_capture: true,
  });
}

/**
 * Fetch payment details from Razorpay.
 */
export async function fetchPayment(
  keyId: string,
  keySecret: string,
  paymentId: string
) {
  const razorpay = getRazorpayClient(keyId, keySecret);

  return await razorpay.payments.fetch(paymentId);
}

/**
 * Verify Razorpay payment signature.
 */
export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
) {
  const body = `${orderId}|${paymentId}`;

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  return expected === signature;
}