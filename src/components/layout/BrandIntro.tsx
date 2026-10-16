import { LogoWordmark, MARK_FRAME, MARK_PATH, MARK_STROKE } from "./Logo";

/**
 * Loading intro: the rounded square draws in, breaks open and twists into the
 * S mark, then the wordmark rises and the curtain fades away. Pure CSS (see
 * `.brand-intro` in globals.css), so it never blocks the page. Shown once per
 * browser session and skipped for reduced motion.
 */
export function BrandIntro() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("osa-intro"))document.documentElement.classList.add("intro-seen");else sessionStorage.setItem("osa-intro","1")}catch(e){}`,
        }}
      />
      <div className="brand-intro" aria-hidden>
        <div className="brand-intro__stage">
          <svg viewBox="0 0 120 96" className="brand-intro__mark" fill="none">
            <path className="brand-intro__frame" d={MARK_FRAME} pathLength={1} strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round" />
            <path className="brand-intro__s" d={MARK_PATH} pathLength={1} strokeWidth={MARK_STROKE} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <LogoWordmark className="brand-intro__word" />
        </div>
      </div>
    </>
  );
}
