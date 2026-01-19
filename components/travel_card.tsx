"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, MapPin, Sparkles, Clock, Info, Globe, ExternalLink } from "lucide-react"

interface TravelPlace {
    name: string
    description: string
    suitability: string
    details: string
    imageSearchQuery: string
    website?: string
    mapsUrl?: string
}

interface TravelCardProps {
    place: TravelPlace
    language: string
}

export function TravelCard({ place, language }: TravelCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <Card className="overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300">
            <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-lg text-foreground">{place.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        <Sparkles className="w-3 h-3" />
                        {language === "ja-JP" ? "おすすめ" : "Best Fit"}
                    </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {place.description}
                </p>

                <div className="p-3 bg-muted/50 rounded-xl border border-border/50 mb-4">
                    <p className="text-xs font-medium text-foreground flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary" />
                        {place.suitability}
                    </p>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                >
                    {isExpanded ? (
                        <>
                            {language === "ja-JP" ? "詳細を閉じる" : "Hide Details"}
                            <ChevronUp className="w-3 h-3" />
                        </>
                    ) : (
                        <>
                            {language === "ja-JP" ? "詳細を見る" : "View Details"}
                            <ChevronDown className="w-3 h-3" />
                        </>
                    )}
                </button>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-5 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Info className="w-3 h-3" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {language === "ja-JP" ? "詳しい情報" : "Detailed Info"}
                                </p>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {place.details}
                                </p>
                            </div>
                        </div>

                        {(place.website || place.mapsUrl) && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {place.website && (
                                    <a
                                        href={place.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold transition-colors border border-border"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        {language === "ja-JP" ? "ウェブサイト" : "Website"}
                                    </a>
                                )}
                                {place.mapsUrl && (
                                    <a
                                        href={place.mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-xs font-semibold transition-all shadow-sm"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        {language === "ja-JP" ? "Google マップ" : "Google Maps"}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}
