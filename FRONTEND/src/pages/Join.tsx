// frontend/src/pages/Join.tsx
import { useState, useEffect, useCallback } from 'react'
import GlassCard from '../components/ui/GlassCard'
import { supabase } from '../lib/supabase'

// ========================================
// TYPES
// ========================================
interface Event {
  id: string
  title: string
  description: string
  event_type: string
  start_time: string
  end_time: string
  recurring: boolean
  recurrence_rule: string | null
  meeting_link: string | null
  platform: string
}

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
  isStartingSoon: boolean
  label: string
}

// ========================================
// TIME HELPERS
// ========================================
function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatLocalTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calculateCountdown(targetDate: string): Countdown {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const diff = target - now
  const fifteenMinutes = 15 * 60 * 1000

  // Service is live (within the service window)
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: true,
      isStartingSoon: false,
      label: '🔴 LIVE NOW',
    }
  }

  // Join button opens 15 minutes before service
  if (diff <= fifteenMinutes) {
    const mins = Math.floor(diff / (1000 * 60))
    const secs = Math.floor((diff % (1000 * 60)) / 1000)
    return {
      days: 0,
      hours: 0,
      minutes: mins,
      seconds: secs,
      isLive: false,
      isStartingSoon: true,
      label: `Starting in ${mins}m ${secs}s`,
    }
  }

  // Full countdown
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isLive: false,
    isStartingSoon: false,
    label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  }
}

function getCountdownDisplay(countdown: Countdown): string {
  if (countdown.isLive) return '🔴 LIVE NOW — Join the service'
  if (countdown.isStartingSoon) return `🟡 Starting soon — Join is open`
  if (countdown.days === 0) {
    return `Today at ${countdown.hours}h ${countdown.minutes}m`
  }
  if (countdown.days === 1) return 'Tomorrow'
  return `${countdown.days} days away`
}

