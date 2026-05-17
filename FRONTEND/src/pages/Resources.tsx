// frontend/src/pages/Resources.tsx
import { useState, useEffect } from 'react'
import GlassCard from '../components/ui/GlassCard'
import { supabase } from '../lib/supabase'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string
const CHANNEL_ID = '@Emmanuel_Owusu_Jnr'

interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  duration: string
}

interface Ebook {
  id: string
  title: string
  author: string
  description: string
  pages: number
  format: string
  file_url: string | null
  thumbnail_url: string | null
  is_free: boolean
}

function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  const hours = match[1] ? parseInt(match[1]) : 0
  const minutes = match[2] ? parseInt(match[2]) : 0
  const seconds = match[3] ? parseInt(match[3]) : 0
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export default function Resources() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [loadingEbooks, setLoadingEbooks] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Fetch ebooks from Supabase
  useEffect(() => {
    async function fetchEbooks() {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('resource_type', 'ebook')
          .order('created_at', { ascending: false })

        if (error) throw error

        const formatted = (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          author: item.author || 'Unknown',
          description: item.description || '',
          pages: item.pages || 0,
          format: item.format || 'eBook',
          file_url: item.file_url || null,
          thumbnail_url: item.thumbnail_url || null,
          is_free: item.is_free ?? true,
        }))
        setEbooks(formatted)
      } catch (err) {
        console.error('Failed to fetch ebooks:', err)
      } finally {
        setLoadingEbooks(false)
      }
    }
    fetchEbooks()
  }, [])

  /**
   * Convert Google Drive URL to direct download URL
   * Supports formats:
   * - https://drive.google.com/file/d/FILE_ID/view
   * - https://drive.google.com/open?id=FILE_ID
   * Returns: https://drive.google.com/uc?export=download&id=FILE_ID
   */
  const getGoogleDriveDownloadUrl = (url: string): string | null => {
    // Pattern 1: /file/d/FILE_ID/
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileIdMatch) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
    }
    
    // Pattern 2: ?id=FILE_ID or &id=FILE_ID
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (idParamMatch) {
      return `https://drive.google.com/uc?export=download&id=${idParamMatch[1]}`
    }
    
    return null
  }

  /**
   * Force download a file from a URL without opening preview
   */
  const forceDownload = async (url: string, filename: string): Promise<void> => {
    try {
      // Fetch the file as a blob
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl)
      }, 1000)
    } catch (err) {
      console.error('Force download failed, trying direct link:', err)
      // Fallback: open in new tab (some browsers may still download)
      window.open(url, '_blank')
    }
  }

  /**
   * Generate filename from ebook info
   */
  const getFilename = (ebook: Ebook): string => {
    const titleSlug = ebook.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const extension = ebook.format.toLowerCase() === 'pdf' ? 'pdf' : 'pdf'
    return `${titleSlug}.${extension}`
  }

  // Handle ebook download
  const handleDownload = async (ebook: Ebook) => {
    if (!ebook.file_url) return

    try {
      setDownloadingId(ebook.id)

      // Case 1: Google Drive URL → Convert to direct download + force download
      if (ebook.file_url.includes('drive.google.com')) {
        const directUrl = getGoogleDriveDownloadUrl(ebook.file_url)
        if (directUrl) {
          await forceDownload(directUrl, getFilename(ebook))
          return
        }
      }

      // Case 2: External HTTP URL → Force download via fetch
      if (ebook.file_url.startsWith('http')) {
        await forceDownload(ebook.file_url, getFilename(ebook))
        return
      }

      // Case 3: Supabase Storage path → Download via signed URL
      const { data, error } = await supabase
        .storage
        .from('ebooks')
        .createSignedUrl(ebook.file_url, 300) // 5 minutes expiry

      if (error) throw error

      // Force download the signed URL
      await forceDownload(data.signedUrl, getFilename(ebook))

      // Increment download count
      await supabase
        .from('resources')
        .update({ download_count: (await getDownloadCount(ebook.id)) + 1 })
        .eq('id', ebook.id)

    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloadingId(null)
    }
  }

  // Helper to get current download count
  const getDownloadCount = async (resourceId: string): Promise<number> => {
    const { data } = await supabase
      .from('resources')
      .select('download_count')
      .eq('id', resourceId)
      .single()
    return data?.download_count || 0
  }

  // Fetch videos from YouTube
  useEffect(() => {
    async function fetchVideos() {
      try {
        if (!YOUTUBE_API_KEY) throw new Error('YouTube API key not configured')

        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
        )
        if (!channelRes.ok) throw new Error('Channel not found')
        const channelData = await channelRes.json()
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

        const videosRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
        )
        if (!videosRes.ok) throw new Error('Failed to fetch videos')
        const videosData = await videosRes.json()

        const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(',')
        const detailsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        )
        const detailsData = await detailsRes.json()
        const durationMap = new Map<string, string>()
        detailsData.items?.forEach((item: any) => {
          durationMap.set(item.id, formatDuration(item.contentDetails.duration))
        })

        const formatted: YouTubeVideo[] = videosData.items.map((item: any) => ({
          id: item.contentDetails.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
          publishedAt: item.snippet.publishedAt,
          duration: durationMap.get(item.contentDetails.videoId) || '0:00',
        }))
        setVideos(formatted)
      } catch (err) {
        console.error(err)
        setError('Unable to load videos. Please try again later.')
      } finally {
        setLoadingVideos(false)
      }
    }
    fetchVideos()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
      <header className="text-center mb-16">
        <span className="badge-primary mb-4">Learn & Grow</span>
        <h1 className="text-4xl md:text-5xl font-light text-slate-800 mt-4 mb-4">Resources</h1>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Explore our collection of ebooks and video messages to deepen your faith and understanding.
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
          <h2 className="text-2xl font-semibold text-slate-800">Ebooks</h2>
        </div>

        {loadingEbooks ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-caption mt-4">Loading ebooks...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No ebooks available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map((book) => (
              <GlassCard key={book.id}>
              {book.thumbnail_url?.startsWith('http') ? (
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={book.thumbnail_url}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              ) : null}
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-primary text-xs">{book.format}</span>
                  <span className="text-caption text-xs">{book.pages} pages</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1.5">{book.title}</h3>
                <p className="text-sm text-slate-400 mb-4">by {book.author}</p>
                <p className="text-body text-sm leading-relaxed mb-6">{book.description}</p>
                <button
                  onClick={() => handleDownload(book)}
                  disabled={!book.file_url || downloadingId === book.id}
                  className={`block w-full py-2.5 rounded-xl text-sm font-medium text-center transition-all border ${
                    book.file_url
                      ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600 shadow-md hover:shadow-lg'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  } ${downloadingId === book.id ? 'opacity-75' : ''}`}
                >
                  {downloadingId === book.id ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Downloading...
                    </span>
                  ) : book.file_url ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download {book.format}
                    </span>
                  ) : (
                    'Coming Soon'
                  )}
                </button>
              </GlassCard>
            ))}
          </div>
        )}
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
          <h2 className="text-2xl font-semibold text-slate-800">Video Messages</h2>
        </div>

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
            <button onClick={() => setActiveVideo(null)} className="mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium">
              ✕ Close player
            </button>
          </div>
        )}

        {loadingVideos ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-caption mt-4">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-slate-500">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <GlassCard key={video.id} className="p-0 overflow-hidden">
                <div className="aspect-video bg-slate-200 relative cursor-pointer group" onClick={() => setActiveVideo(video.id)}>
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
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
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-800 mb-1.5">{video.title}</h3>
                  <p className="text-caption text-sm leading-relaxed line-clamp-2">{video.description}</p>
                  <p className="text-caption text-xs mt-2">{formatDate(video.publishedAt)}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}