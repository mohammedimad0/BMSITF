'use client'

import { useState, useCallback, useEffect } from 'react'
import { StudentPrefs } from '@/lib/types'
import { getStudentPrefs, saveStudentPrefs, resetStudentPrefs } from '@/lib/storage'

export function useAccessibility() {
    const [prefs, setPrefs] = useState<StudentPrefs>({
        font: 'opendyslexic',
        fontSize: 18,
        lineHeight: 1.8,
        letterSpacing: 0.05,
        background: 'cream',
        showRuler: true,
        ttsSpeed: 1,
        ttsAutoPlay: false,
    })
    const [mounted, setMounted] = useState(false)

    // Load preferences from localStorage on mount
    useEffect(() => {
        const loaded = getStudentPrefs()
        setPrefs(loaded)
        applyPrefsToDOM(loaded)
        setMounted(true)
    }, [])

    const updatePref = useCallback(
        <K extends keyof StudentPrefs>(key: K, value: StudentPrefs[K]) => {
            const updated = { ...prefs, [key]: value }
            setPrefs(updated)
            saveStudentPrefs(updated)
            applyPrefsToDOM(updated)
        },
        [prefs]
    )

    const reset = useCallback(() => {
        resetStudentPrefs()
        const defaults = getStudentPrefs()
        setPrefs(defaults)
        applyPrefsToDOM(defaults)
    }, [])

    return {
        prefs,
        updatePref,
        reset,
        mounted,
    }
}

function applyPrefsToDOM(prefs: StudentPrefs): void {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    // Font family
    const fontMap = {
        opendyslexic: "font-opendyslexic, 'OpenDyslexic', sans-serif",
        lexend: "font-lexend, 'Lexend', sans-serif",
        system: "system-ui, -apple-system, sans-serif",
    }
    root.style.setProperty('--font-family', fontMap[prefs.font])

    // Font size (in px)
    root.style.setProperty('--font-size', `${prefs.fontSize}px`)

    // Line height
    root.style.setProperty('--line-height', `${prefs.lineHeight}`)

    // Letter spacing (in em)
    root.style.setProperty('--letter-spacing', `${prefs.letterSpacing}em`)

    // Background colors
    const bgMap = {
        cream: '#FEF9F0',
        white: '#FFFFFF',
        blue: '#EFF6FF',
        dark: '#1a1a1a',
    }
    root.style.setProperty('--bg-color', bgMap[prefs.background])
    root.style.setProperty('--text-color', prefs.background === 'dark' ? '#E8E8E8' : '#2C2416')

    // Apply to body
    document.body.style.fontFamily = fontMap[prefs.font]
    document.body.style.fontSize = `${prefs.fontSize}px`
    document.body.style.lineHeight = `${prefs.lineHeight}`
    document.body.style.letterSpacing = `${prefs.letterSpacing}em`
    document.body.style.backgroundColor = bgMap[prefs.background]
    document.body.style.color = prefs.background === 'dark' ? '#E8E8E8' : '#2C2416'
}
