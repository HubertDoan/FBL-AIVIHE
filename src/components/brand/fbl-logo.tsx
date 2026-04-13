'use client'

interface ThongDongLifeLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

/**
 * Thong Dong Life logo component — replaces old FBL logo.
 * Uses /thong-dong-life-logo.png from public folder.
 * Kept filename as fbl-logo.tsx to avoid breaking imports.
 */
export function FblLogo({ size = 'md', showTagline = true }: ThongDongLifeLogoProps) {
  const imgH = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-20' : 'h-12'
  const tagSize = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-sm' : 'text-[10px]'

  return (
    <div className="flex flex-col items-center">
      <img
        src="/thong-dong-life-logo.png"
        alt="Thong Dong Life - Sống thong dong"
        className={`${imgH} w-auto object-contain`}
      />
      {showTagline && (
        <p className={`${tagSize} font-medium text-slate-500 tracking-[0.15em] mt-1`}>
          THONG DONG LIFE
        </p>
      )}
    </div>
  )
}
