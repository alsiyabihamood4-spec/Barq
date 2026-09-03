import type { ReactNode } from "react";
import { LocaleProvider } from "../components/LocaleProvider";
import "./globals.css";

export const metadata = {
  title: "BARQ Admin · برق",
  description: "Sultanate of Oman — customs clearance & freight tender operations console.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-lang="ar">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
