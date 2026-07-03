"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
};

export function RegistrationFloatingField({
  id,
  label,
  required,
  type = "text",
  value,
  onChange,
  helperText,
}: Props) {
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder=" "
          className={cn(
            "peer h-14 rounded-2xl border-2 border-yamaha-purple-muted bg-white px-4 pt-5 pb-2 text-base shadow-sm",
            "focus-visible:border-yamaha-purple focus-visible:ring-4 focus-visible:ring-yamaha-purple/15"
          )}
        />
        <Label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground transition-all",
            "peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-yamaha-purple",
            "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-yamaha-purple"
          )}
        >
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      </div>
      {helperText && (
        <p className="px-1 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
