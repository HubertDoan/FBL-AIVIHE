export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header: FBL logo on top, AIVIHE below */}
      <header className="flex flex-col items-center py-6 gap-3">
        <img
          src="/fbl-logo.jpg"
          alt="FBL - Life Ecosystem"
          className="h-16 w-auto object-contain"
        />
        <img
          src="/AIVIHE.jpg"
          alt="AIVIHE - Trợ lý AI sức khỏe cá nhân"
          className="h-20 w-auto object-contain rounded-lg"
        />
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-start justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          {children}
          <div className="mt-6 text-center">
            <a href="/" className="text-base text-muted-foreground hover:text-primary underline">
              ← Trở về trang chủ
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
