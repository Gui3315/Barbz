
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="barber-gradient p-0.5 rounded-md">
        <div className="bg-white dark:bg-barber-DEFAULT p-1 rounded-sm">
          <div className="bg-gradient-to-r from-barber-copper to-barber-gold rounded-sm flex items-center justify-center">
            <span className="text-white font-bold px-1">
              {size === "sm" ? "B" : "BARBZ"}
            </span>
          </div>
        </div>
      </div>
      {size !== "sm" && (
        <span className={cn("font-bold text-barber-DEFAULT dark:text-white", sizeClasses[size])}>
          BARBZ
        </span>
      )}
    </div>
  );
}
