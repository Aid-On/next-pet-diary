import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateAIResponse(message: string) {
  const result = await generateText({
    model: openai('gpt-3.5-turbo'), // 使うAIモデル
    messages: [
      {
        role: 'system',
        content:
          'あなたは親切で優しいアシスタントです。日本語で丁寧に答えてください。',
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
