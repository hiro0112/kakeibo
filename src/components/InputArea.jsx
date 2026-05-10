import { useState, useRef } from 'react'

async function decodeFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const buf = e.target.result
      const bytes = new Uint8Array(buf)
      // UTF-8 BOM があれば UTF-8、なければ Shift-JIS として扱う
      if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        resolve(new TextDecoder('utf-8').decode(buf))
      } else {
        resolve(new TextDecoder('shift-jis').decode(buf))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export default function InputArea({ onParse, onClear, totalCount }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  // ファイル選択 → デコード後すぐ解析（複数ファイル対応）
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setError('')
    for (const file of files) {
      const decoded = await decodeFile(file)
      onParse(decoded, file.name)
    }
    e.target.value = ''
  }

  // テキスト貼り付けから解析
  const handleParseText = () => {
    if (!text.trim()) {
      setError('CSVテキストを入力してください')
      return
    }
    setError('')
    onParse(text, 'テキスト貼り付け')
    setText('')
  }

  return (
    <section className="input-area">
      <div className="input-area-head">
        <h2>明細を入力</h2>
        {totalCount > 0 && (
          <div className="loaded-info">
            <span>取込済：{totalCount}件</span>
            <button className="btn-clear-inline" onClick={onClear}>クリア</button>
          </div>
        )}
      </div>

      {/* ファイル選択 */}
      <div className="input-controls">
        <button className="btn-file" onClick={() => fileRef.current.click()}>
          CSVファイルを選択（複数可）
        </button>
        <input
          type="file"
          accept=".csv,.txt"
          multiple
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
        <span className="file-hint">選択後すぐに取り込まれます</span>
      </div>

      {/* テキスト貼り付け */}
      <p className="paste-label">または、以下にCSVテキストを貼り付け</p>
      <textarea
        className="csv-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにカード明細のCSVテキストを貼り付けてください..."
      />
      {error && <p className="input-error">{error}</p>}
      <button className="btn-parse" onClick={handleParseText}>
        テキストを解析
      </button>
    </section>
  )
}
