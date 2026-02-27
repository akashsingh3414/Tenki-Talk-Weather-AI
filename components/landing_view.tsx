"use client"

import { Button } from "@/components/ui/button"
import { HeroSection } from "./hero_section"
import { StaticImageData } from "next/image"

interface LandingViewProps {
    logo: StaticImageData;
    user: any;
    onLogin: () => void;
}

export function LandingView({ logo, user, onLogin }: LandingViewProps) {
    return (
        <div className="flex flex-col min-h-full">
            <HeroSection logo={logo} />
            {!user && (
                <div className="flex flex-col items-center justify-center pb-4 pt-1 lg:pt-2 transition-opacity duration-300">
                    <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 py-3.5 px-8 rounded-2xl backdrop-blur-xl max-w-4xl mx-4 flex flex-col gap-1.5 ring-1 ring-slate-900/5 dark:ring-white/10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight italic">Ready to plan your trip?</h2>
                            <Button
                                onClick={onLogin}
                                variant="outline"
                                className="h-10 rounded-xl px-5 cursor-pointer text-sm font-medium border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors active:scale-95 flex items-center justify-center gap-2.5 w-full sm:w-auto"
                            >
                                <svg className="w-5 h-5 flex-none overflow-visible" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    <path fill="none" d="M0 0h48v48H0z" />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
