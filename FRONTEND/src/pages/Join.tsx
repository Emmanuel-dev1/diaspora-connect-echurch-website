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
  meeting_id: string | null
  meeting_password: string | null
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
// CONSTANTS
// ========================================
const TEAMS_MEETING_ID = '93876861095581'
const TEAMS_PASSCODE = 'echurch2024'
const TEAMS_LINK = 'https://teams.live.com/meet/93876861095581?p=jAI9zJaZzxcUYzaPk1&eventType=community'

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

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: true,
      isStartingSoon: false,
      label: 'LIVE NOW',
    }
  }

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

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  let label = ''
  if (days > 0) label += `${days}d `
  if (hours > 0) label += `${hours}h `
  label += `${minutes}m ${seconds}s`

  return {
    days,
    hours,
    minutes,
    seconds,
    isLive: false,
    isStartingSoon: false,
    label: label.trim(),
  }
}

// ========================================
// AUDIO BUTTON COMPONENT
// ========================================
function AudioButton({ label, emoji, color }: { label: string; emoji: string; color: string }) {
  const [ripple, setRipple] = useState(false)

  const playSound = () => {
    const audioSrc = `/audio/${label.toLowerCase()}.mp3`
    const audio = new Audio(audioSrc)
    audio.volume = 0.6
    audio.play().catch(() => {})

    setRipple(true)
    setTimeout(() => setRipple(false), 300)
  }

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100',
    purple: 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100',
    rose: 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100',
    blue: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100',
  }

  return (
    <button
      onClick={playSound}
      className={`relative px-4 py-3 rounded-xl border font-semibold text-sm transition-all active:scale-95 ${colorMap[color]} ${ripple ? 'scale-90' : ''}`}
    >
      <span className="text-lg mr-1">{emoji}</span> {label}
      {ripple && <span className="absolute inset-0 rounded-xl animate-ping bg-white/50" />}
    </button>
  )
}

