import type { Metadata, Viewport } from "next";
import "../src/styles.css";

export const metadata: Metadata = {
  title: "Growzzy OS",
  description: "Research, plan and launch complete ad campaigns from one conversation.",
};

export const viewport: Viewport = { themeColor: "#F6F7F9", userScalable: false };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-canvas"><body>{children}</body></html>;
}
