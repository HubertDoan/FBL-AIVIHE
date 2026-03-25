import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Đăng nhập</h2>
        <p className="text-muted-foreground">
          Chọn loại tài khoản và nhập thông tin đăng nhập
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-base">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Đăng ký mới
        </Link>
      </p>
    </div>
  )
}
