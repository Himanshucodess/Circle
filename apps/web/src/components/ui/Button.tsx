import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Spinner } from "./Spinner"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-card hover:shadow-glow hover:brightness-110 btn-shine",
        primary: "bg-primary text-white shadow-card hover:shadow-glow hover:brightness-110 btn-shine",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background/80 backdrop-blur hover:bg-accent hover:text-accent-foreground hover:border-primary/40",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border/60",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        dark: "bg-ink-950 text-white hover:bg-ink-800 shadow-card dark:bg-white dark:text-ink-950 dark:hover:bg-white/90",
        lime: "bg-lime text-ink-950 hover:brightness-105 shadow-card font-bold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-7 text-[15px]",
        xl: "h-14 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner className="w-4 h-4 shrink-0" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
