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

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images')
    const files: { name: string; url: string; category: string; size: number }[] = []

    if (fs.existsSync(imagesDir)) {
      const rootFiles = fs.readdirSync(imagesDir, { withFileTypes: true })
      for (const f of rootFiles) {
        if (f.isFile() && /\.(jpe?g|png|webp|avif|svg)$/i.test(f.name)) {
          const stat = fs.statSync(path.join(imagesDir, f.name))
          files.push({
            name: f.name,
            url: `/images/${f.name}`,
            category: 'general',
            size: stat.size,
          })
        }
      }

      const spacesDir = path.join(imagesDir, 'spaces')
      if (fs.existsSync(spacesDir)) {
        const spaceFolders = fs.readdirSync(spacesDir, { withFileTypes: true })
        for (const s of spaceFolders) {
          if (s.isDirectory()) {
            const roomDir = path.join(spacesDir, s.name)
            const roomFiles = fs.readdirSync(roomDir, { withFileTypes: true })
            for (const rf of roomFiles) {
              if (rf.isFile() && /\.(jpe?g|png|webp|avif|svg)$/i.test(rf.name)) {
                const stat = fs.statSync(path.join(roomDir, rf.name))
                files.push({
                  name: rf.name,
                  url: `/images/spaces/${s.name}/${rf.name}`,
                  category: `space:${s.name}`,
                  size: stat.size,
                })
              }
            }
          }
        }
      }
    }

    const videoDir = path.join(process.cwd(), 'public', 'video')
    if (fs.existsSync(videoDir)) {
      const videoFiles = fs.readdirSync(videoDir, { withFileTypes: true })
      for (const vf of videoFiles) {
        if (vf.isFile() && /\.(mp4|webm|mov|mkv)$/i.test(vf.name)) {
          const stat = fs.statSync(path.join(videoDir, vf.name))
          files.push({
            name: vf.name,
            url: `/video/${vf.name}`,
            category: 'video',
            size: stat.size,
          })
        }
      }
    }

    return NextResponse.json({ files })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authenticated = await isAuth()
    if (!authenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await req.json()
    if (!url || typeof url !== 'string' || (!url.startsWith('/images/') && !url.startsWith('/video/'))) {
      return NextResponse.json({ success: false, message: 'Invalid URL' }, { status: 400 })
    }

    // Protect core logo
    if (url.includes('am-logo.png')) {
      return NextResponse.json({ success: false, message: 'Logo delete nahi ho sakta.' }, { status: 400 })
    }

    const relativePath = url.replace(/^\//, '')
    const fullPath = path.join(process.cwd(), 'public', relativePath)

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      return NextResponse.json({ success: true, message: 'Image delete ho gai!' })
    }

    return NextResponse.json({ success: false, message: 'File nahi mili.' }, { status: 404 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
