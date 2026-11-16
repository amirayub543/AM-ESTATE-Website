import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSiteData, saveSiteData } from '@/lib/data-store'

const COOKIE_NAME = 'am_admin_token'
const SESSION_SECRET = 'am_estate_secret_session_key_2026'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token === SESSION_SECRET) {
    return NextResponse.json({ authenticated: true })
  }
  return NextResponse.json({ authenticated: false })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, password, newPassword } = body
    const data = getSiteData()
    const currentPass = data.adminConfig?.passwordHash || 'admin123'

    if (action === 'login') {
      if (password === currentPass) {
        const cookieStore = await cookies()
        cookieStore.set(COOKIE_NAME, SESSION_SECRET, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        return NextResponse.json({ success: true, message: 'Logged in successfully' })
      }
      return NextResponse.json({ success: false, message: 'Ghalat password hai. Dobara koshish karain.' }, { status: 401 })
    }

    if (action === 'logout') {
      const cookieStore = await cookies()
      cookieStore.delete(COOKIE_NAME)
      return NextResponse.json({ success: true, message: 'Logged out' })
    }

    if (action === 'change-password') {
      const cookieStore = await cookies()
      const token = cookieStore.get(COOKIE_NAME)?.value
      if (token !== SESSION_SECRET) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      }

      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ success: false, message: 'Naya password kam az kam 4 characters ka hona chahiye.' }, { status: 400 })
      }

      data.adminConfig = {
        passwordHash: newPassword,
        updatedAt: new Date().toISOString(),
      }
      saveSiteData(data)

      return NextResponse.json({ success: true, message: 'Password kamyabi se tabdeel ho gaya hai!' })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
