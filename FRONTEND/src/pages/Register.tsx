// frontend/src/pages/Register.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const ministryOptions = [
    'Personal Ministries', 'Stewardship', 'Music', 'Men Ministries', 'Women Ministries', 'Family Life'
  ]

  const toggleInterest = (ministry: string) => {
    setInterests(prev => 
      prev.includes(ministry) 
        ? prev.filter(m => m !== ministry) 
        : [...prev, ministry]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUp(email, password, fullName)
    
    if (signUpError) {
      setError(signUpError)
      setLoading(false)
      return
    }

    // Register for membership
    await supabase.from('registrations').insert({
      full_name: fullName,
      email,
      location,
      interests
    })

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5">
        <div className="w-full max-w-md glass-card p-10 text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Check Your Email</h2>
          <p className="text-body mb-6">
            We've sent a confirmation link to <strong>{email}</strong>. 
            Please verify your email to complete registration.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">Join Our Community</h1>
            <p className="text-body text-sm">Create your account to get started</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800"
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800"
                placeholder="City, Country (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interests (optional)</label>
              <div className="flex flex-wrap gap-2">
                {ministryOptions.map((ministry) => (
                  <button
                    key={ministry}
                    type="button"
                    onClick={() => toggleInterest(ministry)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      interests.includes(ministry)
                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                        : 'bg-white/50 text-slate-600 border-slate-200 hover:border-teal-200'
                    }`}
                  >
                    {ministry}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}