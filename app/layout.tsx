import type { Metadata, Viewport } from "next"
import { Sora, DM_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme_provider"
import { ClientLayout } from "@/components/client_layout"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
})



export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Tenki Talk : Plan your trip with AI",
  description:
    "Tenki Talk is a conversational Weather AI with voice and text input. Get real-time weather, forecasts, and activity suggestions in Japanese, English, and Hindi.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${dmMono.variable} ${sora.className} antialiased`}>


        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}