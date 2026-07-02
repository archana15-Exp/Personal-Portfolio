"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import HeroContent from "../HeroContent/HeroContent";
import ScrollIndicator from "../ScrollIndicator/ScrollIndicator";
import styles from "./VideoIntro.module.css";

const VIDEO_SRC = "/video/hero-talking.mp4";
const SOUND_HINT_TIMEOUT = 5000;
// The clip plays through 3 times back-to-back, then stops itself on the
// last frame instead of looping forever.
const PLAY_LIMIT = 3;

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
  // control button, or the play-count limit below) so the scroll observer
  // further down doesn't auto-resume it.
  const userPausedRef = useRef(false);
  // Counts how many times the clip has played through since it last started
  // a fresh cycle, so we can stop it after PLAY_LIMIT loops instead of
  // looping forever.
  const playCountRef = useRef(0);

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

  // Belt-and-braces: explicitly kick off playback on mount. The `autoPlay`
  // attribute usually handles this, but React-mounted <video> elements
  // don't always honor it reliably on first paint (particularly on
  // Safari/iOS), which can leave the clip sitting on its first frame until
  // some unrelated interaction (like tapping the sound button) happens to
  // nudge it. Calling .play() directly guarantees it starts as soon as the
  // page loads — it stays muted at this point, so it's always allowed.
  useEffect(() => {
    [bgVideoRef.current, fgVideoRef.current].forEach((video) => {
      if (video) video.play().catch(() => {});
    });
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
  // is in view, and pause it once the user has scrolled down far enough
  // that the skills/showcase section dominates the screen — it resumes if
  // they scroll back up, unless they'd manually paused it themselves.
  //
  // Note: we check the intersection *ratio* against a cutoff rather than
  // the binary `isIntersecting` flag. `isIntersecting` only turns false
  // once the hero is 100% scrolled out of view — but the next section is
  // barely taller than one viewport, so that 100% point sits almost at the
  // very bottom of the whole page. Using a ratio cutoff instead means the
  // video pauses as soon as the hero stops being the dominant content,
  // which is what "landing on the skills page" actually looks like.
  useEffect(() => {
    const heroEl = sectionRef.current;
    if (!heroEl || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const VISIBLE_CUTOFF = 0.5;
    // Remembers the last play/pause decision so we only ever call
    // video.play()/pause() when it actually changes. Without this, every
    // threshold crossing (there are 21 of them) re-issues play()/pause()
    // even while the decision stays the same, and firing overlapping calls
    // on two separate <video> elements back-to-back can desync them (one
    // element's play() promise can lose the race against a later pause()).
    let lastDecision = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const mostlyVisible = entry.intersectionRatio >= VISIBLE_CUTOFF;
        const shouldPlay = mostlyVisible && !userPausedRef.current;
        if (shouldPlay === lastDecision) return;
        lastDecision = shouldPlay;

        const videos = [fgVideoRef.current, bgVideoRef.current];
        if (shouldPlay) {
          videos.forEach((video) => video && video.play().catch(() => {}));
        } else {
          videos.forEach((video) => video && video.pause());
        }
        setIsPlaying(shouldPlay);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Fires when the foreground video finishes a playthrough (the two videos
  // share the same source and start together, so driving the cycle from just
  // one of them avoids double-counting). Below the limit, both videos are
  // rewound and replayed together; once the limit is hit, both are paused on
  // their last frame and marked as a "user pause" so the scroll observer
  // won't resurrect it.
  function handleEnded() {
    playCountRef.current += 1;
    const videos = [fgVideoRef.current, bgVideoRef.current];
    if (playCountRef.current < PLAY_LIMIT) {
      videos.forEach((video) => {
        if (!video) return;
        video.currentTime = 0;
        video.play().catch(() => {});
      });
    } else {
      userPausedRef.current = true;
      setIsPlaying(false);
      videos.forEach((video) => video && video.pause());
    }
  }

  function togglePlay() {
    const next = !isPlaying;
    userPausedRef.current = !next;
    setIsPlaying(next);
    // If the clip had already run through its play limit, clicking play
    // again starts a brand-new 3-loop cycle from the top.
    if (next && playCountRef.current >= PLAY_LIMIT) {
      playCountRef.current = 0;
    }
    [fgVideoRef.current, bgVideoRef.current].forEach((video) => {
      if (!video) return;
      if (next) {
        if (video.ended) video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
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
          muted={isMuted}
          playsInline
          onEnded={handleEnded}
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
