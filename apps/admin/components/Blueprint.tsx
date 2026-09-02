import type { ReactNode } from "react";

/** The Industry system's wireframe frame: square, hairline-bordered, with
 * "+" registration marks at all four corners. Use for cards, figures and
 * the one solid primary-action fill — never round it, never add a surface
 * fill besides the deliberate accent exception. */
export function Blueprint({
  children,
  className = "",
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div className={`blueprint ${accent ? "border-accent-400 bg-accent-100" : ""} ${className}`}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      {children}
    </div>
  );
}
