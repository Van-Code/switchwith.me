"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = React.useRef<T | null>(null)
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { threshold: 0.25, ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}

function AnimatedLine({
  children,
  delayMs = 0,
  from = "from-left",
}: {
  children: React.ReactNode
  delayMs?: number
  from?: "from-left" | "from-bottom"
}) {
  const animClass = from === "from-bottom" ? "animate-slideUpFade" : "animate-slideInFade"
  const translateClass = from === "from-bottom" ? "translate-y-4" : "-translate-x-6"

  return (
    <span
      className={[
        "block opacity-0",
        translateClass,
        animClass,
        "will-change-transform",
      ].join(" ")}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </span>
  )
}

export default function HomeHeroText() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.3 })

  return (
    <div ref={ref} className="text-white max-w-2xl lg:max-w-3xl">
      {isInView && (
        <>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight lg:tracking-tight">
            <AnimatedLine delayMs={0} from="from-left">
              You want their seats.
            </AnimatedLine>
            <AnimatedLine delayMs={250} from="from-left">
              They want{" "}
              <span className="whitespace-nowrap text-cyan-300">someone else&apos;s</span>
              .{" "}
            </AnimatedLine>
            <AnimatedLine delayMs={500} from="from-left">
              We make it work.
            </AnimatedLine>
          </h1>

          <p className="mt-4 text-base sm:text-lg font-medium text-white/90">
            <AnimatedLine delayMs={850} from="from-bottom">
              Community powered seat swaps
            </AnimatedLine>
          </p>

          <div className="mt-8">
            <AnimatedLine delayMs={1100} from="from-bottom">
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 active:scale-[0.98] transition"
              >
                <Link href="/listings">Switch With Me</Link>
              </Button>
            </AnimatedLine>
          </div>

          <style jsx global>{`
            @keyframes slideInFade {
              0% {
                opacity: 0;
                transform: translate3d(-24px, 0, 0);
              }
              100% {
                opacity: 1;
                transform: translate3d(0, 0, 0);
              }
            }
            @keyframes slideUpFade {
              0% {
                opacity: 0;
                transform: translate3d(0, 16px, 0);
              }
              100% {
                opacity: 1;
                transform: translate3d(0, 0, 0);
              }
            }
            .animate-slideInFade {
              animation: slideInFade 650ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
            }
            .animate-slideUpFade {
              animation: slideUpFade 650ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
            }
          `}</style>
        </>
      )}
    </div>
  )
}
