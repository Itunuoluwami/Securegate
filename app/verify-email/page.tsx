"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./verify-email.module.css";

export default function VerifyEmailRequestPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setMessage(data.message || "Verification email sent successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <div className={`${styles.iconCircle} ${styles.iconCircleError}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
        </div>

        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.description}>
          Before accessing the protected dashboard, you must verify your email address. 
          If you did not receive a verification link, enter your email below to resend it.
        </p>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleResend} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="your.email@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className={styles.input}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={styles.actionButton}
          >
            {loading ? "Sending..." : "Resend Verification Link"}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/login" className={styles.footerLink}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
