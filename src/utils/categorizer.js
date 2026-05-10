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
    keywords: ['OPENAI', 'ANTHROPIC', 'CHATGPT', 'CLAUDE', 'GEMINI', 'COPILOT', 'MIDJOURNEY', 'PERPLEXITY'],
  },
  {
    category: 'ネット買い物',
    keywords: ['Amazon', 'アマゾン', 'AMAZON'],
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
    category: '交通費',
    keywords: [
      'JR', '地下鉄', 'バス', 'タクシー',
      '電鉄', '鉄道', 'メトロ', '急行', '特急',
      'Suica', 'PASMO', 'PiTaPa', 'ICOCA',
      '新幹線', '航空', 'エアライン', '空港',
      'JAL', 'ANA', 'エーエヌエー',
    ],
  },
  {
    category: 'サブスク',
    keywords: [
      'Netflix', 'NETFLIX',
      'Spotify', 'SPOTIFY',
      'YouTube', 'YOUTUBE',
      'Apple', 'Disney', 'Hulu', 'dTV', 'U-NEXT',
      'Adobe', 'Microsoft', 'Google', 'Dropbox',
      'NHK', 'プレミアム',
      'チョコザップ', 'アオバ', 'ノート',
    ],
  },
  {
    category: '買い物',
    keywords: [
      '楽天', 'Rakuten', 'RAKUTEN',
      'Yahoo', 'ヤフー', 'ZOZOTOWN', 'ゾゾ', 'メルカリ',
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
]

/**
 * 店名からカテゴリを判定する
 */
export function categorize(merchant) {
  const upper = merchant.toUpperCase()
  for (const rule of RULES) {
    if (rule.keywords.some(kw => upper.includes(kw.toUpperCase()))) {
      return rule.category
    }
  }
  return 'その他'
}

export function categorizeAll(transactions) {
  return transactions.map(t => ({ ...t, category: categorize(t.merchant) }))
}
