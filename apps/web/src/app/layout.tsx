import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Sage",
  description: "Sage Web Application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
