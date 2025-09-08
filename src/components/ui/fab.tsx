import React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './button'

// Floating Action Button based on Stitch designs
export interface FABProps extends Omit<ButtonProps, 'size' | 'shape'> {
  icon: React.ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, icon, position = 'bottom-right', size = 'md', ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-4 right-4',
      'bottom-left': 'fixed bottom-4 left-4',
      'top-right': 'fixed top-4 right-4',
      'top-left': 'fixed top-4 left-4'
    }

    const sizeClasses = {
      sm: 'h-12 w-12',
      md: 'h-16 w-16',
      lg: 'h-20 w-20'
    }

    return (
      <Button
        ref={ref}
        className={cn(
          'shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 z-50',
          positionClasses[position],
          sizeClasses[size],
          className
        )}
        shape="full"
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
FloatingActionButton.displayName = 'FloatingActionButton'

// FAB Group for multiple actions (like in student management)
export interface FABGroupProps {
  children: React.ReactNode
  position?: FABProps['position']
  className?: string
}

const FABGroup = ({ children, position = 'bottom-right', className }: FABGroupProps) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4'
  }

  return (
    <div 
      className={cn(
        'flex flex-col items-end gap-3 z-50',
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  )
}

export { FloatingActionButton, FABGroup }