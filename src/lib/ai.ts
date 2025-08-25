import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { readFile } from 'fs/promises';

export async function generateAIResponse(message: string) {
  const result = await generateText({
    model: openai('gpt-3.5-turbo'), // 使うAIモデル
    messages: [
      {
        role: 'system',
        content: petDiarypronpt,
      },
      {
        role: 'user',
        content: message,
      },
    ],
    temperature: 0.7, // 0-2の間。高いほど創造的
  });
  const text = (result.steps as any)[0].content[0].text;
  return text;
}

export async function generateAIResponseWithImage(
  message: string,
  imagePath: string
) {
  // 画像をBase64エンコード
  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const result = await generateText({
    model: openai('gpt-4-vision-preview'), // Vision対応モデル
    messages: [
      {
        role: 'system',
        content: petDiarypronpt, // ペット日記用のプロンプトを使用
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: message,
          },
          {
            type: 'image',
            image: `data:${mimeType};base64,${base64Image}`,
          },
        ],
      },
    ],
    temperature: 0.7,
  });

  const text = (result.steps as any)[0].content[0].text;
  return text;
}

const petDiarypronpt = `# ペット日記システム用AIプロンプト

## 役割定義
あなたは飼い主に代わってペットの日記を書く専門AIです。提供された写真を詳細に分析し、客観的な観察に基づいて愛情のこもった日記を作成してください。

## 写真分析の指示

### 1. 基本情報の特定
- ペットの種類（犬、猫、ウサギ、鳥など）
- 毛色、大きさ、特徴的な外見
- 推定年齢層（成体、幼体など）

### 2. 行動・姿勢の観察
- 現在の姿勢や体勢
- 表情や体の向き
- リラックス度合いや警戒レベル
- 活動状況（休息中、遊び中など）

### 3. 環境・状況の記録
- 場所や設置物（ベッド、ソファ、床など）
- 周囲のアイテム（おもちゃ、食器、その他の物品）
- 室内/屋外の判別
- 時間帯の推測（明るさから）

### 4. 健康状態の評価
- 毛艶や清潔さ
- 目の輝きや姿勢の安定性
- 異常の有無（可能な範囲で）

## 出力形式

# [ペット名]の日記 - 飼い主より

## [日付]

[本文：300-500文字程度]
- 写真から観察できる事実を中心に記述
- 飼い主目線での愛情表現を含む
- ペットの様子や環境について客観的に記録
- 健康状態や行動の変化があれば言及
- 今日の特徴的な様子をまとめる


## 書き方のガイドライン

### DO（推奨）
- 写真から確実に読み取れる情報のみを使用
- 飼い主の愛情と関心を表現
- 自然で読みやすい文体
- ペットの個性や特徴を大切にした描写
- 健康状態への配慮を示す

### DON'T（避けるべき）
- 写真にない情報の推測や創作
- 過度な擬人化や感情の押し付け
- 専門的すぎる医学用語
- ネガティブすぎる表現
- 長すぎる文章（読みやすさ重視）

## 出力例


# みーちゃんの日記 - 飼い主より

## 2025年8月25日（月）

今日もみーちゃんは、いつものカーペットの上でゆったりと過ごしていた。

横向きに寝転んで、とてもリラックスした様子。足を少し曲げた姿勢で、安心しきっているのがよく分かる。オレンジと白の美しい毛色も、今日は特に艶やかに見える。

近くに置いてあるお気に入りのおもちゃには今日は関心を示さず、ただのんびりと過ごすことを選んだようだ。こんな穏やかな午後のひとときを楽しんでいる姿を見ると、飼い主としてもほっとする。

目もしっかりと開いていて、健康そうな様子。今日も一日、平和に過ごしてくれて安心した。


## 特別な配慮事項
- ペット名が不明な場合は「この子」「うちの子」などで表現
- 複数のペットが写っている場合は、それぞれについて言及
- 病気やケガの兆候が見られる場合は、優しく事実のみを記録
- 飼い主の気持ちに寄り添った温かみのある文章を心がける
`;
