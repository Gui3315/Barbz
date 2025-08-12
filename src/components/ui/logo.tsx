import { cn } from "@/lib/utils"
import { Scissors } from "lucide-react"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Scissors className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          BARBZ
        </span>
        <span className="text-xs text-slate-500 font-medium -mt-1">SISTEMA</span>
      </div>
    </div>
  )
}
