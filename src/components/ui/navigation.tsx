import React from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils'

// Bottom Navigation based on Stitch designs
export interface NavigationItem {
  href: string
  icon: string // Material Symbol name
  label: string
  active?: boolean
}

export interface BottomNavigationProps {
  items: NavigationItem[]
  className?: string
}

const BottomNavigation = ({ items, className }: BottomNavigationProps) => {
  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light pb-safe z-40',
      className
    )}>
      <div className="flex justify-around items-center pt-2 pb-1 px-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-0 flex-1',
              item.active 
                ? 'text-primary font-semibold' 
                : 'text-text-secondary hover:text-primary'
            )}
          >
            <span className="material-symbols-outlined text-xl">
              {item.icon}
            </span>
            <span className="text-xs font-medium truncate">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

// Header Navigation
export interface HeaderProps {
  title: string
  onBack?: () => void
  action?: React.ReactNode
  className?: string
}

const Header = ({ title, onBack, action, className }: HeaderProps) => {
  return (
    <header className={cn(
      'sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-surface-light',
      className
    )}>
      <div className="flex items-center p-4 justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors"
          >
            <span className="material-symbols-outlined text-text-primary">
              arrow_back
            </span>
          </button>
        ) : (
          <div className="w-10" />
        )}
        
        <h1 className="text-xl font-bold text-text-primary flex-1 text-center pr-10">
          {title}
        </h1>
        
        {action || <div className="w-10" />}
      </div>
    </header>
  )
}

// Tab Navigation (for reports page)
export interface TabItem {
  id: string
  label: string
  active?: boolean
}

export interface TabNavigationProps {
  items: TabItem[]
  onTabChange?: (tabId: string) => void
  className?: string
}

const TabNavigation = ({ items, onTabChange, className }: TabNavigationProps) => {
  return (
    <nav className={cn(
      'flex border-b border-surface-light',
      className
    )}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange?.(item.id)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center border-b-2 pb-3 pt-4 text-sm font-semibold transition-colors',
            item.active
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export { BottomNavigation, Header, TabNavigation }