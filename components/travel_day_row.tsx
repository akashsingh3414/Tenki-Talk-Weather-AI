"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TravelCard } from "@/components/travel_card"
import { type Language } from "@/lib/i18n"
import { TravelPlace } from "@/lib/types"

interface TravelDayRowProps {
    day: string
    dayPlaces: TravelPlace[]
}

export function TravelDayRow({ day, dayPlaces }: TravelDayRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(false)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 10)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [dayPlaces])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                    Day {day}
                </span>
                <div className="h-px flex-1 bg-border/50" />
            </div>

            <div className="relative group/scroll">
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground transition-all hover:bg-background hover:scale-110 active:scale-95 pointer-events-auto"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex overflow-x-auto pb-4 gap-4 -mx-6 px-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                >
                    {dayPlaces.map((place, idx) => (
                        <div
                            key={idx}
                            className="min-w-[75%] sm:min-w-[40%] flex-shrink-0 snap-start flex first:ml-0"
                            style={{ width: 'calc((100% - 32px) / 2.5)' }}
                        >
                            <TravelCard place={place} />
                        </div>
                    ))}
                </div>

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center text-foreground transition-all hover:bg-background hover:scale-110 active:scale-95 pointer-events-auto"
                    >
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}
