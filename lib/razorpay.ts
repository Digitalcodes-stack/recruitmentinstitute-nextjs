import Razorpay from 'razorpay'
import crypto from 'crypto'

export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TUKkvyTnXzSVTP'
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'hvO4iBLPhZGoDQ8LxzmPNdOc'

  return new Razorpay({
    key_id,
    key_secret,
  })
}

export const razorpayClient = {
  get orders() {
    return getRazorpayClient().orders
  },
  get payments() {
    return getRazorpayClient().payments
  },
}

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
  const secret = process.env.RAZORPAY_KEY_SECRET || 'hvO4iBLPhZGoDQ8LxzmPNdOc'
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
