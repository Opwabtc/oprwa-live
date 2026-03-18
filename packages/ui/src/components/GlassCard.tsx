import { type ReactNode } from "react";
import { clsx } from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className,
  onClick,
  hoverable = false,
}: GlassCardProps): JSX.Element {
  return (
    <div
      className={clsx("glass-card", hoverable && "glass-card--hoverable", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
