import type { Metadata } from "next";
export const metadata: Metadata = { title: "BXB OS", description: "Your life, connected." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
