// src/pages/Join.tsx
import GlassCard from '../components/ui/GlassCard'

const TEAMS_LINK = "https://teams.live.com/meet/93876861095581?p=jAI9zJaZzxcUYzaPk1&eventType=community"
const SERVICE_DAY = 6 // Saturday
const SERVICE_START_HOUR = 8
const SERVICE_END_HOUR = 11
const SERVICE_END_MINUTES = 30
const TIMEZONE = "GMT"

function getNextServiceDate(): { date: Date; formattedDate: string; countdown: string } {
  const now = new Date()
  const nextService = new Date()
  const daysUntilSaturday = (SERVICE_DAY - now.getDay() + 7) % 7
  nextService.setDate(now.getDate() + daysUntilSaturday)
  nextService.setHours(SERVICE_START_HOUR, 0, 0, 0)
  
  if (daysUntilSaturday === 0 && now.getHours() >= SERVICE_START_HOUR) {
    nextService.setDate(nextService.getDate() + 7)
  }
  
  const diffMs = nextService.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  let countdown: string
  if (diffDays === 0) {
    countdown = `Today at ${formatTime(nextService)}`
  } else if (diffDays === 1) {
    countdown = `Tomorrow at ${formatTime(nextService)}`
  } else {
    countdown = `In ${diffDays} days ${diffHours} hours`
  }
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return {
    date: nextService,
    formattedDate: nextService.toLocaleDateString('en-US', options),
    countdown,
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

const upcomingSessions = [
  {
    title: 'Sabbath Worship Service',
    day: 'Saturday',
    time: '08:00 - 11:30 GMT',
    description: 'Weekly worship with praise, prayer, and an inspiring message.',
    type: 'Worship',
    link: TEAMS_LINK,
  },
  {
    title: 'Midweek Bible Study',
    day: 'Wednesday',
    time: '7:00 PM EST',
    description: 'Deep dive into Scripture with our online study group.',
    type: 'Bible Study'
  },
  {
    title: 'Morning Prayer Call',
    day: 'Friday',
    time: '6:00 AM EST',
    description: 'Start your day with peaceful prayer and intercession.',
    type: 'Prayer'
  },
  {
    title: 'Youth Fellowship',
    day: 'Saturday',
    time: '4:00 PM EST',
    description: 'A space for young people to connect and grow in faith.',
    type: 'Fellowship'
  },
]

export default function Join() {
  const nextService = getNextServiceDate()

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      
      {/* Page Header */}
      <header className="text-center mb-16">
        <span className="badge-primary mb-4">
          Worship Together
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">
          Join Live Service
        </h1>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Connect with our community in real-time. 
          All are welcome at His table.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Join Card */}
          <GlassCard>
            <div className="space-y-6">
              
              {/* Next Service Info */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                    Next Service
                  </span>
                </div>
                <p className="text-2xl font-semibold text-slate-800 mb-1">
                  {nextService.countdown}
                </p>
                <p className="text-teal-600 font-medium">
                  {nextService.formattedDate} • 08:00 - 11:30 {TIMEZONE}
                </p>
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  Sabbath Worship Service
                </h2>
                <p className="text-body">
                  Our weekly Sabbath service is hosted on Microsoft Teams. 
                  Click the button below to join when the service begins.
                </p>
              </div>

              {/* Join Button - Real Teams Link */}
              <a
                href={TEAMS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg text-center hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
              >
                Join Teams Meeting
              </a>

              {/* Meeting Details */}
              <div className="grid sm:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-50/50">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Schedule
                  </p>
                  <p className="text-slate-800 font-semibold">
                    Every Saturday
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Time
                  </p>
                  <p className="text-slate-800 font-semibold">
                    08:00 - 11:30 {TIMEZONE}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="border border-teal-100 rounded-xl p-5 bg-teal-50/50">
                <h3 className="text-sm font-semibold text-teal-800 mb-3">
                  How to Join
                </h3>
                <ol className="space-y-2 text-sm text-teal-700 list-decimal list-inside">
                  <li>Click "Join Teams Meeting" when service begins</li>
                  <li>Choose to join via browser or the Teams app</li>
                  <li>Enter your name to be admitted to the meeting</li>
                  <li>Settle in and prepare your heart for worship</li>
                </ol>
              </div>

              {/* Recurring Notice */}
              <div className="text-center pt-2">
                <p className="text-caption text-sm">
                  This is a weekly recurring service. The same link works every Saturday.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          
          {/* Quick Join for Sabbath */}
          <a
            href={TEAMS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-teal-600 hover:bg-teal-700 transition-colors rounded-2xl p-6 text-white shadow-lg shadow-teal-500/25 text-center"
          >
            <p className="text-lg font-semibold mb-2">
              Sabbath Service
            </p>
            <p className="text-teal-100 text-sm mb-1">
              Every Saturday
            </p>
            <p className="text-teal-100 text-sm mb-3">
              08:00 - 11:30 {TIMEZONE}
            </p>
            <span className="inline-block px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
              Join Now
            </span>
          </a>

          {/* Upcoming Sessions */}
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
            Upcoming Sessions
          </h3>
          
          {upcomingSessions.map((session) => (
            <GlassCard key={session.title}>
              <div className="space-y-3">
                {/* Type Badge */}
                <span className="badge-primary text-xs">
                  {session.type}
                </span>

                {/* Title */}
                <h4 className="text-base font-semibold text-slate-800">
                  {session.title}
                </h4>

                {/* Description */}
                <p className="text-body text-sm">
                  {session.description}
                </p>

                {/* Day & Time */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200/50">
                  <span className="text-sm font-medium text-slate-600">
                    {session.day}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-sm text-slate-500">
                    {session.time}
                  </span>
                </div>

                {/* Join Link for Sabbath */}
                {session.link && (
                  <a
                    href={session.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium text-center hover:bg-teal-100 transition-colors border border-teal-200"
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}