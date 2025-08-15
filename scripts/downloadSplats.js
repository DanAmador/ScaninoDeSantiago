// downloadSplats.mjs
// Requires: npm i adm-zip
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const splatsJsonPath = path.join(__dirname, '../public/splats.json')
const parsedSplatsPath = path.join(__dirname, '../public/parsed_splats.json')
const splatsDir = path.join(__dirname, '../public/splats')

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function sanitizeFilename(s, fallback = 'file') {
  const cleaned = String(s)
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .trim()
  return cleaned.length ? cleaned : fallback
}

async function downloadZip(url, dest, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(
      url,
      {
        headers: {
          'User-Agent': 'splat-downloader/1.0',
          Accept: '*/*',
        },
      },
      (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          if (redirectsLeft <= 0) {
            reject(new Error(`Too many redirects for ${url}`))
            return
          }
          const next = new URL(res.headers.location, url).toString()
          downloadZip(next, dest, redirectsLeft - 1)
            .then(resolve)
            .catch(reject)
          return
        }

        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`))
          return
        }

        const fileStream = fs.createWriteStream(dest)
        res.pipe(fileStream)
        fileStream.on('finish', () => fileStream.close(resolve))
        res.on('error', (e) => {
          fileStream.destroy()
          reject(e)
        })
      }
    )
    req.on('error', reject)
  })
}

function uniquePath(baseDir, baseName) {
  // e.g., my_file.ply -> my_file(1).ply if needed
  const ext = path.extname(baseName)
  const name = path.basename(baseName, ext)
  let candidate = path.join(baseDir, baseName)
  let i = 1
  while (fs.existsSync(candidate)) {
    candidate = path.join(baseDir, `${name}(${i})${ext}`)
    i++
  }
  return candidate
}

async function main() {
  ensureDir(splatsDir)

  if (!fs.existsSync(splatsJsonPath)) {
    console.error(`Missing ${splatsJsonPath}`)
    process.exit(1)
  }

  const splatsRoot = readJson(splatsJsonPath)
  const splatList = splatsRoot.response || []
  const parsedSplats = fs.existsSync(parsedSplatsPath) ? readJson(parsedSplatsPath) : []

  console.log(`Total splats found: ${splatList.length}`)

  let withPly = 0
  let processed = 0
  let skipped = 0

  // Quick lookup for already processed entries (by name+date)
  const seen = new Set(parsedSplats.map((e) => `${e.name}@@${e.date}`))

  for (const splat of splatList) {
    const { title, date, location, artifacts = [] } = splat
    const key = `${title}`

    const plyArtifact =
      artifacts.find((a) => a.type === 'gaussian_splatting_point_cloud.ply') ||
      artifacts.find((a) => a.url && a.url.endsWith('.zip')) // fallback if type varies

    if (!plyArtifact || !plyArtifact.url) {
      skipped++
      continue
    }

    withPly++

    if (seen.has(key)) {
      skipped++
      continue
    }

    const safeTitle = sanitizeFilename(title || 'untitled')
    const safeDate = sanitizeFilename(date || 'unknown')
    const plyFilename = `${safeTitle}.ply`
    const plyPath = uniquePath(splatsDir, plyFilename)
    const tempZipPath = uniquePath(splatsDir, `${safeTitle}.zip`)
    const vitePath = `/splats/${path.basename(plyPath)}`

    try {
      console.log(`→ Downloading: ${title}`)
      await downloadZip(plyArtifact.url, tempZipPath)

      const zip = new AdmZip(tempZipPath)
      const plyEntry = zip
        .getEntries()
        .find((entry) => entry.entryName.toLowerCase().endsWith('.ply'))
      if (!plyEntry) throw new Error('No .ply file found in zip')

      fs.writeFileSync(plyPath, plyEntry.getData())

      // Remove the zip after successful extraction
      fs.unlinkSync(tempZipPath)

      parsedSplats.push({
        name: title,
        date,
        location,
        localUrl: vitePath,
      })
      writeJson(parsedSplatsPath, parsedSplats)
      seen.add(key)
      processed++
      console.log(`✓ Saved: ${path.basename(plyPath)}`)
    } catch (err) {
      console.error(`✗ Error with "${title}":`, err.message)
      // Cleanup partial files if any
      try {
        if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath)
      } catch {}
      try {
        if (fs.existsSync(plyPath)) fs.unlinkSync(plyPath)
      } catch {}
    }
  }

  console.log(`\nSummary:`)
  console.log(`Splats with .ply zip: ${withPly}`)
  console.log(`Processed: ${processed}`)
  console.log(`Skipped:   ${skipped}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
