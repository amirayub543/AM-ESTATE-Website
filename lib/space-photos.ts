import fs from 'node:fs'
import path from 'node:path'

/**
 * Photos dropped into public/images/spaces/<slug>/ show up on the website automatically
 * (sorted by file name — the first one becomes the card's cover). Server-side only.
 */
export function spacePhotos(slug: string): string[] {
  try {
    const folder = path.join(process.cwd(), 'public', 'images', 'spaces', slug)
    return fs
      .readdirSync(folder)
      .filter((file) => /\.(jpe?g|png|webp|avif|svg)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => `/images/spaces/${slug}/${file}`)
  } catch {
    return []
  }
}
