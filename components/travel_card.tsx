"use client"

import React, { useState, useContext } from "react"
import { LanguageContext } from "@/lib/language_context"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, MapPin, Sparkles, Info, Globe } from "lucide-react"
import { type Language } from "@/lib/i18n"

import { type TravelPlace } from "@/lib/types"

interface TravelCardProps {
    place: TravelPlace
}

export function TravelCard({ place }: TravelCardProps) {
    const { dictionary } = useContext(LanguageContext)
    const [isExpanded, setIsExpanded] = useState(false)
    const labels = dictionary.travelCard

    return (
        <Card className="overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300 h-full flex flex-col">
            <div className="p-2 flex flex-col h-full">
                <div className="flex-1">
                    <div className="flex justify-between items-start gap-4 mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <MapPin className="w-3 h-3" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-foreground">{place.name}</h4>
                                {(place.day || place.timeOfDay) && (
                                    <p className="text-xs text-muted-foreground">
                                        {place.day && `Day ${place.day}`}
                                        {place.day && place.timeOfDay && " • "}
                                        {place.timeOfDay && `${place.timeOfDay}`}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            <Sparkles className="w-3 h-3" />
                            {place.weatherMatch}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {place.description}
                    </p>

                    <div className="p-2 bg-muted/50 rounded-xl border border-border/50 mb-2">
                        <p className="text-xs font-medium text-foreground flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary" />
                            {place.suitability}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                >
                    {isExpanded ? (
                        <>
                            {labels.hideDetails}
                            <ChevronUp className="w-3 h-3" />
                        </>
                    ) : (
                        <>
                            {labels.viewDetails}
                            <ChevronDown className="w-3 h-3" />
                        </>
                    )}
                </button>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-5 animate-in slide-in-from-top-2 duration-300">
                        {place.visitDuration && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Info className="w-3 h-3" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {labels.duration}
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {place.visitDuration}
                                    </p>
                                </div>
                            </div>
                        )}

                        {place.travelTip && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Info className="w-3 h-3" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {labels.travelTip}
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {place.travelTip}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Info className="w-3 h-3" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {labels.detailedInfo}
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
                                        {labels.website}
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
                                        {labels.googleMaps}
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
