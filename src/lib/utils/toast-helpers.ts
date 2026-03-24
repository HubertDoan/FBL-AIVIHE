import { toast } from "sonner"

const DEFAULT_DURATION = 4000

export function toastSuccess(message: string = "Thành công!") {
  toast.success(message, { duration: DEFAULT_DURATION })
}

export function toastError(message: string = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  toast.error(message, { duration: 6000 })
}

export function toastInfo(message: string) {
  toast.info(message, { duration: DEFAULT_DURATION })
}

export function toastLoading(message: string = "Đang xử lý...") {
  return toast.loading(message)
}

export function toastDismiss(toastId: string | number) {
  toast.dismiss(toastId)
}

/** Show loading toast, run async fn, then show success/error toast */
export async function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading?: string
    success?: string
    error?: string
  } = {},
): Promise<T> {
  const result = toast.promise(promise, {
    loading: messages.loading ?? "Đang xử lý...",
    success: messages.success ?? "Thành công!",
    error: messages.error ?? "Đã xảy ra lỗi. Vui lòng thử lại.",
  })
  return result.unwrap()
}
