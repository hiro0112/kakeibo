export default function UnreadableTable({ rows }) {
  return (
    <section className="unreadable-section">
      <div className="section-head">
        <h2>読み取れなかった行（{rows.length}件）</h2>
      </div>
      <p className="unreadable-note">これらの行はExcelの「読み取れなかった行」シートにも出力されます。</p>
      <div className="table-wrapper">
        <table className="unreadable-table">
          <thead>
            <tr>
              <th>行の内容</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="unreadable-row">{row}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
