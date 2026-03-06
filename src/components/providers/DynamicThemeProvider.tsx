'use client'

import { useEffect, useMemo } from 'react'

interface ThemeSettings {
    primary?: string
    primary_foreground?: string
    logo_url?: string
}

interface DynamicThemeProviderProps {
    settings?: {
        theme?: ThemeSettings
    }
    children: React.ReactNode
}

export function DynamicThemeProvider({ settings, children }: DynamicThemeProviderProps) {
    const theme = settings?.theme

    // Gera o CSS injection
    useEffect(() => {
        if (!theme?.primary) return

        const root = document.documentElement

        // Cores Primárias
        root.style.setProperty('--primary', hexToHsl(theme.primary))

        if (theme.primary_foreground) {
            root.style.setProperty('--primary-foreground', hexToHsl(theme.primary_foreground))
        } else {
            // Auto-calcula contraste (Simplified)
            root.style.setProperty('--primary-foreground', '0 0% 100%')
        }

        // Você pode adicionar mais variáveis aqui conforme necessário
        // Ex: --ring, --outline, etc.

    }, [theme])

    return <>{children}</>
}

/**
 * Converte Hex para HSL no formato aceito pelo Tailwind (H S% L%)
 * Ex: #3B82F6 -> 217 91% 60%
 */
function hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16)
        g = parseInt(hex[2] + hex[2], 16)
        b = parseInt(hex[3] + hex[3], 16)
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16)
        g = parseInt(hex.substring(3, 5), 16)
        b = parseInt(hex.substring(5, 7), 16)
    }

    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}
