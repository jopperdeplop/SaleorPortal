'use client'

import { useState, useEffect } from 'react'
import { Store, Image as ImageIcon, Instagram, Youtube, Loader2, Save, ExternalLink } from 'lucide-react'

interface BrandHeroBlock {
  blockType: 'brand-hero'
  logo?: { url: string }
  coverImage?: { url: string }
  tagline?: string
  instagramUrl?: string
  youtubeUrl?: string
}

interface BrandAboutBlock {
  blockType: 'brand-about'
  heading?: string
  story?: string
  foundingYear?: number
}

type BrandBlock = BrandHeroBlock | BrandAboutBlock

interface BrandPage {
  id: string
  vendorId: string
  saleorPageSlug: string
  brandName: string
  layout?: BrandBlock[]
}

export default function BrandPageEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [brandPage, setBrandPage] = useState<BrandPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state for Hero block
  const [tagline, setTagline] = useState('')
  const [instagram, setInstagram] = useState('')
  const [youtube, setYoutube] = useState('')

  // Form state for About block
  const [aboutHeading, setAboutHeading] = useState('About Us')
  const [story, setStory] = useState('')
  const [foundingYear, setFoundingYear] = useState<number | ''>('')

  useEffect(() => {
    fetchBrandPage()
  }, [])

  async function fetchBrandPage() {
    try {
      const res = await fetch('/api/brand-page')
      if (res.ok) {
        const data = await res.json()
        setBrandPage(data.brandPage)
        
        // Populate form from existing data
        if (data.brandPage?.layout) {
          const hero = data.brandPage.layout.find((b: BrandBlock) => b.blockType === 'brand-hero') as BrandHeroBlock | undefined
          const about = data.brandPage.layout.find((b: BrandBlock) => b.blockType === 'brand-about') as BrandAboutBlock | undefined
          
          if (hero) {
            setTagline(hero.tagline || '')
            setInstagram(hero.instagramUrl || '')
            setYoutube(hero.youtubeUrl || '')
          }
          if (about) {
            setAboutHeading(about.heading || 'About Us')
            setStory(about.story || '')
            setFoundingYear(about.foundingYear || '')
          }
        }
      } else if (res.status === 404) {
        // No brand page yet - this is fine
        setBrandPage(null)
      } else {
        setError('Failed to load brand page')
      }
    } catch {
      setError('Failed to load brand page')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const layout: BrandBlock[] = [
        {
          blockType: 'brand-hero',
          tagline,
          instagramUrl: instagram || undefined,
          youtubeUrl: youtube || undefined,
        },
        {
          blockType: 'brand-about',
          heading: aboutHeading,
          story: story || undefined,
          foundingYear: foundingYear || undefined,
        },
      ]

      const res = await fetch('/api/brand-page', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout }),
      })

      if (res.ok) {
        const data = await res.json()
        setBrandPage(data.brandPage)
        setSuccessMessage('Brand page saved successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError('Failed to save brand page')
      }
    } catch {
      setError('Failed to save brand page')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-carbon dark:text-white mb-2">Brand Page</h2>
          <p className="text-stone-500">Customize how your brand appears on the storefront.</p>
        </div>
        {brandPage?.saleorPageSlug && (
          <a
            href={`https://salp.shop/pages/${brandPage.saleorPageSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Live Page
          </a>
        )}
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}

      {!brandPage ? (
        <div className="bg-white dark:bg-card p-8 border border-vapor dark:border-border rounded-lg text-center">
          <Store className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-carbon dark:text-white mb-2">Brand Page Not Ready</h3>
          <p className="text-stone-500">Your brand page is being set up. Please check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero Section */}
          <section className="bg-white dark:bg-card border border-vapor dark:border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-vapor dark:border-border bg-stone-50 dark:bg-stone-900">
              <h3 className="text-lg font-serif font-medium text-carbon dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Hero Section
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Your brand's tagline"
                  className="w-full px-4 py-2 border border-vapor dark:border-border rounded-lg bg-white dark:bg-stone-800 text-carbon dark:text-white focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    <Instagram className="w-4 h-4 inline mr-1" />
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourbrand"
                    className="w-full px-4 py-2 border border-vapor dark:border-border rounded-lg bg-white dark:bg-stone-800 text-carbon dark:text-white focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    <Youtube className="w-4 h-4 inline mr-1" />
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@yourbrand"
                    className="w-full px-4 py-2 border border-vapor dark:border-border rounded-lg bg-white dark:bg-stone-800 text-carbon dark:text-white focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-white dark:bg-card border border-vapor dark:border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-vapor dark:border-border bg-stone-50 dark:bg-stone-900">
              <h3 className="text-lg font-serif font-medium text-carbon dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5" />
                About Section
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={aboutHeading}
                  onChange={(e) => setAboutHeading(e.target.value)}
                  placeholder="About Us"
                  className="w-full px-4 py-2 border border-vapor dark:border-border rounded-lg bg-white dark:bg-stone-800 text-carbon dark:text-white focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Brand Story
                </label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Share your brand's history and mission..."
                  rows={6}
                  className="w-full px-4 py-2 border border-vapor dark:border-border rounded-lg bg-white dark:bg-stone-800 text-carbon dark:text-white focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Founding Year
                </label>
                <input
                  type="number"
                  value={foundingYear}
                  onChange={(e) => setFoundingYear(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="2020"
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-vapor dark:border-border rounded-lg bg-white dark:bg-stone-800 text-carbon dark:text-white focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white font-medium rounded-lg hover:bg-terracotta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
