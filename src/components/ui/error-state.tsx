import { TriangleAlertIcon, RefreshCwIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  message = "Đã xảy ra lỗi. Vui lòng thử lại sau.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-10 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-destructive/10 p-4">
        <TriangleAlertIcon className="size-8 text-destructive" />
      </div>
      <p className="max-w-sm text-lg font-medium text-destructive">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="lg"
          onClick={onRetry}
          className="mt-2 gap-2"
        >
          <RefreshCwIcon className="size-4" />
          Thử lại
        </Button>
      )}
    </div>
  )
}
