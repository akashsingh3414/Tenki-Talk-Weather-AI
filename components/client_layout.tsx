"use client"

import { LanguageProvider } from "@/lib/language_context"
import { Header } from "@/components/header"

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">
            <Header />
            {children}
        </div>
    )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <ClientLayoutContent>{children}</ClientLayoutContent>
        </LanguageProvider>
    )
}