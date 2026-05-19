# Skill — DB Migration Runner

## Purpose

Responsible for database schema setup, Prisma migrations, and PostgreSQL integrity in SecureGate.

This skill owns:

- Prisma initialization
- schema management
- migrations
- database consistency
- migration safety

This skill does NOT own:

- authentication logic
- API handlers
- UI components

---

# Database Philosophy

Database changes must be:

> deliberate, reversible, and verified.

Never guess database structure.

Always confirm schema state.

---

# Required Stack

Database:
- PostgreSQL

ORM:
- Prisma

Environment variable:

```env
DATABASE_URL=
```

---

# Required Models

SecureGate requires:

## User

Fields:

```prisma
id
name
email
password
emailVerified
createdAt
```

Rules:
- email must be unique
- password stores bcrypt hash only
- emailVerified controls access

---

## VerificationToken

Fields:

```prisma
identifier
token
expires
```

Purpose:
- email verification

Rules:
- token expires after 15 minutes
- delete after use

---

## PasswordResetToken

Fields:

```prisma
email
token
expires
```

Purpose:
- forgot password flow

Rules:
- token expires after 1 hour
- delete after reset

---

# Migration Workflow

Always follow this order:

## 1. Update Schema

Edit:

```txt
prisma/schema.prisma
```

Never change DB manually first.

Schema is source of truth.

---

## 2. Generate Migration

Run:

```bash
npx prisma migrate dev --name migration_name
```

Naming convention:

Good:

```txt
init_auth_schema
add_reset_tokens
add_email_verification
```

Bad:

```txt
fix
stuff
update
```

Migration names must be descriptive.

---

## 3. Verify Migration

Confirm:

- migration succeeded
- tables exist
- columns exist
- constraints exist

Use:

```bash
npx prisma studio
```

or DB client.

---

## 4. Regenerate Prisma Client

Run:

```bash
npx prisma generate
```

Required after schema changes.

---

# Prisma Client Rules

Create singleton pattern.

Never create multiple clients.

Correct:

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma =
  globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
```

Purpose:
- prevent connection exhaustion

---

# Migration Safety Rules

Before migration:

Check:
- breaking changes
- nullable fields
- destructive actions

Never:
- drop columns casually
- reset DB unnecessarily

Bad:

```bash
prisma db push
```

for production logic.

Preferred:

```bash
prisma migrate dev
```

---

# Schema Rules

## User.email

Must be:

```prisma
@unique
```

---

## Password

Must store:

```txt
bcrypt hash only
```

Never plaintext.

---

## Token Expiry

Use:

```prisma
DateTime
```

Never strings.

---

## IDs

Use:

```prisma
@id
@default(cuid())
```

Preferred for consistency.

---

# Validation Checklist

After migration verify:

✅ User table exists  
✅ VerificationToken exists  
✅ PasswordResetToken exists  
✅ Email uniqueness works  
✅ Prisma client regenerates  
✅ No migration errors

---

# Constraints

Do NOT:

- manually edit DB tables
- bypass migrations
- use db push for final architecture
- duplicate Prisma clients
- store plaintext passwords

---

# Troubleshooting

## Migration failed

Try:

```bash
npx prisma migrate reset
```

ONLY during local development.

Never in production.

---

## Prisma Client stale

Run:

```bash
npx prisma generate
```

---

## DB connection issue

Check:

```env
DATABASE_URL
```

Verify:
- postgres running
- credentials valid

---

# Success Criteria

Database layer is complete when:

✅ schema is correct  
✅ migrations succeed  
✅ tables verified  
✅ Prisma client works  
✅ auth models exist

