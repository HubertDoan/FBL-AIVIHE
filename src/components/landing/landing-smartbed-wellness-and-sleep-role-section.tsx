import {
  Moon, Brain, Heart, ShieldAlert, Activity,
  Thermometer, Wind, Mic, Zap, ChevronDown, Users, Stethoscope, PersonStanding,
  BedDouble, Bell, ClipboardList,
} from 'lucide-react'

/**
 * Section SmartBed Wellness + Vai trò giấc ngủ
 *
 * Narrative flow:
 *  1. Framing: 1/3 cuộc đời + "cửa sổ quan sát 8 tiếng/đêm"
 *  2. Vì sao giấc ngủ quan trọng với người cao tuổi (4 cards khoa học)
 *  3. 5-actor ecosystem: SmartBed kết nối ai với ai trong Thong Dong
 *  4. SmartBed Wellness — phần cứng + tính năng
 *  5. AI report + sync vào hồ sơ sức khỏe cá nhân
 *  6. CTA
 */
export function SmartBedWellnessSleepSection() {
  return (
    <section
      id="smartbed-wellness"
      className="py-8 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white scroll-mt-6"
    >
      <div className="max-w-5xl mx-auto px-4">

        {/* ═══ HEADER ═══ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/40 rounded-full px-4 py-1.5 mb-4">
            <Moon className="size-4 text-indigo-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Đang thử nghiệm · Sắp ra mắt</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-purple-300 bg-clip-text text-transparent">
              SmartBed Wellness
            </span>{' '}
            — Giường thông minh sức khỏe
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Giấc ngủ chiếm <span className="text-white font-semibold">1/3 cuộc đời</span> mỗi người — nhưng lại là khoảng thời gian{' '}
            <span className="text-white font-semibold">ít được theo dõi nhất</span>.
            SmartBed Wellness là <em>cửa sổ quan sát sức khỏe 8 tiếng mỗi đêm</em> — không tiếp xúc, không đeo gì — đưa dữ liệu liên tục vào
            thông tin sức khỏe cá nhân trên AIVIHE để bác sĩ gia đình, PHCN và gia đình cùng theo dõi.
          </p>
        </div>

        {/* ═══ 1. VAI TRÒ GIẤC NGỦ — 4 cards khoa học ═══ */}
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">
            Vì sao giấc ngủ đặc biệt quan trọng với người cao tuổi
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SleepRoleCard
              icon={Brain}
              color="text-violet-400"
              bg="bg-violet-500/10 border-violet-500/30"
              title="Não & nhận thức"
              body="Trong giấc ngủ sâu, não xử lý ký ức và loại bỏ protein amyloid — chất liên quan đến nguy cơ Alzheimer. Ngủ kém mạn tính làm tăng nguy cơ suy giảm nhận thức 30–40%."
              tag="Khoa học thần kinh"
            />
            <SleepRoleCard
              icon={Heart}
              color="text-rose-400"
              bg="bg-rose-500/10 border-rose-500/30"
              title="Tim mạch & huyết áp"
              body="Giấc ngủ ngắn hoặc phân mảnh làm tăng huyết áp tâm thu trung bình 5–10 mmHg. Ngủ dưới 6 giờ liên tục làm tăng nguy cơ suy tim 13% so với ngủ đủ 7–8 giờ."
              tag="Tim mạch học"
            />
            <SleepRoleCard
              icon={ShieldAlert}
              color="text-amber-400"
              bg="bg-amber-500/10 border-amber-500/30"
              title="Té ngã & an toàn"
              body="50–70% người cao tuổi có rối loạn giấc ngủ. Người ngủ kém có phản xạ và giữ thăng bằng giảm — nguy cơ té ngã tăng gấp 2 lần vào sáng sớm sau đêm ngủ không yên."
              tag="Lão khoa"
            />
            <SleepRoleCard
              icon={Activity}
              color="text-emerald-400"
              bg="bg-emerald-500/10 border-emerald-500/30"
              title="Miễn dịch & phục hồi"
              body="Cytokine bảo vệ miễn dịch tiết ra chủ yếu trong giấc ngủ. Ngủ kém kéo dài làm chậm lành vết thương, tăng nguy cơ nhiễm trùng và làm phản ứng vaccine kém hiệu quả."
              tag="Miễn dịch học"
            />
          </div>
        </div>

        {/* ═══ 2. 5-ACTOR ECOSYSTEM — quan trọng nhất ═══ */}
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">
            SmartBed kết nối toàn bộ hành trình chăm sóc Thong Dong
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <EcosystemCard
              icon={BedDouble}
              color="bg-indigo-500/15 border-indigo-500/30"
              iconColor="text-indigo-300"
              actor="Khách hàng"
              title="Đặt lịch tại Daycare — hoặc dùng tại nhà"
              desc='Đặt gói "Sleep Check 60 phút" hoặc "Sleep Coaching 14 ngày" ngay trong tab Daycare. Sáng hôm sau đọc báo cáo AI và điểm giấc ngủ trên AIVIHE.'
            />
            <EcosystemCard
              icon={Stethoscope}
              color="bg-blue-500/15 border-blue-500/30"
              iconColor="text-blue-300"
              actor="Bác sĩ gia đình"
              title="Xem dữ liệu ngủ khi được cấp quyền"
              desc="Khi khách hàng cấp quyền, BS gia đình xem báo cáo AI, biểu đồ SpO₂, HR đêm, số lần ngáy — và ghi tư vấn ngay trên AIVIHE. Cảnh báo nghi sleep apnea tự động gửi BS."
            />
            <EcosystemCard
              icon={PersonStanding}
              color="bg-teal-500/15 border-teal-500/30"
              iconColor="text-teal-300"
              actor="Phục hồi chức năng"
              title="Correlate giấc ngủ với tiến triển PHCN"
              desc="KTV PHCN xem Sleep Score 4 tuần song song với tiến triển phục hồi. Tuần ngủ kém → kết quả tập thường chậm 30%. Giúp tối ưu lịch tập sau 9h sáng."
            />
            <EcosystemCard
              icon={Users}
              color="bg-rose-500/15 border-rose-500/30"
              iconColor="text-rose-300"
              actor="Gia đình & người chăm sóc"
              title="Nhận cảnh báo an toàn tức thì"
              desc="Khi khách hàng cho phép, người thân nhận thông báo: SpO₂ thấp, ra khỏi giường đêm > 3 lần, nghi té ngã. Không cần ở cạnh vẫn đồng hành."
            />
            <EcosystemCard
              icon={ClipboardList}
              color="bg-amber-500/15 border-amber-500/30"
              iconColor="text-amber-300"
              actor="Lễ tân Daycare"
              title="Check-in vào Sleep Pod trong 2 phút"
              desc="Lễ tân mở tài khoản AIVIHE của khách → assign Pod → consent flow → bắt đầu phiên. Kết thúc → thanh toán tự động. Không cần hệ thống riêng."
            />
            <EcosystemCard
              icon={Activity}
              color="bg-green-500/15 border-green-500/30"
              iconColor="text-green-300"
              actor="Hồ sơ sức khỏe cá nhân"
              title="Sleep Score vào Chỉ số sức khỏe mỗi đêm"
              desc='Sau mỗi đêm, điểm giấc ngủ, HR trung bình và SpO₂ trung bình tự đồng bộ vào tab "Chỉ số sức khỏe" trên AIVIHE — cùng huyết áp, cân nặng. Báo cáo AI tích hợp thuốc đang dùng và bệnh nền.'
            />
          </div>
        </div>

        {/* ═══ 3. SMARTBED — PHẦN CỨNG & TÍNH NĂNG ═══ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Moon className="size-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-white">SmartBed B1 — 8 nhóm cảm biến, không tiếp xúc</h3>
              <p className="text-xs text-slate-500">Bộ xử lý AI edge phân tích tại chỗ — không cần đeo thêm thiết bị</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            <SensorBadge icon={Activity} label="Tư thế & chuyển động" sub="Load cell 4 góc + radar 24GHz" />
            <SensorBadge icon={Heart} label="Nhịp tim & SpO₂" sub="Quang học MAX30102 không tiếp xúc" />
            <SensorBadge icon={Mic} label="Phát hiện ngáy" sub="Microphone + AI CNN" />
            <SensorBadge icon={Thermometer} label="Nhiệt độ & độ ẩm" sub="Cảm biến môi trường phòng ngủ" />
            <SensorBadge icon={Wind} label="CO₂ phòng ngủ" sub="Cảm biến NDIR" />
            <SensorBadge icon={Zap} label="Tự điều chỉnh tư thế" sub="Servo nâng hạ 10 điểm" />
          </div>
          {/* Collapsible — AI report detail */}
          <details className="group">
            <summary className="list-none cursor-pointer select-none flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
              <span className="group-open:hidden">Xem: Sleep Score AI + báo cáo tích hợp bệnh nền & thuốc</span>
              <span className="hidden group-open:inline">Ẩn chi tiết</span>
            </summary>
            <div className="mt-3 grid sm:grid-cols-3 gap-2.5">
              <AiFeatureCard emoji="📊" title="Sleep Score 0–100 mỗi đêm"
                desc="AI tổng hợp thời gian ngủ, số lần thức, SpO₂ và tỉ lệ nằm yên thành 1 điểm duy nhất." />
              <AiFeatureCard emoji="💊" title="Tích hợp thuốc & bệnh nền"
                desc='Báo cáo AI biết khách đang dùng Losartan, có COPD → gợi ý phù hợp, cảnh báo ngưỡng SpO₂ chặt hơn.' />
              <AiFeatureCard emoji="⚠️" title="Cảnh báo nghi sleep apnea"
                desc="AHI > 15 + bệnh nền liên quan → thông báo ngay cho khách hàng và BS gia đình (nếu đã cấp quyền)." />
            </div>
          </details>
        </div>

        {/* ═══ CTA ═══ */}
        <div className="text-center">
          <p className="text-slate-500 text-xs mb-3">
            Đang thử nghiệm tại Thong Dong Daycare Hà Pú, Sóc Sơn.
            Gói <em>Sleep Check 60 phút</em> và <em>Sleep Coaching 14 ngày</em> dành cho khách hàng AIVIHE.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#dang-ky-tu-van"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-indigo-900/50 transition-all text-sm">
              <Moon className="size-4" aria-hidden="true" />
              Đăng ký trải nghiệm SmartBed
            </a>
            <a href="#goi-dich-vu"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-slate-300 font-medium px-6 py-3 rounded-lg transition-all text-sm">
              <Bell className="size-4" aria-hidden="true" />
              Xem gói dịch vụ
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}

// ── Internal sub-components ──────────────────────────────────

function SleepRoleCard({ icon: Icon, color, bg, title, body, tag }: {
  icon: React.ComponentType<{ className?: string }>
  color: string; bg: string; title: string; body: string; tag: string
}) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 ${bg}`}>
      <div className="flex items-center gap-2">
        <Icon className={`size-5 shrink-0 ${color}`} />
        <span className="font-bold text-white text-sm">{title}</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed flex-1">{body}</p>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${color} opacity-70`}>{tag}</span>
    </div>
  )
}

function EcosystemCard({ icon: Icon, color, iconColor, actor, title, desc }: {
  icon: React.ComponentType<{ className?: string }>
  color: string; iconColor: string; actor: string; title: string; desc: string
}) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 ${color}`}>
      <div className="flex items-center gap-2">
        <Icon className={`size-4 shrink-0 ${iconColor}`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${iconColor}`}>{actor}</span>
      </div>
      <p className="text-sm font-semibold text-white leading-tight">{title}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function SensorBadge({ icon: Icon, label, sub }: {
  icon: React.ComponentType<{ className?: string }>; label: string; sub: string
}) {
  return (
    <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-lg p-2.5">
      <Icon className="size-4 text-indigo-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-white leading-tight">{label}</p>
        <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function AiFeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
      <div className="text-xl mb-1.5" aria-hidden="true">{emoji}</div>
      <p className="text-xs font-bold text-white mb-1">{title}</p>
      <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}
