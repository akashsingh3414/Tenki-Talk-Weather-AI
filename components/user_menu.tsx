"use client"

import { useAuth } from "@/lib/auth_context"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User as UserIcon } from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"

export function UserMenu() {
    const { user, login, logout, loading } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (loading) return <div className="w-9 h-9 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-full" />

    if (!user) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={login}
                className="gap-2 rounded-xl px-4 cursor-pointer border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                <LogIn size={16} />
                <span className="hidden sm:inline">Sign In</span>
            </Button>
        )
    }

    return (
        <div className="relative" ref={menuRef}>
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col items-end hidden sm:flex active:opacity-80 transition-opacity">
                    <span className="text-sm font-semibold leading-none">{user.displayName}</span>
                    <span className="text-[10px] text-muted-foreground">{user.email}</span>
                </div>

                <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 transition-transform active:scale-95">
                        {user.photoURL ? (
                            <Image
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <UserIcon size={20} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1 transition-all duration-200 origin-top-right z-[1001] ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}>
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                    <p className="text-sm font-semibold truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <button
                    onClick={() => {
                        logout()
                        setIsOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm cursor-pointer text-red-600 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-lg"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
