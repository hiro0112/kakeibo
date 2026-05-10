/**
 * 全明細を yearMonth ごとにグループ化する
 * @returns {{ [yearMonth: string]: Array }}
 */
export function groupByYearMonth(transactions) {
  const groups = {}
  for (const t of transactions) {
    const key = t.yearMonth || 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  }
  return groups
}

/**
 * yearMonth キーの配列を新しい月順（降順）で返す
 */
export function sortedYearMonths(groups) {
  return Object.keys(groups).sort((a, b) => b.localeCompare(a))
}

/**
 * "2026-04" → "2026年4月"
 */
export function formatYearMonth(ym) {
  if (!ym || ym === 'unknown') return '日付不明'
  const [year, month] = ym.split('-')
  return `${year}年${parseInt(month, 10)}月`
}

/**
 * 明細一覧から合計金額・カテゴリ別合計・件数を計算する
 */
export function calculateSummary(transactions) {
  const total = transactions.reduce((s, t) => s + t.amount, 0)
  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})
  return { total, byCategory, count: transactions.length }
}
