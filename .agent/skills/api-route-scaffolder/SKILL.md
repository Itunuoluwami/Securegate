# Skill — API Router Scaffolder

## Purpose

Responsible for creating secure, consistent API route handlers for SecureGate.

This skill owns:

- Route scaffolding
- Request validation
- Response formatting
- Error handling
- Auth-safe patterns
- Security defaults

This skill does NOT own:
- Database schema design
- Email templates
- Authentication provider config

Those belong to other skills.

---

# Scope

Create and maintain API routes for:

```txt
/api/auth/signup
/api/auth/signin
/api/auth/logout
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/verify-email
```

---

# Framework Rules

Use:

- Next.js 14
- App Router
- Route Handlers

Pattern:

```txt
app/api/**/route.ts
```

Always export:

```ts
POST
GET
```

only when required.

Never create unused handlers.

---

# Route Structure Standard

Every route must follow this order:

## 1. Parse Request

```ts
const body = await request.json()
```

---

## 2. Validate Input

Use Zod.

Never trust request body.

Pattern:

```ts
const parsed = schema.safeParse(body)

if (!parsed.success) {
  return NextResponse.json(
    { error: "Invalid input" },
    { status: 400 }
  )
}
```

Never skip validation.

---

## 3. Security Checks

Before business logic:

Examples:
- Rate limit check
- Token validity
- Authentication state
- Verification status

Fail fast.

---

## 4. Execute Business Logic

Examples:

Signup:
- hash password
- create user
- generate token

Reset password:
- validate token
- hash password
- save password
- delete token

Keep logic small and focused.

---

## 5. Return Safe Response

Responses must be:

- minimal
- predictable
- safe

Never leak internals.

Bad:

```json
{
  "error": "User john@gmail.com not found"
}
```

Good:

```json
{
  "error": "Invalid credentials"
}
```

---

# Error Handling Rules

Never expose:

- stack traces
- DB internals
- Prisma errors
- token existence
- email existence

Preferred pattern:

```ts
try {
  // logic
} catch (error) {
  console.error(error)

  return NextResponse.json(
    { error: "Something went wrong" },
    { status: 500 }
  )
}
```

---

# API Design Rules

## Signup

Must:

- validate with Zod
- hash password
- bcrypt salt rounds = 12
- create user
- generate verification token
- send verification email

Never:
- auto-login unverified users

---

## Login

Must:
- query user
- compare bcrypt hash
- return generic auth error

Never reveal:
- whether email exists
- whether password was wrong

Allowed response:

```txt
Invalid credentials
```

---

## Verify Email

Must:

- validate token
- check expiry
- mark verified
- delete token

If invalid:

Return safe message.

---

## Forgot Password

Must:

- always return success response
- generate reset token
- send email

Never reveal:

```txt
email exists / doesn't exist
```

---

## Reset Password

Must:

- validate token
- check expiry
- hash password
- delete token
- redirect to login

---

# File Structure

Preferred:

```txt
app/
  api/
    auth/
      signup/
        route.ts
      forgot-password/
        route.ts
      reset-password/
        route.ts
      verify-email/
        route.ts
```

Keep one responsibility per route.

Avoid giant handlers.

---

# Response Standard

Success:

```ts
return NextResponse.json(
  { success: true },
  { status: 200 }
)
```

Validation failure:

```ts
return NextResponse.json(
  { error: "Invalid input" },
  { status: 400 }
)
```

Unauthorized:

```ts
return NextResponse.json(
  { error: "Unauthorized" },
  { status: 401 }
)
```

Server error:

```ts
return NextResponse.json(
  { error: "Something went wrong" },
  { status: 500 }
)
```

---

# Constraints

Do NOT:

- use client-side auth logic
- skip validation
- expose DB errors
- over-abstract handlers
- merge unrelated responsibilities

---

# Success Criteria

A route is complete when:

✅ validated with Zod  
✅ safe error handling exists  
✅ security checks exist  
✅ response is predictable  
✅ no sensitive information leaks

