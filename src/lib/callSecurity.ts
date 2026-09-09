/**
 * Anti-Spam, Abuse Protection and Phone Validation for "Request a Call"
 * 
 * Rules enforced:
 * 1. Strict Indian mobile format (+91 followed by 10 digits starting with 6, 7, 8 or 9)
 * 2. Block fake, dummy, sequential and repetitive phone numbers
 * 3. Maximum 3 call requests per phone number per hour
 * 4. Maximum 5 call requests per phone number per day
 * 5. Maximum 10 requests per IP address per hour
 * 6. Minimum 15-20 minutes gap between two requests from the same number
 * 7. 30-60 minutes cooldown after a successful call for that number
 * 8. Friendly user messages instead of technical errors
 */

interface CallLogEntry {
  timestamp: number
  ip: string
}

// In-memory sliding windows
const phoneRequestLog = new Map<string, CallLogEntry[]>()
const ipRequestLog = new Map<string, number[]>()
const successfulCallLog = new Map<string, number>()

const ONE_HOUR_MS = 60 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const MIN_GAP_MS = 15 * 60 * 1000 // 15 minutes minimum gap
const SUCCESS_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes cooldown after successful call

const MAX_CALLS_PER_PHONE_HOUR = 3
const MAX_CALLS_PER_PHONE_DAY = 5
const MAX_CALLS_PER_IP_HOUR = 10

/**
 * Validates and normalizes phone number to +91XXXXXXXXXX.
 * Strictly blocks dummy/fake numbers.
 */
export function validateIndianPhoneNumber(raw: string): {
  isValid: boolean
  formatted: string
  raw10?: string
  display?: string
  error?: string
} {
  if (!raw || typeof raw !== 'string') {
    return {
      isValid: false,
      formatted: '',
      error: 'Please enter your mobile number.',
    }
  }

  // Extract digits only and strip redundant prefixes e.g. 91, 0 or double 9191
  let digits = raw.replace(/\D/g, '').trim()
  if (digits.startsWith('9191') && digits.length === 14) digits = digits.slice(4)
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2)
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1)

  // Must be 10 digits starting with 6, 7, 8 or 9
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      formatted: raw,
      raw10: '',
      display: raw,
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.',
    }
  }

  const num = digits
  const clean = `+91${num}`

  // --- Fake Number Detection ---

  // 1. All identical digits (e.g. 9999999999, 8888888888)
  if (/^(\d)\1{9}$/.test(num)) {
    return {
      isValid: false,
      formatted: clean,
      error: 'Please enter a valid mobile number.',
    }
  }

  // 2. Known sequential patterns
  const knownSequential = [
    '0123456789', '1234567890', '2345678901', '3456789012',
    '9876543210', '8765432109', '7654321098', '6543210987',
  ]
  if (knownSequential.includes(num)) {
    return {
      isValid: false,
      formatted: clean,
      error: 'Please enter a valid mobile number.',
    }
  }

  // 3. Repeating 2-digit patterns (e.g. 9898989898, 9191919191, 9090909090)
  if (num.slice(0, 2).repeat(5) === num) {
    return {
      isValid: false,
      formatted: clean,
      error: 'Please enter a valid mobile number.',
    }
  }

  // 4. Numbers with fewer than 4 unique digits (e.g. 9988998899)
  const uniqueDigits = new Set(num.split('')).size
  if (uniqueDigits < 4) {
    return {
      isValid: false,
      formatted: clean,
      error: 'Please enter a valid mobile number.',
    }
  }

  // 5. Obvious placeholder sequences (e.g. 9000000000, 8000000000)
  if (/^[6-9]0{7,}$/.test(num) || /^[6-9]\d0{6,}$/.test(num)) {
    return {
      isValid: false,
      formatted: clean,
      error: 'Please enter a valid mobile number.',
    }
  }

  return {
    isValid: true,
    formatted: clean,
    raw10: num,
    display: `+91 ${num}`,
  }
}

/**
 * Checks all anti-spam rate limits and cooldowns.
 * Returns friendly messages suitable for users.
 */
export function checkCallAbuseAndRateLimit(
  phone: string,
  ip: string
): { allowed: boolean; reason?: string } {
  const now = Date.now()

  // 1. IP rate limit check (max 10 requests / hour)
  const ipLog = (ipRequestLog.get(ip) || []).filter((t) => now - t < ONE_HOUR_MS)
  if (ipLog.length >= MAX_CALLS_PER_IP_HOUR) {
    return {
      allowed: false,
      reason: 'You can request a call again after some time.',
    }
  }

  // 2. Successful call cooldown (30-60 min cooldown)
  const lastSuccess = successfulCallLog.get(phone)
  if (lastSuccess && now - lastSuccess < SUCCESS_COOLDOWN_MS) {
    return {
      allowed: false,
      reason: 'Our team connected with you recently. You can request another call after some time.',
    }
  }

  // 3. Per-phone rate limits & gap check
  const history = (phoneRequestLog.get(phone) || []).filter(
    (e) => now - e.timestamp < ONE_DAY_MS
  )

  if (history.length > 0) {
    const lastRequest = history[history.length - 1]
    // Minimum 15 minutes gap between any two requests
    if (now - lastRequest.timestamp < MIN_GAP_MS) {
      return {
        allowed: false,
        reason: 'A call was recently requested for this number. You can request a call again after some time.',
      }
    }
  }

  // Max 3 calls per hour
  const lastHourCount = history.filter((e) => now - e.timestamp < ONE_HOUR_MS).length
  if (lastHourCount >= MAX_CALLS_PER_PHONE_HOUR) {
    return {
      allowed: false,
      reason: 'You can request a call again after some time.',
    }
  }

  // Max 5 calls per day
  if (history.length >= MAX_CALLS_PER_PHONE_DAY) {
    return {
      allowed: false,
      reason: 'You have reached the maximum call requests for today. You can request a call again tomorrow.',
    }
  }

  return { allowed: true }
}

/**
 * Records an authorized call request attempt.
 */
export function recordCallAttempt(phone: string, ip: string) {
  const now = Date.now()

  // Update IP log
  const ipList = (ipRequestLog.get(ip) || []).filter((t) => now - t < ONE_HOUR_MS)
  ipList.push(now)
  ipRequestLog.set(ip, ipList)

  // Update Phone log
  const phoneList = (phoneRequestLog.get(phone) || []).filter(
    (e) => now - e.timestamp < ONE_DAY_MS
  )
  phoneList.push({ timestamp: now, ip })
  phoneRequestLog.set(phone, phoneList)
}

/**
 * Records when a call is answered or successfully completed to apply cooldown.
 */
export function recordCallOutcome(phone: string, status: string) {
  if (status === 'completed' || status === 'in_call' || status === 'answered') {
    successfulCallLog.set(phone, Date.now())
  }
}
