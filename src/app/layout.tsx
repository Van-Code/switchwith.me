import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "@/components/Footer"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { auth } from "@/lib/auth-server"
import ProtectedLayout from "@/components/ProtectedLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Switch With Me",
  description: "Find and swap Golden State Valkyries tickets with other fans",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ProtectedLayout session={session}>
          <Header />
          <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
        </ProtectedLayout>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