// ========================================
// MEETING INFO CARD
// ========================================
function MeetingInfoCard() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="glass-card p-4 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Meeting ID</p>
        <p className="text-base font-bold text-slate-800">{TEAMS_MEETING_ID}</p>
      </div>
      <div className="glass-card p-4 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Passcode</p>
        <p className="text-base font-bold text-slate-800">{TEAMS_PASSCODE}</p>
      </div>
      <div className="glass-card p-4 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Platform</p>
        <p className="text-base font-bold text-slate-800">Microsoft Teams</p>
      </div>
      <div className="glass-card p-4 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Access</p>
        <p className="text-base font-bold text-green-600">Free • No Account Needed</p>
      </div>
    </div>
  )
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

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (!nextService) return

    const tick = () => {
      setCountdown(calculateCountdown(nextService.start_time))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [nextService])

  // Refresh events every 5 minutes
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
          <div className="inline-block w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Preparing the sanctuary...</p>
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
        <div className="max-w-md mx-auto text-center py-16">
          <div className="text-6xl mb-6">📅</div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-3">No Services Scheduled</h2>
          <p className="text-body text-lg">
            We're preparing our next worship service. Please check back soon or contact us for more information.
          </p>
        </div>
      </div>
    )
  }

  const isLiveOrSoon = countdown?.isLive || countdown?.isStartingSoon

  // ========================================
  // LIVE / STARTING SOON VIEW
  // ========================================
  if (isLiveOrSoon) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-16">
        
        {/* Live Banner */}
        <div className="text-center mb-10">
          <span className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold tracking-wide ${
            countdown?.isLive
              ? 'bg-red-50 text-red-700 border-2 border-red-300'
              : 'bg-amber-50 text-amber-700 border-2 border-amber-300'
          }`}>
            {countdown?.isLive && (
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            {countdown?.isLive ? 'LIVE NOW' : `STARTING IN ${countdown?.minutes}m ${countdown?.seconds}s`}
          </span>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-800 mt-5 mb-3">
            {nextService.title}
          </h1>
          
          <p className="text-lg text-slate-500">
            {formatDate(nextService.start_time)} • {formatLocalTime(nextService.start_time)} – {formatLocalTime(nextService.end_time)}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Your timezone: {browserTimezone}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Join Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Service Lobby Card */}
            <GlassCard>
              <div className="text-center space-y-6 py-4">
                
                {/* Welcome Message */}
                <div>
                  <div className="text-5xl mb-4">⛪</div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                    Welcome to {nextService.title}
                  </h2>
                  <p className="text-body text-lg max-w-xl mx-auto">
                    {nextService.description}
                  </p>
                </div>

                {/* Info Message */}
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 max-w-xl mx-auto">
                  <p className="text-sm text-teal-700 leading-relaxed">
                    When you click <strong>Join Live Service</strong>, the meeting will open in 
                    Microsoft Teams Web in your browser, where you can use your microphone, camera, 
                    chat, reactions, and other meeting features.
                  </p>
                </div>

                {/* Join Button */}
                <a
                  href={TEAMS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0 ${
                    countdown?.isLive
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30 animate-pulse'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/30'
                  }`}
                >
                  {countdown?.isLive ? (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      Join Live Service Now
                    </>
                  ) : (
                    'Join Live Service'
                  )}
                </a>

                <p className="text-xs text-slate-400">
                  Opens in a new browser tab • No sign-in required
                </p>
              </div>
            </GlassCard>

            {/* Meeting Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
                Meeting Information
              </h3>
              <MeetingInfoCard />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Worship Reactions */}
            <GlassCard>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
                Worship Reactions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <AudioButton label="Amen" emoji="🙏" color="amber" />
                <AudioButton label="Hallelujah" emoji="🎉" color="purple" />
                <AudioButton label="Praise" emoji="🔥" color="rose" />
                <AudioButton label="Worship" emoji="🎵" color="blue" />
              </div>
              <p className="text-caption text-xs text-center mt-4">
                Click to add your voice to the congregation
              </p>
            </GlassCard>

            {/* Quick Info Card */}
            <GlassCard>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Service</p>
                  <p className="font-semibold text-slate-800">{nextService.title}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Date</p>
                  <p className="font-semibold text-slate-800">{formatDate(nextService.start_time)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Time (Your Local)</p>
                  <p className="font-semibold text-slate-800">
                    {formatLocalTime(nextService.start_time)} – {formatLocalTime(nextService.end_time)}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/50">
                  <p className="text-xs text-slate-400">No account needed. Just enter your name and join the worship.</p>
                </div>
              </div>
            </GlassCard>

            {/* Upcoming Sessions */}
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1 pt-2">
              Upcoming Sessions
            </h3>
            
            {events.filter(e => e.id !== nextService?.id).length === 0 ? (
              <p className="text-caption text-sm px-1">More sessions coming soon.</p>
            ) : (
              <div className="space-y-4">
                {events.filter(e => e.id !== nextService?.id).map((event) => (
                  <GlassCard key={event.id}>
                    <div className="space-y-3">
                      <span className="badge-primary text-xs capitalize">
                        {event.event_type.replace('_', ' ')}
                      </span>
                      <h4 className="text-base font-semibold text-slate-800">{event.title}</h4>
                      <p className="text-body text-sm line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-200/50">
                        <span className="text-sm font-medium text-slate-600">
                          {formatDate(event.start_time)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-sm text-slate-500">
                          {formatLocalTime(event.start_time)}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ========================================
  // COUNTDOWN VIEW (Service not live yet)
  // ========================================
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      
      {/* Page Header */}
      <header className="text-center mb-16">
        <span className="badge-primary mb-4">Worship Together</span>
        <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">
          Join Live Service
        </h1>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Connect with our community in real-time. All are welcome at His table.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Countdown Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Countdown Card */}
          <GlassCard>
            <div className="text-center space-y-6 py-4">
              
              {/* Countdown Display */}
              <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-8">
                <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">
                  Service Begins In
                </p>
                {countdown && (
                  <p className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
                    {countdown.label}
                  </p>
                )}
                <p className="text-lg text-slate-600">
                  {formatDate(nextService.start_time)}
                </p>
                <p className="text-slate-500">
                  {formatLocalTime(nextService.start_time)} – {formatLocalTime(nextService.end_time)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Your timezone: {browserTimezone}
                </p>
              </div>

              {/* Service Details */}
              <div className="max-w-lg mx-auto">
                <div className="text-5xl mb-4">⛪</div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  {nextService.title}
                </h2>
                <p className="text-body">
                  {nextService.description}
                </p>
              </div>

              {/* Info Message */}
              <div className="bg-slate-50 rounded-xl p-5 max-w-lg mx-auto">
                <p className="text-sm text-slate-600 leading-relaxed">
                  The join button will become active 15 minutes before the service begins. 
                  When it's time, click to open Microsoft Teams Web — no account or sign-in required.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Meeting Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Meeting Information
            </h3>
            <MeetingInfoCard />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Service Info Card */}
          <GlassCard>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Service</p>
                <p className="font-semibold text-slate-800">{nextService.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Date</p>
                <p className="font-semibold text-slate-800">{formatDate(nextService.start_time)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Time (Your Local)</p>
                <p className="font-semibold text-slate-800">
                  {formatLocalTime(nextService.start_time)} – {formatLocalTime(nextService.end_time)}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/50">
                <p className="text-xs text-slate-400">No account needed. Just enter your name and join.</p>
              </div>
            </div>
          </GlassCard>

          {/* Upcoming Sessions */}
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
            Upcoming Sessions
          </h3>
          
          {events.filter(e => e.id !== nextService?.id).length === 0 ? (
            <p className="text-caption text-sm px-1">More sessions coming soon.</p>
          ) : (
            <div className="space-y-4">
              {events.filter(e => e.id !== nextService?.id).map((event) => (
                <GlassCard key={event.id}>
                  <div className="space-y-3">
                    <span className="badge-primary text-xs capitalize">
                      {event.event_type.replace('_', ' ')}
                    </span>
                    <h4 className="text-base font-semibold text-slate-800">{event.title}</h4>
                    <p className="text-body text-sm line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-200/50">
                      <span className="text-sm font-medium text-slate-600">
                        {formatDate(event.start_time)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-sm text-slate-500">
                        {formatLocalTime(event.start_time)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}