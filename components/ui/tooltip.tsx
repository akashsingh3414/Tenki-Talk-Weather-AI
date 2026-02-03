"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { AlertTriangle, Sparkles } from "lucide-react"

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipPortal = TooltipPrimitive.Portal

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-[9999] overflow-hidden rounded-xl border border-white/20 bg-slate-950/90 px-4 py-2.5 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

interface TooltipProps {
  children: React.ReactNode
  content: string
  visible?: boolean
  variant?: "warning" | "info"
  side?: "top" | "bottom" | "left" | "right"
  delayDuration?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  visible,
  variant = "warning",
  side = "top",
  delayDuration = 200,
  className
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot open={visible}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side={side}
            className={cn(
              "flex items-center gap-2.5 font-bold tracking-tight shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
              variant === "warning"
                ? "bg-slate-900/95 border-amber-500/20 ring-1 ring-amber-500/10"
                : "bg-blue-600/90 border-blue-400/30 ring-1 ring-blue-400/20",
              className
            )}
          >
            {variant === "warning" && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={12} className="text-amber-400" />
              </div>
            )}
            {variant === "info" && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100/20 flex items-center justify-center">
                <Sparkles size={12} className="text-blue-100" />
              </div>
            )}
            <span className="text-[13px] leading-tight">{content}</span>
            <TooltipPrimitive.Arrow className="fill-slate-900 shadow-xl" />
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
  )
}

export { TooltipRoot, TooltipTrigger, TooltipContent, TooltipProvider }
