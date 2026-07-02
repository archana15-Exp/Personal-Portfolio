"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./HeroContent.module.css";

export default function HeroContent() {
  const rootRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Respect the user's preference — show the final state immediately
        // instead of animating.
        gsap.set(
          [
            `.${styles.tagline}`,
            `.${styles.nameLine}`,
            `.${styles.subtitle}`,
            `.${styles.divider}`,
          ],
          { clearProps: "all" }
        );
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.3,
      });

      tl.from(`.${styles.tagline}`, {
        y: 20,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          `.${styles.nameLine}`,
          {
            y: 60,
            opacity: 0,
            duration: 1.1,
            stagger: 0.15,
          },
          "-=0.5"
        )
        .from(
          `.${styles.subtitle}`,
          {
            y: 20,
            opacity: 0,
            duration: 0.9,
          },
          "-=0.6"
        )
        .from(
          `.${styles.divider}`,
          {
            scaleX: 0,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.7"
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={styles.wrapper}>
      <p className={styles.tagline}>Product &amp; AI Engagement Leader</p>

      <h1 className={styles.name} aria-label="Archana Bhoga">
        <span className={styles.nameLine}>ARCHANA</span>
        <span className={styles.nameLine}>BHOGA</span>
      </h1>

      <span className={styles.divider} />

      <p className={styles.subtitle}>
        Manager, Product Management — Global Product Delivery &amp; AI
        Engagement. 11+ years turning complex problems into disciplined,
        human-centred delivery.
      </p>
    </div>
  );
}
