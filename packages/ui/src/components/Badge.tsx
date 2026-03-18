import { type ReactNode } from "react";
import { clsx } from "clsx";

type BadgeVariant = "category" | "yield" | "status" | "network" | "default";
type BadgeStatus = "pending" | "settled" | "failed" | "verified" | "testnet" | "mainnet";

interface BadgeProps {
  variant?: BadgeVariant;
  status?: BadgeStatus;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  status,
  children,
  className,
}: BadgeProps): JSX.Element {
  return (
    <span
      className={clsx(
        "badge",
        `badge--${variant}`,
        status && `badge--${status}`,
        className
      )}
    >
      {children}
    </span>
  );
}
