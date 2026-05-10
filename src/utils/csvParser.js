/**
 * CSV行を配列に変換（クォート対応）
 */
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

/**
 * 日付文字列を YYYY/MM/DD に正規化
 * 対応: "2026年04月26日" / "2026/03/01" / "2026-03-01"
 */
function parseDate(str) {
  if (!str) return null
  let m = str.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (m) return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`
  m = str.match(/(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/)
  if (m) return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`
  return null
}

/**
 * 金額文字列を整数に変換（カンマ・記号を除去）
 */
function parseAmount(str) {
  if (!str) return null
  const n = parseInt(str.replace(/[^\d]/g, ''), 10)
  return n > 0 ? n : null
}

/**
 * 店名末尾の @ パディングを除去
 */
function cleanMerchant(name) {
  return name.replace(/@+\s*$/, '').trim()
}

/**
 * フォーマット判定
 * format1: ショッピング/キャッシング/その他 が先頭に来る形式
 * format2: 利用日・利用先名称 が列ヘッダに来る形式（タカシマヤ等）
 */
function detectFormat(lines) {
  for (const line of lines) {
    if (/^(ショッピング|キャッシング|その他)[,\s]/.test(line)) return 'format1'
    if (/^利用日[,\s]/.test(line)) return 'format2'
    if (/^カード名称[,\s]/.test(line)) return 'format2'
  }
  return 'unknown'
}

const TYPE_VALS = new Set(['ショッピング', 'キャッシング', 'その他'])

function parseFormat1(lines) {
  const readable = []
  const unreadable = []

  for (const line of lines) {
    const cols = parseCSVLine(line)
    if (!TYPE_VALS.has(cols[0])) continue  // ヘッダ・合計行はスキップ

    const date = parseDate(cols[1])
    const merchant = cleanMerchant(cols[2] || '')
    const amount = parseAmount(cols[4])  // 利用金額

    if (date && merchant && amount !== null) {
      readable.push({ date, merchant, amount })
    } else {
      unreadable.push(line)
    }
  }
  return { readable, unreadable }
}

function parseFormat2(lines) {
  const readable = []
  const unreadable = []
  let inData = false

  // 「,」始まりの継続行を前の行に結合（外貨・注記など）
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

    // データヘッダ行を検出（「利用日」で始まる行）
    if (cols[0] === '利用日') { inData = true; continue }
    if (!inData) continue
    if (!/^\d{4}/.test(cols[0] || '')) continue  // 日付以外の行はスキップ

    const date = parseDate(cols[0])
    const merchant = cleanMerchant(cols[1] || '')
    const amount = parseAmount(cols[5])  // 利用金額（6列目）

    if (date && merchant && amount !== null) {
      readable.push({ date, merchant, amount })
    } else {
      unreadable.push(line)
    }
  }
  return { readable, unreadable }
}

/**
 * CSVテキストを解析してトランザクション一覧と読み取れなかった行を返す
 * @param {string} text - デコード済みCSVテキスト
 * @returns {{ readable: Array, unreadable: string[], format: string }}
 */
export function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const format = detectFormat(lines)

  if (format === 'format1') return { ...parseFormat1(lines), format }
  if (format === 'format2') return { ...parseFormat2(lines), format }

  return { readable: [], unreadable: lines.filter(l => l.includes(',')), format }
}
