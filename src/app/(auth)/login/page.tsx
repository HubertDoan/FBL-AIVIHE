import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'
import { DemoLoginSection } from '@/components/auth/demo-login-section'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">
          {isDemoMode ? 'Đăng nhập Demo' : 'Đăng nhập'}
        </h2>
        <p className="text-muted-foreground">
          {isDemoMode
            ? 'Chọn tài khoản demo hoặc nhập email/mật khẩu'
            : 'Nhập số điện thoại để nhận mã xác thực'}
        </p>
      </div>

      {isDemoMode ? (
        <DemoLoginSection />
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <p className="text-sm text-muted-foreground text-center">
              Chúng tôi sẽ gửi mã OTP qua SMS đến số điện thoại của bạn
            </p>
          </CardHeader>
          <CardContent>
            <PhoneOtpForm />
          </CardContent>
        </Card>
      )}
      <p className="text-center text-base">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  )
}
