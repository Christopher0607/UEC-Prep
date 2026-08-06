"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SUBJECTS } from "@/lib/exam";
import { copy } from "@/lib/prompt";
import type { Mastery, SubjectId } from "@/lib/types";

export function Panel({
  title,
  subtitle,
  right,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-surface p-4 sm:p-5">
      {(title || right) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function Button({
  variant = "default",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger";
}) {
  const styles = {
    default: "border bg-surface hover:bg-surface-2",
    primary: "bg-accent text-accent-foreground hover:opacity-90",
    ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
    danger: "border border-danger/40 text-danger hover:bg-danger/10",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {hint && <span className="mb-1 block text-xs text-muted-foreground">{hint}</span>}
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-accent";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputBase} resize-y font-mono leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function SubjectSelect({
  value,
  onChange,
  includeAll = false,
}: {
  value: SubjectId | "all";
  onChange: (v: SubjectId | "all") => void;
  includeAll?: boolean;
}) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as SubjectId | "all")}>
      {includeAll && <option value="all">全部科目</option>}
      {SUBJECTS.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </Select>
  );
}

export const MASTERY_LABELS = ["没学 / 一看就懵", "看得懂但不会做", "会做但慢或易错", "熟练，能默写"];
export const MASTERY_COLORS = ["bg-danger", "bg-warn", "bg-accent", "bg-ok"];

export function MasteryPicker({
  value,
  onChange,
}: {
  value: Mastery;
  onChange: (v: Mastery) => void;
}) {
  return (
    <div className="flex gap-1">
      {([0, 1, 2, 3] as Mastery[]).map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          title={MASTERY_LABELS[level]}
          aria-label={MASTERY_LABELS[level]}
          className={`h-6 w-6 rounded-md border text-xs font-semibold transition ${
            value === level
              ? `${MASTERY_COLORS[level]} border-transparent text-white`
              : "text-muted-foreground hover:bg-surface-2"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

/**
 * The bridge that keeps this app free: instead of calling a model, it hands the
 * student a prompt precise enough to paste straight into a Claude conversation.
 */
export function CopyPrompt({
  build,
  label = "复制给 Claude",
  className = "",
}: {
  build: () => string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 2000);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <Button
      variant={done ? "primary" : "default"}
      className={className}
      onClick={async () => {
        const text = build();
        const ok = await copy(text);
        if (ok) {
          setDone(true);
        } else {
          // Clipboard API needs a secure context and can be blocked outright.
          // Falling back to a prompt() beats silently copying nothing.
          window.prompt("自动复制被浏览器挡住了，手动全选复制：", text);
        }
      }}
    >
      {done ? "✓ 已复制，去贴给 Claude" : label}
    </Button>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

const noopSubscribe = () => () => {};

/**
 * Renders children only after hydration, for anything that reads localStorage
 * or the clock. Uses useSyncExternalStore rather than a mount effect so React
 * treats the server and client snapshots as intentionally different instead of
 * as a hydration mismatch.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return <>{children}</>;
}
