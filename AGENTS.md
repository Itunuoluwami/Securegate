# AGENTS.md — SecureGate

## Product Context

SecureGate is a standalone authentication and security app built to demonstrate production-ready identity and access management.

This is NOT a full SaaS product.

Focus:
- Authentication
- Security
- Session management
- Verification flows
- Defensive programming

Goal:
> Small scope. Deep execution. Zero shortcuts.

---

## Core Requirements

Build:

- Sign Up
- Login
- Email Verification
- Protected Dashboard
- Forgot Password
- Password Reset
- Logout
- Rate Limiting
- Password Hashing

Security is more important than speed.

Never trust client input.

---

## Build Order (Mandatory)

Build in phases and do not skip ahead.

### Phase 1
Scaffold + Prisma + PostgreSQL + schema

Models:
- User
- VerificationToken
- PasswordResetToken

Confirm migrations work before continuing.

### Phase 2
Authentication core:
- NextAuth Credentials Provider
- bcrypt password hashing
- Zod validation
- Protected dashboard route

### Phase 3
Email verification:
- secure token generation
- token expiry (15 min)
- Resend integration
- verified users only

### Phase 4
Forgot password:
- reset token
- 1-hour expiry
- secure reset flow
- generic success responses

### Phase 5
Security hardening:
- rate limiting
- secure error handling
- environment variables
- security headers

### Phase 6
UI polish + deployment:
- loading states
- accessible forms
- password strength indicator
- deploy to Vercel

---

## Tech Stack

Required:
- Next.js 14 (App Router)
- TypeScript
- Prisma
- PostgreSQL
- NextAuth.js
- bcryptjs
- Zod
- Resend
- Vercel

Optional:
- Upstash Redis for rate limiting

---

## Security Rules

Always:
- Hash passwords with bcrypt (12 salt rounds)
- Expire tokens
- Delete used tokens
- Validate inputs with Zod
- Hide sensitive auth errors
- Protect routes
- Store secrets in `.env.local`

Never:
- Store plain-text passwords
- Leak whether an email exists
- Hardcode secrets
- Commit `.env.local`

---

## Constraints

Do NOT build:
- Social login
- MFA
- Audit logs
- Extra auth providers
- Features outside assessment scope

Avoid overengineering.

