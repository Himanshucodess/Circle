import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white",
        secondary: "border-border/70 bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        brand: "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200",
        neutral: "border-transparent bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
        green: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
        amber: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
        red: "border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
        glass: "border-white/25 bg-white/15 text-white backdrop-blur-md",
        lime: "border-transparent bg-lime text-ink-950",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  tone?: "brand" | "neutral" | "green" | "amber" | "red" | "default" | "secondary" | "destructive" | "glass" | "lime"
}

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  const v = (tone as any) ?? variant
  return <div className={cn(badgeVariants({ variant: v as any }), className)} {...props} />
}

export function ConditionBadge({ condition }: { condition: string }) {
  const tone =
    condition === "NEW" ? "green" : condition === "LIKE_NEW" ? "brand" : condition === "GOOD" ? "amber" : "neutral"
  return <Badge tone={tone as any}>{condition.replace(/_/g, " ")}</Badge>
}

export { badgeVariants }
