/**
 * カテゴリ判定ルール（上から順に評価し、最初に一致したカテゴリを使用）
 *
 * 優先順位:
 *   保険 → ゴルフ → 宿泊費 → AI関連 → ネット買い物
 *   → 交通費 → サブスク → 食費 → 日用品 → 買い物 → その他
 */
const RULES = [
  {
    category: '保険',
    keywords: ['保険'],
  },
  {
    category: 'ゴルフ',
    keywords: ['ゴルフ'],
  },
  {
    category: '宿泊費',
    keywords: ['ラクテントラベル', 'アゴダ', 'AGODA'],
  },
  {
    category: 'AI関連',
    keywords: ['AI', 'OPENAI', 'ANTHROPIC', 'CHATGPT', 'GEMINI', 'COPILOT', 'MIDJOURNEY', 'PERPLEXITY'],
  },
  {
    category: 'ネット買い物',
    // AMAZONは「買い物」より先にここで判定する
    keywords: ['AMAZON', 'アマゾン'],
  },
  {
    category: '交通費',
    keywords: [
      'JR', 'JAL', 'ANA', 'エーエヌエー',
      '地下鉄', 'バス', 'タクシー',
      '電鉄', '鉄道', 'メトロ', '急行', '特急',
      'SUICA', 'PASMO', 'PITAPA', 'ICOCA',
      '新幹線', '航空', 'エアライン', '空港',
    ],
  },
  {
    category: 'サブスク',
    keywords: [
      'NETFLIX', 'SPOTIFY', 'YOUTUBE',
      'APPLE', 'DISNEY', 'HULU', 'DTV', 'U-NEXT',
      'ADOBE', 'MICROSOFT', 'GOOGLE', 'DROPBOX',
      'NHK', 'プレミアム',
      'チョコザップ', 'アオバ', 'ノート',
    ],
  },
  {
    category: '食費',
    keywords: [
      'コンビニ', 'スーパー', 'レストラン',
      'セブン', 'ファミマ', 'ファミリーマート', 'ローソン', 'ミニストップ',
      'イオン', 'ライフ', '西友', 'マルエツ', 'サミット', 'ヨーカドー',
      'マクド', 'モスバーガー', 'ケンタッキー', 'KFC', 'すき家', '吉野家',
      '松屋', 'サイゼ', 'ガスト', 'デニーズ', 'ジョナサン',
      'スタバ', 'スターバックス', 'ドトール', 'コメダ', 'カフェ',
      '食品', 'フード', 'キッチン', 'ダイニング', 'ビストロ',
      'ラーメン', 'そば', 'うどん', 'ピザ', 'バーガー', '弁当',
    ],
  },
  {
    category: '日用品',
    keywords: [
      'ドラッグストア', 'ドラッグ',
      'マツキヨ', 'マツモトキヨシ', 'ウエルシア', 'ウェルシア',
      'ツルハ', 'サンドラッグ', 'コスモス', 'カワチ', 'スギ薬局',
      'くすり', '薬局', '薬店', '調剤',
      'ドンキ', 'ドン・キホーテ',
      'ホームセンター', 'コーナン', 'カインズ', 'ナフコ',
    ],
  },
  {
    category: '買い物',
    keywords: [
      '楽天', 'RAKUTEN', 'YAHOO', 'ヤフー', 'ZOZOTOWN', 'ゾゾ', 'メルカリ',
    ],
  },
]

/**
 * 店名からカテゴリを判定する
 * - normalize('NFKC') で全角→半角に変換
 * - toUpperCase() で大文字に統一
 * → amazon / Amazon / AMAZON / ＡＭＡＺＯＮ はすべて同じ扱い
 */
export function categorize(merchant) {
  const normalized = merchant.normalize('NFKC').toUpperCase()
  for (const rule of RULES) {
    if (rule.keywords.some(kw => normalized.includes(kw.toUpperCase()))) {
      return rule.category
    }
  }
  return 'その他'
}

export function categorizeAll(transactions) {
  return transactions.map(t => ({ ...t, category: categorize(t.merchant) }))
}
