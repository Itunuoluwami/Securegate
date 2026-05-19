---
trigger: always_on
---

# SecureGate — Architecture

## Overview

SecureGate is a standalone authentication and security application built with Next.js 14.

Its purpose is to provide a production-grade authentication layer with:

- Secure user registration
- Login and session management
- Email verification
- Password reset
- Route protection
- Security hardening
- Rate limiting

SecureGate is intentionally small in scope.

It is not a SaaS platform or dashboard product.

The system is designed around:

> Authentication correctness, security, and reliability.

---

# Architecture Philosophy

SecureGate follows:

> Small scope. Deep execution. Zero shortcuts.

Architecture decisions must prioritize:

1. Security
2. Predictability
3. Simplicity
4. Separation of concerns
5. Defensive programming

Avoid premature abstraction.

Avoid overengineering.

---

# High-Level System Architecture

```txt
Client (Browser)
        ↓
Next.js App Router
        ↓
Route Handlers / Server Actions
        ↓
Auth Layer (NextAuth)
        ↓
Prisma ORM
        ↓
PostgreSQL Database
        ↓
Email Service (Resend)
```

Security middleware sits between:

```txt
Client Request
      ↓
Middleware
      ↓
Authentication Check
      ↓
Protected Route
```

Rate limiting intercepts sensitive requests:

```txt
Login Attempt
      ↓
Rate Limiter
      ↓
Allow or Reject
```

---

# Core Architectural Layers

## 1. Presentation Layer

Responsible for:

- UI rendering
- Form interactions
- Validation feedback
- Loading states
- Error messaging

Technology:
- Next.js App Router
- React
- Tailwind CSS

Rules:
- Keep components simple
- Prioritize accessibility
- Keep forms predictable
- Never trust client validation alone

---

## 2. Authentication Layer

Responsible for:

- Login
- Session creation
- Logout
- Session validation
- Protected routes

Technology:
- NextAuth.js

Authentication strategy:
- Credentials Provider

Responsibilities:
- Validate credentials
- Compare hashed passwords
- Manage sessions
- Enforce route protection

Protected route:
```txt
/dashboard
```

Rules:
- Redirect unauthenticated users
- Redirect unverified users
- Never expose sensitive auth errors

---

## 3. Business Logic Layer

Responsible for:

### Sign Up
- Validate input
- Hash password
- Create user
- Generate verification token
- Send verification email

### Login
- Authenticate user
- Create session

### Email Verification
- Validate token
- Check expiry
- Mark user verified
- Delete token

### Forgot Password
- Generate reset token
- Send reset email

### Password Reset
- Validate token
- Check expiry
- Hash new password
- Delete used token

Rules:
- Logic must live server-side
- No sensitive logic in client components

---

## 4. Database Layer

Technology:
- PostgreSQL
- Prisma ORM

Purpose:
- Persist users
- Store verification tokens
- Store password reset tokens
- Support authentication state

---

# Database Schema

## User

Purpose:
Stores user identity and auth state.

Fields:

```ts
id
name
email
password
emailVerified
createdAt
```

Rules:
- Password must be hashed
- Email should be unique
- emailVerified controls access

---

## VerificationToken

Purpose:
Email ownership verification.

Fields:

```ts
identifier
token
expires
```

Rules:
- Must expire after 15 minutes
- Delete after use

---

## PasswordResetToken

Purpose:
Password recovery.

Fields:

```ts
email
token
expires
```

Rules:
- Must expire after 1 hour
- Delete after successful reset

---

# API Architecture

Sensitive endpoints include:

```txt
/api/auth/signup
/api/auth/signin
/api/auth/logout
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/verify-email
```

Rules:
- Server-side validation required
- Return safe errors
- Rate limit sensitive routes

---

# Session Architecture

Authentication flow:

```txt
User Login
    ↓
Credentials Validation
    ↓
bcrypt Password Compare
    ↓
NextAuth Session Created
    ↓
Protected Routes Allowed
```

Session checks happen:

- Middleware
- Server-side auth checks

Rules:
- Never trust client state
- Missing/invalid session redirects to login

---

# Email Architecture

Technology:
- Resend
- React Email

Emails sent:

### Verification Email
Purpose:
Verify account ownership.

Contains:
- Tokenized verification link

### Password Reset Email
Purpose:
Allow secure password reset.

Contains:
- Reset token link

Rules:
- Tokens expire
- Tokens are single-use

---

# Middleware Architecture

Middleware responsibilities:

### Route Protection
Protect:
```txt
/dashboard
```

Logic:
- Check authentication
- Check verification status
- Redirect failures

### Rate Limiting
Protect:
- Login endpoint
- Forgot password endpoint

Rule:
```txt
5 attempts / 10 minutes / IP
```

---

# Folder Philosophy

Organize by responsibility.

Example:

```txt
app/
  login/
  signup/
  dashboard/
  forgot-password/
  reset-password/

api/
  auth/

lib/
  auth.ts
  prisma.ts
  mail.ts
  tokens.ts

schemas/
  auth.ts

components/
  auth/

emails/

middleware.ts
```

Rules:
- Keep files focused
- Avoid giant files
- Separate auth logic from UI

---

# Performance Principles

SecureGate prioritizes:

1. Security
2. Correctness
3. Reliability

Then:

4. Performance

Guidelines:
- Minimize DB queries
- Reuse Prisma client
- Avoid unnecessary re-renders

---

# Architecture Constraints

Do NOT add:

- Social login
- MFA
- Audit logs
- OAuth providers
- Payment systems
- Multi-tenant logic

Reason:
> SecureGate is an authentication-focused MVP.

---

# Definition of Done

Architecture is complete when:

✅ Authentication works  
✅ Email verification works  
✅ Password reset works  
✅ Protected routes work  
✅ Sessions are secure  
✅ Rate limiting works  
✅ Security boundaries are enforced

