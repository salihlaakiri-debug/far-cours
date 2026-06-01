import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سلاح المدرعات — منصة التدريب الإلكتروني",
  description: "منصة التدريب الإلكتروني لسلاح المدرعات — القوات المسلحة الملكية المغربية",
  icons: [{ rel: "icon", url: "/ERB.png" }, { rel: "apple-touch-icon", url: "/ERB.png" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FAR Lessons",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#0f172a",
    "theme-color": "#0f172a",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/ERB.png" />
      </head>
      <body
        className="min-h-screen bg-[#0f172a] text-[#f1f5f9] antialiased"
        style={{ fontFamily: "'Tajawal', system-ui, -apple-system, sans-serif" }}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", () => {
                  navigator.serviceWorker.register("/sw.js");
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
