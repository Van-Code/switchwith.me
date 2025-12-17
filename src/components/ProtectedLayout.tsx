"use client"

import React, { useEffect, useState } from "react"
import { useIdleTimer } from "react-idle-timer"
import { SessionProvider } from "next-auth/react"
import { signOut } from "next-auth/react"
import { Session } from "next-auth"
interface Props {
  children: React.ReactNode
  session?: Session | null
}

export default function ProtectedLayout({ children, session }: Props) {
  const [state, setState] = useState<string>("Active")
  const [count, setCount] = useState<number>(0)
  const [remaining, setRemaining] = useState<number>(0)

  const onIdle = async () => {
    // User has been idle for 5 minutes, sign them out
    setState("Idle")

    if (session?.user?.id) {
      // Sign out with redirect to ensure both client and server sessions are cleared
      // The redirect: true ensures a full page navigation, which clears server-side session cache
      await signOut({
        callbackUrl: "/auth/signin?reason=idle",
        redirect: true,
      })
    }
  }

  const onActive = () => {
    setState("Active")
  }

  const onAction = () => {
    setCount(count + 1)
  }

  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onActive,
    onAction,
    //timeout: 10_000,
    timeout: 480 * (60 * 1000),
    throttle: 500,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, 500)

    return () => {
      clearInterval(interval)
    }
  })

  return <SessionProvider>{children}</SessionProvider>
}
