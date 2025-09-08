import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

// Button variants based on Stitch designs
const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-background hover:bg-primary-600 active:bg-primary-700',
        secondary: 'bg-surface text-text-primary hover:bg-surface-light border border-surface-light',
        ghost: 'hover:bg-surface text-text-primary',
        outline: 'border border-surface-light bg-transparent text-text-primary hover:bg-surface',
      },
      size: {
        default: 'h-12 px-4 py-2',
        sm: 'h-10 px-3 text-sm',
        lg: 'h-14 px-6 text-base',
        icon: 'h-10 w-10',
        fab: 'h-16 w-16 text-xl', // Floating Action Button
      },
      shape: {
        default: 'rounded-xl',
        full: 'rounded-full',
        square: 'rounded-lg',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'full',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }