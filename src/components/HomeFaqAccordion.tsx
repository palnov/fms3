"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import gsap from "gsap";

interface HomeFaqAccordionProps {
  items: Array<[string, string]>;
}

export default function HomeFaqAccordion({ items }: HomeFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    panelRefs.current.forEach((panel, index) => {
      if (!panel) return;

      const content = panel.firstElementChild;
      const targetHeight = openIndex === index && content instanceof HTMLElement ? content.offsetHeight : 0;

      gsap.to(panel, {
        height: targetHeight,
        autoAlpha: openIndex === index ? 1 : 0,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }, [openIndex]);

  return (
    <div data-motion-stagger className="grid items-start gap-3 md:grid-cols-3">
      {items.map(([question, answer], index) => {
        const isOpen = openIndex === index;
        const panelId = `home-faq-${index}`;

        return (
          <section
            key={question}
            data-motion-card
            className={`rounded-2xl border bg-white p-5 shadow-[0_14px_36px_rgba(31,44,65,0.06)] transition-colors duration-200 ${
              isOpen ? "border-[#02629f]/35 shadow-[0_18px_44px_rgba(2,98,159,0.12)]" : "border-[#d8dee7]"
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              className="flex min-h-11 w-full items-center justify-between gap-3 text-left font-extrabold"
            >
              <span>{question}</span>
              <CheckCircle2
                className={`h-5 w-5 shrink-0 text-[#02629f] transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
              />
            </button>
            <div
              id={panelId}
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
              className="h-0 overflow-hidden opacity-0"
            >
              <p className="pt-3 text-sm leading-6 text-[#667287]">{answer}</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
