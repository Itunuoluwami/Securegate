import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const initial = session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.logoIcon}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>SecureGate</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back to your secure session workspace.</p>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {initial}
            </div>
            <div className={styles.profileTitle}>
              <h2 className={styles.profileName}>{session.user?.name || "User"}</h2>
              <div className={`${styles.badge} ${styles.badgeVerified}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Verified Account
              </div>
            </div>
          </div>

          <div className={styles.profileBody}>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Email Address</span>
              <span className={styles.infoValue}>{session.user?.email}</span>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>User Reference ID</span>
              <span className={styles.infoValue}>{session.user?.id}</span>
            </div>
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Session Status</span>
              <span className={styles.infoValue} style={{ color: "var(--color-success)" }}>Active & Secure</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
