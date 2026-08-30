import { cn } from "@/lib/utils"
import { PackageOpen } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed bg-muted/20", className)}>
      <div className="w-14 h-14 rounded-2xl bg-background border shadow-sm flex items-center justify-center mb-4 text-muted-foreground">
        {icon ? <span className="text-2xl">{icon}</span> : <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
