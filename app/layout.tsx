import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heritage Studio | Wear Your Own Expression",
  description:
    "Discover everyday clothing and personalized apparel at Heritage Studio.",
  icons: {
    icon: "/icons/HS%20Logo%20mark%20b.png",
  },
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