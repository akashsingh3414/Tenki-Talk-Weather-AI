"use client"

import { RefObject } from "react"
import { ChatMessage } from "./chat_message"
import Image, { StaticImageData } from "next/image"
import { Language } from "@/lib/i18n"
import { Message } from "@/lib/types"

interface ChatDisplayProps {
    messages: Message[]
    isLoading: boolean
    language: Language
    messagesEndRef: RefObject<HTMLDivElement | null>
    logo: StaticImageData
}

export function ChatDisplay({ messages, isLoading, language, messagesEndRef, logo }: ChatDisplayProps) {
    return (
        <div className="space-y-6 py-6 max-w-5xl mx-auto">
            {messages.map((m) => (
                <ChatMessage key={m.id} message={m} language={language} />
            ))}
            {isLoading && (
                <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-3 w-[90%] mx-auto flex-row">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner">
                            <Image
                                src={logo}
                                alt="AI"
                                width={36}
                                height={36}
                                className="object-cover animate-pulse"
                            />
                        </div>
                        <div className="rounded-2xl px-6 py-4 border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            <div className="flex gap-1.5 order-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    )
}
