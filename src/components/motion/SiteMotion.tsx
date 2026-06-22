"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) {
      document.documentElement.classList.add("motion-reduced");
      return;
    }

    document.documentElement.classList.remove("motion-reduced");

    const disposers: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.defaults({
        ease: "power3.out",
      });

      gsap.from("[data-motion='hero-copy'] > *", {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.08,
        clearProps: "opacity,visibility,transform",
      });

      gsap.from("[data-motion='hero-visual']", {
        autoAlpha: 0,
        y: 34,
        scale: 0.97,
        duration: 0.95,
        delay: 0.12,
        clearProps: "opacity,visibility,transform",
      });

      gsap.utils.toArray<HTMLElement>("[data-motion='section']").forEach((section) => {
        gsap.from(section, {
          autoAlpha: 0,
          y: 32,
          duration: 0.75,
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-motion-stagger]").forEach((group) => {
        const children = Array.from(group.children);

        gsap.from(children, {
          autoAlpha: 0,
          y: 24,
          duration: 0.62,
          stagger: 0.06,
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: group,
            start: "top 84%",
            once: true,
          },
        });
      });

      gsap.to("[data-motion='hero-visual']", {
        yPercent: -7,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-motion='home-hero']",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      gsap.to(".passport-route", {
        strokeDashoffset: -84,
        duration: 3.4,
        ease: "none",
        repeat: -1,
      });

      gsap.utils.toArray<HTMLElement>("[data-motion-card]").forEach((card) => {
        const enter = () =>
          gsap.to(card, {
            y: -6,
            scale: 1.012,
            duration: 0.28,
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.28,
            overwrite: "auto",
          });

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        card.addEventListener("focusin", enter);
        card.addEventListener("focusout", leave);

        disposers.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
          card.removeEventListener("focusin", enter);
          card.removeEventListener("focusout", leave);
        });
      });
    });

    const animatedNodes = new WeakSet<Element>();
    const animateLiveNode = (node: Element) => {
      if (animatedNodes.has(node)) return;
      animatedNodes.add(node);
      gsap.from(node, {
        autoAlpha: 0,
        y: 14,
        scale: 0.985,
        duration: 0.34,
        ease: "power2.out",
        clearProps: "opacity,visibility,transform",
      });
    };

    document.querySelectorAll("[data-motion-live]").forEach(animateLiveNode);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;

          if (node.matches("[data-motion-live]")) {
            animateLiveNode(node);
          }

          node.querySelectorAll("[data-motion-live]").forEach(animateLiveNode);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      disposers.forEach((dispose) => dispose());
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [pathname]);

  return null;
}
