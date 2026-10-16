"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary mt-8 print:hidden">
      Print
    </button>
  );
}
