// src/pages/Resources.tsx
import { useState } from 'react'
import GlassCard from '../components/ui/GlassCard'

const ebooks = [
  {
    title: 'Steps to Christ',
    author: 'Ellen G. White',
    description: 'A timeless guide to building a personal relationship with Jesus Christ.',
    pages: 128,
    format: 'PDF'
  },
  {
    title: 'The Desire of Ages',
    author: 'Ellen G. White',
    description: 'A profound and inspiring look at the life and ministry of Jesus Christ.',
    pages: 864,
    format: 'PDF'
  },
  {
    title: 'Prayer: Experiencing Awe',
    author: 'Timothy Keller',
    description: 'Discover the transformative power and practice of prayer in your daily life.',
    pages: 336,
    format: 'eBook'
  },
  {
    title: 'The Pursuit of God',
    author: 'A.W. Tozer',
    description: 'A spiritual classic that invites you to seek a deeper relationship with God.',
    pages: 128,
    format: 'eBook'
  },
]

const videos = [
  {
    title: 'Finding Peace in Troubled Times',
    description: 'A comforting message of hope for challenging seasons of life.',
    videoId: 'dQw4w9WgXcQ',
    duration: '24:15'
  },
  {
    title: 'Understanding God\'s Grace',
    description: 'Exploring the beauty and depth of divine grace in our lives.',
    videoId: 'dQw4w9WgXcQ',
    duration: '31:42'
  },
  {
    title: 'The Power of Community',
    description: 'How fellowship and gathering strengthen our faith journey.',
    videoId: 'dQw4w9WgXcQ',
    duration: '28:10'
  },
]

export default function Resources() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      
      {/* Page Header */}
      <header className="text-center mb-16">
        <span className="badge-primary mb-4">
          Learn & Grow
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">
          Resources
        </h1>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Explore our collection of ebooks and video messages 
          to deepen your faith and understanding.
        </p>
      </header>

      {/* Ebooks Section */}
      <section id="ebooks" className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Ebooks
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map((book) => (
            <GlassCard key={book.title}>
              {/* Format Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="badge-primary text-xs">
                  {book.format}
                </span>
                <span className="text-caption text-xs">
                  {book.pages} pages
                </span>
              </div>

              {/* Title & Author */}
              <h3 className="text-lg font-semibold text-slate-800 mb-1.5">
                {book.title}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                by {book.author}
              </p>

              {/* Description */}
              <p className="text-body text-sm leading-relaxed mb-6">
                {book.description}
              </p>

              {/* Download Button */}
              <button className="w-full py-2.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors border border-teal-200">
                Download
              </button>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Video Messages
          </h2>
        </div>

        {/* Active Video Player */}
        {activeVideo && (
          <div className="mb-8">
            <div className="glass-card p-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <button
              onClick={() => setActiveVideo(null)}
              className="mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
            >
              ✕ Close player
            </button>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <GlassCard key={video.title} className="p-0 overflow-hidden">
              
              {/* Thumbnail */}
              <div 
                className="aspect-video bg-slate-200 relative cursor-pointer group"
                onClick={() => setActiveVideo(video.videoId)}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-5 h-5 text-teal-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/80 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
                  {video.duration}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-1.5">
                  {video.title}
                </h3>
                <p className="text-caption text-sm leading-relaxed">
                  {video.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  )
}