// react-emails/components/Button.tsx
import * as React from "react";

export function Button({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        padding: "10px 22px",
        background: "linear-gradient(135deg,#4f46e5,#f97316)",
        borderRadius: "999px",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}
