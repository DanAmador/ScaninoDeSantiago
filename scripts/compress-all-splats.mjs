// Batch-call your scripts/to-spz.js for every .ply in public/splats
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// folders / files
const splatsDir = path.resolve(__dirname, '../public/splats')
const toSpzScript = path.resolve(__dirname, './compress-to-spz.mjs') // your CLI

// options passthrough (e.g. --filter-zero --max-sh 2)
// and special flags for this batch runner:
//   --keep    -> don't delete .ply after success
//   --concurrency N  -> number of parallel jobs (default 3)
const rawArgs = process.argv.slice(2)
const passthrough = []
let keepSource = false
let concurrency = 3

for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i]
  if (a === '--keep') {
    keepSource = true
  } else if (a === '--concurrency') {
    const v = Number(rawArgs[++i])
    if (!Number.isFinite(v) || v < 1) throw new Error('Invalid --concurrency')
    concurrency = v
  } else {
    // forward to to-spz.js
    passthrough.push(a)
  }
}

if (!fs.existsSync(splatsDir)) {
  console.error(`❌ Folder not found: ${splatsDir}`)
  process.exit(1)
}
if (!fs.existsSync(toSpzScript)) {
  console.error(`❌ scripts/to-spz.js not found at ${toSpzScript}`)
  process.exit(1)
}

// collect .ply
const plyFiles = fs
  .readdirSync(splatsDir)
  .filter((f) => f.toLowerCase().endsWith('.ply'))
  .map((f) => path.join(splatsDir, f))

if (plyFiles.length === 0) {
  console.log('Nothing to do: no .ply files found.')
  process.exit(0)
}

async function compressOne(plyPath) {
  const outPath = plyPath.replace(/\.ply$/i, '.spz')

  // skip if already compressed
  if (fs.existsSync(outPath)) {
    console.log(`↷ Skipping (already exists): ${path.basename(outPath)}`)
    return
  }

  console.log(`⚙️  Compressing ${path.basename(plyPath)} ...`)
  // run: node scripts/to-spz.js [passthrough flags...] <plyPath>
  try {
    await execFileAsync(process.execPath, [toSpzScript, ...passthrough, plyPath], {
      cwd: process.cwd(),
      stdio: 'inherit',
    })

    if (fs.existsSync(outPath)) {
      if (!keepSource) {
        await fsp.unlink(plyPath)
        console.log(`✔ ${path.basename(outPath)} (removed ${path.basename(plyPath)})`)
      } else {
        console.log(`✔ ${path.basename(outPath)} (kept ${path.basename(plyPath)})`)
      }
    } else {
      console.warn(`❗ Finished but missing: ${path.basename(outPath)} — keeping source.`)
    }
  } catch (err) {
    console.error(`❌ Failed: ${path.basename(plyPath)}\n${err?.message ?? err}`)
  }
}

// small worker pool
const queue = [...plyFiles]
const workers = Array.from({ length: concurrency }, async () => {
  while (queue.length) {
    const next = queue.shift()
    if (next) await compressOne(next)
  }
})
await Promise.all(workers)

console.log('✅ All done.')
