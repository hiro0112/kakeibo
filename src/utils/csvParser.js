// ─── 内部ユーティリティ ────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const cols = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue }
    if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  cols.push(cur.trim())
  return cols
}

function parseAmount(str) {
  if (!str) return null
  const n = parseInt(str.replace(/[^\d]/g, ''), 10)
  return n > 0 ? n : null
}

function cleanMerchant(name) {
  return name.replace(/@+\s*$/, '').trim()
}

// ─── 公開API ──────────────────────────────────────────────────────────────────

/**
 * 日付文字列を "YYYY/MM/DD" に正規化する
 * 対応形式:
 *   2026年04月26日 / 2026/03/01 / 2026-03-01 / 26/03/01
 */
export function normalizeDate(str) {
  if (!str) return null
  str = str.trim()

  let m = str.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (m) return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`

  m = str.match(/^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/)
  if (m) return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`

  // 2桁年 (例: 26/03/01 → 2026/03/01)
  m = str.match(/^(\d{2})[/\-](\d{1,2})[/\-](\d{1,2})/)
  if (m) return `20${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`

  return null
}

/**
 * "YYYY/MM/DD" 形式の日付から "YYYY-MM" を返す
 * 例: "2026/04/26" → "2026-04"
 */
export function getYearMonth(dateStr) {
  if (!dateStr) return null
  const m = dateStr.match(/^(\d{4})\/(\d{2})/)
  return m ? `${m[1]}-${m[2]}` : null
}

// ─── フォーマット判定 ─────────────────────────────────────────────────────────

function detectFormat(lines) {
  for (const line of lines) {
    if (/^(ショッピング|キャッシング|その他)[,\s]/.test(line)) return 'format1'
    if (/^利用日[,\s]/.test(line)) return 'format2'
    if (/^カード名称[,\s]/.test(line)) return 'format2'
  }
  // Format3: 先頭列が日付、3列目が金額のシンプル形式
  for (const line of lines) {
    const cols = parseCSVLine(line)
    if (cols.length >= 3 && normalizeDate(cols[0]) && parseAmount(cols[2])) return 'format3'
  }
  return 'unknown'
}

// ─── 各フォーマットのパーサー ─────────────────────────────────────────────────

const TYPE_VALS = new Set(['ショッピング', 'キャッシング', 'その他'])

function parseFormat1(lines) {
  // 先頭列が「ショッピング/キャッシング/その他」の形式
  // col[1]=利用年月日, col[2]=利用先, col[4]=利用金額
  const readable = [], unreadable = []
  for (const line of lines) {
    const cols = parseCSVLine(line)
    if (!TYPE_VALS.has(cols[0])) continue
    const date = normalizeDate(cols[1])
    const merchant = cleanMerchant(cols[2] || '')
    const amount = parseAmount(cols[4])
    if (date && merchant && amount !== null) {
      readable.push({ date, merchant, amount })
    } else {
      unreadable.push(line)
    }
  }
  return { readable, unreadable }
}

function parseFormat2(lines) {
  // 「利用日,利用先名称,...,利用金額,...」のヘッダーがある形式
  // col[0]=利用日, col[1]=利用先, col[5]=利用金額
  const readable = [], unreadable = []
  let inData = false

  const merged = []
  for (const line of lines) {
    if (line.startsWith(',') && merged.length > 0) {
      merged[merged.length - 1] += line
    } else {
      merged.push(line)
    }
  }

  for (const line of merged) {
    const cols = parseCSVLine(line)
    if (cols[0] === '利用日') { inData = true; continue }
    if (!inData) continue
    if (!/^\d{4}/.test(cols[0] || '')) continue
    const date = normalizeDate(cols[0])
    const merchant = cleanMerchant(cols[1] || '')
    const amount = parseAmount(cols[5])
    if (date && merchant && amount !== null) {
      readable.push({ date, merchant, amount })
    } else {
      unreadable.push(line)
    }
  }
  return { readable, unreadable }
}

function parseFormat3(lines) {
  // シンプル形式: 日付,利用先,金額[,その他...]
  const readable = [], unreadable = []
  for (const line of lines) {
    const cols = parseCSVLine(line)
    if (cols.length < 3) continue
    const date = normalizeDate(cols[0])
    if (!date) continue  // 日付でない行はスキップ（ヘッダー行など）
    const merchant = cleanMerchant(cols[1] || '')
    const amount = parseAmount(cols[2])
    if (date && merchant && amount !== null) {
      readable.push({ date, merchant, amount })
    } else if (cols.some(c => c.trim())) {
      unreadable.push(line)
    }
  }
  return { readable, unreadable }
}

// ─── メインエントリ ───────────────────────────────────────────────────────────

/**
 * CSVテキストを解析してトランザクション一覧を返す
 * @param {string} text - デコード済みCSVテキスト
 * @param {string} fileName - 取込元ファイル名（省略可）
 * @returns {{ readable: Array, unreadable: string[], format: string }}
 */
export function parseCSV(text, fileName = '') {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const format = detectFormat(lines)

  let result
  if (format === 'format1') result = parseFormat1(lines)
  else if (format === 'format2') result = parseFormat2(lines)
  else if (format === 'format3') result = parseFormat3(lines)
  else result = { readable: [], unreadable: lines.filter(l => l.includes(',')) }

  // 各明細に yearMonth と sourceFileName を付与
  result.readable = result.readable.map(t => ({
    ...t,
    yearMonth: getYearMonth(t.date) ?? 'unknown',
    sourceFileName: fileName,
  }))

  return { ...result, format }
}
