// Cuts the mobile hero video into frames: public/frames-mobile/frame_000.webp ...
// Run through app/make-mobile-frames.bat (it installs ffmpeg into a temp folder first).
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const [video, toolsDir] = process.argv.slice(2)
if (!video || !fs.existsSync(video)) {
  console.error('Video file nahi mili:', video)
  process.exit(1)
}

const require = createRequire(path.join(toolsDir, 'index.js'))
const ffmpeg = require('ffmpeg-static')
const outDir = path.join(process.cwd(), 'public', 'frames-mobile')
const FPS = 24
const WIDTH = 540

const clean = () => {
  fs.mkdirSync(outDir, { recursive: true })
  for (const file of fs.readdirSync(outDir)) {
    if (/^frame_\d+\.(webp|jpg)$/.test(file) || file === 'manifest.json') fs.unlinkSync(path.join(outDir, file))
  }
}

const extract = (ext, codecArgs) => {
  clean()
  spawnSync(
    ffmpeg,
    [
      '-y', '-i', video, '-an',
      '-vf', `fps=${FPS},scale=${WIDTH}:-2`,
      ...codecArgs,
      '-start_number', '0', '-f', 'image2',
      path.join(outDir, `frame_%03d.${ext}`),
    ],
    { stdio: 'inherit' },
  )
  return fs.readdirSync(outDir).filter((file) => file.endsWith(`.${ext}`)).length
}

let ext = 'webp'
let count = extract('webp', ['-c:v', 'libwebp', '-quality', '72'])
if (count === 0) {
  ext = 'jpg'
  count = extract('jpg', ['-q:v', '4'])
}
if (count === 0) {
  console.error('Frames nahi ban sakay.')
  process.exit(1)
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({ count, ext }))
console.log(`\nDone: ${count} frames (${ext}) -> public/frames-mobile`)
