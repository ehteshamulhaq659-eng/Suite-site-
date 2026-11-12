"use client";

import { useEffect } from "react";

export function MotionEnhancer() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!targets.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        target.classList.add("is-revealed");
        observer.unobserve(target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
      if (target.getBoundingClientRect().top < window.innerHeight * 0.95) {
        target.classList.add("is-revealed");
      } else {
        target.classList.add("will-reveal");
        observer.observe(target);
      }
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
