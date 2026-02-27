"use client"

import { LanguageContext } from "@/lib/language_context"
import { useContext } from "react"
import Image, { StaticImageData } from "next/image"

interface HeroSectionProps {
    logo: StaticImageData;
}

export function HeroSection({ logo }: HeroSectionProps) {
    const { dictionary } = useContext(LanguageContext)
    const localHero = dictionary.home.hero
    return (
        <div className="flex flex-col items-center justify-start py-8 lg:py-12">
            <div className="w-full max-w-5xl space-y-6">
                <div className="text-center gap-4 flex items-center justify-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-slate-900 transition-transform hover:scale-105 duration-300">
                            <Image
                                src={logo}
                                alt="Tenki Talk Logo"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {localHero.title}
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
                            {localHero.description}
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3 pt-4">
                    {localHero.details.map((detail: string, i: number) => (
                        <div key={i} className="flex gap-3 text-lg text-slate-700 dark:text-slate-300 leading-relaxed items-start">
                            <span className="flex-none font-bold text-blue-600 dark:text-blue-400 text-xl">
                                {i + 1}
                            </span>
                            <p className="font-normal tracking-tight">{detail}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
