"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x py-20">
      <p className="label text-muted">Something went wrong</p>
      <h1 className="display mt-3 text-4xl md:text-5xl">We hit a snag.</h1>
      <p className="mt-4 max-w-md text-muted">The page couldn&apos;t load. Your cart is safe — try again, or head back home.</p>
      <div className="mt-8 flex gap-2">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
