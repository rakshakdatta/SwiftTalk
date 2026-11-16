import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftTalk – Real-Time Chat App",
  description: "A responsive, scalable chat frontend built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-white text-gray-900 antialiased min-h-dvh"
      >
        {children}
      </body>
    </html>
  );
}
