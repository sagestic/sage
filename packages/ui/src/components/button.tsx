"use client";

import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: 500,
    cursor: "pointer",
    border: variant === "primary" ? "none" : "1px solid #ccc",
    backgroundColor: variant === "primary" ? "#000" : "#fff",
    color: variant === "primary" ? "#fff" : "#000",
    ...style,
  };

  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  );
};
