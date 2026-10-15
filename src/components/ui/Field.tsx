import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/format";

interface Base {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
}

function Wrap({ label, name, error, hint, optional, className, children }: Base & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium">
        {label}
        {optional && <span className="label text-subtle">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (name: string, error?: string, hint?: ReactNode) => (error ? `${name}-error` : hint ? `${name}-hint` : undefined);

export function TextField({ label, name, error, hint, optional, className, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap {...{ label, name, error, hint, optional, className }}>
      <input id={name} name={name} className="field" aria-invalid={!!error} aria-describedby={describedBy(name, error, hint)} required={!optional} {...rest} />
    </Wrap>
  );
}

export function SelectField({ label, name, error, hint, optional, className, children, ...rest }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap {...{ label, name, error, hint, optional, className }}>
      <select id={name} name={name} className="field" aria-invalid={!!error} aria-describedby={describedBy(name, error, hint)} required={!optional} {...rest}>
        {children}
      </select>
    </Wrap>
  );
}

export function TextAreaField({ label, name, error, hint, optional, className, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap {...{ label, name, error, hint, optional, className }}>
      <textarea id={name} name={name} className={cn("field min-h-24 resize-y")} aria-invalid={!!error} aria-describedby={describedBy(name, error, hint)} required={!optional} {...rest} />
    </Wrap>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
