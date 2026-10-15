import { cn } from "@/lib/format";

/**
 * OSA TECHSTORE wordmark — vector recreation of the supplied logo
 * (geometric "OSA" with a peaked A and letter-spaced "TECHSTORE" beneath).
 * Swap in the original vector artwork when it is available.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <svg
      viewBox={compact ? "0 0 204 44" : "0 0 204 62"}
      className={cn("block h-auto", className)}
      role="img"
      aria-label="OSA Techstore"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M20 4h28a18 18 0 0 1 0 36H20A18 18 0 0 1 20 4Zm1.5 10.5h25a7.5 7.5 0 0 1 0 15h-25a7.5 7.5 0 0 1 0-15Z"
      />
      <path d="M137 9H90.5a6.5 6.5 0 0 0 0 13h28a6.5 6.5 0 0 1 0 13H72" fill="none" stroke="currentColor" strokeWidth="10" />
      <path fillRule="evenodd" d="M172 3 202 40h-13.6L172 19.6 155.6 40H142L172 3Z" />
      {!compact && (
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
      )}
    </svg>
  );
}
