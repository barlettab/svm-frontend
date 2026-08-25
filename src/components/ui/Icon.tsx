import { cx } from "./cx";

/** Nomes disponíveis em public/icons.svg (prefixo svm-). */
export type IconName =
  | "bell" | "user" | "help" | "logout"
  | "arrow-left" | "chev-down" | "chev-up" | "chev-right" | "chev-left"
  | "chev-first" | "chev-last"
  | "calendar" | "search" | "eraser" | "plus" | "download" | "upload"
  | "eye" | "edit" | "trash" | "check" | "x"
  | "warning" | "info" | "clock" | "doc" | "paperclip"
  | "filter" | "sort" | "grid" | "inbox" | "spinner" | "menu" | "history"
  | "alterar-solicitante";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 16, strokeWidth, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cx("shrink-0", className)}
      style={strokeWidth ? { strokeWidth } : undefined}
    >
      <use href={"/icons.svg#svm-" + name} />
    </svg>
  );
}
