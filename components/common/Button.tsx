import React from "react";

type Variant = "primary" | "secondary" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: React.ReactNode;
  className?: string;
}

export default function Button({ children, variant = "primary", icon, className = "", ...props }: ButtonProps) {
  const baseStyle =
    "rounded-md font-bold transition-all text-xs tracking-wide flex items-center justify-center space-x-2 cursor-pointer active:scale-95";

  const variants: Record<Variant, string> = {
    primary: "group bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 transform hover:-translate-y-0.5 px-7 py-3.5",
    secondary:
      "border border-card-border bg-card-bg/50 backdrop-blur-sm text-text-main hover:border-brand/40 hover:text-brand shadow-sm px-7 py-3.5",
    icon: "bg-card-bg border border-card-border shadow-sm text-brand hover:border-brand/30 p-3",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children && <span>{children}</span>}
      {icon}
    </button>
  );
}
