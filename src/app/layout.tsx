import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Tarot - Your 24/7 Tarot Advisor",
  description:
    "Get instant AI-powered tarot readings with deep insights. Ask your question, draw cards, and receive personalized guidance from our mystical AI oracle.",
  keywords: [
    "tarot",
    "AI tarot",
    "tarot reading",
    "tarot cards",
    "psychic reading",
    "spiritual guidance",
    "love tarot",
    "career tarot",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <Providers>
          <I18nProvider>
            <div className="relative min-h-screen">
              {/* Floating particles */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 6}s`,
                      animationDuration: `${4 + Math.random() * 4}s`,
                    }}
                  >
                    <div className="w-1 h-1 bg-tarot-gold/30 rounded-full" />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="relative z-10">{children}</div>
            </div>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
