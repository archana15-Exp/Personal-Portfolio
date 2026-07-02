"use client";

import styles from "./ScrollIndicator.module.css";

export default function ScrollIndicator({ targetId = "next-section" }) {
  function handleClick() {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <button
      type="button"
      className={styles.indicator}
      onClick={handleClick}
      aria-label="Scroll to next section"
    >
      <span className={styles.label}>Scroll</span>
      <span className={styles.track}>
        <span className={styles.pulse} />
      </span>
    </button>
  );
}
