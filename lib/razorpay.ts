import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TUJvHxa7DhM26d',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '26Tl9lJnW0NpkyQLyABzpbit',
})

/**
 * Verify HMAC SHA256 payment signature returned by Razorpay Checkout
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || '26Tl9lJnW0NpkyQLyABzpbit'
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return generatedSignature === signature
}

/**
 * Verify HMAC SHA256 webhook signature sent in X-Razorpay-Signature header
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || 'ri_razorpay_webhook_secret_2026'
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  return expectedSignature === signature
}
