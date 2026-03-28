import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drydock Masters",
  description: "A semi-cooperative digital board game of shipyard management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-950 text-steel-300 antialiased">
        {children}
      </body>
    </html>
  );
}
