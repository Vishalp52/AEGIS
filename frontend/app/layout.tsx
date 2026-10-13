import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AEGIS | Behavioral access security",
  description: "Evidence-based access control for Monad wallets, with human review and on-chain audit evidence.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
