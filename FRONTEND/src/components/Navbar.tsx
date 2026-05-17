// frontend/src/components/Navbar.tsx
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const resources = [
  { name: 'Ebooks', path: '/resources#ebooks' },
  { name: 'Videos', path: '/resources#videos' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [ministries, setMinistries] = useState<{ name: string; path: string }[]>([])
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    async function fetchMinistries() {
      const { data } = await supabase
        .from('ministries')
        .select('name, slug')
        .eq('is_active', true)
        .order('created_at')

      if (data) {
        setMinistries(data.map((m) => ({ name: m.name, path: `/ministries#${m.slug}` })))
      }
    }
    fetchMinistries()
  }, [])

  useEffect(() => { setDropdownOpen(null); setMobileOpen(false) }, [location])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path.split('#')[0])

  const linkBase = "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
  const linkInactive = "text-slate-600 hover:text-slate-900 hover:bg-white/50"
  const linkActive = "bg-teal-50 text-teal-700 font-semibold"

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-teal-200 group-hover:opacity-90 transition bg-teal-50">
              {logoError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-teal-700 font-bold text-lg">DC</span>
                </div>
              ) : (
                <video src="/images/church-logo.mp4" autoPlay loop muted playsInline onError={() => setLogoError(true)} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-semibold text-slate-800 leading-tight">Diaspora Connect</p>
              <p className="text-xs text-teal-600 font-medium tracking-wider">ECHURCH</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            
            {/* Home */}
            <Link to="/" className={`${linkBase} ${isActive('/') ? linkActive : linkInactive}`}>
              Home
            </Link>

            {/* Ministries Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === 'ministries' ? null : 'ministries')}
                className={`${linkBase} inline-flex items-center gap-1.5 ${isActive('/ministries') ? linkActive : linkInactive}`}
              >
                <span>Ministries</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen === 'ministries' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen === 'ministries' && (
                <div className="absolute top-full left-0 mt-2 w-64 glass rounded-2xl shadow-xl py-2 border-white/40">
                  {ministries.map((item) => (
                    <Link key={item.name} to={item.path} className="block px-5 py-3 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === 'resources' ? null : 'resources')}
                className={`${linkBase} inline-flex items-center gap-1.5 ${isActive('/resources') ? linkActive : linkInactive}`}
              >
                <span>Resources</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen === 'resources' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-48 glass rounded-2xl shadow-xl py-2 border-white/40">
                  {resources.map((item) => (
                    <Link key={item.name} to={item.path} className="block px-5 py-3 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Links */}
            {user ? (
              <div className="flex items-center gap-1 ml-2">
                <span className="px-3 py-2 text-sm text-slate-500">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  className={`${linkBase} text-slate-600 hover:text-slate-900 hover:bg-white/50`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`${linkBase} ${isActive('/login') ? linkActive : linkInactive}`}
              >
                Sign In
              </Link>
            )}

            {/* Join Live CTA */}
            <Link
              to="/join"
              className={`${linkBase} ml-2 bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all`}
            >
              Join Live
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-white/60 transition-colors"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/50 space-y-1">
            
            {/* Home */}
            <Link
              to="/"
              className={`block px-4 py-3 rounded-xl text-sm font-medium ${isActive('/') ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-white/50'}`}
            >
              Home
            </Link>
            
            {/* Ministries */}
            <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ministries
            </p>
            {ministries.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block px-6 py-2.5 text-sm text-slate-600 hover:bg-white/50 rounded-xl"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Resources */}
            <p className="px-4 py-2 pt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Resources
            </p>
            {resources.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block px-6 py-2.5 text-sm text-slate-600 hover:bg-white/50 rounded-xl"
              >
                {item.name}
              </Link>
            ))}

            {/* Auth - Mobile */}
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-slate-500 font-medium">
                  Signed in as {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </div>
                <button
                  onClick={signOut}
                  className="block mx-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl text-center w-[calc(100%-2rem)]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block mx-4 py-3 text-sm text-teal-600 hover:bg-teal-50 rounded-xl text-center border border-teal-200"
              >
                Sign In
              </Link>
            )}
            
            {/* Join Live */}
            <Link
              to="/join"
              className="block mx-4 mt-3 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium text-center"
            >
              Join Live Service
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}