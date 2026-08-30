import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        brand: "border-transparent bg-brand-100 text-brand-700",
        neutral: "border-transparent bg-gray-100 text-gray-700",
        green: "border-transparent bg-emerald-100 text-emerald-700",
        amber: "border-transparent bg-amber-100 text-amber-700",
        red: "border-transparent bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  tone?: "brand" | "neutral" | "green" | "amber" | "red" | "default" | "secondary" | "destructive"
}

export function Badge({ className, variant, tone, ...props }: BadgeProps) {
  const v = (tone as any) ?? variant
  return <div className={cn(badgeVariants({ variant: v as any }), className)} {...props} />
}

export function ConditionBadge({ condition }: { condition: string }) {
  const tone =
    condition === "NEW" ? "green" : condition === "LIKE_NEW" ? "brand" : condition === "REFURBISHED" ? "amber" : "neutral"
  return <Badge tone={tone as any}>{condition.replace(/_/g, " ")}</Badge>
}

export { badgeVariants }
