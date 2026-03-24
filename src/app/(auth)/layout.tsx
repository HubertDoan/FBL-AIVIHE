export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header with logo */}
      <header className="flex items-center justify-center py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            AIVIHE
          </h1>
          <p className="text-muted-foreground mt-1">
            Tr&#x1EE3; l&#x00FD; AI s&#x1EE9;c kh&#x1ECF;e c&#x00E1; nh&#x00E2;n
          </p>
        </div>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-start justify-center px-4 pb-20">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
