import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pixie Journey - Your Life, Honestly Visualized",
  description:
    "Health tracking app combining bullet journal aesthetics with clinical-grade functionality. Track mood, sleep, and symptoms with context notes and AI-powered insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* WUUNU SNIPPET - DON'T CHANGE THIS (START) */}
        {process.env.NODE_ENV !== "production" && (
          <>
            <Script id="wuunu-ws" strategy="afterInteractive">
              {`window.__WUUNU_WS__ = "http://127.0.0.1:37175/?token=a4202b72040ff35b6b1778a3f221060fb168570aa959dcd8";`}
            </Script>
            <Script
              id="wuunu-widget"
              src="https://cdn.jsdelivr.net/npm/@wuunu/widget@0.1.21"
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
          </>
        )}
        {/* WUUNU SNIPPET - DON'T CHANGE THIS (END) */}
      </body>
    </html>
  );
}
