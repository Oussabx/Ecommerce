import { cn } from "@/lib/format";

/**
 * The OSA "S" mark: one continuous stroke that runs along the top of a
 * rounded square, down the left side, diagonally across, down the right side
 * and back along the bottom. Exported so the loading intro can animate it.
 */
export const MARK_PATH = "M88 10H34A24 24 0 0 0 10 34V58L110 38V62A24 24 0 0 1 86 86H32";
/** The closed rounded square the mark assembles from. */
export const MARK_FRAME = "M34 10H86A24 24 0 0 1 110 34V62A24 24 0 0 1 86 86H34A24 24 0 0 1 10 62V34A24 24 0 0 1 34 10Z";
export const MARK_STROKE = 17;

export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 120 96" className={cn("block h-auto", className)} role="img" aria-label="OSA Techstore" fill="none">
      <path
        d={MARK_PATH}
        strokeWidth={MARK_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: mono ? "currentColor" : "var(--color-accent)" }}
      />
    </svg>
  );
}

/** "OSA" letters with a peaked A and letter-spaced "TECHSTORE" beneath (204 × 62 units). */
function Wordmark() {
  return (
    <>
      <path fillRule="evenodd" d="M20 4h28a18 18 0 0 1 0 36H20A18 18 0 0 1 20 4Zm1.5 10.5h25a7.5 7.5 0 0 1 0 15h-25a7.5 7.5 0 0 1 0-15Z" />
      <path d="M137 9H90.5a6.5 6.5 0 0 0 0 13h28a6.5 6.5 0 0 1 0 13H72" fill="none" stroke="currentColor" strokeWidth="10" />
      <path fillRule="evenodd" d="M172 3 202 40h-13.6L172 19.6 155.6 40H142L172 3Z" />
      <text
        x="1"
        y="60"
        textLength="201"
        lengthAdjust="spacing"
        fontSize="12.5"
        fontWeight="500"
        style={{ fontFamily: "var(--nf-ui), Arial, sans-serif" }}
      >
        TECHSTORE
      </text>
    </>
  );
}

/** The wordmark on its own (OSA + TECHSTORE), in the current text colour. */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 204 62" className={cn("block h-auto", className)} aria-hidden fill="currentColor">
      <Wordmark />
    </svg>
  );
}

/**
 * OSA TECHSTORE logo: the lime S mark beside the wordmark.
 * `compact` shows the mark only; `mono` draws everything in the current text colour (for print).
 */
export function Logo({ className, compact = false, mono = false }: { className?: string; compact?: boolean; mono?: boolean }) {
  if (compact) return <LogoMark className={className} mono={mono} />;
  return (
    <svg viewBox="0 0 352 96" className={cn("block h-auto", className)} role="img" aria-label="OSA Techstore" fill="currentColor">
      <path
        d={MARK_PATH}
        fill="none"
        strokeWidth={MARK_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: mono ? "currentColor" : "var(--color-accent)" }}
      />
      <g transform="translate(144 19)">
        <Wordmark />
      </g>
    </svg>
  );
}
