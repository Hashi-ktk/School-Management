import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  subtle?: boolean;
  hover?: boolean;
  variant?: 'default' | 'gradient' | 'glass' | 'outlined';
  glow?: boolean;
}

export default function Card({
  children,
  className = "",
  subtle = false,
  hover = true,
  variant = 'default',
  glow = false,
  ...props
}: CardProps) {
  const base = "relative rounded-2xl text-slate-800";

  const padding = subtle ? "p-5 md:p-6" : "p-6 md:p-7";

  const variantStyles = {
    default: "bg-white border border-gray-200/80 shadow-sm",
    gradient: "bg-gradient-to-br from-white via-slate-50/50 to-white border border-gray-200/60 shadow-md",
    glass: "bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg",
    outlined: "bg-transparent border-2 border-gray-200"
  };

  const hoverStyles = hover
    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200/50"
    : "";

  const glowStyles = glow
    ? "shadow-lg shadow-purple-500/10"
    : "";

  return (
    <div
      className={`${base} ${padding} ${variantStyles[variant]} ${hoverStyles} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
