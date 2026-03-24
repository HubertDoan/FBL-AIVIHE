# Design Guidelines

## Target Users
- Vietnamese citizens, primarily elderly (55-80 tuổi)
- Family members managing health for parents/grandparents
- Basic smartphone literacy

## Elder-Friendly Principles
- Base font size: **18px** (not 16px)
- Touch targets: minimum **48px** height
- High contrast: `text-gray-900` on white, no light gray text
- Large buttons with **Vietnamese text labels** — no icon-only actions
- Loading states: spinner + **Vietnamese text explanation**
- Simple navigation: max 2 levels deep
- Big, clear CTAs

## Color Palette
- Primary: Blue (#2563EB) — trust, health
- Success: Green (#16A34A) — confirmed, healthy range
- Warning: Amber (#D97706) — borderline, needs attention
- Danger: Red (#DC2626) — abnormal, urgent
- Background: White (#FFFFFF)
- Text: Gray-900 (#111827)

## AI Confidence Indicators
- ≥ 0.8: Green badge "Tin cậy cao"
- 0.5 - 0.79: Yellow badge "Cần kiểm tra"
- < 0.5: Red badge "Cần nhập lại"

## Vietnamese Language Rules
- All UI text in Vietnamese
- Medical terms: Vietnamese first, English/Latin in parentheses
- Example: "Đường huyết (Glucose)"
- Date format: DD/MM/YYYY
- Number format: use comma for decimal (7,2 not 7.2) in display

## Disclaimer Display
- Always visible at bottom of AI-generated content
- Font size: 14px, italic, gray-600
- Cannot be dismissed or hidden

## Responsive Breakpoints
- Mobile: 375px (primary)
- Tablet: 768px
- Desktop: 1280px
- Mobile-first approach
