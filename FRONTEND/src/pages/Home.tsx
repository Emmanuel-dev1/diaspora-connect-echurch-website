// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Home() {
  const [videoError, setVideoError] = useState(false)

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {!videoError && (
          <video
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            className="absolute w-full h-full object-cover"
          >
            <source src="/videos/church-logo.mp4" type="video/mp4" />
          </video>
        )}
        <div className={`absolute inset-0 ${
          videoError 
            ? 'bg-gradient-to-br from-sky-50 via-white to-teal-50' 
            : 'bg-white/10 backdrop-blur-sm'
        }`} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 py-20">
        <div className="glass-card p-10 md:p-16 text-center">
          
          {/* Label */}
          <div className="inline-flex mb-8">
            <span className="badge-primary text-sm font-medium tracking-wide">
              Welcome Home
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 leading-[1.15] mb-6">
            A Digital Sanctuary
            <br />
            <span className="font-semibold text-teal-600">
              For Your Soul
            </span>
          </h1>

          {/* Description */}
          <p className="text-body text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Diaspora Connect eChurch brings the peace of worship to you, 
            wherever you are. Experience faith, community, and spiritual growth 
            in a space designed for your journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              to="/join"
              className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-base hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
            >
              Join Live Service
            </Link>
            <Link
              to="/ministries"
              className="inline-flex items-center justify-center px-8 py-4 glass rounded-xl font-medium text-slate-700 hover:text-teal-700 hover:bg-white/70 transition-all border-white/60"
            >
              Explore Ministries
            </Link>
          </div>

          {/* Verse */}
          <div className="pt-8 border-t border-slate-200/60">
            <blockquote className="space-y-1">
              <p className="text-slate-400 italic text-base text-black/60">
                "For where two or three gather in my name,
                <br className="hidden sm:block" /> there am I with them."
              </p>
              <cite className="text-slate-300 text-sm not-italic text-black/60">
                Matthew 18:20
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  )
}