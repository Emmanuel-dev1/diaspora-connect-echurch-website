// frontend/src/hooks/useMinistries.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Ministry {
  id: string
  name: string
  slug: string
  description: string
  focus_area: string
  icon: string
  is_active: boolean
}

export function useMinistries() {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMinistries() {
      try {
        const { data, error } = await supabase
          .from('ministries')
          .select('*')
          .eq('is_active', true)
          .order('created_at')

        if (error) throw error
        setMinistries(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ministries')
      } finally {
        setLoading(false)
      }
    }
    fetchMinistries()
  }, [])

  return { ministries, loading, error }
}