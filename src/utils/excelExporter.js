import * as XLSX from 'xlsx'
import { groupByYearMonth, sortedYearMonths, formatYearMonth, calculateSummary } from './grouper'

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

function buildMonthSheet(transactions, ym) {
  const { total, byCategory } = calculateSummary(transactions)
  const label = formatYearMonth(ym)

  const rows = [
    [`${label} サマリー`],
    ['支出合計（円）', total],
    [],
    ['カテゴリ', '合計金額（円）', '割合'],
    ...Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => [cat, amt, `${((amt / total) * 100).toFixed(1)}%`]),
    [],
    ['利用日', '利用先', '金額（円）', 'カテゴリ', '取込元ファイル'],
    ...transactions
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(t => [t.date, t.merchant, t.amount, t.category, t.sourceFileName]),
  ]
  return XLSX.utils.aoa_to_sheet(rows)
}

/**
 * 年月別シート + 全明細シート + 読み取れなかった行シートを含む
 * Excelファイルを生成してダウンロードする
 */
export function exportToExcel(allTransactions, unreadable) {
  const wb = XLSX.utils.book_new()
  const groups = groupByYearMonth(allTransactions)
  const months = sortedYearMonths(groups)

  // ── 年月別シート（新しい月が先） ───────────────────────────────
  for (const ym of months) {
    const ws = buildMonthSheet(groups[ym], ym)
    // Excelのシート名は31文字以内・特殊文字不可
    const sheetName = ym.replace('unknown', '日付不明').substring(0, 31)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  // ── 全明細シート ───────────────────────────────────────────────
  const allRows = [
    ['利用日', '年月', '利用先', '金額（円）', 'カテゴリ', '取込元ファイル'],
    ...allTransactions
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(t => [t.date, t.yearMonth, t.merchant, t.amount, t.category, t.sourceFileName]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(allRows), '全明細')

  // ── 読み取れなかった行シート ───────────────────────────────────
  if (unreadable.length > 0) {
    const unreadRows = [['読み取れなかった行'], ...unreadable.map(r => [r])]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(unreadRows), '読み取れなかった行')
  }

  const now = new Date()
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  downloadBlob(wb, `kakeibo_${ts}.xlsx`)
}
