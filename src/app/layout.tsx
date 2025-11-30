import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientProviders } from "../components/ClientProviders"
import Footer from "../components/Footer"
import { Header } from "../components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Switch With Me",
  description: "Find and swap Golden State Valkyries tickets with other fans",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientProviders>
          <Header />

          <main className="container mx-auto px-4 py-8 flex-1">
            {children}
          </main>

          <Footer />
        </ClientProviders>
      </body>
    </html>
  )
}