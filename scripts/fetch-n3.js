#!/usr/bin/env node
/**
 * Fetch & decrypt N3 202407 questions from easy-jlpt.com API
 * Usage: node scripts/fetch-n3.js
 * No extra dependencies needed (uses built-in https + crypto).
 */

const https = require('https')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const KEY = Buffer.from('j5x1z2xz2x3zz11', 'utf8')  // 16 bytes AES-128
const IV  = Buffer.from('aoxsa153xsd1ad51', 'utf8')  // 16 bytes

const LEVEL = 'n3'
const TIME  = '202407'
const TYPES = [1, 2, 3, 4]
const OUT   = path.join(__dirname, `../src/data/${LEVEL}_${TIME}.json`)

// ── decrypt ───────────────────────────────────────────────────────────────────
function decrypt(base64Str) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', KEY, IV)
  decipher.setAutoPadding(true)
  let out = decipher.update(base64Str, 'base64', 'utf8')
  out += decipher.final('utf8')
  return JSON.parse(out)
}

// ── fetch one URL ─────────────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(new Error(`JSON parse failed: ${body.slice(0, 200)}`)) }
      })
    }).on('error', reject)
  })
}

// ── map one raw question → schema ─────────────────────────────────────────────
// Dump the first raw item so we can see the actual field names.
let rawSample = null

function mapQuestion(raw, type, questionId, typeQuestionId) {
  if (!rawSample) {
    rawSample = raw
    console.log('\n── raw field names ──')
    console.log(Object.keys(raw).join(', '))
    console.log('────────────────────\n')
  }

  // Field name candidates (the API may use camelCase or snake_case)
  const get = (...keys) => {
    for (const k of keys) if (raw[k] != null) return raw[k]
    return null
  }

  return {
    id:             get('id') ?? (30000 + questionId),
    time:           TIME,
    level:          LEVEL,
    questionId,
    typeQuestionId,
    type,
    bigTitle:       get('bigTitle', 'big_title', 'sectionTitle', 'section_title') ?? '',
    question:       get('question', 'questionText', 'question_text', 'stem') ?? '',
    littleQuestion: get('littleQuestion', 'little_question', 'subQuestion') ?? null,
    picture:        get('picture', 'image', 'img') ?? null,
    audio:          get('audio', 'audioUrl', 'audio_url') ?? null,
    article:        get('article', 'passage', 'reading') ?? null,
    option1:        get('option1', 'options[0]') ?? raw.options?.[0] ?? '',
    option2:        get('option2', 'options[1]') ?? raw.options?.[1] ?? '',
    option3:        get('option3', 'options[2]') ?? raw.options?.[2] ?? '',
    option4:        get('option4', 'options[3]') ?? raw.options?.[3] ?? '',
    answer:         get('answer', 'correctAnswer', 'correct_answer', 'correct') ?? 0,
    isMultiple:     get('isMultiple', 'is_multiple') ?? 0,
    multipleIds:    get('multipleIds', 'multiple_ids') ?? null,
    assistant:      get('assistant', 'explanation', 'explain') ?? '',
    assistantNew:   get('assistantNew', 'assistant_new') ?? get('assistant', 'explanation', 'explain') ?? '',
    extending:      get('extending') ?? [],
    parentId:       get('parentId', 'parent_id') ?? null,
    articleAssistant: get('articleAssistant', 'article_assistant') ?? null,
  }
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Fetching ${LEVEL.toUpperCase()} ${TIME} (types 1-4)…\n`)

  const result = {}
  let globalQId = 1

  for (const type of TYPES) {
    const url = `https://easy-jlpt.com/api/practice?level=${LEVEL}&time=${TIME}&type=${type}`
    process.stdout.write(`type ${type}: fetching… `)

    const resp = await fetchJson(url)

    if (resp.code !== 1 || !resp.data) {
      console.log(`SKIP (code=${resp.code}, msg=${resp.msg})`)
      result[`type_${type}`] = []
      continue
    }

    const raw = decrypt(resp.data)

    if (!Array.isArray(raw)) {
      // Maybe it's wrapped: { data: [...] } or { list: [...] }
      const arr = raw.data ?? raw.list ?? raw.questions ?? Object.values(raw)
      if (!Array.isArray(arr)) {
        console.log(`SKIP (unexpected shape after decrypt)`)
        fs.writeFileSync(
          path.join(__dirname, `debug_decrypt_type${type}.json`),
          JSON.stringify(raw, null, 2)
        )
        result[`type_${type}`] = []
        continue
      }
      raw.length = arr.length  // reassign
      arr.forEach((v, i) => raw[i] = v)
    }

    const mapped = raw.map((item, i) => mapQuestion(item, type, globalQId + i, i))
    globalQId += mapped.length
    result[`type_${type}`] = mapped
    console.log(`${mapped.length} questions`)
  }

  fs.writeFileSync(OUT, JSON.stringify(result, null, 2))

  const total = Object.values(result).reduce((s, a) => s + a.length, 0)
  console.log(`\nSaved ${total} questions → ${OUT}`)
}

main().catch(err => { console.error(err.message); process.exit(1) })
