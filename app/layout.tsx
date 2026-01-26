import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme_provider"
import { ClientLayout } from "@/components/client_layout"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tenki-Talk : Multilingual Weather AI",
  description:
    "Tenki-Talk is a conversational Weather AI with voice and text input. Get real-time weather, forecasts, and activity suggestions in Japanese, English, and Hindi.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}