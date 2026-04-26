// src/components/Layout.tsx
import { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      
      <footer className="border-t border-white/50 bg-white/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} Diaspora Connect eChurch
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              A digital sanctuary for all
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}