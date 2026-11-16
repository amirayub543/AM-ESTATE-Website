import fs from 'node:fs'
import path from 'node:path'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'am_admin_token'
const SESSION_SECRET = 'am_estate_secret_session_key_2026'

async function isAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return token === SESSION_SECRET
}

export async function POST(req: Request) {
  try {
    const authenticated = await isAuth()
    if (!authenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const targetFolder = (formData.get('targetFolder') as string) || 'images'
    const spaceSlug = formData.get('spaceSlug') as string | null

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename
    const originalName = file.name
    const ext = path.extname(originalName).toLowerCase()
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')

    const finalFileName = `${Date.now()}-${baseName}${ext}`

    let destinationDir = path.join(process.cwd(), 'public', 'images')
    let publicUrl = `/images/${finalFileName}`

    const isVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(ext)

    if (targetFolder === 'video' || isVideo) {
      destinationDir = path.join(process.cwd(), 'public', 'video')
      publicUrl = `/video/${finalFileName}`
    } else if (targetFolder === 'spaces' && spaceSlug) {
      destinationDir = path.join(process.cwd(), 'public', 'images', 'spaces', spaceSlug)
      publicUrl = `/images/spaces/${spaceSlug}/${finalFileName}`
    }

    fs.mkdirSync(destinationDir, { recursive: true })
    const fullPath = path.join(destinationDir, finalFileName)
    fs.writeFileSync(fullPath, buffer)

    return NextResponse.json({
      success: true,
      message: 'File upload ho gai!',
      url: publicUrl,
      fileName: finalFileName,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
