import { useState } from 'react'

const PAGE_SIZE = 25

export default function TransactionTable({ transactions, showSource = false }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? transactions.filter(
        (t) =>
          t.merchant.includes(filter) ||
          t.category.includes(filter) ||
          t.date.includes(filter) ||
          (showSource && t.sourceFileName?.includes(filter)),
      )
    : transactions

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleFilter = (e) => {
    setFilter(e.target.value)
    setPage(0)
  }

  return (
    <div className="tx-section">
      <div className="section-head">
        <h3>明細一覧（{filtered.length}件）</h3>
        <input
          className="filter-input"
          type="text"
          placeholder="絞り込み..."
          value={filter}
          onChange={handleFilter}
        />
      </div>

      <div className="table-wrapper">
        <table className="tx-table">
          <thead>
            <tr>
              <th>利用日</th>
              <th>利用先</th>
              <th>金額</th>
              <th>カテゴリ</th>
              {showSource && <th>取込元</th>}
            </tr>
          </thead>
          <tbody>
            {slice.map((t, i) => (
              <tr key={i}>
                <td>{t.date}</td>
                <td>{t.merchant}</td>
                <td className="col-amount">¥{t.amount.toLocaleString('ja-JP')}</td>
                <td>
                  <span className={`badge badge-${t.category}`}>{t.category}</span>
                </td>
                {showSource && <td className="col-source">{t.sourceFileName}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            前へ
          </button>
          <span>
            {page + 1} / {pages}
          </span>
          <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
            次へ
          </button>
        </div>
      )}
    </div>
  )
}
