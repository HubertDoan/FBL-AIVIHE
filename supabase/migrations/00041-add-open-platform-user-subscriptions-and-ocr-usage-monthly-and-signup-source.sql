-- Migration 00041: Open Platform Foundation
-- 1. signup_source trên citizens (self_registered vs staff_created)
-- 2. user_subscriptions: free / premium / enterprise
-- 3. ocr_usage_monthly: đếm trang OCR đã dùng theo tháng

-- ============================================================
-- 1. signup_source
-- ============================================================
ALTER TABLE public.citizens
  ADD COLUMN IF NOT EXISTS signup_source TEXT NOT NULL DEFAULT 'staff_created'
    CHECK (signup_source IN ('staff_created', 'self_registered', 'invited')),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ============================================================
-- 2. user_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id    UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL DEFAULT 'free'
                  CHECK (plan IN ('free', 'premium', 'enterprise')),
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,           -- NULL = không hết hạn (staff/enterprise)
  amount_vnd    INTEGER,               -- 200000 cho premium
  payment_ref   TEXT,                  -- mã giao dịch VNPay/MoMo
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (citizen_id)                  -- mỗi user 1 subscription active
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_citizen ON public.user_subscriptions (citizen_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan    ON public.user_subscriptions (plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status  ON public.user_subscriptions (status);

-- ============================================================
-- 3. ocr_usage_monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ocr_usage_monthly (
  citizen_id  UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  month       TEXT NOT NULL,  -- 'YYYY-MM' ví dụ '2026-04'
  pages_used  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (citizen_id, month)
);

CREATE INDEX IF NOT EXISTS idx_ocr_usage_citizen ON public.ocr_usage_monthly (citizen_id);

-- ============================================================
-- 4. RLS
-- ============================================================

-- user_subscriptions: user chỉ xem subscription của mình
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_subscriptions_select_own"
  ON public.user_subscriptions FOR SELECT
  USING (citizen_id = auth.uid());

CREATE POLICY "user_subscriptions_insert_service_only"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (false);  -- chỉ service role (server-side)

CREATE POLICY "user_subscriptions_update_service_only"
  ON public.user_subscriptions FOR UPDATE
  USING (false);       -- chỉ service role

-- ocr_usage_monthly: user chỉ xem usage của mình
ALTER TABLE public.ocr_usage_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ocr_usage_select_own"
  ON public.ocr_usage_monthly FOR SELECT
  USING (citizen_id = auth.uid());

CREATE POLICY "ocr_usage_service_only_write"
  ON public.ocr_usage_monthly FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 5. RPC: increment_ocr_usage — atomic upsert counter
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_ocr_usage(
  p_citizen_id UUID,
  p_month      TEXT,
  p_pages      INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER  -- chạy với quyền service, không cần user có write RLS
AS $$
BEGIN
  INSERT INTO public.ocr_usage_monthly (citizen_id, month, pages_used, updated_at)
  VALUES (p_citizen_id, p_month, p_pages, now())
  ON CONFLICT (citizen_id, month)
  DO UPDATE SET
    pages_used = ocr_usage_monthly.pages_used + EXCLUDED.pages_used,
    updated_at = now();
END;
$$;

-- ============================================================
-- 6. Seed subscription free cho tất cả existing citizens
-- ============================================================
INSERT INTO public.user_subscriptions (citizen_id, plan, status)
SELECT id, 'free', 'active'
FROM public.citizens
ON CONFLICT (citizen_id) DO NOTHING;
