const modules = import.meta.glob('./*.json')

export function getExamData(level, time) {
  const key = `./${level}_${time}.json`
  if (!modules[key]) throw new Error(`Exam not found: ${key}`)
  return modules[key]().then(m => m.default || m)
}

export function getAvailableExams() {
  return Object.keys(modules)
    .map(k => {
      const match = k.match(/\.\/(\w+)_(\d+)\.json/)
      if (!match) return null
      return { level: match[1], time: match[2] }
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.level !== b.level) return a.level.localeCompare(b.level)
      return b.time.localeCompare(a.time)
    })
}
