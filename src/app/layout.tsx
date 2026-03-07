import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RG Digital",
    template: "%s • RG Digital",
  },
  description:
    "Plataforma para jornada do colaborador: recrutamento, onboarding, rotinas, performance, PDI e progressão.",
  applicationName: "RG Digital",
  manifest: "/manifest.json",
  // metadataBase: new URL("https://seu-dominio.com"), // quando tiver domínio
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { getBrandingSettings } from "./actions/branding";
import { DynamicThemeProvider } from "@/components/providers/DynamicThemeProvider";
import { Toaster } from "@/components/ui/feedback";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getBrandingSettings();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "antialiased",
          "min-h-screen",
          "bg-background",
          "text-foreground",
        ].join(" ")}
      >
        <DynamicThemeProvider settings={branding as any}>
          {children}
          <Toaster />
        </DynamicThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
