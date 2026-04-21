# Security Hardening Phase 1 — Deployment Checklist

**Stack**: Cloudflare (free) + Upstash Redis (free) + Next.js security headers
**Mục tiêu**: Chặn 90% attack vector với $0/tháng
**Pilot**: chỉ VN — geo-block giảm 80% attack surface ngay

## Đã triển khai code (commit này)

| Layer | File | Status |
|-------|------|--------|
| Security headers | `next.config.ts` | ✅ HSTS, X-Frame, CSP-ready, Permissions-Policy |
| Rate limit lib | `src/lib/security/rate-limit-upstash-sliding-window.ts` | ✅ Sliding window, 6 policies |
| Turnstile server verify | `src/lib/security/cloudflare-turnstile-server-verify.ts` | ✅ |
| Turnstile widget | `src/components/security/cloudflare-turnstile-widget-client.tsx` | ✅ Invisible/flexible |
| Applied: login | `src/app/api/demo/login/route.ts` | ✅ 5 lần/15 phút/IP |
| Applied: register | `src/app/api/auth/register/route.ts` | ✅ 3 lần/giờ/IP + Turnstile |
| Applied: consultation | `src/app/api/consultation-request/route.ts` | ✅ 3 lần/giờ/IP + Turnstile |
| Applied: doctor-app | `src/app/api/doctor-application/route.ts` | ✅ 3 lần/giờ/IP + Turnstile |
| Forms wired | 3 forms (register, consultation, doctor-app) | ✅ Turnstile widget |

**Fail-open design**: nếu env vars trống → code tự bypass, không break production.

---

## Cần cấu hình external (một lần, ~30 phút)

### 1. Cloudflare DNS + Bot Fight Mode (15 phút)

1. Đăng ký Cloudflare free: https://dash.cloudflare.com/sign-up
2. Add site `aivihe.vn` → copy 2 nameserver Cloudflare cấp
3. Đăng ký name `aivihe.vn` → đổi nameserver sang Cloudflare (propagate 1-24h)
4. Trong Cloudflare dashboard:
   - **SSL/TLS** → mode "Full (strict)"
   - **Security** → Bot Fight Mode: ON
   - **Security** → Security Level: Medium
   - **Security** → Challenge Passage: 30 min
   - **Rules → WAF → Custom rules** → tạo rule:
     - **Geo-block**: nếu country ≠ VN → Challenge (pilot VN only)
     - **Block bad bots**: cf.client.bot = false AND user_agent contains "curl|wget|bot" → Block
   - **Rules → Rate limiting rules** (free 10k/tháng):
     - `POST /api/*` > 30 req/phút/IP → Block 10 phút
5. Test: `curl -I https://aivihe.vn` → header có `CF-RAY`

### 2. Cloudflare Turnstile site (5 phút)

1. Cloudflare dashboard → **Turnstile** (sidebar) → Add site
2. Domain: `aivihe.vn`, `localhost` (dev)
3. Widget mode: **Managed** (auto-challenge bot, real user invisible)
4. Copy **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
5. Copy **Secret Key** → `TURNSTILE_SECRET_KEY`

### 3. Upstash Redis (5 phút)

1. Sign up: https://console.upstash.com/
2. Create Database → **Redis** → region `ap-southeast-1` (Singapore — gần VN nhất)
3. Tab "REST API":
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`
4. Free tier: 10k commands/day (đủ pilot ~500 users/ngày)

### 4. Vercel env vars (5 phút)

Vercel project → Settings → Environment Variables → thêm 4 secret:

```
UPSTASH_REDIS_REST_URL = <from step 3>
UPSTASH_REDIS_REST_TOKEN = <from step 3>
NEXT_PUBLIC_TURNSTILE_SITE_KEY = <from step 2>
TURNSTILE_SECRET_KEY = <from step 2>
```

**Scope**: Production + Preview
**Redeploy**: sau khi set → trigger deploy mới để env active

---

## Kiểm thử production (~10 phút)

### Test 1 — Security headers
```bash
curl -I https://aivihe.vn | grep -iE 'strict-transport|x-frame|x-content|referrer|permissions'
```
Phải thấy đủ 5 header.

### Test 2 — Rate limit login
```bash
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://aivihe.vn/api/demo/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@test.com","password":"wrong"}'
done
```
Lần 1-5: `401`. Lần 6: `429` với `Retry-After` header.

### Test 3 — Turnstile bypass attempt
```bash
curl -X POST https://aivihe.vn/api/consultation-request \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Bot Test","phone":"0900000000"}'
```
Phải trả `400` với message "Xác thực bảo mật thất bại".

### Test 4 — Form user thật
Mở https://aivihe.vn → "Tư vấn" → submit → phải pass (Turnstile auto-verify invisible).

### Test 5 — Cloudflare geo-block
Dùng VPN → IP nước ngoài → truy cập aivihe.vn → phải nhận Challenge page của Cloudflare.

---

## Monitoring (đặt sau khi deploy)

- **Cloudflare Analytics** → tab Security → xem số bot blocked/ngày
- **Upstash Console** → tab Analytics → xem rate limit hit rate
- **Vercel Logs** → grep `[rate-limit]` và `[turnstile]` để phát hiện bypass

---

## Phase 2 — để sau (không cần cho launch)

- File upload hardening (MIME whitelist + magic byte + virus scan)
- Supabase RLS policy audit (script check tất cả bảng)
- Sentry error tracking ($26/mo Team tier)
- 2FA TOTP cho admin/director role (Supabase built-in)
- Webhook HMAC audit cho Daycare integration
- Supabase Pro + PITR backup ($25/mo)

## Phase 3 — scale (khi >1000 users)

- Cloudflare WAF managed ruleset ($20/mo — OWASP top 10)
- Penetration test external (~$1500-3000 one-off)
- SOC2 readiness nếu bán B2B
