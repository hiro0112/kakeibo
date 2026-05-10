import TransactionTable from './TransactionTable'
import { formatYearMonth } from '../utils/grouper'

const fmt = (n) => '¥' + n.toLocaleString('ja-JP')

export default function MonthlySection({ yearMonth, transactions }) {
  const total = transactions.reduce((s, t) => s + t.amount, 0)
  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <section className="monthly-section">
      {/* 月ヘッダー */}
      <div className="monthly-header">
        <h2 className="monthly-title">{formatYearMonth(yearMonth)}</h2>
        <div className="monthly-meta">
          <span className="monthly-total">{fmt(total)}</span>
          <span className="monthly-count">{transactions.length}件</span>
        </div>
      </div>

      {/* カテゴリ別合計 */}
      <div className="monthly-body">
        <p className="categories-title">カテゴリ別合計</p>
        <div className="category-grid">
          {categories.map(([cat, amt]) => (
            <div key={cat} className="category-card">
              <span className="cat-name">{cat}</span>
              <span className="cat-amount">{fmt(amt)}</span>
              <span className="cat-pct">{((amt / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>

        {/* 明細一覧 */}
        <TransactionTable transactions={transactions} showSource />
      </div>
    </section>
  )
}
