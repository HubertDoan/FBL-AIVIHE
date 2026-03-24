import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const

interface LoadingSpinnerProps {
  size?: keyof typeof sizeMap
  label?: string
  className?: string
}

export function LoadingSpinner({
  size = "md",
  label = "Đang tải...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      data-slot="loading-spinner"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <Loader2Icon className={cn("animate-spin text-muted-foreground", sizeMap[size])} />
      {label && (
        <span className="text-base text-muted-foreground">{label}</span>
      )}
    </div>
  )
}
