export interface TempColorStyle {
    bg: string
    border: string
    text: string
    accent: string
}

export function getTempColor(temp: number | undefined): TempColorStyle {
    const defaultStyle: TempColorStyle = {
        bg: "bg-slate-100 dark:bg-slate-800",
        border: "border-slate-300 dark:border-slate-700",
        text: "text-slate-700 dark:text-slate-300",
        accent: "bg-blue-600",
    }

    if (temp === undefined) return defaultStyle

    if (temp < 0) {
        return {
            bg: "bg-sky-400 dark:bg-sky-600",
            border: "border-sky-300 dark:border-sky-500",
            text: "text-white",
            accent: "bg-white",
        }
    }

    if (temp < 15) {
        return {
            bg: "bg-blue-500 dark:bg-blue-700",
            border: "border-blue-400 dark:border-blue-600",
            text: "text-white",
            accent: "bg-white",
        }
    }

    if (temp < 25) {
        return {
            bg: "bg-emerald-500 dark:bg-emerald-700",
            border: "border-emerald-400 dark:border-emerald-600",
            text: "text-white",
            accent: "bg-white",
        }
    }

    if (temp < 32) {
        return {
            bg: "bg-orange-500 dark:bg-orange-700",
            border: "border-orange-400 dark:border-orange-600",
            text: "text-white",
            accent: "bg-white",
        }
    }

    return {
        bg: "bg-rose-500 dark:bg-rose-700",
        border: "border-rose-400 dark:border-rose-600",
        text: "text-white",
        accent: "bg-white",
    }
}
