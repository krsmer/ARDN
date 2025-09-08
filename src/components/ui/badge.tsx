import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Badge component for rankings, points, etc.
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-background',
        secondary: 'border-transparent bg-surface text-text-primary',
        success: 'border-transparent bg-green-500 text-white',
        warning: 'border-transparent bg-yellow-500 text-background',
        destructive: 'border-transparent bg-red-500 text-white',
        outline: 'border-surface-light text-text-secondary',
        gold: 'border-transparent bg-yellow-400 text-background', // For #1 ranking
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// ARDN Points Badge - specific for our point system
export interface ARDNBadgeProps extends Omit<BadgeProps, 'children'> {
  points: number
  showLabel?: boolean
}

const ARDNBadge = ({ points, showLabel = true, className, ...props }: ARDNBadgeProps) => {
  const variant = points >= 1000 ? 'gold' : points >= 500 ? 'success' : 'default'
  
  return (
    <Badge 
      variant={variant}
      className={cn('font-bold', className)}
      {...props}
    >
      {points} {showLabel && 'ARDN'}
    </Badge>
  )
}

// Rank Badge for leaderboard
export interface RankBadgeProps extends Omit<BadgeProps, 'children'> {
  rank: number
}

const RankBadge = ({ rank, className, ...props }: RankBadgeProps) => {
  const variant = rank === 1 ? 'gold' : rank <= 3 ? 'success' : 'secondary'
  
  return (
    <Badge 
      variant={variant}
      className={cn('min-w-[2rem] justify-center font-bold', className)}
      {...props}
    >
      #{rank}
    </Badge>
  )
}

export { Badge, badgeVariants, ARDNBadge, RankBadge }