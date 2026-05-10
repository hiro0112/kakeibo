import { useState, useRef } from 'react'

async function decodeFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const buf = e.target.result
      const bytes = new Uint8Array(buf)
      // UTF-8 BOM (EF BB BF) があればUTF-8、なければShift-JISとして扱う
      if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        resolve(new TextDecoder('utf-8').decode(buf))
      } else {
        resolve(new TextDecoder('shift-jis').decode(buf))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export default function InputArea({ onParse }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const decoded = await decodeFile(file)
    setText(decoded)
    setError('')
    e.target.value = ''  // 同じファイルを再選択できるようにリセット
  }

  const handleParse = () => {
    if (!text.trim()) {
      setError('CSVテキストを入力するか、ファイルを選択してください')
      return
    }
    setError('')
    onParse(text)
  }

  return (
    <section className="input-area">
      <h2>明細を入力</h2>
      <div className="input-controls">
        <button className="btn-file" onClick={() => fileRef.current.click()}>
          CSVファイルを選択
        </button>
        <input
          type="file"
          accept=".csv,.txt"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <span className="or">または</span>
        <span className="hint">以下にCSVテキストを貼り付け</span>
      </div>
      <textarea
        className="csv-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにカード明細のCSVテキストを貼り付けてください..."
      />
      {error && <p className="input-error">{error}</p>}
      <button className="btn-parse" onClick={handleParse}>
        解析する
      </button>
    </section>
  )
}
