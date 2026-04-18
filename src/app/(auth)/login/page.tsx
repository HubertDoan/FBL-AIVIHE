import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Đăng nhập AIVIHE</h2>
        <p className="text-muted-foreground">
          Nền tảng quản lý thông tin sức khỏe cá nhân của hệ sinh thái Thong Dong
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-base">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Đăng ký tư vấn
        </Link>
      </p>
    </div>
  )
}
