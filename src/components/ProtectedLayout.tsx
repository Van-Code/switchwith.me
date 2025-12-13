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
    //do signout and delete session
    setState("Idle")

    if (session?.user?.id)
      signOut({
        callbackUrl: "/auth/signin",
        redirect: true,
      })
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
    timeout: 5 * 60 * 1000,
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
