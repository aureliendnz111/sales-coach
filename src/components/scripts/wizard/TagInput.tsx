"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  default:   { tag: "bg-stone-100 text-stone-700",    x: "text-stone-400 hover:text-stone-700" },
  blue:      { tag: "bg-blue-50 text-blue-900",       x: "text-blue-300 hover:text-blue-700" },
  violet:    { tag: "bg-violet-50 text-violet-900",   x: "text-violet-300 hover:text-violet-700" },
  amber:     { tag: "bg-amber-50 text-amber-800",     x: "text-amber-300 hover:text-amber-700" },
  outline:   { tag: "border border-stone-200 text-stone-500 bg-white", x: "text-stone-400 hover:text-stone-700" },
};

type Variant = keyof typeof VARIANTS;

export function TagInput({ values, onChange, placeholder, variant = "default" }: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  variant?: Variant;
}) {
  const [input, setInput] = useState("");
  const style = VARIANTS[variant];

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  }

  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className={cn("inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg", style.tag)}>
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className={cn("transition-colors", style.x)}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
        onBlur={add}
        placeholder={placeholder}
        className="h-8 text-xs border-stone-200 placeholder:text-stone-400 focus-visible:ring-stone-300"
      />
    </div>
  );
}
