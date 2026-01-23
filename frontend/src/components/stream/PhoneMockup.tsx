import { cn } from "@/lib/utils"

interface PhoneMockupProps {
  children: React.ReactNode
  className?: string
}

export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div className={cn(
      "relative mx-auto flex-shrink-0",
      // iPhone aspect ratio (~19.5:9), max dimensions
      "w-[320px] h-[693px]",
      className
    )}>
      {/* Phone frame - outer bezel */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] shadow-2xl border-[3px] border-gray-700 overflow-hidden">

        {/* Inner bezel shadow */}
        <div className="absolute inset-1 rounded-[2.2rem] bg-black shadow-inner">

          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-24 h-7 bg-black rounded-full flex items-center justify-center gap-2 shadow-lg border border-gray-800">
              {/* Camera */}
              <div className="w-2.5 h-2.5 rounded-full bg-gray-800 ring-1 ring-gray-700" />
              {/* Speaker */}
              <div className="w-8 h-1 rounded-full bg-gray-800" />
            </div>
          </div>

          {/* Screen content area */}
          <div className="absolute inset-2 top-12 bottom-6 bg-base rounded-2xl overflow-hidden">
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-28 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Side buttons - Volume */}
        <div className="absolute left-[-3px] top-24 w-[3px] h-6 bg-gray-600 rounded-l-sm" />
        <div className="absolute left-[-3px] top-32 w-[3px] h-10 bg-gray-600 rounded-l-sm" />
        <div className="absolute left-[-3px] top-44 w-[3px] h-10 bg-gray-600 rounded-l-sm" />

        {/* Side button - Power */}
        <div className="absolute right-[-3px] top-32 w-[3px] h-14 bg-gray-600 rounded-r-sm" />
      </div>
    </div>
  )
}
