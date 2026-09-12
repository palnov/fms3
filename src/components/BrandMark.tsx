import type { CSSProperties } from "react";

type BrandMarkProps = {
  className?: string;
  style?: CSSProperties;
};

export default function BrandMark({ className = "h-7 w-7", style }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      style={style}
      fill="none"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M9 7.5h12.5l9.5 9v17H9z" fill="currentColor" />
      <path d="M21.5 7.5v9h9.5" stroke="#c8aa70" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m20 16 4.8 8.2-8.2-4.8L20 16Z" fill="#c8aa70" />
      <path d="M14 27h11M14 30h7" stroke="#f1f0e9" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
