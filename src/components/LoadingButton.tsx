"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ isLoading, loadingText, disabled, children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className={cn(isLoading && "opacity-70")}>
          {isLoading && loadingText ? loadingText : children}
        </span>
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
