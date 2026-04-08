#!/usr/bin/env node
/**
 * Scraper for easy-jlpt.com - N3 202407
 * Usage:
 *   npm install puppeteer   (run once)
 *   node scripts/scrape-n3.js
 *
 * Outputs: src/data/n3_202407.json
 * Debug HTML saved to scripts/debug_type{1-4}.html for inspection if needed.
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const CONFIG = {
  level: 'n3',
  time: '202407',
  types: [1, 2, 3, 4],
  baseUrl: 'https://easy-jlpt.com/questions',
  outputPath: path.join(__dirname, '../src/data/n3_202407.json'),
  debugDir: __dirname,
}

let idCounter = 30000
const nextId = () => idCounter++

// ── DOM extraction ────────────────────────────────────────────────────────────
// Runs inside the browser context via page.evaluate().
// Tries several common selector patterns used by JLPT practice sites.
function extractInBrowser(typeNum) {
  const qs = (sel, root = document) => root.querySelector(sel)
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel))

  // Candidate selectors for question wrapper elements
  const WRAPPER_SELECTORS = [
    '.question-item', '.question-wrap', '.question-block', '.question-card',
    '[class*="question-item"]', '[class*="QuestionItem"]',
    '.q-item', '.q-wrap', '.exam-question', '.problem-item',
    'article', '.card',
  ]

  // Candidate selectors for option/choice elements inside a wrapper
  const OPTION_SELECTORS = [
    '[class*="option"]', '[class*="choice"]', '[class*="answer"]',
    '.item', 'li', 'label',
  ]

  // Candidate selectors for the correct-answer marker
  const CORRECT_SELECTORS = [
    '[class*="correct"]', '[class*="right"]', '[class*="active"]',
    '[class*="selected"]', '[data-correct="true"]', '[data-answer]',
  ]

  // ── find question containers ──
  let containers = []
  for (const sel of WRAPPER_SELECTORS) {
    const found = qsa(sel)
    if (found.length >= 2) { containers = found; break }
  }

  // Fallback: look for any element that contains exactly 4 radio/button children
  if (!containers.length) {
    containers = qsa('div, section, article').filter(el => {
      const inputs = qsa('input[type=radio], button', el)
      return inputs.length === 4
    })
  }

  const questions = []

  for (const wrap of containers) {
    // ── big title (section header) ──
    const bigTitleEl =
      qs('[class*="big-title"], [class*="bigTitle"], [class*="section-title"], [class*="problem-title"]', wrap) ||
      qs('h2, h3, h4', wrap)
    const bigTitle = bigTitleEl ? bigTitleEl.innerHTML.trim() : ''

    // ── article (reading passage) ──
    const articleEl = qs('[class*="article"], [class*="passage"], [class*="text-body"], .reading', wrap)
    const article = articleEl ? articleEl.innerHTML.trim() : null

    // ── question text ──
    const questionEl =
      qs('[class*="question-text"], [class*="questionText"], [class*="stem"], .q-text, .question p', wrap) ||
      qs('p', wrap)
    const question = questionEl ? questionEl.innerHTML.trim() : wrap.innerText.split('\n')[0].trim()

    // ── audio ──
    const audioEl = qs('audio source, audio', wrap)
    const audio = audioEl ? (audioEl.src || audioEl.getAttribute('src') || null) : null

    // ── picture ──
    const imgEl = qs('img', wrap)
    const picture = imgEl ? (imgEl.src || imgEl.getAttribute('src') || null) : null

    // ── options ──
    let optionEls = []
    for (const sel of OPTION_SELECTORS) {
      const found = qsa(sel, wrap)
      if (found.length >= 2 && found.length <= 6) { optionEls = found; break }
    }
    const options = optionEls.slice(0, 4).map(el => el.textContent.trim())

    // ── answer ──
    let answer = 0

    // Strategy 1: data attribute on wrapper
    const dataAns = wrap.dataset.answer || wrap.dataset.correct || wrap.dataset.correctAnswer
    if (dataAns) {
      answer = parseInt(dataAns, 10)
    }

    // Strategy 2: a child element marked as correct
    if (!answer) {
      for (const sel of CORRECT_SELECTORS) {
        const correctEl = qs(sel, wrap)
        if (correctEl) {
          const txt = correctEl.textContent.trim()
          const idx = options.findIndex(o => o === txt)
          if (idx >= 0) { answer = idx + 1; break }
          // Maybe the element itself is one of the option els
          const optIdx = optionEls.indexOf(correctEl)
          if (optIdx >= 0) { answer = optIdx + 1; break }
        }
      }
    }

    // Strategy 3: look for a data-answer attribute on option elements
    if (!answer) {
      optionEls.forEach((el, i) => {
        if (el.dataset.correct === 'true' || el.dataset.answer === 'true' ||
            el.classList.toString().includes('correct')) {
          answer = i + 1
        }
      })
    }

    questions.push({ bigTitle, question, article, audio, picture, options, answer })
  }

  return questions
}

// ── map raw scraped data → JSON schema ───────────────────────────────────────
function toSchema(raw, type, startQuestionId) {
  return raw.map((q, i) => ({
    id: nextId(),
    time: '202407',
    level: 'n3',
    questionId: startQuestionId + i,
    typeQuestionId: i,
    type,
    bigTitle: q.bigTitle ? `<p>${q.bigTitle}</p>` : '',
    question: q.question ? `<p>${q.question}</p>` : '',
    littleQuestion: null,
    picture: q.picture || null,
    audio: q.audio || null,
    article: q.article ? `<p>${q.article}</p>` : null,
    option1: q.options[0] || '',
    option2: q.options[1] || '',
    option3: q.options[2] || '',
    option4: q.options[3] || '',
    answer: q.answer || 0,
    isMultiple: 0,
    multipleIds: null,
    assistant: '',
    assistantNew: '',
    extending: [],
    parentId: null,
    articleAssistant: null,
  }))
}

// ── scrape one type page ──────────────────────────────────────────────────────
async function scrapeType(browser, type) {
  const url = `${CONFIG.baseUrl}?time=${CONFIG.time}&level=${CONFIG.level}&type=${type}`
  console.log(`\n[type ${type}] ${url}`)

  const page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  )

  // Intercept JSON API responses — many SPAs load question data via XHR
  const apiCaptures = []
  page.on('response', async res => {
    const ct = res.headers()['content-type'] || ''
    if (!ct.includes('application/json')) return
    try {
      const json = await res.json()
      apiCaptures.push({ url: res.url(), json })
    } catch (_) {}
  })

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  // Extra wait for lazy-rendered content
  await new Promise(r => setTimeout(r, 3000))

  // Save debug HTML
  const html = await page.content()
  const debugPath = path.join(CONFIG.debugDir, `debug_type${type}.html`)
  fs.writeFileSync(debugPath, html)
  console.log(`  debug HTML → ${debugPath}`)

  // Log any captured API responses
  if (apiCaptures.length) {
    console.log(`  captured ${apiCaptures.length} JSON response(s):`)
    apiCaptures.forEach(c => console.log(`    ${c.url}`))
    // Save for inspection
    fs.writeFileSync(
      path.join(CONFIG.debugDir, `debug_api_type${type}.json`),
      JSON.stringify(apiCaptures, null, 2)
    )
  }

  // DOM extraction
  const raw = await page.evaluate(extractInBrowser)
  console.log(`  DOM extraction: ${raw.length} question(s)`)

  await page.close()
  return raw
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== N3 202407 scraper ===')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ja-JP'],
  })

  const result = {}
  let globalQuestionId = 1

  for (const type of CONFIG.types) {
    try {
      const raw = await scrapeType(browser, type)
      const mapped = toSchema(raw, type, globalQuestionId)
      result[`type_${type}`] = mapped
      globalQuestionId += mapped.length
      console.log(`  → type_${type}: ${mapped.length} questions`)
    } catch (err) {
      console.error(`  ERROR type ${type}:`, err.message)
      result[`type_${type}`] = []
    }
  }

  await browser.close()

  fs.writeFileSync(CONFIG.outputPath, JSON.stringify(result, null, 2))

  const total = Object.values(result).reduce((s, a) => s + a.length, 0)
  console.log(`\nDone. ${total} questions saved to:\n  ${CONFIG.outputPath}`)

  if (total === 0) {
    console.log('\n⚠  No questions extracted.')
    console.log('   Check the debug HTML files in scripts/ to inspect the page structure,')
    console.log('   then adjust the selectors in extractInBrowser() accordingly.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
