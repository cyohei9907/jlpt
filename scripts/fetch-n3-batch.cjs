#!/usr/bin/env node
/**
 * Batch fetch & decrypt N3 questions for all available time periods.
 * Usage: node scripts/fetch-n3-batch.cjs
 */

const https  = require('https')
const crypto = require('crypto')
const fs     = require('fs')
const path   = require('path')

const KEY   = Buffer.from('j5x1z2xz2x3zz112', 'utf8')
const IV    = Buffer.from('aoxsa153xsd1ad51',  'utf8')
const LEVEL = 'n3'
const TYPES = [1, 2, 3, 4]
const DATA_DIR = path.join(__dirname, '../src/data')

// All N3 time periods visible in the UI (image reference)
const TIMES = [
  '202412', '202407',
  '202312', '202307',
  '202212', '202207',
  '202112', '202107',
  '202012',
]

function decrypt(base64Str) {
  const d = crypto.createDecipheriv('aes-128-cbc', KEY, IV)
  d.setAutoPadding(true)
  return JSON.parse(d.update(base64Str, 'base64', 'utf8') + d.final('utf8'))
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(new Error(`Parse failed: ${body.slice(0, 100)}`)) }
      })
    }).on('error', reject)
  })
}

async function fetchTime(time) {
  const outPath = path.join(DATA_DIR, `${LEVEL}_${time}.json`)

  if (fs.existsSync(outPath)) {
    console.log(`  [${time}] already exists, skipping`)
    return
  }

  const result = {}
  let qId = 1

  for (const type of TYPES) {
    const url = `https://easy-jlpt.com/api/practice?level=${LEVEL}&time=${time}&type=${type}`
    process.stdout.write(`  [${time}] type ${type}: `)

    const resp = await fetchJson(url)

    if (resp.code !== 1 || !resp.data) {
      console.log(`skip (code=${resp.code})`)
      result[`type_${type}`] = []
      continue
    }

    let arr
    try {
      const raw = decrypt(resp.data)
      arr = Array.isArray(raw) ? raw : (raw.data ?? raw.list ?? [])
    } catch (e) {
      console.log(`decrypt error: ${e.message}`)
      result[`type_${type}`] = []
      continue
    }

    // Field names from API match schema exactly — pass through as-is
    result[`type_${type}`] = arr.map((q, i) => ({
      ...q,
      time,
      level: LEVEL,
      questionId:     qId + i,
      typeQuestionId: i,
    }))
    qId += arr.length
    console.log(`${arr.length} questions`)
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2))
  const total = Object.values(result).reduce((s, a) => s + a.length, 0)
  console.log(`  [${time}] saved ${total} questions → ${path.basename(outPath)}`)
}

async function main() {
  console.log(`Batch fetching N3 (${TIMES.length} time periods)…\n`)
  for (const time of TIMES) {
    await fetchTime(time)
  }
  console.log('\nAll done.')
}

main().catch(err => { console.error(err.message); process.exit(1) })
