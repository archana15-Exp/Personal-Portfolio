"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import HeroContent from "../HeroContent/HeroContent";
import ScrollIndicator from "../ScrollIndicator/ScrollIndicator";
import styles from "./VideoIntro.module.css";

const VIDEO_SRC = "/video/hero-talking.mp4";
const SOUND_HINT_TIMEOUT = 5000;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.45 2.45c.03-.21.05-.43.05-.65zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L18.73 21 20 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function UnmutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

/**
 * Fullscreen sticky cinematic hero. Pairs a sharp foreground video with a
 * blurred, cover-fit duplicate as an ambient background layer so the frame
 * never letterboxes, then layers gradients and the animated portfolio copy
 * on top.
 */
export default function VideoIntro() {
  const sectionRef = useRef(null);
  const fgVideoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  // Tracks whether the current pause was a deliberate user action (via the
  // control button) so the scroll observer below doesn't auto-resume it.
  const userPausedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundHint, setShowSoundHint] = useState(true);

  // Entrance fade-in for the whole hero once mounted.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(sectionRef.current, { clearProps: "all" });
        return;
      }
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Auto-hide the "tap for sound" hint after a few seconds.
  useEffect(() => {
    if (!showSoundHint) return undefined;
    hintTimeoutRef.current = setTimeout(() => {
      setShowSoundHint(false);
    }, SOUND_HINT_TIMEOUT);
    return () => clearTimeout(hintTimeoutRef.current);
  }, [showSoundHint]);

  // Keep the clip looping (no more freeze-frame at the end) while the hero
  // is in view, and pause it as soon as the user scrolls down into the
  // skills/showcase section — it resumes if they scroll back up, unless
  // they'd manually paused it themselves.
  useEffect(() => {
    const heroEl = sectionRef.current;
    if (!heroEl || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const videos = [fgVideoRef.current, bgVideoRef.current];
        if (entry.isIntersecting) {
          if (userPausedRef.current) return;
          videos.forEach((video) => video && video.play().catch(() => {}));
          setIsPlaying(true);
        } else {
          videos.forEach((video) => video && video.pause());
          setIsPlaying(false);
        }
      },
      { threshold: 0 }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  function togglePlay() {
    const next = !isPlaying;
    userPausedRef.current = !next;
    setIsPlaying(next);
    [fgVideoRef.current, bgVideoRef.current].forEach((video) => {
      if (!video) return;
      if (next) video.play().catch(() => {});
      else video.pause();
    });
  }

  // Only the foreground video ever carries audio — the background copy is a
  // purely decorative blurred duplicate and must stay muted at all times.
  // Unmuting both was causing two slightly-out-of-sync copies of the same
  // audio track to play at once, which is what produced the echo.
  function toggleMute() {
    const next = !isMuted;
    setIsMuted(next);
    if (fgVideoRef.current) fgVideoRef.current.muted = next;
    if (!next) setShowSoundHint(false);
  }

  function handleUnmuteFromHint() {
    toggleMute();
  }

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div className={styles.bgLayer} aria-hidden="true">
        <video
          ref={bgVideoRef}
          className={styles.bgVideo}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className={styles.fgLayer}>
        <video
          ref={fgVideoRef}
          className={styles.fgVideo}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted={isMuted}
          playsInline
        />
      </div>

      <div className={styles.gradientTop} aria-hidden="true" />
      <div className={styles.gradientBottom} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.contentLayer}>
        <HeroContent />
      </div>

      {showSoundHint && (
        <button
          type="button"
          className={styles.soundHint}
          onClick={handleUnmuteFromHint}
        >
          <span className={styles.soundHintDot} />
          Tap for sound
        </button>
      )}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.glassButton}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className={styles.glassButton}
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <MutedIcon /> : <UnmutedIcon />}
        </button>
      </div>

      <ScrollIndicator targetId="next-section" />
    </section>
  );
}
