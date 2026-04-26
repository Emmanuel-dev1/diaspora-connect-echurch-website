// src/pages/Ministries.tsx
import GlassCard from '../components/ui/GlassCard'

const ministries = [
  {
    id: 'personal',
    title: 'Personal Ministries',
    focus: 'Outreach & Discipleship',
    description: 'Empowering individuals to serve and grow in their personal walk with Christ through outreach, discipleship, and community engagement.',
  },
  {
    id: 'stewardship',
    title: 'Stewardship',
    focus: 'Faithful Management',
    description: 'Learning to manage God\'s resources wisely — time, talents, and treasures through biblical principles of faithful stewardship.',
  },
  {
    id: 'music',
    title: 'Music Ministry',
    focus: 'Worship & Praise',
    description: 'Worshipping God through melody and song. Join our virtual choir and praise team as we lift our voices in unity and spirit.',
  },
  {
    id: 'men',
    title: 'Adventist Men Ministries',
    focus: 'Leadership & Fellowship',
    description: 'Building strong men of faith who lead their families and communities with integrity, wisdom, and godly character.',
  },
  {
    id: 'women',
    title: 'Women Ministries',
    focus: 'Nurture & Empowerment',
    description: 'Nurturing and empowering women to reach their full potential in Christ through fellowship, mentoring, and spiritual growth.',
  },
  {
    id: 'family',
    title: 'Family Life Ministries',
    focus: 'Family & Relationships',
    description: 'Strengthening families through biblical principles, resources, and programs that build healthy, lasting relationships.',
  },
]

export default function Ministries() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      
      {/* Page Header */}
      <header className="text-center mb-16">
        <span className="badge-primary mb-4">
          Serve & Grow
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">
          Our Ministries
        </h1>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Discover ways to connect, serve, and deepen your faith 
          through our ministry programs designed for the digital age.
        </p>
      </header>

      {/* Ministries Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ministries.map((ministry) => (
          <GlassCard key={ministry.id} id={ministry.id}>
            
            {/* Focus Badge */}
            <span className="badge-accent mb-4">
              {ministry.focus}
            </span>

            {/* Title */}
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              {ministry.title}
            </h2>

            {/* Description */}
            <p className="text-body text-sm leading-relaxed mb-6">
              {ministry.description}
            </p>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200/50">
              <p className="text-caption italic">
                Content coming soon
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}