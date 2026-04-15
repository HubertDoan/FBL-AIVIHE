'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquareMore, X, Send, Loader2, Sparkles } from 'lucide-react'

/**
 * Floating AI chat button — fixed bottom-right
 * Click → mở panel chatbot cạnh bên
 * Chat với AI về sức khỏe; AI có context từ hồ sơ y tế của user
 */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_GREETING: ChatMessage = {
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý AI sức khỏe của AIVIHE. Tôi có thể giúp gì cho bạn hôm nay?\n\nVí dụ:\n• Huyết áp hôm nay của tôi có ổn không?\n• HbA1c 6.8% có cao không?\n• Tôi nên ăn gì để kiểm soát tiểu đường?\n\n⚠️ Tôi không chẩn đoán bệnh và không thay thế bác sĩ.',
}

const QUICK_QUESTIONS = [
  'Huyết áp của tôi có ổn không?',
  'HbA1c 6.8% có cao không?',
  'Tôi nên ăn gì cho tiểu đường?',
  'Đau khớp gối phải làm sao?',
]

export function FloatingAiChatButtonWithPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = await res.json()
      const reply: ChatMessage = {
        role: 'assistant',
        content: data.ok && data.reply ? data.reply : (data.error || 'Không nhận được phản hồi'),
      }
      setMessages([...nextMessages, reply])
    } catch {
      setMessages([...nextMessages, { role: 'assistant', content: '❌ Lỗi kết nối. Vui lòng thử lại.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg flex items-center justify-center transition hover:scale-105"
        aria-label="Mở AI Chat"
      >
        <MessageSquareMore className="size-6" />
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-red-500 border-2 border-white" />
      </button>
    )
  }

  return (
    <div className="fixed inset-x-0 bottom-0 md:inset-auto md:bottom-6 md:right-6 md:w-96 z-50 md:max-h-[600px] md:rounded-2xl md:shadow-2xl flex flex-col bg-white border border-gray-200 max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white md:rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="font-bold text-sm">AI Trợ lý sức khỏe</p>
            <p className="text-xs opacity-90">AIVIHE by Thong Dong Tech</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin" /> AI đang trả lời...
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div className="space-y-1.5 pt-2">
            <p className="text-xs text-gray-500">Câu hỏi gợi ý:</p>
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs text-left block w-full px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-gray-700 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={e => { e.preventDefault(); sendMessage(input) }}
        className="flex items-center gap-2 p-2 border-t border-gray-200"
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Hỏi AI về sức khỏe của bạn..."
          disabled={loading}
          className="flex-1 text-sm"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-teal-600 hover:bg-teal-700 shrink-0">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
          isUser
            ? 'bg-teal-600 text-white rounded-br-sm'
            : 'bg-slate-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
