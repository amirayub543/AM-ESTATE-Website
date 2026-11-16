import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSiteData, saveSiteData, type SiteData } from '@/lib/data-store'

const COOKIE_NAME = 'am_admin_token'
const SESSION_SECRET = 'am_estate_secret_session_key_2026'

async function isAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return token === SESSION_SECRET
}

export async function GET() {
  const data = getSiteData()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const authenticated = await isAuth()
    if (!authenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Pehlay login karain.' }, { status: 401 })
    }

    const body = (await req.json()) as SiteData
    if (!body || !body.company) {
      return NextResponse.json({ success: false, message: 'Invalid data format' }, { status: 400 })
    }

    // Preserve existing adminConfig if not provided in body
    const existing = getSiteData()
    if (!body.adminConfig) {
      body.adminConfig = existing.adminConfig
    }

    const saved = saveSiteData(body)
    if (!saved) {
      return NextResponse.json({ success: false, message: 'Failed to write site data' }, { status: 500 })
    }

    // Revalidate website paths
    revalidatePath('/')
    revalidatePath('/real-estate/[slug]', 'page')
    revalidatePath('/projects/[id]', 'page')
    revalidatePath('/construction/[slug]', 'page')
    revalidatePath('/spaces/[slug]', 'page')

    return NextResponse.json({ success: true, message: 'Data kamyabi sy save ho gaya hai!' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
