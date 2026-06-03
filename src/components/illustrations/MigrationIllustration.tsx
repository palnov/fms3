"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function MigrationIllustration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const passportRef = useRef<SVGGElement>(null);
  const visaRef = useRef<SVGGElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const orbit1Ref = useRef<SVGCircleElement>(null);
  const orbit2Ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Subtle floating loop for the entire SVG container
    gsap.to(containerRef.current, {
      y: -10,
      duration: 6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // 1. Passport Floating & Tilting (luxurious slower wave)
    if (passportRef.current) {
      gsap.to(passportRef.current, {
        y: -18,
        rotation: 2,
        duration: 5,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    }

    // 2. Visa Document Sheet Floating (counters the passport animation)
    if (visaRef.current) {
      gsap.to(visaRef.current, {
        y: 12,
        rotation: -3,
        duration: 7,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    }

    // Orbit speed offset loop
    if (orbit1Ref.current) {
      gsap.to(orbit1Ref.current, {
        strokeDashoffset: -100,
        duration: 12,
        ease: "none",
        repeat: -1,
      });
    }

    if (orbit2Ref.current) {
      gsap.to(orbit2Ref.current, {
        strokeDashoffset: 100,
        duration: 16,
        ease: "none",
        repeat: -1,
      });
    }

    // Plane micro-bobbing
    if (planeRef.current) {
      gsap.to(planeRef.current, {
        x: 8,
        y: -8,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full max-w-[480px] aspect-square mx-auto flex items-center justify-center cursor-pointer select-none"
    >
      {/* Glow Backdrops */}
      <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/15 rounded-full filter blur-3xl animate-pulse-glow -z-10"></div>
      <div className="absolute w-3/4 h-3/4 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full filter blur-3xl -z-10"></div>

      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_20px_50px_rgba(139,92,246,0.15)] dark:drop-shadow-[0_20px_50px_rgba(139,92,246,0.25)]"
      >
        {/* Orbit Route 1 (Outer) */}
        <circle
          ref={orbit1Ref}
          cx="250"
          cy="250"
          r="200"
          stroke="url(#orbitGradient1)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          className="opacity-60"
        />

        {/* Orbit Route 2 (Inner) */}
        <circle
          ref={orbit2Ref}
          cx="250"
          cy="250"
          r="150"
          stroke="url(#orbitGradient2)"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="opacity-40"
        />

        {/* Glowing holographic center glow */}
        <circle cx="250" cy="250" r="100" fill="url(#centerGlow)" className="opacity-30" />

        {/* ================= ELEMENT 1: VISA DOCUMENT SHEET ================= */}
        <g ref={visaRef} id="visa-sheet">
          {/* Main Paper Sheet Shadow & Base */}
          <rect
            x="110"
            y="130"
            width="200"
            height="270"
            rx="16"
            fill="url(#visaBg)"
            stroke="url(#visaBorder)"
            strokeWidth="1.5"
            className="backdrop-blur-sm"
          />

          {/* Visa Text Lines Lines */}
          <g opacity="0.8">
            {/* Header banner */}
            <rect x="130" y="155" width="80" height="8" rx="3" fill="url(#blueText)" />
            <circle cx="275" cy="160" r="5" fill="#1953b5" />

            {/* Content text skeleton */}
            <line x1="130" y1="185" x2="270" y2="185" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
            <line x1="130" y1="205" x2="250" y2="205" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
            <line x1="130" y1="225" x2="280" y2="225" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
            
            {/* Block sections */}
            <rect x="130" y="250" width="50" height="25" rx="6" fill="rgba(25, 83, 181, 0.05)" stroke="rgba(25, 83, 181, 0.15)" strokeWidth="1" />
            <rect x="190" y="250" width="90" height="25" rx="6" fill="rgba(25, 83, 181, 0.05)" stroke="rgba(25, 83, 181, 0.15)" strokeWidth="1" />

            <line x1="130" y1="300" x2="280" y2="300" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="130" y1="325" x2="210" y2="325" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
            <line x1="130" y1="345" x2="240" y2="345" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Holographic Seal on Visa */}
          <circle cx="255" cy="335" r="18" fill="rgba(25, 83, 181, 0.05)" stroke="#1953b5" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M250 335 L253 338 L260 331" stroke="#1953b5" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* ================= ELEMENT 2: PASSPORT BOOKLET ================= */}
        <g ref={passportRef} id="passport-booklet">
          {/* Passport Shadow / Outer Border Glow */}
          <rect
            x="200"
            y="190"
            width="180"
            height="250"
            rx="20"
            fill="url(#passportCoverBg)"
            stroke="url(#passportCoverBorder)"
            strokeWidth="2"
            className="drop-shadow-2xl"
          />

          {/* Passport Cover Details (Gold/Bronze lines on cover) */}
          <g opacity="0.9">
            {/* Top Text placeholder */}
            <rect x="235" y="220" width="110" height="7" rx="3" fill="#ffe0b2" opacity="0.25" />
            <rect x="255" y="235" width="70" height="5" rx="2.5" fill="#ffe0b2" opacity="0.15" />

            {/* Emblem circle with crest skeleton (star centered visually at 290, 300) */}
            <circle cx="290" cy="300" r="30" stroke="url(#passportGold)" strokeWidth="1.5" fill="none" />
            <polygon points="290,278 298,293 313,293 301,303 305,318 290,307 275,318 279,303 267,293 282,293" fill="url(#passportGold)" opacity="0.85" />
            
            {/* Bottom biometric chip emblem */}
            <rect x="278" y="380" width="24" height="16" rx="4" fill="none" stroke="url(#passportGold)" strokeWidth="1.5" />
            <line x1="278" y1="388" x2="302" y2="388" stroke="url(#passportGold)" strokeWidth="1.5" />
            <circle cx="290" cy="388" r="3" fill="url(#passportGold)" />
          </g>
        </g>

        {/* Paper Plane */}
        <g ref={planeRef}>
          <path
            d="M 365 146 L 373 152 L 363 160 L 364 153 Z"
            fill="#1953b5"
          />
          <path
            d="M 371 150 L 341 175 L 349 182 L 371 150 Z"
            fill="url(#planeGrad)"
            className="drop-shadow-lg"
          />
        </g>

        {/* Floating Sparks */}
        <circle cx="340" cy="180" r="3.5" fill="#e11d48" className="animate-pulse" />
        <circle cx="150" cy="120" r="4" fill="#1953b5" />
        <circle cx="100" cy="270" r="2.5" fill="#94a3b8" />
        <circle cx="410" cy="330" r="5" fill="#1953b5" className="opacity-80" />

        {/* ================= DEFINITIONS OF GRADIENTS ================= */}
        <defs>
          <linearGradient id="orbitGradient1" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1953b5" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#64748b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="orbitGradient2" x1="500" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1953b5" stopOpacity="0.1" />
          </linearGradient>

          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1953b5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1953b5" stopOpacity="0" />
          </radialGradient>

          {/* Visa Sheet Gradients */}
          <linearGradient id="visaBg" x1="110" y1="130" x2="310" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.98)" />
            <stop offset="100%" stopColor="rgba(240, 244, 248, 0.9)" />
          </linearGradient>
          <linearGradient id="visaBorder" x1="110" y1="130" x2="310" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(25, 83, 181, 0.2)" />
          </linearGradient>
          <linearGradient id="blueText" x1="130" y1="155" x2="210" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1953b5" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="130" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(100, 116, 139, 0.4)" />
            <stop offset="100%" stopColor="rgba(100, 116, 139, 0.08)" />
          </linearGradient>

          {/* Passport Gradients - RF Authentic Dark Red Cover */}
          <linearGradient id="passportCoverBg" x1="200" y1="190" x2="380" y2="440" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#80141b" />
            <stop offset="100%" stopColor="#4a070c" />
          </linearGradient>
          <linearGradient id="passportCoverBorder" x1="200" y1="190" x2="380" y2="440" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(184, 29, 36, 0.5)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
          </linearGradient>
          <linearGradient id="passportGold" x1="270" y1="280" x2="320" y2="390" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="planeGrad" x1="341" y1="175" x2="371" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
