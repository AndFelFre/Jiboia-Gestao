'use client'

import { useState, useRef, useEffect } from 'react'
import { askCultureAssistant } from '@/app/actions/ai-assistant'
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    User,
    Bot,
    ChevronDown,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

export function CultureAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Sou o assistente de Cultura & Onboarding do RG Digital. Como posso te ajudar hoje? (Ex: benefícios, valores, primeiro dia)',
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        const res = await askCultureAssistant({ question: input })

        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: res.success && res.data ? (res.data.answer || 'Sem resposta') : 'Desculpe, tive um problema técnico. Tente novamente mais tarde.',
            sender: 'bot',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, botMsg])
        setIsLoading(false)
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-sans">
            {/* Botão Flutuante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group animate-bounce-slow"
                >
                    <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] font-bold">1</span>
                    </div>
                </button>
            )}

            {/* Janela de Chat */}
            {isOpen && (
                <div className="w-[380px] h-[550px] bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    {/* Header */}
                    <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Guia de Cultura</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IA Inteligente</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100'
                                        }`}>
                                        {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${m.sender === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100/50'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center shadow-sm">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white border border-slate-100/50 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-xs text-slate-400 italic">Digitando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-white border-t border-slate-50">
                        <div className="relative">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte sobre benefícios..."
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:shadow-lg active:scale-95 transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-center text-[9px] text-slate-400 font-medium mt-3 uppercase tracking-tighter">Respostas baseadas nos manuais do colaborador</p>
                    </div>
                </div>
            )}
        </div>
    )
}
