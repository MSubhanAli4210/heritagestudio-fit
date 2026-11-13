import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heuristic Studio | Wear Your Own Expression",
  description:
    "Discover everyday clothing and personalized apparel at Heuristic Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}