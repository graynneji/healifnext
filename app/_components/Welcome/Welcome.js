import React, { useTransition } from "react";
import Image from "next/image";
import {
  UserPlus,
  Calendar,
  Chats,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import Logo from "@/public/Company Logo.svg";
import styles from "./Welcome.module.css";
import { signOut } from "@/app/_lib/actions";

const Welcome = () => {
  const [isPending, startTransition] = useTransition();
  const handleSignout = () => {
    startTransition(() => signOut());
  };
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        <div className={styles.logoSection}>
          {/* <Image
            width={220}
            height={90}
            src={Logo}
            alt="Logo"
            className={styles.logo}
          /> */}
          <h1 className={styles.welcomeHeading}>Welcome back, Dr. Thompson</h1>
          <p className={styles.welcomeSubtext}>
            Your patient dashboard is ready. Select a patient from the sidebar
            to begin a therapy session.
          </p>
        </div>

        <div className={styles.quickStatsSection}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Chats size={24} weight="fill" />
            </div>
            <div className={styles.statInfo}>
              <h3>5</h3>
              <p>Unread messages</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={24} weight="fill" />
            </div>
            <div className={styles.statInfo}>
              <h3>3</h3>
              <p>Todays sessions</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <UserPlus size={24} weight="fill" />
            </div>
            <div className={styles.statInfo}>
              <h3>2</h3>
              <p>New patients</p>
            </div>
          </div>
        </div>

        <div className={styles.actionsSection}>
          <div className={styles.nextSessionCard}>
            <div className={styles.sessionHeader}>
              <h3>Next Session</h3>
              <span className={styles.sessionTime}>11:30 AM - 12:30 PM</span>
            </div>
            <div className={styles.sessionInfo}>
              <div className={styles.patientAvatar}>
                <span>SJ</span>
              </div>
              <div className={styles.patientDetails}>
                <h4>Sarah Johnson</h4>
                <p>Regular therapy session - Weekly follow-up</p>
              </div>
              <button className={styles.sessionButton}>
                Join <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>

          <button onClick={handleSignout} className={styles.logoutButton}>
            {isPending ? "Logging Out..." : "Logout"}
          </button>
        </div>
      </div>

      <div className={styles.welcomeFooter}>
        <p>© 2025 Betterspace. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="/help">Help</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
