export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header: AIVIHE nhỏ ở giữa trên cùng, FBL bên phải */}
      <header className="relative flex items-center justify-center py-3 px-4">
        <img
          src="/AIVIHE.jpg"
          alt="AIVIHE - Trợ lý AI sức khỏe cá nhân"
          className="h-10 w-auto object-contain rounded"
        />
        <img
          src="/fbl-logo.jpg"
          alt="FBL - For Better Life"
          className="absolute right-4 h-10 w-auto object-contain"
        />
      </header>

      {/* Centered content - đẩy lên sát header */}
      <main className="flex-1 flex items-start justify-center px-4 pt-2 pb-10">
        <div className="w-full max-w-md">
          {children}
          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary underline">
              ← Trở về trang chủ
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
