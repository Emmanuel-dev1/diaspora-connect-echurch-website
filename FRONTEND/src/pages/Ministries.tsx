// frontend/src/pages/Ministries.tsx
import { useState, useEffect } from 'react'
import GlassCard from '../components/ui/GlassCard'
import { supabase } from '../lib/supabase'

interface Ministry {
  id: string
  slug: string
  name: string
  focus_area: string
  description: string
  icon: string
}

export default function Ministries() {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMinistries() {
      try {
        const { data, error } = await supabase
          .from('ministries')
          .select('*')
          .eq('is_active', true)
          .order('created_at')

        if (error) throw error

        const formatted = (data || []).map((m) => ({
          id: m.id,
          slug: m.slug,
          name: m.name,
          focus_area: m.focus_area || 'Ministry',
          description: m.description || '',
          icon: m.icon || '✝️',
        }))
        setMinistries(formatted)
      } catch (err) {
        console.error('Failed to fetch ministries:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMinistries()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      <header className="text-center mb-16">
        <span className="badge-primary mb-4">Serve & Grow</span>
        <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">Our Ministries</h1>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Discover ways to connect, serve, and deepen your faith through our ministry programs.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-caption mt-4">Loading ministries...</p>
        </div>
      ) : ministries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No ministries available yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((ministry) => (
            <GlassCard key={ministry.id} id={ministry.slug}>
              <span className="badge-accent mb-4">{ministry.focus_area}</span>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {ministry.icon} {ministry.name}
              </h2>
              <p className="text-body text-sm leading-relaxed mb-6">{ministry.description}</p>
              <div className="pt-4 border-t border-slate-200/50">
                <p className="text-caption italic">Content coming soon</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}