'use client'

interface FblLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

export function FblLogo({ size = 'md', showTagline = true }: FblLogoProps) {
  const iconSize = size === 'sm' ? 'size-8' : size === 'lg' ? 'size-20' : 'size-12'
  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-5xl' : 'text-3xl'
  const subSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-base' : 'text-xs'
  const tagSize = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-sm' : 'text-[10px]'
  const lineW = size === 'sm' ? 'w-20' : size === 'lg' ? 'w-48' : 'w-32'

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <div className={`relative ${iconSize}`}>
          <div className="absolute inset-0 rounded-full border-2 border-green-600" />
          <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-blue-500 via-blue-400 to-orange-400 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-2/3 h-2/3 text-white" fill="currentColor">
              <circle cx="20" cy="10" r="4" />
              <path d="M12 36 C12 24 16 18 20 18 C24 18 28 24 28 36" />
              <path d="M8 28 C12 22 16 20 20 18" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M32 28 C28 22 24 20 20 18" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
        <div>
          <p className={`${textSize} font-black tracking-tight leading-none`}>
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 bg-clip-text text-transparent">FBL</span>
          </p>
          <p className={`${subSize} font-semibold text-slate-600 tracking-widest`}>LIFE ECOSYSTEM</p>
        </div>
      </div>
      {showTagline && (
        <>
          <div className={`${lineW} h-px bg-slate-300 my-1`} />
          <p className={`${tagSize} font-medium text-slate-500 tracking-[0.2em]`}>FOR BETTER LIFE</p>
        </>
      )}
    </div>
  )
}
