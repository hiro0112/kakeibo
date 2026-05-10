import * as XLSX from 'xlsx'

function calcCategories(transactions) {
  const total = transactions.reduce((s, t) => s + t.amount, 0)
  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})
  return { total, byCategory }
}

function downloadBlob(wb, filename) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Excelファイルを生成してダウンロードする
 * シート構成: サマリー / 明細一覧 / 読み取れなかった行
 */
export function exportToExcel(transactions, unreadable) {
  const { total, byCategory } = calcCategories(transactions)
  const wb = XLSX.utils.book_new()

  // ── シート1: サマリー ──────────────────────────
  const summaryRows = [
    ['支出合計（円）', total],
    [],
    ['カテゴリ', '合計金額（円）', '割合'],
    ...Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => [cat, amt, `${((amt / total) * 100).toFixed(1)}%`]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'サマリー')

  // ── シート2: 明細一覧 ──────────────────────────
  const txRows = [
    ['利用日', '利用先', '金額（円）', 'カテゴリ'],
    ...transactions.map(t => [t.date, t.merchant, t.amount, t.category]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(txRows), '明細一覧')

  // ── シート3: 読み取れなかった行 ───────────────
  if (unreadable.length > 0) {
    const unreadRows = [['読み取れなかった行'], ...unreadable.map(r => [r])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(unreadRows), '読み取れなかった行')
  }

  const now = new Date()
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  downloadBlob(wb, `kakeibo_${ts}.xlsx`)
}
