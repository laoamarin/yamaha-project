import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-5xl",
};

export function PageContainer({
  children,
  className,
  size = "md",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6",
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-background via-background to-muted/40",
        className
      )}
    >
      {children}
    </div>
  );
}
