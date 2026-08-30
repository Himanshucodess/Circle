import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return <Loader2 className={cn("animate-spin", className ?? "w-5 h-5")} />
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
      <Spinner className="w-8 h-8 text-primary" />
      {label && <p className="text-sm animate-pulse">{label}</p>}
    </div>
  )
}
