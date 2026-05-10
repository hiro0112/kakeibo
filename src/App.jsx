import { useState, useEffect } from 'react'
import InputArea from './components/InputArea'
import MonthlySection from './components/MonthlySection'
import UnreadableTable from './components/UnreadableTable'
import { parseCSV } from './utils/csvParser'
import { categorizeAll } from './utils/categorizer'
import { groupByYearMonth, sortedYearMonths } from './utils/grouper'
import { exportToExcel } from './utils/excelExporter'
import './App.css'

const STORAGE_KEY = 'kakeibo_data_v2'

export default function App() {
  const [allTransactions, setAllTransactions] = useState([])
  const [allUnreadable, setAllUnreadable] = useState([])
  const [parseStatus, setParseStatus] = useState(null)

  // localStorage から復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { transactions, unreadable } = JSON.parse(saved)
        setAllTransactions(transactions || [])
        setAllUnreadable(unreadable || [])
      } catch {}
    }
  }, [])

  // 変更時に localStorage へ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions: allTransactions,
      unreadable: allUnreadable,
    }))
  }, [allTransactions, allUnreadable])

  const handleParse = (text, fileName) => {
    const { readable, unreadable, format } = parseCSV(text, fileName)
    const categorized = categorizeAll(readable)

    if (readable.length === 0) {
      setParseStatus({ type: 'warn', msg: `「${fileName}」からデータを読み取れませんでした（フォーマット: ${format}）` })
    } else {
      setParseStatus({ type: 'ok', msg: `「${fileName}」から ${readable.length}件 を取り込みました` })
    }
    setTimeout(() => setParseStatus(null), 4000)

    setAllTransactions(prev => [...prev, ...categorized])
    setAllUnreadable(prev => [...prev, ...unreadable])
  }

  const handleClear = () => {
    setAllTransactions([])
    setAllUnreadable([])
    localStorage.removeItem(STORAGE_KEY)
    setParseStatus(null)
  }

  const groups = groupByYearMonth(allTransactions)
  const months = sortedYearMonths(groups)

  return (
    <div className="app">
      <header className="app-header">
        <h1>カード明細家計簿</h1>
        <p>カード明細CSVを取り込むだけで月別・カテゴリ別に自動集計</p>
      </header>

      <main className="app-main">
        <InputArea
          onParse={handleParse}
          onClear={handleClear}
          totalCount={allTransactions.length}
        />

        {/* 取込結果メッセージ */}
        {parseStatus && (
          <p className={`parse-status parse-status--${parseStatus.type}`}>
            {parseStatus.msg}
          </p>
        )}

        {/* Excel ダウンロード */}
        {allTransactions.length > 0 && (
          <div className="export-row">
            <button
              className="btn-export"
              onClick={() => exportToExcel(allTransactions, allUnreadable)}
            >
              Excelファイルをダウンロード
            </button>
          </div>
        )}

        {/* 年月別セクション（新しい月が上） */}
        {months.map(ym => (
          <MonthlySection
            key={ym}
            yearMonth={ym}
            transactions={groups[ym]}
          />
        ))}

        {/* 読み取れなかった行 */}
        {allUnreadable.length > 0 && (
          <UnreadableTable rows={allUnreadable} />
        )}
      </main>
    </div>
  )
}
