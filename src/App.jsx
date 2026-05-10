import { useState, useEffect } from 'react'
import InputArea from './components/InputArea'
import Summary from './components/Summary'
import TransactionTable from './components/TransactionTable'
import UnreadableTable from './components/UnreadableTable'
import { parseCSV } from './utils/csvParser'
import { categorizeAll } from './utils/categorizer'
import { exportToExcel } from './utils/excelExporter'
import './App.css'

const STORAGE_KEY = 'kakeibo_data_v1'

export default function App() {
  const [result, setResult] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setResult(JSON.parse(saved)) } catch {}
    }
  }, [])

  const handleParse = (text) => {
    const { readable, unreadable, format } = parseCSV(text)
    const transactions = categorizeAll(readable)
    const data = { transactions, unreadable, format }
    setResult(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const handleClear = () => {
    setResult(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>カード明細家計簿</h1>
        <p>カード明細CSVを貼り付けるだけで支出を自動集計</p>
      </header>
      <main className="app-main">
        <InputArea onParse={handleParse} />

        {result && (
          <>
            {result.format === 'unknown' && (
              <p className="format-warn">
                CSVフォーマットを自動判別できませんでした。対応フォーマットかご確認ください。
              </p>
            )}

            {result.transactions.length > 0 && (
              <>
                <Summary transactions={result.transactions} />
                <div className="export-row">
                  <button className="btn-export" onClick={() => exportToExcel(result.transactions, result.unreadable)}>
                    Excelファイルをダウンロード
                  </button>
                  <button className="btn-clear" onClick={handleClear}>
                    クリア
                  </button>
                </div>
                <TransactionTable transactions={result.transactions} />
              </>
            )}

            {result.unreadable.length > 0 && (
              <UnreadableTable rows={result.unreadable} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
