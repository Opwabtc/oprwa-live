import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps): JSX.Element {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        loading && "btn--loading",
        className
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span className="btn__loader" aria-hidden="true" />
      ) : null}
      <span className={loading ? "btn__text btn__text--loading" : "btn__text"}>
        {children}
      </span>
    </button>
  );
}
