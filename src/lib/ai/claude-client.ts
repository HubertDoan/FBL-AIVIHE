import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-sonnet-4-20250514'

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY chưa được cấu hình.')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

/**
 * Call Claude with a base64-encoded image for OCR / vision tasks.
 * Uses claude-sonnet for cost-effective processing.
 */
export async function callClaudeVision(
  imageBase64: string,
  mimeType: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = getClient()

  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as const
  type ImageMediaType = (typeof validTypes)[number]

  if (!validTypes.includes(mimeType as ImageMediaType)) {
    throw new Error(
      `Định dạng ảnh không hỗ trợ: ${mimeType}. Chỉ hỗ trợ JPEG, PNG, GIF, WebP.`
    )
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as ImageMediaType,
              data: imageBase64,
            },
          },
          { type: 'text', text: userPrompt },
        ],
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Không nhận được phản hồi văn bản từ Claude.')
  }

  return textBlock.text
}

/**
 * Call Claude for text-only generation (summaries, visit prep, etc.).
 */
export async function callClaudeText(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = getClient()

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Không nhận được phản hồi văn bản từ Claude.')
  }

  return textBlock.text
}
