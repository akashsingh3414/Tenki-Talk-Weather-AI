"use client"

import { LanguageProvider } from "@/src/language_context"
import { AuthProvider } from "@/src/auth_context"
import { Header } from "@/components/header"

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-dvh flex flex-col overflow-hidden bg-white dark:bg-slate-950">
            <Header />
            {children}
        </div>
    )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <ClientLayoutContent>{children}</ClientLayoutContent>
            </LanguageProvider>
        </AuthProvider>
    )
}