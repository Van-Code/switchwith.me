"use client"

import { SocketProvider } from "../contexts/SocketContext"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>
}
