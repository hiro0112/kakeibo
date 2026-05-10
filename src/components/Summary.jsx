const fmt = (n) => '¥' + n.toLocaleString('ja-JP')

export default function Summary({ transactions }) {
  const total = transactions.reduce((s, t) => s + t.amount, 0)

  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})

  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <>
      <div className="total-card">
        <h2>支出合計</h2>
        <p className="total-amount">{fmt(total)}</p>
        <p className="tx-count">{transactions.length}件</p>
      </div>

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
    </>
  )
}
