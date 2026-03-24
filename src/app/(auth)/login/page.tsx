import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'
import { DemoLoginSection } from '@/components/auth/demo-login-section'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">
          {isDemoMode ? '\u0110\u0103ng nh\u1EADp Demo' : '\u0110\u0103ng nh\u1EADp'}
        </h2>
        <p className="text-muted-foreground">
          {isDemoMode
            ? 'Ch\u1ECDn t\u00E0i kho\u1EA3n demo ho\u1EB7c nh\u1EADp email/m\u1EADt kh\u1EA9u'
            : 'Nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i \u0111\u1EC3 nh\u1EADn m\u00E3 x\u00E1c th\u1EF1c'}
        </p>
      </div>

      {isDemoMode ? (
        <DemoLoginSection />
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <p className="text-sm text-muted-foreground text-center">
              Ch\u00FAng t\u00F4i s\u1EBD g\u1EEDi m\u00E3 OTP qua SMS \u0111\u1EBFn s\u1ED1 \u0111i\u1EC7n tho\u1EA1i c\u1EE7a b\u1EA1n
            </p>
          </CardHeader>
          <CardContent>
            <PhoneOtpForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
