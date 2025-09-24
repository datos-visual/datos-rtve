"use client";

import { useEffect, useRef, useState } from "react";
import ScrollButton from "../ScrollButton/ScrollButton";
import "../../app/styles/_videoScroll.scss";

export default function VideoScroll({
  srcDesktop,
  srcMobile,
  pixelsPerSecond = 800,
}) {
  const videoRef = useRef(null);
  const placeholderRef = useRef(null);
  const scrollHintRef = useRef(null);

  const [src, setSrc] = useState(srcDesktop);

  useEffect(() => {
    // Detectar mobile/desktop al montar
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    setSrc(isMobile ? srcMobile : srcDesktop);
  }, [srcDesktop, srcMobile]);

  useEffect(() => {
    const video = videoRef.current;
    const placeholder = placeholderRef.current;
    const scrollHint = scrollHintRef.current;
    if (!video || !placeholder || !scrollHint) return;

    let rafId = null;
    let duration = 0;
    let totalScroll = 0;

    const syncVideoToScroll = () => {
      const rect = placeholder.getBoundingClientRect();
      const scrolled = Math.min(Math.max(-rect.top, 0), totalScroll);
      const frac = totalScroll === 0 ? 0 : scrolled / totalScroll;
      video.currentTime = Math.min(duration, Math.max(0, duration * frac));
    };

    const onScroll = () => {
      const scrolled = window.scrollY;
      scrollHint.style.opacity = scrolled === 0 ? "1" : "0";

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        syncVideoToScroll();
        rafId = null;
      });
    };

    const onResize = () => {
      if (duration) {
        totalScroll = Math.round(duration * pixelsPerSecond);
        placeholder.style.height = `${totalScroll + window.innerHeight}px`;
        syncVideoToScroll();
      }
    };

    const onMetadata = () => {
      duration = video.duration || 1;
      totalScroll = Math.max(1, Math.round(duration * pixelsPerSecond));
      placeholder.style.height = `${totalScroll + window.innerHeight}px`;
      syncVideoToScroll();
    };

    video.addEventListener("loadedmetadata", onMetadata);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pixelsPerSecond]);

  return (
    <div className="video-scroll-portal" style={{ position: "relative" }}>
      <div className="video-placeholder" ref={placeholderRef}></div>
      <div className="video-fixed">
        <video id="videoScroll" ref={videoRef} preload="auto" muted playsInline>
          <source src={src} type="video/mp4" />
        </video>

        <div
          ref={scrollHintRef}
          style={{
            position: "absolute",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 1,
            transition: "opacity 0.5s",
          }}
        >
          <ScrollButton
            label="Scroll para más fosas"
            animated={true}
            icon="mouse"
          />
        </div>
      </div>
    </div>
  );
}