// ========================================
// JOIN PAGE COMPONENT
// ========================================
export default function Join() {
  const [events, setEvents] = useState<Event[]>([])
  const [nextService, setNextService] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState<Countdown | null>(null)
  const browserTimezone = getBrowserTimezone()

  // Fetch events from Supabase
  const fetchEvents = useCallback(async () => {
    try {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('end_time', now)
        .order('start_time')
        .limit(10)

      if (error) throw error

      const fetchedEvents = data || []
      setEvents(fetchedEvents)

      // Find next worship service
      const worship = fetchedEvents.find(
        (e) => e.event_type === 'worship' && new Date(e.end_time).getTime() > Date.now()
      )
      setNextService(worship || fetchedEvents[0] || null)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Live countdown ticker
  useEffect(() => {
    if (!nextService) return

    const tick = () => {
      setCountdown(calculateCountdown(nextService.start_time))
    }

    tick() // Initial calculation
    const interval = setInterval(tick, 1000) // Update every second

    return () => clearInterval(interval)
  }, [nextService])

  // Reload events every 5 minutes to catch new/updated events
  useEffect(() => {
    const interval = setInterval(fetchEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchEvents])

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-block w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-caption">Loading service information...</p>
        </div>
      </div>
    )
  }

  // ========================================
  // NO EVENTS STATE
  // ========================================
  if (!nextService) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
        <header className="text-center mb-16">
          <span className="badge-primary mb-4">Worship Together</span>
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">Join Live Service</h1>
        </header>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">No Services Scheduled</h2>
          <p className="text-body text-lg max-w-md mx-auto">
            We're preparing our next service. Please check back soon or contact us for more information.
          </p>
        </div>
      </div>
    )
  }

  // ========================================
  // MAIN VIEW
  // ========================================
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      
      {/* Page Header */}
      <header className="text-center mb-16">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium tracking-wide mb-4 ${
          countdown?.isLive
            ? 'bg-red-50 text-red-700 border border-red-200'
            : countdown?.isStartingSoon
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'badge-primary'
        }`}>
          {countdown?.isLive && (
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          {countdown?.isLive ? 'LIVE NOW' : countdown?.isStartingSoon ? 'Starting Soon' : 'Worship Together'}
        </span>
        
        <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">
          Join Live Service
        </h1>
        
        <p className="text-body text-lg max-w-2xl mx-auto">
          Connect with our community in real-time. All are welcome at His table.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <div className="space-y-6">
              
              {/* Next Service Countdown */}
              <div className={`rounded-2xl p-6 border-2 transition-colors ${
                countdown?.isLive
                  ? 'bg-red-50/80 border-red-300'
                  : countdown?.isStartingSoon
                  ? 'bg-amber-50/80 border-amber-300'
                  : 'bg-teal-50 border-teal-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {countdown?.isLive ? (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  ) : (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                    </span>
                  )}
                  <span className={`text-sm font-semibold uppercase tracking-wider ${
                    countdown?.isLive ? 'text-red-700' : countdown?.isStartingSoon ? 'text-amber-700' : 'text-teal-700'
                  }`}>
                    {countdown?.isLive ? '🔴 LIVE NOW' : 'Next Service'}
                  </span>
                </div>

                {countdown && (
                  <p className="text-2xl font-bold text-slate-800 mb-1">
                    {getCountdownDisplay(countdown)}
                  </p>
                )}

                <p className="text-slate-600 font-medium">
                  {formatDate(nextService.start_time)} • {formatLocalTime(nextService.start_time)} – {formatLocalTime(nextService.end_time)}
                </p>

                {/* Local time indicator */}
                <p className="text-xs text-slate-400 mt-2">
                  Your timezone: {browserTimezone}
                </p>
              </div>

              {/* Service Info */}
              <div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  {nextService.title}
                </h2>
                <p className="text-body leading-relaxed">
                  {nextService.description}
                </p>
              </div>

              {/* Join Button */}
              {(countdown?.isLive || countdown?.isStartingSoon) ? (
                <a
                  href={nextService.meeting_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-4 rounded-xl font-semibold text-lg text-center transition-all shadow-lg ${
                    countdown?.isLive
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/25 animate-pulse'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/25'
                  }`}
                >
                  {countdown?.isLive ? '🔴 Join Now — Service is Live' : '🟡 Join Early — Service Starting Soon'}
                </a>
              ) : (
                <button
                  disabled
                  className="block w-full py-4 bg-slate-300 text-slate-500 rounded-xl font-semibold text-lg text-center cursor-not-allowed"
                >
                  Join opens 15 minutes before service
                </button>
              )}

              {/* Meeting Details */}
              <div className="grid sm:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-50/50">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Schedule
                  </p>
                  <p className="text-slate-800 font-semibold">
                    {nextService.recurring ? 'Every Saturday' : 'One-time event'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Platform
                  </p>
                  <p className="text-slate-800 font-semibold capitalize">
                    {nextService.platform}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Your Local Time
                  </p>
                  <p className="text-slate-800 font-semibold">
                    {formatLocalTime(nextService.start_time)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="text-slate-800 font-semibold">
                    {(() => {
                      const start = new Date(nextService.start_time)
                      const end = new Date(nextService.end_time)
                      const hours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60))
                      const mins = Math.floor(((end.getTime() - start.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
                      return `${hours}h ${mins}m`
                    })()}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="border border-teal-100 rounded-xl p-5 bg-teal-50/50">
                <h3 className="text-sm font-semibold text-teal-800 mb-3">
                  How to Join
                </h3>
                <ol className="space-y-2 text-sm text-teal-700 list-decimal list-inside">
                  <li>Click the join button when it becomes active (15 minutes before service)</li>
                  <li>Choose to join via browser or the Teams app</li>
                  <li>Enter your name to be admitted to the meeting</li>
                  <li>Settle in and prepare your heart for worship</li>
                </ol>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Join Card */}
          {(countdown?.isLive || countdown?.isStartingSoon) ? (
            <a
              href={nextService.meeting_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-2xl p-6 text-white text-center shadow-lg transition-all ${
                countdown?.isLive
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <p className="text-lg font-semibold mb-2">
                {countdown?.isLive ? '🔴 Service Live' : '🟡 Starting Soon'}
              </p>
              <p className="text-white/80 text-sm mb-1">
                {nextService.title}
              </p>
              <p className="text-white/80 text-sm mb-3">
                {formatLocalTime(nextService.start_time)}
              </p>
              <span className="inline-block px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
                Join Now
              </span>
            </a>
          ) : (
            <div className="glass-card text-center p-6">
              <p className="text-slate-500 text-sm">
                Join button activates 15 minutes before service
              </p>
              {countdown && (
                <p className="text-slate-800 font-bold text-xl mt-2">
                  {countdown.days > 0 && `${countdown.days}d `}
                  {countdown.hours > 0 && `${countdown.hours}h `}
                  {countdown.minutes}m {countdown.seconds}s
                </p>
              )}
            </div>
          )}

          {/* Upcoming Sessions */}
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
            Upcoming Sessions
          </h3>

          {events.filter(e => e.id !== nextService?.id).length === 0 ? (
            <p className="text-caption text-sm px-1">
              More sessions coming soon.
            </p>
          ) : (
            events
              .filter(e => e.id !== nextService?.id)
              .map((event) => (
                <GlassCard key={event.id}>
                  <div className="space-y-3">
                    <span className="badge-primary text-xs capitalize">
                      {event.event_type.replace('_', ' ')}
                    </span>
                    <h4 className="text-base font-semibold text-slate-800">
                      {event.title}
                    </h4>
                    <p className="text-body text-sm line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-200/50">
                      <span className="text-sm font-medium text-slate-600">
                        {formatDate(event.start_time)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-sm text-slate-500">
                        {formatLocalTime(event.start_time)}
                      </span>
                    </div>
                    {event.meeting_link && (
                      <a
                        href={event.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium text-center hover:bg-teal-100 transition-colors border border-teal-200"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </GlassCard>
              ))
          )}
        </div>
      </div>
    </div>
  )
}