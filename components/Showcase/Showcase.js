"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Showcase.module.css";
import {
  skillGroups,
  certifications,
  featuredExperience,
  earlierCareer,
  linkedInUrl,
} from "./data";

const PAGES = [
  { key: "skills", label: "Skills & Certifications" },
  { key: "experience", label: "Experience" },
  { key: "connect", label: "Let's Connect" },
];

export default function Showcase() {
  const [page, setPage] = useState(0);
  const panelRef = useRef(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!panelRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(panelRef.current, { clearProps: "all" });
      return;
    }

    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
  }, [page]);

  function goNext() {
    setPage((p) => Math.min(p + 1, PAGES.length - 1));
  }

  function goBack() {
    setPage((p) => Math.max(p - 1, 0));
  }

  function goTo(index) {
    setPage(index);
  }

  return (
    <div className={styles.showcase}>
      <div className={styles.header}>
        <span className={styles.tag}>Selected Work &amp; Impact</span>
        <h2 className={styles.title}>{PAGES[page].label}</h2>
      </div>

      <div ref={panelRef} className={styles.panel}>
        {page === 0 && <SkillsPage />}
        {page === 1 && <ExperiencePage />}
        {page === 2 && <ConnectPage />}
      </div>

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navButton}
          onClick={goBack}
          disabled={page === 0}
        >
          ← Back
        </button>

        <div className={styles.dots}>
          {PAGES.map((p, i) => (
            <button
              key={p.key}
              type="button"
              className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
              aria-label={`Go to ${p.label}`}
              aria-current={i === page}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {page < PAGES.length - 1 ? (
          <button
            type="button"
            className={styles.navButtonPrimary}
            onClick={goNext}
          >
            Next →
          </button>
        ) : (
          <span className={styles.navSpacer} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function SkillsPage() {
  return (
    <div className={styles.skillsGrid}>
      <div className={styles.skillsColumn}>
        {skillGroups.map((group) => (
          <div key={group.title}>
            <h3 className={styles.skillGroupTitle}>{group.title}</h3>
            <div className={styles.pillRow}>
              {group.skills.map((skill) => (
                <span key={skill} className={styles.pill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.certColumn}>
        <h3 className={styles.skillGroupTitle}>Certifications</h3>
        <ul className={styles.certList}>
          {certifications.map((cert) => (
            <li key={cert.name} className={styles.certItem}>
              <span className={styles.certName}>{cert.name}</span>
              <span className={styles.certIssuer}>{cert.issuer}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExperiencePage() {
  return (
    <div className={styles.experienceWrap}>
      <div className={styles.timeline}>
        {featuredExperience.map((role) => (
          <article key={role.company} className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <div>
                <h3 className={styles.roleTitle}>{role.role}</h3>
                <p className={styles.roleCompany}>
                  {role.company} · {role.location}
                </p>
              </div>
              <span className={styles.rolePeriod}>{role.period}</span>
            </div>
            <p className={styles.roleContext}>{role.context}</p>
            <ul className={styles.roleBullets}>
              {role.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className={styles.earlierCareer}>
        <h4 className={styles.earlierTitle}>Earlier Career</h4>
        <div className={styles.earlierRow}>
          {earlierCareer.map((job) => (
            <div key={job.company} className={styles.earlierCard}>
              <p className={styles.earlierRole}>{job.role}</p>
              <p className={styles.earlierCompany}>{job.company}</p>
              <p className={styles.earlierPeriod}>{job.period}</p>
              <p className={styles.earlierSummary}>{job.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectPage() {
  return (
    <div className={styles.connectWrap}>
      <p className={styles.connectEyebrow}>Thanks for scrolling this far</p>
      <h3 className={styles.connectHeadline}>
        Let&apos;s build something worth shipping.
      </h3>
      <p className={styles.connectCopy}>
        Eleven-plus years turning ambiguous problems into disciplined delivery
        — across healthcare procurement, fintech SaaS, smart-city IoT, and
        now enterprise AI. If any of this resonates with a problem
        you&apos;re working on, I&apos;d love to hear about it.
      </p>
      <p className={styles.connectCopy}>Happy to connect and discuss more.</p>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.linkedinButton}
      >
        Connect on LinkedIn
      </a>
    </div>
  );
}
