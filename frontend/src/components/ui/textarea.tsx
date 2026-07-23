import * as React from "react"
import { cn } from "@/lib/utils"

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"
