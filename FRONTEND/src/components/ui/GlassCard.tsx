// src/components/ui/GlassCard.tsx
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  id?: string
}

export default function GlassCard({ children, className = '', id }: GlassCardProps) {
  return (
    <div id={id} className={`glass-card p-6 md:p-8 glass-hover ${className}`}>
      {children}
    </div>
  )
}