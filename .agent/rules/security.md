---
trigger: always_on
---

# Rule — Security

## Purpose
SecureGate prioritizes security over speed. This project implements defensive programming, meaning client input is never trusted, and sensitive data is strictly protected.

## 1. Password Hashing (bcrypt rules)
- **Always** hash passwords using `bcryptjs`.
- **Always** use exactly 12 salt rounds.
- **Never** store or log plaintext passwords.
- Example: `await bcrypt.hash(password, 12)`

## 2. Token Security & Expiration
- **Email Verification Tokens:** Must expire after exactly **15 minutes**.
- **Password Reset Tokens:** Must expire after exactly **1 hour**.
- **Always** delete tokens immediately after successful use to prevent replay attacks.
- Tokens must be randomly generated and secure.

## 3. Rate Limiting
- **Protect** sensitive endpoints (login, forgot password, sign up).
- **Rule:** 5 attempts per 10 minutes per IP.
- Reject requests exceeding this limit with a `429 Too Many Requests` status.

## 4. Safe Error Messages (Zero Leakage)
- **Never** expose sensitive errors to the client.
- **Never** leak whether an email exists in the system (e.g., during login or forgot password flows).
- **Correct:** "If an account with this email exists, a reset link has been sent."
- **Incorrect:** "Email not found."

## 5. Environment Variables
- **Always** store secrets (Database URL, NextAuth secret, Resend API key) in `.env.local`.
- **Never** hardcode secrets in the codebase.
- **Never** commit `.env.local` to version control.

## 6. Input Validation
- **Always** validate all incoming request bodies using Zod schemas on the server-side.
- **Never** rely solely on client-side validation.

## 7. Route Protection & Security Headers
- Ensure all protected routes (e.g., `/dashboard`) verify authentication and `emailVerified` status via Server Components or Middleware.
- Missing or invalid sessions must immediately redirect to the login page.