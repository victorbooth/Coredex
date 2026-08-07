import { sampleDb, type Database } from './sampleData'

const KEY = 'household-finance-demo-v1'

export function loadDb(): Database {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Database
  } catch {
    // fall through to sample data
  }
  return structuredClone(sampleDb)
}

export function saveDb(db: Database) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function resetDb(): Database {
  localStorage.removeItem(KEY)
  return structuredClone(sampleDb)
}
