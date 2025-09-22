import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Minimal env loader for Node (no dotenv dependency)
function loadEnv() {
  const root = process.cwd()
  const candidates = ['.env.local', '.env']
  for (const filename of candidates) {
    const filePath = path.join(root, filename)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      for (const line of content.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
        if (!m) continue
        const key = m[1]
        let val = m[2]
        // Strip optional surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!(key in process.env)) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[check-schema] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment (.env.local)')
  process.exit(2)
}

// Masked debug output to confirm envs are loaded
const mask = (s = '') => (s.length <= 8 ? '*'.repeat(s.length) : s.slice(0, 4) + '...' + s.slice(-4))
console.log('[check-schema] Using SUPABASE_URL:', SUPABASE_URL)
console.log('[check-schema] Using ANON KEY:', mask(SUPABASE_ANON_KEY))

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Declare required tables/columns here
const schemaChecks = {
  profiles: ['id', 'full_name', 'name', 'email', 'whatsapp_number', 'whatsapp', 'phone', 'role'],
  // Add other tables when needed, e.g.:
  // annonces: ['id', 'ville_depart', 'ville_arrivee']
}

async function checkColumn(table, column) {
  // We intentionally select a single column; PostgREST will error if it doesn't exist
  const { error } = await supabase.from(table).select(column).limit(1)
  if (error) {
    // Detect typical missing-column Postgres error
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('column') && msg.includes('does not exist')) {
      return { ok: false, reason: 'missing' }
    }
    return { ok: false, reason: `query_error: ${error.message}` }
  }
  return { ok: true }
}

async function main() {
  let missing = []
  for (const [table, columns] of Object.entries(schemaChecks)) {
    for (const col of columns) {
      const res = await checkColumn(table, col)
      if (!res.ok) {
        missing.push({ table, column: col, reason: res.reason })
        console.log(`❌ ${table}.${col}: ${res.reason}`)
      } else {
        console.log(`✅ ${table}.${col}`)
      }
    }
  }

  if (missing.length) {
    console.error('\n[check-schema] Missing or invalid columns detected:')
    for (const m of missing) {
      console.error(` - ${m.table}.${m.column} (${m.reason})`)
    }
    console.error('\nAction: create a migration to add the missing columns, or align the front-end with the current schema.')
    process.exit(1)
  } else {
    console.log('\n[check-schema] Schema OK')
  }
}

main().catch((err) => {
  console.error('[check-schema] Unexpected failure:', err)
  process.exit(3)
})
