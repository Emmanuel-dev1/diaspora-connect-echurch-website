// frontend/src/hooks/useResources.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Resource {
  id: string
  title: string
  description: string
  resource_type: string
  author: string
  format: string
  pages: number
  is_free: boolean
  price: number
  download_count: number
}

export function useResources() {
  const [ebooks, setEbooks] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEbooks() {
      try {
        const { data } = await supabase
          .from('resources')
          .select('*')
          .eq('resource_type', 'ebook')
          .order('created_at', { ascending: false })
        
        setEbooks(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchEbooks()
  }, [])

  return { ebooks, loading }
}