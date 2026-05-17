// frontend/src/hooks/useEvents.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  start_time: string
  end_time: string
  recurring: boolean
  recurrence_rule: string | null
  meeting_link: string
  meeting_id: string | null
  meeting_password: string | null
  platform: string
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [nextService, setNextService] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Get upcoming events
        const now = new Date().toISOString()
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .gte('start_time', now)
          .order('start_time')
          .limit(10)
        
        const fetchedEvents = data || []
        setEvents(fetchedEvents)
        
        // Find the next worship service
        const worship = fetchedEvents.find(e => e.event_type === 'worship')
        setNextService(worship || null)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return { events, nextService, loading }
}