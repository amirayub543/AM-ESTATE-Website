'use client'

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FolderOpen,
  Hammer,
  Home,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Link as LinkIcon,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquareQuote,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { HeroStage, Project, PropertyCategory, PropertyOption, Service, SiteData, Space } from '@/lib/data-store'

type Tab =
  | 'overview'
  | 'company'
  | 'hero'
  | 'projects'
  | 'real-estate'
  | 'construction'
  | 'spaces'
  | 'testimonials'
  | 'stats'
  | 'media'
  | 'settings'

type ImagePickerTarget =
  | { type: 'project-cover'; projectIndex: number }
  | { type: 'category-cover'; categoryIndex: number }
  | { type: 'space-cover'; spaceIndex: number }
  | { type: 'space-gallery-add'; spaceIndex: number }
  | { type: 'modal-project-cover' }
  | { type: 'house-tour-poster' }
  | { type: 'house-tour-video' }
  | null

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [data, setData] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Media manager state
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string; category: string; size: number }[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadFolder, setUploadFolder] = useState<'images' | 'spaces'>('images')
  const [selectedSpaceSlug, setSelectedSpaceSlug] = useState<string>('living-room')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Visual Image Picker Modal state
  const [pickerTarget, setPickerTarget] = useState<ImagePickerTarget>(null)
  const [pickerFilter, setPickerFilter] = useState<'all' | 'projects' | 'spaces' | 'videos'>('all')

  // Modals / sub-state
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isNewProject, setIsNewProject] = useState(false)

  // Password change state
  const [newPasswordInput, setNewPasswordInput] = useState('')

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth')
      const json = await res.json()
      if (json.authenticated) {
        setAuthenticated(true)
        loadData()
        loadMedia()
      } else {
        setAuthenticated(false)
        setLoading(false)
      }
    } catch {
      setAuthenticated(false)
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password }),
      })
      const json = await res.json()
      if (json.success) {
        setAuthenticated(true)
        loadData()
        loadMedia()
      } else {
        setLoginError(json.message || 'Ghalat password')
      }
    } catch {
      setLoginError('Server se rabta nahi ho saka.')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    setAuthenticated(false)
    setData(null)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/data')
      const json = await res.json()
      setData(json)
    } catch {
      showNotice('Data load nahi ho saka.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadMedia = async () => {
    try {
      const res = await fetch('/api/admin/media')
      const json = await res.json()
      if (json.files) setMediaFiles(json.files)
    } catch (e) {
      console.error(e)
    }
  }

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type })
    setTimeout(() => {
      setNotice(null)
    }, 4500)
  }

  const handleSaveAll = async (overrideData?: SiteData) => {
    const payload = overrideData || data
    if (!payload) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        showNotice('Changes kamyabi sy save ho gayi hain aur Website update ho chuki hai!')
      } else {
        showNotice(json.message || 'Save fail ho gaya', 'error')
      }
    } catch {
      showNotice('Network error. Save nahi ho saka.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDirectUpload = async (
    file: File,
    target: 'images' | 'spaces',
    spaceSlug?: string
  ): Promise<string | null> => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetFolder', target)
    if (target === 'spaces' && spaceSlug) {
      formData.append('spaceSlug', spaceSlug)
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success && json.url) {
        showNotice(`Photo upload ho gai: ${json.url}`)
        await loadMedia()
        return json.url as string
      } else {
        showNotice(json.message || 'Upload fail ho gaya', 'error')
        return null
      }
    } catch {
      showNotice('Upload error', 'error')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (url: string) => {
    if (!confirm('Kya aap waqai is photo ko delete karna chahtay hain?')) return
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (json.success) {
        showNotice('Photo delete ho gai')
        loadMedia()
      } else {
        showNotice(json.message || 'Delete fail', 'error')
      }
    } catch {
      showNotice('Delete error', 'error')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(text)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // --- Assign selected image to target ---
  const applySelectedImage = (url: string) => {
    if (!data || !pickerTarget) return

    if (pickerTarget.type === 'project-cover') {
      const projects = [...data.projects]
      projects[pickerTarget.projectIndex].image = url
      setData({ ...data, projects })
      showNotice(`Project cover picture update ho gai!`)
    } else if (pickerTarget.type === 'modal-project-cover') {
      if (editingProject) {
        setEditingProject({ ...editingProject, image: url })
      }
    } else if (pickerTarget.type === 'category-cover') {
      const propertyCategories = [...data.propertyCategories]
      propertyCategories[pickerTarget.categoryIndex].image = url
      setData({ ...data, propertyCategories })
      showNotice(`Section picture update ho gai!`)
    } else if (pickerTarget.type === 'space-cover') {
      const spaces = [...data.spaces]
      spaces[pickerTarget.spaceIndex].image = url
      setData({ ...data, spaces })
      showNotice(`Room cover picture update ho gai!`)
    } else if (pickerTarget.type === 'space-gallery-add') {
      const spaces = [...data.spaces]
      const space = spaces[pickerTarget.spaceIndex]
      const photos = space.photos || []
      photos.push({ src: url, alt: `${space.title} photo` })
      spaces[pickerTarget.spaceIndex].photos = photos
      setData({ ...data, spaces })
      showNotice(`Room gallery mein photo add ho gai!`)
    } else if (pickerTarget.type === 'house-tour-poster') {
      setData({
        ...data,
        houseTour: {
          ...(data.houseTour || {
            title: 'Watch house tour',
            subtitle: 'Walkthrough of our signature completed luxury house in Bahria Town Lahore',
            videoUrl: '/video/house-tour.mp4',
            posterUrl: '/frames/frame_119.webp',
          }),
          posterUrl: url,
        },
      })
      showNotice('House Tour video ka poster picture update ho gaya!')
    } else if (pickerTarget.type === 'house-tour-video') {
      setData({
        ...data,
        houseTour: {
          ...(data.houseTour || {
            title: 'Watch house tour',
            subtitle: 'Walkthrough of our signature completed luxury house in Bahria Town Lahore',
            videoUrl: '/video/house-tour.mp4',
            posterUrl: '/frames/frame_119.webp',
          }),
          videoUrl: url,
        },
      })
      showNotice('House Tour video source update ho gaya!')
    }

    setPickerTarget(null)
  }

  // Quick assign helper from Media tab
  const handleAssignMediaTo = (url: string, destination: string) => {
    if (!data) return

    if (destination.startsWith('project:')) {
      const projId = destination.replace('project:', '')
      const projects = data.projects.map((p) => (p.id === projId ? { ...p, image: url } : p))
      setData({ ...data, projects })
      showNotice(`Photo Project "${projId}" ke thumbnail par lag gai!`)
    } else if (destination.startsWith('category:')) {
      const catSlug = destination.replace('category:', '')
      const categories = data.propertyCategories.map((c) => (c.slug === catSlug ? { ...c, image: url } : c))
      setData({ ...data, propertyCategories: categories })
      showNotice(`Photo Real Estate "${catSlug}" ke cover par lag gai!`)
    } else if (destination.startsWith('space-cover:')) {
      const spaceSlug = destination.replace('space-cover:', '')
      const spaces = data.spaces.map((s) => (s.slug === spaceSlug ? { ...s, image: url } : s))
      setData({ ...data, spaces })
      showNotice(`Photo Room "${spaceSlug}" ke cover par lag gai!`)
    } else if (destination.startsWith('space-gallery:')) {
      const spaceSlug = destination.replace('space-gallery:', '')
      const spaces = data.spaces.map((s) => {
        if (s.slug === spaceSlug) {
          const photos = [...(s.photos || []), { src: url, alt: `${s.title} photo` }]
          return { ...s, photos }
        }
        return s
      })
      setData({ ...data, spaces })
      showNotice(`Photo Room "${spaceSlug}" ki gallery mein add ho gai!`)
    } else if (destination === 'house-tour-poster') {
      setData({
        ...data,
        houseTour: {
          ...(data.houseTour || {
            title: 'Watch house tour',
            subtitle: 'Walkthrough of our signature completed luxury house in Bahria Town Lahore',
            videoUrl: '/video/house-tour.mp4',
            posterUrl: '/frames/frame_119.webp',
          }),
          posterUrl: url,
        },
      })
      showNotice('Photo House Tour video ke poster par lag gai!')
    } else if (destination === 'house-tour-video') {
      setData({
        ...data,
        houseTour: {
          ...(data.houseTour || {
            title: 'Watch house tour',
            subtitle: 'Walkthrough of our signature completed luxury house in Bahria Town Lahore',
            videoUrl: '/video/house-tour.mp4',
            posterUrl: '/frames/frame_119.webp',
          }),
          videoUrl: url,
        },
      })
      showNotice('Video House Tour section mein lag gai!')
    }
  }

  // --- HYDRATION SAFETY CHECK ---
  if (!mounted) {
    return (
      <div
        suppressHydrationWarning
        className="flex min-h-screen items-center justify-center bg-[#0d0f12] text-[#a0a5b1]"
      >
        <div suppressHydrationWarning className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 animate-spin text-[#c2a06a]" />
          <p className="text-sm font-medium">Initializing AM Estate Control Panel...</p>
        </div>
      </div>
    )
  }

  // --- LOGIN SCREEN ---
  if (authenticated === false) {
    return (
      <div
        suppressHydrationWarning
        className="flex min-h-screen items-center justify-center bg-[#0d0f12] p-4 text-[#e6e8ec]"
      >
        <div suppressHydrationWarning className="w-full max-w-md rounded-3xl border border-[#262930] bg-[#16181d] p-8 shadow-2xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#c2a06a] text-black">
              <Lock className="size-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">AM Estate &amp; Builders</h1>
            <p className="mt-1 text-xs uppercase tracking-widest text-[#a0a5b1]">Admin Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#a0a5b1]">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password (Default: admin123)"
                  className="w-full rounded-xl border border-[#2c3038] bg-[#0d0f12] px-4 py-3 text-sm text-white placeholder-[#5d6370] focus:border-[#c2a06a] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c2a06a] py-3 text-sm font-bold text-black transition hover:bg-[#d8b57d]"
            >
              Sign In to CMS
              <ArrowRight className="size-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#717786]">
            Only authorized personnel of AM Estate &amp; Builders.
          </p>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div
        suppressHydrationWarning
        className="flex min-h-screen items-center justify-center bg-[#0d0f12] text-[#a0a5b1]"
      >
        <div suppressHydrationWarning className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 animate-spin text-[#c2a06a]" />
          <p className="text-sm font-medium">Loading AM Estate CMS...</p>
        </div>
      </div>
    )
  }

  // Filter media for picker
  const filteredMedia = mediaFiles.filter((f) => {
    if (pickerFilter === 'projects') return f.url.includes('project') || f.category === 'general'
    if (pickerFilter === 'spaces') return f.url.includes('space') || f.category.startsWith('space')
    if (pickerFilter === 'videos') return f.url.includes('/video/') || f.category === 'video'
    return true
  })

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-[#0d0f12]">
      {/* SIDEBAR */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#20232b] bg-[#121419]">
        <div className="flex items-center gap-3 border-b border-[#20232b] p-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#c2a06a] font-serif text-lg font-bold text-black">
            AM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-sm font-bold text-white">AM Estate</span>
            <span className="text-[10px] uppercase tracking-wider text-[#c2a06a]">CMS Dashboard</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'overview'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <LayoutDashboard className="size-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'projects'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <Building2 className="size-4" />
            <span>High-Rise Projects</span>
            <span className="ml-auto rounded-full bg-[#20232b] px-2 py-0.5 text-[10px] text-[#c2a06a]">
              {data.projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('real-estate')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'real-estate'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <Home className="size-4" />
            <span>Homes &amp; Plots</span>
          </button>

          <button
            onClick={() => setActiveTab('spaces')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'spaces'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <Sparkles className="size-4" />
            <span>Curated Spaces</span>
            <span className="ml-auto rounded-full bg-[#20232b] px-2 py-0.5 text-[10px] text-[#c2a06a]">
              {data.spaces.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'media'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <ImageIcon className="size-4" />
            <span>Media &amp; Photos</span>
            <span className="ml-auto rounded-full bg-[#20232b] px-2 py-0.5 text-[10px] text-[#a0a5b1]">
              {mediaFiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'company'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <Building2 className="size-4" />
            <span>Company &amp; Contact</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'hero'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <Sparkles className="size-4" />
            <span>Hero &amp; Marquee</span>
          </button>

          <button
            onClick={() => setActiveTab('construction')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'construction'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <Hammer className="size-4" />
            <span>Construction</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'stats'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Stats Counters</span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'testimonials'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <MessageSquareQuote className="size-4" />
            <span>Testimonials</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition ${
              activeTab === 'settings'
                ? 'bg-[#c2a06a] text-black shadow-md'
                : 'text-[#9ea3af] hover:bg-[#1a1d24] hover:text-white'
            }`}
          >
            <Settings className="size-4" />
            <span>Password &amp; Backup</span>
          </button>
        </nav>

        <div className="border-t border-[#20232b] p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#20232b] bg-[#121419]/90 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a5b1]">
              Local Server Active — PC Backend Mode
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-xl border border-[#2a2e37] bg-[#171a21] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#20242e]"
            >
              <ExternalLink className="size-3.5" />
              Visit Website
            </Link>

            <button
              onClick={() => handleSaveAll()}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#c2a06a] px-5 py-2 text-xs font-bold text-black shadow-lg shadow-[#c2a06a]/20 transition hover:bg-[#d8b57d] disabled:opacity-50"
            >
              {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save All Changes
            </button>
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {notice && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl transition-all ${
              notice.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
                : 'border-red-500/30 bg-red-950/90 text-red-200'
            }`}
          >
            {notice.type === 'success' ? <Check className="size-5" /> : <AlertCircle className="size-5" />}
            <span className="text-sm font-medium">{notice.message}</span>
            <button onClick={() => setNotice(null)} className="ml-2 opacity-60 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* TAB CONTENTS */}
        <main className="p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white">AM Estate CMS Overview</h2>
                <p className="mt-1 text-sm text-[#8c92a0]">
                  Aapke PC py chalne wala complete backend management system. Har cheez yahan se add, edit ya delete
                  ho sakti hai.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-5">
                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8c92a0]">
                      High-Rise Projects
                    </span>
                    <Building2 className="size-5 text-[#c2a06a]" />
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-white">{data.projects.length}</p>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="mt-3 text-xs font-semibold text-[#c2a06a] hover:underline"
                  >
                    Manage Projects &rarr;
                  </button>
                </div>

                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8c92a0]">
                      Real Estate Sectors
                    </span>
                    <Home className="size-5 text-[#c2a06a]" />
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-white">{data.propertyCategories.length}</p>
                  <button
                    onClick={() => setActiveTab('real-estate')}
                    className="mt-3 text-xs font-semibold text-[#c2a06a] hover:underline"
                  >
                    Manage Homes &amp; Plots &rarr;
                  </button>
                </div>

                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8c92a0]">Curated Spaces</span>
                    <Sparkles className="size-5 text-[#c2a06a]" />
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-white">{data.spaces.length}</p>
                  <button
                    onClick={() => setActiveTab('spaces')}
                    className="mt-3 text-xs font-semibold text-[#c2a06a] hover:underline"
                  >
                    Manage Rooms &rarr;
                  </button>
                </div>

                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8c92a0]">Total Media</span>
                    <ImageIcon className="size-5 text-[#c2a06a]" />
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-white">{mediaFiles.length}</p>
                  <button
                    onClick={() => setActiveTab('media')}
                    className="mt-3 text-xs font-semibold text-[#c2a06a] hover:underline"
                  >
                    Photo Library &rarr;
                  </button>
                </div>
              </div>

              {/* Quick instructions in Urdu */}
              <div className="rounded-3xl border border-[#c2a06a]/20 bg-[#1a1813] p-6">
                <h3 className="font-serif text-lg font-bold text-[#c2a06a]">Photos &amp; Content Kaisay Lagani Hain:</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#d4cfc5]">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#c2a06a]">1. Projects:</span>
                    <span>
                      <b>High-Rise Projects</b> tab mein jayen. Har project ke neechay <b>Change Thumbnail</b> ka button
                      hai, jis se aap library se photo select kar saktay hain ya apne PC se nayi photo laga saktay hain.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#c2a06a]">2. Homes &amp; Plots:</span>
                    <span>
                      <b>Homes &amp; Plots</b> tab mein har category ka cover banner select ya change karne ka button
                      mojood hai.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#c2a06a]">3. Curated Spaces (Rooms):</span>
                    <span>
                      <b>Curated Spaces</b> tab mein har room (Living room, Bedroom, Kitchen, Cinema) ka Main Cover photo
                      aur uski pore Gallery ke photos add/remove karne ke visual buttons diye gaye hain.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#c2a06a]">4. Media Tab se 1-Click Assignment:</span>
                    <span>
                      <b>Media &amp; Photos</b> tab mein kisi bhi photo ke neechay <b>"Assign Photo To..."</b> dropdown
                      dabayein aur foran project ya room chun lein!
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: HIGH-RISE PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">High-Rise Projects Manager</h2>
                  <p className="text-sm text-[#8c92a0]">
                    The Oasis Grand 15, Grand 14, Grand 11, Grand X, 18 Park Residence etc. Har project ki thumbnail photo
                    yahan se direct change karein.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject({
                      id: `project-${Date.now()}`,
                      title: 'New High-Rise Project',
                      tagline: 'Luxury Apartments & Commercial Shops',
                      category: 'Commercial & Residential',
                      location: 'Bahria Town Lahore',
                      stories: '10 Stories',
                      area: '100,000 Sq. Ft.',
                      possession: '2 Years',
                      status: 'Booking Open',
                      rentalYield: 'Up to 0.5% monthly ROI',
                      features: ['Modern Elevators', '24/7 Security', 'Wide Corridors'],
                      image: '/images/project-grand-15.jpg',
                      imageAlt: 'Project exterior view',
                    })
                    setIsNewProject(true)
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[#c2a06a] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#d8b57d]"
                >
                  <Plus className="size-4" />
                  Add New Project
                </button>
              </div>

              {/* PROJECT CARDS GRID */}
              <div className="grid grid-cols-2 gap-5">
                {data.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#232731] bg-[#16181f] p-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <span className="rounded-full bg-[#20232b] px-2.5 py-0.5 text-[10px] font-semibold text-[#c2a06a]">
                            {proj.status}
                          </span>
                          <h3 className="mt-2 truncate font-serif text-xl font-bold text-white">{proj.title}</h3>
                          <p className="text-xs text-[#8c92a0]">{proj.location}</p>
                        </div>

                        {/* PROJECT THUMBNAIL WITH DIRECT CHANGE BUTTON */}
                        <div className="group relative size-24 shrink-0 overflow-hidden rounded-xl border border-[#2a2e37] bg-black">
                          <Image src={proj.image} alt={proj.title} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setPickerTarget({ type: 'project-cover', projectIndex: idx })}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 p-1 text-center opacity-0 transition group-hover:opacity-100"
                          >
                            <ImageIcon className="size-4 text-[#c2a06a]" />
                            <span className="mt-0.5 text-[9px] font-bold text-white">Change Picture</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-[#8c92a0]">
                        <span>Photo URL: <code className="text-[#c2a06a]">{proj.image}</code></span>
                        <button
                          type="button"
                          onClick={() => setPickerTarget({ type: 'project-cover', projectIndex: idx })}
                          className="flex items-center gap-1 rounded-md bg-[#20232b] px-2 py-0.5 text-[10px] text-[#c2a06a] hover:bg-[#2a2e37]"
                        >
                          <FolderOpen className="size-3" />
                          Choose Photo
                        </button>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-[#a0a5b1]">{proj.tagline}</p>

                      <div className="mt-3 grid grid-cols-3 gap-2 border-y border-[#20232b] py-2 text-[11px]">
                        <div>
                          <span className="text-[#686e7c]">Stories:</span>
                          <p className="font-semibold text-white">{proj.stories}</p>
                        </div>
                        <div>
                          <span className="text-[#686e7c]">Area:</span>
                          <p className="font-semibold text-white">{proj.area}</p>
                        </div>
                        <div>
                          <span className="text-[#686e7c]">Possession:</span>
                          <p className="font-semibold text-white">{proj.possession}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {proj.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="rounded-md bg-[#0d0f12] px-2 py-0.5 text-[10px] text-[#8c92a0]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#20232b] pt-3">
                      <button
                        onClick={() => {
                          setEditingProject({ ...proj })
                          setIsNewProject(false)
                        }}
                        className="flex items-center gap-1 rounded-lg border border-[#2a2e37] bg-[#111317] px-3 py-1.5 text-xs text-white hover:bg-[#1a1d24]"
                      >
                        <Edit3 className="size-3.5" />
                        Edit Details
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Kya aap "${proj.title}" ko delete karna chahtay hain?`)) {
                            const updated = data.projects.filter((p) => p.id !== proj.id)
                            setData({ ...data, projects: updated })
                            showNotice(`Project "${proj.title}" delete ho gaya!`)
                          }
                        }}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROJECT EDIT / ADD MODAL */}
              {editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                  <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#2c3038] bg-[#16181d] p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#20232b] pb-4">
                      <h3 className="font-serif text-xl font-bold text-white">
                        {isNewProject ? 'Add New High-Rise Project' : `Edit: ${editingProject.title}`}
                      </h3>
                      <button onClick={() => setEditingProject(null)} className="text-[#8c92a0] hover:text-white">
                        <X className="size-5" />
                      </button>
                    </div>

                    <div className="mt-5 space-y-4 text-sm">
                      {/* PICTURE SELECTOR IN MODAL */}
                      <div className="rounded-2xl border border-[#2a2e37] bg-[#0d0f12] p-4">
                        <label className="text-xs font-semibold text-[#c2a06a]">Project Thumbnail / Cover Photo</label>
                        <div className="mt-3 flex items-center gap-4">
                          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#2c3038]">
                            <Image src={editingProject.image} alt={editingProject.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editingProject.image}
                              onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                              className="w-full rounded-xl border border-[#2a2e37] bg-[#16181f] px-3 py-1.5 text-xs text-white"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setPickerTarget({ type: 'modal-project-cover' })}
                                className="flex items-center gap-1 rounded-lg bg-[#20232b] px-3 py-1 text-xs text-[#c2a06a] hover:bg-[#2a2e37]"
                              >
                                <FolderOpen className="size-3" />
                                Choose From Media Library
                              </button>
                              <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#c2a06a] px-3 py-1 text-xs font-bold text-black hover:bg-[#d8b57d]">
                                <UploadCloud className="size-3" />
                                Upload Direct From PC
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    const url = await handleDirectUpload(file, 'images')
                                    if (url) {
                                      setEditingProject({ ...editingProject, image: url })
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Project ID (URL slug)</label>
                          <input
                            type="text"
                            value={editingProject.id}
                            disabled={!isNewProject}
                            onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Project Title</label>
                          <input
                            type="text"
                            value={editingProject.title}
                            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Category</label>
                          <input
                            type="text"
                            value={editingProject.category}
                            onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Status Badge</label>
                          <input
                            type="text"
                            value={editingProject.status}
                            placeholder="e.g. Booking Open / Ready Soon"
                            onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Location</label>
                          <input
                            type="text"
                            value={editingProject.location}
                            onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Rental Yield / Price Tag</label>
                          <input
                            type="text"
                            value={editingProject.rentalYield}
                            onChange={(e) => setEditingProject({ ...editingProject, rentalYield: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Stories / Scale</label>
                          <input
                            type="text"
                            value={editingProject.stories}
                            onChange={(e) => setEditingProject({ ...editingProject, stories: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Total Area</label>
                          <input
                            type="text"
                            value={editingProject.area}
                            onChange={(e) => setEditingProject({ ...editingProject, area: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-[#8c92a0]">Possession Timeline</label>
                          <input
                            type="text"
                            value={editingProject.possession}
                            onChange={(e) => setEditingProject({ ...editingProject, possession: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Tagline / Subtitle</label>
                        <input
                          type="text"
                          value={editingProject.tagline}
                          onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Key Features (1 per line)</label>
                        <textarea
                          rows={3}
                          value={editingProject.features.join('\n')}
                          onChange={(e) =>
                            setEditingProject({
                              ...editingProject,
                              features: e.target.value.split('\n').filter(Boolean),
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="rounded-xl border border-[#2a2e37] px-4 py-2 text-xs font-semibold text-[#8c92a0] hover:text-white"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            let updatedProjects = [...data.projects]
                            if (isNewProject) {
                              updatedProjects.push(editingProject)
                            } else {
                              updatedProjects = updatedProjects.map((p) =>
                                p.id === editingProject.id ? editingProject : p
                              )
                            }
                            setData({ ...data, projects: updatedProjects })
                            setEditingProject(null)
                            showNotice(`Project "${editingProject.title}" update ho gaya!`)
                          }}
                          className="rounded-xl bg-[#c2a06a] px-5 py-2 text-xs font-bold text-black hover:bg-[#d8b57d]"
                        >
                          Confirm &amp; Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REAL ESTATE (HOMES, PLOTS, HIGH-RISE) */}
          {activeTab === 'real-estate' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Homes &amp; Plots Inventory Manager</h2>
                <p className="text-sm text-[#8c92a0]">
                  Gharon aur plots ke sizes, rooms detail, aur cover banner picture yahan se customize karein.
                </p>
              </div>

              <div className="space-y-6">
                {data.propertyCategories.map((cat, catIdx) => (
                  <div key={cat.slug} className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#20232b] pb-3">
                      <div className="flex items-center gap-4">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[#2c3038] bg-black">
                          <Image src={cat.image} alt={cat.title} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c2a06a]">
                            Category: {cat.eyebrow}
                          </span>
                          <h3 className="font-serif text-xl font-bold text-white">{cat.title}</h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-[#8c92a0]">Banner: <code className="text-[#c2a06a]">{cat.image}</code></span>
                            <button
                              type="button"
                              onClick={() => setPickerTarget({ type: 'category-cover', categoryIndex: catIdx })}
                              className="rounded bg-[#20232b] px-2 py-0.5 text-[10px] font-semibold text-[#c2a06a] hover:bg-[#2a2e37]"
                            >
                              Change Banner Photo
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newOpt: PropertyOption = {
                            label: 'New Size / Option',
                            detail: 'Description yahan likhein',
                            accommodation: ['2 Bedrooms', 'Attached Bathroom', '1 Kitchen'],
                          }
                          const updated = [...data.propertyCategories]
                          updated[catIdx].options.push(newOpt)
                          setData({ ...data, propertyCategories: updated })
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-[#c2a06a] px-3.5 py-1.5 text-xs font-bold text-black"
                      >
                        <Plus className="size-3.5" />
                        Add New Option / Size
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Summary Text</label>
                        <textarea
                          rows={2}
                          value={cat.summary}
                          onChange={(e) => {
                            const updated = [...data.propertyCategories]
                            updated[catIdx].summary = e.target.value
                            setData({ ...data, propertyCategories: updated })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Intro Paragraph</label>
                        <textarea
                          rows={2}
                          value={cat.intro}
                          onChange={(e) => {
                            const updated = [...data.propertyCategories]
                            updated[catIdx].intro = e.target.value
                            setData({ ...data, propertyCategories: updated })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* OPTIONS & SIZES LIST */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#c2a06a]">
                        Options &amp; Inventory Sizes ({cat.options.length}):
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        {cat.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="rounded-xl border border-[#20232b] bg-[#0d0f12] p-4 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const updated = [...data.propertyCategories]
                                  updated[catIdx].options[optIdx].label = e.target.value
                                  setData({ ...data, propertyCategories: updated })
                                }}
                                className="font-serif text-sm font-bold text-[#c2a06a] bg-transparent focus:outline-none"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...data.propertyCategories]
                                  updated[catIdx].options = updated[catIdx].options.filter((_, i) => i !== optIdx)
                                  setData({ ...data, propertyCategories: updated })
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={opt.detail}
                              onChange={(e) => {
                                const updated = [...data.propertyCategories]
                                updated[catIdx].options[optIdx].detail = e.target.value
                                setData({ ...data, propertyCategories: updated })
                              }}
                              className="w-full rounded-lg border border-[#232731] bg-[#16181f] px-2.5 py-1 text-white"
                            />

                            {opt.accommodation && (
                              <div>
                                <span className="text-[10px] text-[#686e7c]">Standard Accommodation (1 per line):</span>
                                <textarea
                                  rows={3}
                                  value={opt.accommodation.join('\n')}
                                  onChange={(e) => {
                                    const updated = [...data.propertyCategories]
                                    updated[catIdx].options[optIdx].accommodation = e.target.value
                                      .split('\n')
                                      .filter(Boolean)
                                    setData({ ...data, propertyCategories: updated })
                                  }}
                                  className="mt-1 w-full rounded-lg border border-[#232731] bg-[#16181f] px-2.5 py-1 text-white text-[11px]"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CURATED SPACES (ROOMS & GALLERIES) */}
          {activeTab === 'spaces' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Curated Spaces &amp; Room Photos</h2>
                <p className="text-sm text-[#8c92a0]">
                  Living Room, Bedroom, Kitchen, Cinema, Library etc. Har room ka main cover photo aur uski photo gallery
                  yahan se manage karein.
                </p>
              </div>

              {/* HOUSE TOUR VIDEO SECTION CARD */}
              <div className="rounded-2xl border border-[#c2a06a]/40 bg-[#16181f] p-6 space-y-4">
                <div className="flex items-start justify-between border-b border-[#20232b] pb-4">
                  <div>
                    <span className="rounded-full bg-[#c2a06a]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c2a06a]">
                      Featured Video Walkthrough
                    </span>
                    <h3 className="mt-1 font-serif text-xl font-bold text-white">
                      House Tour Video ("Rooms designed around how you live" section)
                    </h3>
                    <p className="text-xs text-[#8c92a0]">
                      Website par rooms ke neechay aane wali walkthrough video, uska cover picture aur title yahan se change karein.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* VIDEO SOURCE & PREVIEW */}
                  <div className="rounded-xl border border-[#20232b] bg-[#0d0f12] p-4 space-y-3">
                    <span className="text-xs font-bold text-[#c2a06a]">1. Video File &amp; Preview:</span>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#2a2e37] bg-black">
                      <video
                        src={data.houseTour?.videoUrl || '/video/house-tour.mp4'}
                        poster={data.houseTour?.posterUrl || '/frames/frame_119.webp'}
                        controls
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[#8c92a0]">Current Video URL / File:</span>
                      <input
                        type="text"
                        value={data.houseTour?.videoUrl || '/video/house-tour.mp4'}
                        onChange={(e) =>
                          setData({
                            ...data,
                            houseTour: {
                              ...(data.houseTour || {
                                title: 'Watch house tour',
                                subtitle: 'Walkthrough of our signature completed luxury house',
                                posterUrl: '/frames/frame_119.webp',
                                videoUrl: '',
                              }),
                              videoUrl: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[#2a2e37] bg-[#16181f] px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPickerFilter('videos')
                          setPickerTarget({ type: 'house-tour-video' })
                        }}
                        className="flex items-center gap-1 rounded-lg bg-[#20232b] px-3 py-1.5 text-xs font-semibold text-[#c2a06a] hover:bg-[#2a2e37]"
                      >
                        <FolderOpen className="size-3.5" />
                        Choose Video From Library
                      </button>

                      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#c2a06a] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#d8b57d]">
                        <UploadCloud className="size-3.5" />
                        Upload Video From PC (.mp4, .webm)
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const url = await handleDirectUpload(file, 'video' as any)
                            if (url) {
                              setData({
                                ...data,
                                houseTour: {
                                  ...(data.houseTour || {
                                    title: 'Watch house tour',
                                    subtitle: 'Walkthrough of our signature completed luxury house',
                                    posterUrl: '/frames/frame_119.webp',
                                    videoUrl: '',
                                  }),
                                  videoUrl: url,
                                },
                              })
                              showNotice('Nayi video upload ho kar section mein lag gai!')
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* VIDEO POSTER & TEXTS */}
                  <div className="rounded-xl border border-[#20232b] bg-[#0d0f12] p-4 space-y-3">
                    <span className="text-xs font-bold text-[#c2a06a]">2. Video Poster (Thumbnail) &amp; Titles:</span>
                    
                    <div className="flex items-center gap-4">
                      <div className="relative aspect-[16/9] w-36 shrink-0 overflow-hidden rounded-xl border border-[#2c3038] bg-black">
                        <Image
                          src={data.houseTour?.posterUrl || '/frames/frame_119.webp'}
                          alt="Video Poster"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPickerFilter('all')
                            setPickerTarget({ type: 'house-tour-poster' })
                          }}
                          className="flex items-center gap-1 rounded-lg bg-[#20232b] px-3 py-1 text-xs text-[#c2a06a] hover:bg-[#2a2e37]"
                        >
                          <FolderOpen className="size-3" />
                          Choose Poster From Library
                        </button>

                        <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#c2a06a] px-3 py-1 text-xs font-bold text-black hover:bg-[#d8b57d]">
                          <UploadCloud className="size-3" />
                          Upload Poster Photo From PC
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const url = await handleDirectUpload(file, 'images')
                              if (url) {
                                setData({
                                  ...data,
                                  houseTour: {
                                    ...(data.houseTour || {
                                      title: 'Watch house tour',
                                      subtitle: 'Walkthrough of our signature completed luxury house',
                                      videoUrl: '/video/house-tour.mp4',
                                      posterUrl: '',
                                    }),
                                    posterUrl: url,
                                  },
                                })
                                showNotice('Video poster image update ho gaya!')
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#8c92a0]">Button Label / Title</label>
                      <input
                        type="text"
                        value={data.houseTour?.title || 'Watch house tour'}
                        onChange={(e) =>
                          setData({
                            ...data,
                            houseTour: {
                              ...(data.houseTour || {
                                subtitle: 'Walkthrough of our signature completed luxury house',
                                videoUrl: '/video/house-tour.mp4',
                                posterUrl: '/frames/frame_119.webp',
                                title: '',
                              }),
                              title: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[#2a2e37] bg-[#16181f] px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#8c92a0]">Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={data.houseTour?.subtitle || 'Walkthrough of our signature completed luxury house in Bahria Town Lahore'}
                        onChange={(e) =>
                          setData({
                            ...data,
                            houseTour: {
                              ...(data.houseTour || {
                                title: 'Watch house tour',
                                videoUrl: '/video/house-tour.mp4',
                                posterUrl: '/frames/frame_119.webp',
                                subtitle: '',
                              }),
                              subtitle: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[#2a2e37] bg-[#16181f] px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {data.spaces.map((spc, spcIdx) => (
                  <div key={spc.slug} className="rounded-2xl border border-[#232731] bg-[#16181f] p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-md bg-[#0d0f12] px-2 py-0.5 text-[10px] text-[#c2a06a]">
                          /{spc.slug}
                        </span>
                        <h3 className="mt-1 font-serif text-lg font-bold text-white">{spc.title}</h3>
                      </div>

                      {/* COVER PHOTO DISPLAY */}
                      <div className="group relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#2c3038] bg-black">
                        {spc.image ? (
                          <Image src={spc.image} alt={spc.title} fill className="object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] text-[#686e7c]">
                            No Cover
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setPickerTarget({ type: 'space-cover', spaceIndex: spcIdx })}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 p-1 text-center opacity-0 transition group-hover:opacity-100"
                        >
                          <ImageIcon className="size-4 text-[#c2a06a]" />
                          <span className="mt-0.5 text-[9px] font-bold text-white">Change Cover</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8c92a0]">
                      <span className="truncate">Cover: <code className="text-[#c2a06a]">{spc.image || 'None'}</code></span>
                      <button
                        type="button"
                        onClick={() => setPickerTarget({ type: 'space-cover', spaceIndex: spcIdx })}
                        className="shrink-0 rounded bg-[#20232b] px-2 py-0.5 text-[10px] text-[#c2a06a] hover:bg-[#2a2e37]"
                      >
                        Set Cover
                      </button>
                    </div>

                    {/* ROOM GALLERY PHOTOS */}
                    <div className="rounded-xl border border-[#20232b] bg-[#0d0f12] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#c2a06a]">
                          Room Gallery Photos ({spc.photos?.length || 0}):
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPickerTarget({ type: 'space-gallery-add', spaceIndex: spcIdx })}
                            className="flex items-center gap-1 rounded bg-[#20232b] px-2 py-0.5 text-[10px] text-[#c2a06a] hover:bg-[#2a2e37]"
                          >
                            <Plus className="size-3" />
                            From Library
                          </button>
                          <label className="flex cursor-pointer items-center gap-1 rounded bg-[#c2a06a] px-2 py-0.5 text-[10px] font-bold text-black hover:bg-[#d8b57d]">
                            <UploadCloud className="size-3" />
                            Upload PC
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const url = await handleDirectUpload(file, 'spaces', spc.slug)
                                if (url) {
                                  const spaces = [...data.spaces]
                                  const photos = spaces[spcIdx].photos || []
                                  photos.push({ src: url, alt: `${spc.title} photo` })
                                  spaces[spcIdx].photos = photos
                                  setData({ ...data, spaces })
                                  showNotice(`Photo ${spc.title} mein upload ho gai!`)
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* GALLERY GRID */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {spc.photos && spc.photos.length > 0 ? (
                          spc.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              className="group relative size-14 overflow-hidden rounded-lg border border-[#2a2e37] bg-black"
                            >
                              <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const spaces = [...data.spaces]
                                  spaces[spcIdx].photos = spaces[spcIdx].photos.filter((_, i) => i !== pIdx)
                                  setData({ ...data, spaces })
                                }}
                                className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-400 opacity-0 transition group-hover:opacity-100"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-[#686e7c]">No gallery photos yet. Click buttons above to add.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#8c92a0]">Subtitle</label>
                      <input
                        type="text"
                        value={spc.subtitle}
                        onChange={(e) => {
                          const updated = [...data.spaces]
                          updated[spcIdx].subtitle = e.target.value
                          setData({ ...data, spaces: updated })
                        }}
                        className="mt-1 w-full rounded-lg border border-[#2a2e37] bg-[#0d0f12] px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#8c92a0]">Intro</label>
                      <textarea
                        rows={2}
                        value={spc.intro}
                        onChange={(e) => {
                          const updated = [...data.spaces]
                          updated[spcIdx].intro = e.target.value
                          setData({ ...data, spaces: updated })
                        }}
                        className="mt-1 w-full rounded-lg border border-[#2a2e37] bg-[#0d0f12] px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MEDIA & PHOTOS UPLOADER */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Media Library &amp; Photo Placements</h2>
                <p className="text-sm text-[#8c92a0]">
                  Apne computer (PC) se nayi photos upload karein aur 1-click se kisi bhi Project, Room ya Category ke
                  thumbnail par lagayein.
                </p>
              </div>

              {/* UPLOAD BOX */}
              <div className="rounded-3xl border border-dashed border-[#c2a06a]/40 bg-[#16181f] p-8 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#c2a06a]/10 text-[#c2a06a]">
                  <UploadCloud className="size-7" />
                </div>
                <h3 className="mt-3 font-serif text-lg font-bold text-white">Upload New Photo From Your PC</h3>
                <p className="mt-1 text-xs text-[#8c92a0]">JPG, PNG, WebP files are supported.</p>

                <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-3">
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value as 'images' | 'spaces')}
                    className="rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-xs text-white"
                  >
                    <option value="images">General / Project Photos (/images)</option>
                    <option value="spaces">Curated Space Room Photo (/images/spaces/...)</option>
                  </select>

                  {uploadFolder === 'spaces' && (
                    <select
                      value={selectedSpaceSlug}
                      onChange={(e) => setSelectedSpaceSlug(e.target.value)}
                      className="rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-xs text-white"
                    >
                      {data.spaces.map((sp) => (
                        <option key={sp.slug} value={sp.slug}>
                          {sp.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mt-5">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#c2a06a] px-6 py-2.5 text-xs font-bold text-black transition hover:bg-[#d8b57d]">
                    {uploading ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-4" />
                        Choose File From Computer
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        await handleDirectUpload(file, uploadFolder, selectedSpaceSlug)
                        e.target.value = ''
                      }}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* MEDIA GALLERY GRID WITH ASSIGN DROPDOWN */}
              <div>
                <h3 className="mb-4 font-serif text-lg font-bold text-white">
                  Available Media Files ({mediaFiles.length})
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.url}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#232731] bg-[#16181f]"
                    >
                      <div className="relative aspect-[4/3] w-full bg-[#0d0f12]">
                        {/\.(mp4|webm|mov|mkv)$/i.test(file.url) ? (
                          <video src={file.url} className="size-full object-cover" muted preload="metadata" />
                        ) : (
                          <Image src={file.url} alt={file.name} fill className="object-cover" />
                        )}
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-0.5 text-[9px] text-[#c2a06a] backdrop-blur-sm">
                          {file.category}
                        </span>
                      </div>

                      <div className="p-3">
                        <p className="truncate text-xs font-semibold text-white">{file.name}</p>
                        <p className="truncate text-[10px] text-[#8c92a0]">{file.url}</p>

                        {/* ASSIGN DROPDOWN ACTION */}
                        <div className="mt-2.5">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignMediaTo(file.url, e.target.value)
                                e.target.value = ''
                              }
                            }}
                            defaultValue=""
                            className="w-full rounded-lg border border-[#2a2e37] bg-[#0d0f12] px-2 py-1 text-[11px] text-[#c2a06a] focus:outline-none"
                          >
                            <option value="" disabled>
                              + Assign Picture To...
                            </option>
                            <optgroup label="High-Rise Projects">
                              {data.projects.map((p) => (
                                <option key={p.id} value={`project:${p.id}`}>
                                  {p.title} Thumbnail
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Real Estate Categories">
                              {data.propertyCategories.map((c) => (
                                <option key={c.slug} value={`category:${c.slug}`}>
                                  {c.title} Cover
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Rooms (Cover Photo)">
                              {data.spaces.map((s) => (
                                <option key={s.slug} value={`space-cover:${s.slug}`}>
                                  {s.title} Cover
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Rooms (Add to Gallery)">
                              {data.spaces.map((s) => (
                                <option key={s.slug} value={`space-gallery:${s.slug}`}>
                                  {s.title} Gallery
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="House Tour Video Section">
                              <option value="house-tour-poster">House Tour Poster Image</option>
                              <option value="house-tour-video">House Tour Video Source</option>
                            </optgroup>
                          </select>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-[#20232b] pt-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(file.url)}
                            className="flex items-center gap-1 text-[11px] text-[#c2a06a] hover:underline"
                          >
                            {copiedUrl === file.url ? <Check className="size-3" /> : <Copy className="size-3" />}
                            {copiedUrl === file.url ? 'Copied' : 'Copy URL'}
                          </button>

                          {!file.url.includes('am-logo') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(file.url)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete photo"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMPANY & CONTACT */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Company &amp; Contact Details</h2>
                <p className="text-sm text-[#8c92a0]">
                  Phone numbers, WhatsApp number, office address aur timings yahan se edit karein.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                  <h3 className="font-serif text-base font-semibold text-white">Basic Info</h3>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">Company Name</label>
                    <input
                      type="text"
                      value={data.company.name}
                      onChange={(e) =>
                        setData({ ...data, company: { ...data.company, name: e.target.value } })
                      }
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">Slogan</label>
                    <input
                      type="text"
                      value={data.company.slogan}
                      onChange={(e) =>
                        setData({ ...data, company: { ...data.company, slogan: e.target.value } })
                      }
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">Tagline</label>
                    <input
                      type="text"
                      value={data.company.tagline}
                      onChange={(e) =>
                        setData({ ...data, company: { ...data.company, tagline: e.target.value } })
                      }
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">Email Address</label>
                    <input
                      type="email"
                      value={data.company.email}
                      onChange={(e) =>
                        setData({ ...data, company: { ...data.company, email: e.target.value } })
                      }
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                  <h3 className="font-serif text-base font-semibold text-white">Phone &amp; WhatsApp</h3>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">WhatsApp Number (e.g. 923210008880)</label>
                    <input
                      type="text"
                      value={data.company.whatsappNumber}
                      onChange={(e) =>
                        setData({ ...data, company: { ...data.company, whatsappNumber: e.target.value } })
                      }
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">WhatsApp Chat Link URL</label>
                    <input
                      type="text"
                      value={data.company.whatsappUrl}
                      onChange={(e) =>
                        setData({ ...data, company: { ...data.company, whatsappUrl: e.target.value } })
                      }
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#8c92a0]">Phone Numbers</label>
                      <button
                        type="button"
                        onClick={() => {
                          const phones = [...data.company.phones, { label: '0300-0000000', href: 'tel:+923000000000' }]
                          setData({ ...data, company: { ...data.company, phones } })
                        }}
                        className="text-xs font-semibold text-[#c2a06a] hover:underline"
                      >
                        + Add Phone
                      </button>
                    </div>

                    <div className="mt-2 space-y-2">
                      {data.company.phones.map((phone, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={phone.label}
                            onChange={(e) => {
                              const phones = [...data.company.phones]
                              phones[idx].label = e.target.value
                              phones[idx].href = `tel:+92${e.target.value.replace(/[^0-9]/g, '').slice(-10)}`
                              setData({ ...data, company: { ...data.company, phones } })
                            }}
                            className="flex-1 rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-sm text-white"
                          />
                          {data.company.phones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const phones = data.company.phones.filter((_, i) => i !== idx)
                                setData({ ...data, company: { ...data.company, phones } })
                              }}
                              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                  <h3 className="font-serif text-base font-semibold text-white">Office Address &amp; Map</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#8c92a0]">Physical Address</label>
                      <textarea
                        rows={3}
                        value={data.company.address}
                        onChange={(e) =>
                          setData({ ...data, company: { ...data.company, address: e.target.value } })
                        }
                        className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8c92a0]">Office Timings (Lines)</label>
                      <textarea
                        rows={3}
                        value={data.company.timings.join('\n')}
                        onChange={(e) =>
                          setData({
                            ...data,
                            company: { ...data.company, timings: e.target.value.split('\n').filter(Boolean) },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">Google Maps Embed URL</label>
                    <input
                      type="text"
                      value={data.company.mapEmbedUrl}
                      onChange={(e) =>
                        setData({ ...data, company: { ...data.company, mapEmbedUrl: e.target.value } })
                      }
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                {/* SOCIAL MEDIA LINKS */}
                <div className="col-span-2 rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                  <h3 className="font-serif text-base font-semibold text-white">Social Media Profile Links</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {data.socials.map((social, idx) => (
                      <div key={social.name}>
                        <label className="text-xs font-semibold text-[#8c92a0]">{social.name} URL</label>
                        <input
                          type="text"
                          value={social.href}
                          placeholder={`https://${social.name.toLowerCase()}.com/amestate`}
                          onChange={(e) => {
                            const socials = [...data.socials]
                            socials[idx].href = e.target.value
                            setData({ ...data, socials })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HERO & MARQUEE */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Hero Section &amp; Marquee Ribbon</h2>
                <p className="text-sm text-[#8c92a0]">
                  Website ke pehle screen (video scrub) ke 4 stages ka text aur running text ribbon edit karein.
                </p>
              </div>

              <div className="space-y-4">
                {data.heroStages.map((stage, idx) => (
                  <div key={idx} className="rounded-2xl border border-[#232731] bg-[#16181f] p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#c2a06a]">
                      Stage 0{idx + 1}
                    </span>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Eyebrow (Chota Tag)</label>
                        <input
                          type="text"
                          value={stage.eyebrow}
                          onChange={(e) => {
                            const heroStages = [...data.heroStages]
                            heroStages[idx].eyebrow = e.target.value
                            setData({ ...data, heroStages })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Heading / Title</label>
                        <input
                          type="text"
                          value={stage.title}
                          onChange={(e) => {
                            const heroStages = [...data.heroStages]
                            heroStages[idx].title = e.target.value
                            setData({ ...data, heroStages })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-[#8c92a0]">Body Description</label>
                        <textarea
                          rows={2}
                          value={stage.body}
                          onChange={(e) => {
                            const heroStages = [...data.heroStages]
                            heroStages[idx].body = e.target.value
                            setData({ ...data, heroStages })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2 text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-white">Marquee Ribbon Words</h3>
                    <p className="text-xs text-[#8c92a0]">Website par chalti hui strip ke alfaz.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const words = [...data.marqueeWords, 'New Keyword']
                      setData({ ...data, marqueeWords: words })
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#c2a06a] px-3.5 py-1.5 text-xs font-bold text-black"
                  >
                    <Plus className="size-3.5" />
                    Add Word
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {data.marqueeWords.map((word, idx) => (
                    <div key={idx} className="flex items-center gap-1 rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-1.5">
                      <input
                        type="text"
                        value={word}
                        onChange={(e) => {
                          const words = [...data.marqueeWords]
                          words[idx] = e.target.value
                          setData({ ...data, marqueeWords: words })
                        }}
                        className="bg-transparent text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const words = data.marqueeWords.filter((_, i) => i !== idx)
                          setData({ ...data, marqueeWords: words })
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONSTRUCTION SERVICES */}
          {activeTab === 'construction' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Construction Services &amp; Build Process</h2>
                <p className="text-sm text-[#8c92a0]">
                  Turnkey Construction, Grey Structure, 3D Architectural Design, aur 6 Build Process Steps edit karein.
                </p>
              </div>

              <div className="space-y-4">
                {data.services.map((srv, srvIdx) => (
                  <div key={srv.slug} className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#20232b] pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl font-bold text-[#c2a06a]">{srv.number}</span>
                        <input
                          type="text"
                          value={srv.title}
                          onChange={(e) => {
                            const updated = [...data.services]
                            updated[srvIdx].title = e.target.value
                            setData({ ...data, services: updated })
                          }}
                          className="font-serif text-lg font-bold text-white bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8c92a0]">Summary</label>
                      <textarea
                        rows={2}
                        value={srv.summary}
                        onChange={(e) => {
                          const updated = [...data.services]
                          updated[srvIdx].summary = e.target.value
                          setData({ ...data, services: updated })
                        }}
                        className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#8c92a0]">Scope of Work Details (1 per line)</label>
                      <textarea
                        rows={4}
                        value={srv.details.join('\n')}
                        onChange={(e) => {
                          const updated = [...data.services]
                          updated[srvIdx].details = e.target.value.split('\n').filter(Boolean)
                          setData({ ...data, services: updated })
                        }}
                        className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3.5 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 6 BUILD STEPS */}
              <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-white">6-Step Construction Lifecycle</h3>
                <div className="grid grid-cols-2 gap-4">
                  {data.buildSteps.map((step, stepIdx) => (
                    <div key={stepIdx} className="rounded-xl border border-[#20232b] bg-[#0d0f12] p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#c2a06a]">Step 0{stepIdx + 1}</span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...data.buildSteps]
                            updated[stepIdx].title = e.target.value
                            setData({ ...data, buildSteps: updated })
                          }}
                          className="font-semibold text-white bg-transparent focus:outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={step.body}
                        onChange={(e) => {
                          const updated = [...data.buildSteps]
                          updated[stepIdx].body = e.target.value
                          setData({ ...data, buildSteps: updated })
                        }}
                        className="w-full rounded-lg border border-[#232731] bg-[#16181f] px-2.5 py-1 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: STATS COUNTERS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Company Statistics Counters</h2>
                <p className="text-sm text-[#8c92a0]">
                  Home page par aane walay 4 counters (Satisfied Customers, Units Sold, Market Projects, Monthly Yield).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {data.stats.map((st, idx) => (
                  <div key={idx} className="rounded-2xl border border-[#232731] bg-[#16181f] p-5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c2a06a]">
                      Counter 0{idx + 1}
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Value (Number)</label>
                        <input
                          type="number"
                          step="any"
                          value={st.value}
                          onChange={(e) => {
                            const updated = [...data.stats]
                            updated[idx].value = Number(e.target.value)
                            setData({ ...data, stats: updated })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#8c92a0]">Suffix (+ ya %)</label>
                        <input
                          type="text"
                          value={st.suffix}
                          onChange={(e) => {
                            const updated = [...data.stats]
                            updated[idx].suffix = e.target.value
                            setData({ ...data, stats: updated })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-sm text-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-[#8c92a0]">Title Label</label>
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => {
                            const updated = [...data.stats]
                            updated[idx].label = e.target.value
                            setData({ ...data, stats: updated })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-sm text-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-[#8c92a0]">Detail Description</label>
                        <input
                          type="text"
                          value={st.detail}
                          onChange={(e) => {
                            const updated = [...data.stats]
                            updated[idx].detail = e.target.value
                            setData({ ...data, stats: updated })
                          }}
                          className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">Client Testimonials &amp; Reviews</h2>
                  <p className="text-sm text-[#8c92a0]">
                    Clients ke feedback reviews yahan se add, edit ya delete karein.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = [
                      ...data.testimonials,
                      { name: 'Client Name', role: 'Home Buyer, Bahria Town', quote: 'Excellent service!' },
                    ]
                    setData({ ...data, testimonials: updated })
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c2a06a] px-3.5 py-2 text-xs font-bold text-black"
                >
                  <Plus className="size-4" />
                  Add Review
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {data.testimonials.map((test, idx) => (
                  <div key={idx} className="rounded-2xl border border-[#232731] bg-[#16181f] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) => {
                          const updated = [...data.testimonials]
                          updated[idx].name = e.target.value
                          setData({ ...data, testimonials: updated })
                        }}
                        className="font-serif text-base font-bold text-white bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.testimonials.filter((_, i) => i !== idx)
                          setData({ ...data, testimonials: updated })
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={test.role}
                      onChange={(e) => {
                        const updated = [...data.testimonials]
                        updated[idx].role = e.target.value
                        setData({ ...data, testimonials: updated })
                      }}
                      className="w-full rounded-lg border border-[#2a2e37] bg-[#0d0f12] px-3 py-1.5 text-xs text-[#c2a06a]"
                    />

                    <textarea
                      rows={3}
                      value={test.quote}
                      onChange={(e) => {
                        const updated = [...data.testimonials]
                        updated[idx].quote = e.target.value
                        setData({ ...data, testimonials: updated })
                      }}
                      className="w-full rounded-lg border border-[#2a2e37] bg-[#0d0f12] px-3 py-2 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & PASSWORD */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">Security &amp; Data Backup</h2>
                <p className="text-sm text-[#8c92a0]">
                  Admin password tabdeel karein aur pore website ka data backup download ya restore karein.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* CHANGE PASSWORD */}
                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#c2a06a]">
                    <KeyRound className="size-5" />
                    <h3 className="font-serif text-base font-bold text-white">Change Admin Password</h3>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8c92a0]">New Password</label>
                    <input
                      type="text"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="mt-1 w-full rounded-xl border border-[#2a2e37] bg-[#0d0f12] px-4 py-2.5 text-sm text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!newPasswordInput || newPasswordInput.length < 4) {
                        showNotice('Password kam az kam 4 characters ka hona chahiye', 'error')
                        return
                      }
                      try {
                        const res = await fetch('/api/admin/auth', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'change-password', newPassword: newPasswordInput }),
                        })
                        const json = await res.json()
                        if (json.success) {
                          showNotice('Password kamyabi se tabdeel ho gaya!')
                          setNewPasswordInput('')
                        } else {
                          showNotice(json.message || 'Error', 'error')
                        }
                      } catch {
                        showNotice('Password update nahi ho saka', 'error')
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-[#c2a06a] px-4 py-2 text-xs font-bold text-black hover:bg-[#d8b57d]"
                  >
                    <Check className="size-4" />
                    Update Password
                  </button>
                </div>

                {/* BACKUP & RESTORE */}
                <div className="rounded-2xl border border-[#232731] bg-[#16181f] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#c2a06a]">
                    <Save className="size-5" />
                    <h3 className="font-serif text-base font-bold text-white">JSON Data Backup &amp; Restore</h3>
                  </div>
                  <p className="text-xs text-[#8c92a0]">
                    Pori website ka saara data ek single JSON file mein download karein, ya pehle se download kiya hua
                    backup yahan upload kar ke restore karein.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `am-estate-data-backup-${new Date().toISOString().slice(0, 10)}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-[#2a2e37] bg-[#111317] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1a1d24]"
                    >
                      <Save className="size-4" />
                      Download Data Backup (.json)
                    </button>

                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#c2a06a] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#d8b57d]">
                      <UploadCloud className="size-4" />
                      Upload &amp; Restore JSON Backup
                      <input
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = async (evt) => {
                            try {
                              const parsed = JSON.parse(evt.target?.result as string) as SiteData
                              if (!parsed || !parsed.company || !parsed.projects) {
                                showNotice('Ghalat file format. Is file mein AM Estate ka data nahi hai.', 'error')
                                return
                              }
                              if (
                                confirm(
                                  `Backup verify ho gaya hai (${parsed.projects.length} Projects, ${parsed.propertyCategories.length} Categories).\n\nKya aap waqai is backup ko restore kar ke website live update karna chahtay hain?`
                                )
                              ) {
                                setData(parsed)
                                await handleSaveAll(parsed)
                                showNotice('Backup kamyabi se restore ho gaya aur website update ho chuki hai!')
                              }
                            } catch {
                              showNotice('JSON file parse nahi ho saki. File corrupted hai.', 'error')
                            }
                          }
                          reader.readAsText(file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* UNIVERSAL VISUAL IMAGE PICKER MODAL */}
      {pickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-[#2c3038] bg-[#16181d] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#20232b] p-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Choose / Assign Picture</h3>
                <p className="text-xs text-[#8c92a0]">
                  Library mein se photo select karein ya apne PC se direct upload kar ke lagayein.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPickerTarget(null)}
                className="rounded-xl border border-[#2a2e37] p-2 text-[#8c92a0] hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* MODAL TOP CONTROLS & UPLOAD */}
            <div className="flex items-center justify-between border-b border-[#20232b] bg-[#121419] px-6 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerFilter('all')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    pickerFilter === 'all' ? 'bg-[#c2a06a] text-black' : 'text-[#8c92a0] hover:text-white'
                  }`}
                >
                  All Photos ({mediaFiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPickerFilter('projects')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    pickerFilter === 'projects' ? 'bg-[#c2a06a] text-black' : 'text-[#8c92a0] hover:text-white'
                  }`}
                >
                  Projects Only
                </button>
                <button
                  type="button"
                  onClick={() => setPickerFilter('spaces')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    pickerFilter === 'spaces' ? 'bg-[#c2a06a] text-black' : 'text-[#8c92a0] hover:text-white'
                  }`}
                >
                  Rooms / Spaces
                </button>
                <button
                  type="button"
                  onClick={() => setPickerFilter('videos')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    pickerFilter === 'videos' ? 'bg-[#c2a06a] text-black' : 'text-[#8c92a0] hover:text-white'
                  }`}
                >
                  Videos
                </button>
              </div>

              {/* DIRECT UPLOAD FROM PC RIGHT INSIDE PICKER */}
              <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#c2a06a] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#d8b57d]">
                {uploading ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-3.5" />
                    Upload From PC &amp; Select
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  disabled={uploading}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const isVid = file.type.startsWith('video') || /\.(mp4|webm|mov|mkv)$/i.test(file.name)
                    const url = await handleDirectUpload(file, isVid ? ('video' as any) : 'images')
                    if (url) {
                      applySelectedImage(url)
                    }
                  }}
                />
              </label>
            </div>

            {/* MODAL GRID */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-4 gap-4">
                {filteredMedia.map((file) => (
                  <div
                    key={file.url}
                    onClick={() => applySelectedImage(file.url)}
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#232731] bg-[#121419] transition hover:border-[#c2a06a] hover:shadow-lg hover:shadow-[#c2a06a]/10"
                  >
                    <div className="relative aspect-[4/3] w-full bg-black">
                      {/\.(mp4|webm|mov|mkv)$/i.test(file.url) ? (
                        <video src={file.url} className="size-full object-cover" muted preload="metadata" />
                      ) : (
                        <Image src={file.url} alt={file.name} fill className="object-cover transition group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                        <span className="flex items-center gap-1 rounded-xl bg-[#c2a06a] px-3 py-1 text-xs font-bold text-black">
                          <Check className="size-3.5" />
                          Select
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-[11px] font-semibold text-white">{file.name}</p>
                      <p className="truncate text-[9px] text-[#8c92a0]">{file.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end border-t border-[#20232b] p-4">
              <button
                type="button"
                onClick={() => setPickerTarget(null)}
                className="rounded-xl border border-[#2a2e37] px-5 py-2 text-xs font-semibold text-[#8c92a0] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
