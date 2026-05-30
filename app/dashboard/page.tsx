"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AccessibilityToolbar from '../../components/personalize/AccessibilityToolbar'
import GardenProgress from '../../components/personalize/GardenProgress'
import AICompanion from '../../components/personalize/AICompanion'
import BreathingExercise from '../../components/personalize/BreathingExercise'
import { computeDashboard, BehaviorMetrics, DashboardData, ProfileKey } from '../../lib/aiSimulator'
import { useAccessibility } from '../../hooks/useAccessibility'
import { ambientSynth } from '../../lib/ambientSynth'

export default function DashboardPage() {
    const { prefs } = useAccessibility()
    
    // Basic Profile & Metrics
    const [profile, setProfile] = useState<ProfileKey>('dyslexia')
    const [metrics, setMetrics] = useState<BehaviorMetrics>({
        attentionSpanSec: 120,
        readingWpm: 140,
        focusDurationSec: 300,
        mistakesPerQuiz: 1,
        recentStress: 0.3,
        completedLessons: 2,
        focusCoins: 25,
        xpPoints: 120
    })
    const [data, setData] = useState<DashboardData | null>(null)

    // Workspace & Support States
    const [activeTab, setActiveTab] = useState<'read' | 'quiz'>('read')
    const [isOverwhelmed, setIsOverwhelmed] = useState(false)
    const [isOneTaskAtATime, setIsOneTaskAtATime] = useState(false)
    const [mood, setMood] = useState<string>('focused')
    const [unlockedThemes, setUnlockedThemes] = useState<string[]>(['Default'])
    const [activeAmbiance, setActiveAmbiance] = useState<string>('Silence')

    // Pomodoro Timer States
    const [timerDuration, setTimerDuration] = useState(300) // 5m default
    const [timerLeft, setTimerLeft] = useState(300)
    const [timerActive, setTimerActive] = useState(false)

    // Reading & Quiz States
    const [isSimplified, setIsSimplified] = useState(true)
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
    const [quizChecked, setQuizChecked] = useState<Record<string, boolean>>({})
    const [ttsActive, setTtsActive] = useState(false)
    const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null)
    const [ttsWordIndex, setTtsWordIndex] = useState(-1)
    const [rulerTop, setRulerTop] = useState(60)

    // Parent/Teacher Panel State
    const [showTeacherPanel, setShowTeacherPanel] = useState(false)

    // Sync metrics and compute dashboard data
    useEffect(() => {
        const storedProfile = localStorage.getItem('neuroadapt_profile') as ProfileKey | null
        if (storedProfile) {
            setProfile(storedProfile)
        }
        const storedMetrics = localStorage.getItem('neuroadapt_behavior_metrics')
        if (storedMetrics) {
            try {
                setMetrics(JSON.parse(storedMetrics))
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    useEffect(() => {
        setData(computeDashboard(profile, metrics))
    }, [profile, metrics])

    // Pomodoro Clock Ticker
    useEffect(() => {
        let clock: NodeJS.Timeout
        if (timerActive && timerLeft > 0) {
            clock = setInterval(() => {
                setTimerLeft((t) => t - 1)
            }, 1000)
        } else if (timerLeft === 0 && timerActive) {
            setTimerActive(false)
            // Reward for completing focus timer
            addXP(50, 10)
            alert("⏰ Wonderful focus session completed! You earned +50 XP and +10 Focus Coins!")
        }
        return () => clearInterval(clock)
    }, [timerActive, timerLeft])

    // Sound Ambiance synthesiser sync
    useEffect(() => {
        if (ambientSynth) {
            ambientSynth.play(activeAmbiance as any)
        }
        return () => {
            if (ambientSynth) {
                ambientSynth.stop()
            }
        }
    }, [activeAmbiance])

    // Helper functions for scoring
    const addXP = (xpAmount: number, coinAmount: number) => {
        setMetrics((prev) => {
            const updated = {
                ...prev,
                xpPoints: prev.xpPoints + xpAmount,
                focusCoins: prev.focusCoins + coinAmount,
                completedLessons: prev.completedLessons + 1
            }
            localStorage.setItem('neuroadapt_behavior_metrics', JSON.stringify(updated))
            return updated
        })
    }

    const resetTimer = (durationSec: number) => {
        setTimerDuration(durationSec)
        setTimerLeft(durationSec)
        setTimerActive(false)
    }

    const handleBuyTheme = (themeName: string, cost: number) => {
        if (metrics.focusCoins >= cost && !unlockedThemes.includes(themeName)) {
            setUnlockedThemes([...unlockedThemes, themeName])
            setMetrics((prev) => {
                const updated = {
                    ...prev,
                    focusCoins: prev.focusCoins - cost
                }
                localStorage.setItem('neuroadapt_behavior_metrics', JSON.stringify(updated))
                return updated
            })
            setActiveAmbiance(themeName)
        }
    }

    // UI helpers
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    const getMoodColor = () => {
        if (mood === 'overwhelmed') return 'border-amber-400 focus:ring-amber-500 bg-amber-50/50'
        if (mood === 'tired') return 'border-blue-400 focus:ring-blue-500 bg-blue-50/50'
        if (mood === 'happy') return 'border-emerald-400 focus:ring-emerald-500 bg-emerald-50/50'
        return 'border-violet-400 focus:ring-violet-500'
    }

    const getDashboardThemeBg = () => {
        if (activeAmbiance === 'Forest Rain') return 'from-teal-50/60 via-emerald-50/60 to-emerald-100/40'
        if (activeAmbiance === 'Cosmic Zen') return 'from-indigo-950 via-slate-900 to-violet-950 text-slate-100'
        return 'from-slate-50 via-violet-50/40 to-sky-50/40'
    }

    // Dynamic contrast styling helpers based on active background themes
    const isDarkTheme = prefs.background === 'dark' || activeAmbiance === 'Cosmic Zen'

    const getCardStyle = () => {
        return isDarkTheme
            ? 'bg-slate-900/90 border border-slate-800 text-slate-100'
            : 'bg-white/90 border border-slate-200/80 text-slate-800'
    }

    const getSubCardStyle = () => {
        return isDarkTheme
            ? 'bg-slate-800/70 border border-slate-700/60 text-slate-200'
            : 'bg-slate-50 border border-slate-100 text-slate-600'
    }

    const getHeadingStyle = () => {
        return isDarkTheme ? 'text-white' : 'text-slate-900'
    }

    const getSubtextStyle = () => {
        return isDarkTheme ? 'text-slate-400' : 'text-slate-500'
    }

    if (!data) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center space-y-2">
                    <div className="h-10 w-10 border-4 border-violet-600 border-t-transparent animate-spin rounded-full mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">Generating personalized workspace...</p>
                </div>
            </div>
        )
    }

    const lessonText = isSimplified ? data.sampleLesson.simplifiedText : data.sampleLesson.fullText

    // Split text into sentences safely
    const sentences = lessonText.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [lessonText]

    return (
        <main className={`min-h-screen relative py-6 px-4 sm:px-6 transition-all duration-700 bg-gradient-to-br ${getDashboardThemeBg()}`}>
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-200/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-200/20 blur-[100px] rounded-full pointer-events-none" />

            <AccessibilityToolbar />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                {/* Header Section */}
                <header className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[32px] shadow-sm backdrop-blur-md ${getCardStyle()}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl shadow-md">
                            🎯
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className={`text-xl font-bold ${getHeadingStyle()}`}>NeuroAdapt Dashboard</h1>
                                <span className="bg-violet-100 text-violet-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-violet-200">
                                    {profile} preset
                                </span>
                            </div>
                            <p className={`text-xs mt-0.5 ${getSubtextStyle()}`}>“An emotionally safe, adaptive study companion built specifically for you.”</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Emergency Button */}
                        <button
                            onClick={() => {
                                setIsOverwhelmed(true)
                                setTtsActive(false)
                                setActiveSentenceIndex(null)
                                setTtsWordIndex(-1)
                                if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-200 flex items-center gap-1.5 animate-pulse"
                        >
                            <span>🆘</span> I'm Overwhelmed
                        </button>

                        <Link
                            href="/personalize"
                            className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm"
                        >
                            Change Profile Preset
                        </Link>
                    </div>
                </header>

                {/* Dashboard Core Grid: Fixed 2-column layout (Left Sidebar [320px], Main View [1fr]) */}
                <div className={`grid gap-6 ${isOneTaskAtATime ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 lg:grid-cols-[320px_1fr]'}`}>

                    {/* Column 1: Left Sidebar for Navigation, Profiles, Sounds & AI Companion */}
                    {!isOneTaskAtATime && (
                        <aside className="space-y-6 flex flex-col">
                            {/* Profile Presets Selector */}
                            <div className={`rounded-[32px] p-5 shadow-sm backdrop-blur-lg space-y-4 ${getCardStyle()}`}>
                                <div>
                                    <h3 className={`text-base font-bold ${getHeadingStyle()}`}>Adaptive Space</h3>
                                    <p className={`text-xs mt-0.5 ${getSubtextStyle()}`}>Switch settings live to fit current mood:</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { key: 'adhd', icon: '⚡', label: 'ADHD' },
                                        { key: 'dyslexia', icon: '📖', label: 'Dyslexia' },
                                        { key: 'autism', icon: '🧩', label: 'Autism' },
                                        { key: 'anxiety', icon: '🕊️', label: 'Anxiety' },
                                        { key: 'sensory', icon: '🍃', label: 'Sensory' },
                                        { key: 'slow', icon: '🔄', label: 'Slow Learn' },
                                        { key: 'visual', icon: '🔍', label: 'Low Vision' },
                                        { key: 'custom', icon: '⚙️', label: 'Custom' }
                                    ] as const).map((p) => (
                                        <button
                                            key={p.key}
                                            onClick={() => {
                                                setProfile(p.key)
                                                localStorage.setItem('neuroadapt_profile', p.key)
                                            }}
                                            className={`rounded-xl border p-2 text-left flex flex-col gap-0.5 transition ${
                                                profile === p.key
                                                    ? 'border-violet-600 bg-violet-500/10 text-violet-500 font-semibold'
                                                    : 'border-slate-100 bg-slate-500/5 text-slate-400 hover:border-slate-500/20'
                                            }`}
                                        >
                                            <span className="text-base">{p.icon}</span>
                                            <span className="text-[10px]">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Suggested Ambiance Playlists */}
                            <div className={`rounded-[32px] p-5 shadow-sm backdrop-blur-lg space-y-3 ${getCardStyle()}`}>
                                <div>
                                    <h3 className={`text-base font-bold ${getHeadingStyle()}`}>Study Sound Ambiance</h3>
                                    <p className={`text-xs ${getSubtextStyle()}`}>Programmatic sound synthesis:</p>
                                </div>
                                <div className="space-y-2">
                                    {data.suggestedPlaylist.map((track, idx) => {
                                        const isRain = track.includes('Rain')
                                        const isZen = track.includes('Zen') || track.includes('Binaural') || track.includes('Waves')
                                        const isSilence = !isRain && !isZen

                                        const isPlayingTrack =
                                            (activeAmbiance === 'Forest Rain' && isRain) ||
                                            (activeAmbiance === 'Cosmic Zen' && isZen) ||
                                            (activeAmbiance === 'Silence' && isSilence)

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveAmbiance(isRain ? 'Forest Rain' : isZen ? 'Cosmic Zen' : 'Silence')}
                                                className={`w-full text-left rounded-xl border p-2.5 flex items-center justify-between text-xs transition ${
                                                    isPlayingTrack
                                                        ? 'border-violet-600 bg-violet-500/10 font-bold text-violet-500'
                                                        : isDarkTheme
                                                        ? 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                                                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{isPlayingTrack ? '🔊' : '🎵'}</span>
                                                    <span>{track}</span>
                                                </div>
                                                <span className="text-[10px] opacity-75">{isPlayingTrack ? 'Playing' : 'Play'}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Garden Progress Component */}
                            <GardenProgress
                                xp={metrics.xpPoints}
                                coins={metrics.focusCoins}
                                onBuyTheme={handleBuyTheme}
                                unlockedThemes={unlockedThemes}
                            />

                            {/* Floating AI Study Companion Component */}
                            <AICompanion
                                profileKey={profile}
                                onAskQuiz={() => setActiveTab('quiz')}
                            />
                        </aside>
                    )}

                    {/* Column 2: Main View for Content, Routines, and Diagnostics */}
                    <section className="space-y-6 flex flex-col">
                        {/* Interactive Widgets & Toolbar: Focus/OneTask Toggle */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Mood Tracker */}
                            <div className={`rounded-3xl p-4 shadow-sm backdrop-blur-lg flex items-center justify-between ${getCardStyle()}`}>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Study Mood</h4>
                                    <p className={`text-xs mt-0.5 ${getSubtextStyle()}`}>Nova adapts tone based on how you feel.</p>
                                </div>
                                <select
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                    className={`rounded-xl border p-2 text-xs font-semibold ${getMoodColor()} ${isDarkTheme ? 'text-white bg-slate-800' : ''}`}
                                >
                                    <option value="focused">⚡ Focused</option>
                                    <option value="happy">🌱 Peaceful</option>
                                    <option value="tired">🥱 Sleepy/Tired</option>
                                    <option value="overwhelmed">🥺 Overwhelmed</option>
                                </select>
                            </div>

                            {/* One Task Focus Toggle */}
                            <div className={`rounded-3xl p-4 shadow-sm backdrop-blur-lg flex items-center justify-between ${getCardStyle()}`}>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">One-Task-At-A-Time</h4>
                                    <p className={`text-xs mt-0.5 ${getSubtextStyle()}`}>Hide sidebar controls completely.</p>
                                </div>
                                <button
                                    onClick={() => setIsOneTaskAtATime(!isOneTaskAtATime)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        isOneTaskAtATime ? 'bg-violet-600' : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isOneTaskAtATime ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Pomodoro Timer Bar */}
                        <div className={`rounded-3xl p-4 shadow-sm backdrop-blur-lg flex flex-wrap items-center justify-between gap-4 ${getCardStyle()}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⏳</span>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adaptive Focus Clock</span>
                                    <h4 className={`text-lg font-extrabold leading-none ${getHeadingStyle()}`}>{formatTime(timerLeft)}</h4>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {[
                                    { label: '5 min', sec: 300 },
                                    { label: '10 min', sec: 600 },
                                    { label: '20 min', sec: 1200 }
                                ].map((btn) => (
                                    <button
                                        key={btn.sec}
                                        onClick={() => resetTimer(btn.sec)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                                            timerDuration === btn.sec
                                                ? 'border-violet-600 bg-violet-500/10 text-violet-500'
                                                : isDarkTheme
                                                ? 'border-slate-700 bg-slate-800 text-slate-300'
                                                : 'border-slate-200 bg-white text-slate-600'
                                        }`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTimerActive(!timerActive)}
                                    className={`px-5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition ${
                                        timerActive
                                            ? 'bg-rose-500 hover:bg-rose-600 text-white'
                                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                                    }`}
                                >
                                    {timerActive ? 'Pause Clock' : 'Start Focus'}
                                </button>
                            </div>
                        </div>

                        {/* Active Lesson Content / Quiz Workspace */}
                        <div className={`rounded-[40px] p-6 sm:p-8 shadow-xl space-y-6 ${getCardStyle()}`}>
                            {/* Lesson Navigation Header */}
                            <div className="flex items-center justify-between border-b border-slate-200/40 pb-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Adaptive Chapter Reading</span>
                                    <h2 className={`text-2xl font-bold ${getHeadingStyle()}`}>{data.sampleLesson.title}</h2>
                                </div>

                                <div className={`flex p-1 rounded-2xl text-xs font-semibold ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <button
                                        onClick={() => {
                                            setActiveTab('read')
                                            setTtsActive(false)
                                            setActiveSentenceIndex(null)
                                            setTtsWordIndex(-1)
                                            if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
                                        }}
                                        className={`rounded-xl px-4 py-1.5 transition ${activeTab === 'read' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Read Chapter
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('quiz')
                                            setTtsActive(false)
                                            setActiveSentenceIndex(null)
                                            setTtsWordIndex(-1)
                                            if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
                                        }}
                                        className={`rounded-xl px-4 py-1.5 transition ${activeTab === 'quiz' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Take Concept Quiz
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'read' ? (
                                /* Adaptive Content Reader */
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className={`text-xs italic ${getSubtextStyle()}`}>{data.sampleLesson.shortDescription}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsSimplified(!isSimplified)}
                                                className={`rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition ${
                                                    isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                {isSimplified ? '📖 Show Complex Text' : '🪄 Simplification Enabled'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Core Text Section - Sentence by Sentence with custom TTS triggers */}
                                    <div
                                        onMouseMove={(e) => {
                                            const bounds = e.currentTarget.getBoundingClientRect()
                                            setRulerTop(e.clientY - bounds.top - 16)
                                        }}
                                        className={`relative p-6 rounded-2xl border cursor-row-resize overflow-hidden ${
                                            isDarkTheme ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-white'
                                        }`}
                                    >
                                        {/* Visual Reading Ruler */}
                                        {profile !== 'sensory' && (
                                            <div
                                                className="absolute left-0 right-0 h-9 bg-amber-400/20 border-y border-amber-500/40 pointer-events-none transition-all duration-75"
                                                style={{ top: `${Math.max(10, Math.min(rulerTop, 220))}px` }}
                                            />
                                        )}

                                        <div className="space-y-4">
                                            {sentences.map((sentence, sIdx) => {
                                                const isActive = activeSentenceIndex === sIdx
                                                const cleanSentence = sentence.trim()

                                                return (
                                                    <div
                                                        key={sIdx}
                                                        className={`p-2.5 rounded-2xl transition flex items-start gap-3 border ${
                                                            isActive
                                                                ? 'border-violet-500/30 bg-violet-500/10'
                                                                : 'border-transparent hover:bg-slate-500/5'
                                                        }`}
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                if (isActive && ttsActive) {
                                                                    setTtsActive(false)
                                                                    setActiveSentenceIndex(null)
                                                                    setTtsWordIndex(-1)
                                                                    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
                                                                } else {
                                                                    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
                                                                    setTtsActive(true)
                                                                    setActiveSentenceIndex(sIdx)
                                                                    setTtsWordIndex(-1)

                                                                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                                                                        const utterance = new SpeechSynthesisUtterance(cleanSentence)
                                                                        utterance.rate = prefs.ttsSpeed || 1
                                                                        
                                                                        utterance.onboundary = (event) => {
                                                                            if (event.name === 'word') {
                                                                                const charIdx = event.charIndex
                                                                                const spokenText = cleanSentence.substring(0, charIdx)
                                                                                const wordCount = spokenText.split(/\s+/).filter(w => w.length > 0).length
                                                                                setTtsWordIndex(wordCount)
                                                                            }
                                                                        }

                                                                        utterance.onend = () => {
                                                                            setTtsActive(false)
                                                                            setActiveSentenceIndex(null)
                                                                            setTtsWordIndex(-1)
                                                                        }

                                                                        window.speechSynthesis.speak(utterance)
                                                                    }
                                                                }
                                                            }}
                                                            className={`p-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                                                                isActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-violet-600/10 text-violet-500 hover:bg-violet-600/20'
                                                            }`}
                                                            title="Read sentence aloud"
                                                        >
                                                            {isActive ? '⏹️' : '🔊'}
                                                        </button>

                                                        <p
                                                            className="leading-relaxed select-text text-left"
                                                            style={{
                                                                fontFamily: 'OpenDyslexic',
                                                                fontSize: '18px',
                                                                lineHeight: '1.5'
                                                            }}
                                                        >
                                                            {cleanSentence.split(/\s+/).map((word, wIdx) => {
                                                                const isWordActive = isActive && wIdx === ttsWordIndex
                                                                return (
                                                                    <span
                                                                        key={wIdx}
                                                                        className={`inline-block mr-1 rounded transition-colors ${
                                                                            isWordActive
                                                                                ? 'bg-yellow-300 text-black font-extrabold px-1 scale-105 shadow-sm'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        {word}
                                                                    </span>
                                                                )
                                                            })}
                                                        </p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Visual Aids Block (ADHD / Autism preference) */}
                                    <div className={`rounded-3xl p-5 space-y-3 ${getSubCardStyle()}`}>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Visual Summary Concept Map</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            {data.sampleLesson.visualAids.map((aid, idx) => (
                                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl shadow-sm text-xs font-medium border ${
                                                    isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200/60 text-slate-700'
                                                }`}>
                                                    <span>{aid}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Adaptive Concept Quizzes */
                                <div className="space-y-6">
                                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 text-xs text-violet-400">
                                        💡 <strong>Nova Insights:</strong> Mistakes here carry no penalties. Each question answered correctly awards <strong>+20 XP</strong> and <strong>+5 Focus Coins</strong>!
                                    </div>

                                    <div className="space-y-8">
                                        {data.activeQuiz.map((q, qidx) => {
                                            const answered = quizAnswers[q.id] !== undefined
                                            const isCorrect = quizAnswers[q.id] === q.correctIndex
                                            const checked = quizChecked[q.id]

                                            return (
                                                <div key={q.id} className="space-y-3.5 border-b border-slate-200/20 pb-5">
                                                    <p className={`text-sm font-bold ${isDarkTheme ? 'text-slate-100' : 'text-slate-800'}`}>
                                                        Q{qidx + 1}. {q.question}
                                                    </p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {q.options.map((opt, optIdx) => {
                                                            const isSelected = quizAnswers[q.id] === optIdx
                                                            let optStyle = isDarkTheme
                                                                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
                                                            
                                                            if (isSelected) {
                                                                if (checked) {
                                                                    optStyle = isCorrect
                                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                                                                        : 'border-rose-500 bg-rose-500/10 text-rose-400 font-bold'
                                                                } else {
                                                                    optStyle = 'border-violet-600 bg-violet-600/10 text-violet-400 font-bold'
                                                                }
                                                            }

                                                            return (
                                                                <button
                                                                    key={optIdx}
                                                                    disabled={checked}
                                                                    onClick={() => {
                                                                        setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })
                                                                    }}
                                                                    className={`rounded-2xl border p-3.5 text-left text-xs transition ${optStyle}`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>

                                                    {answered && !checked && (
                                                        <button
                                                            onClick={() => {
                                                                setQuizChecked({ ...quizChecked, [q.id]: true })
                                                                if (isCorrect) {
                                                                    addXP(20, 5)
                                                                }
                                                            }}
                                                            className="px-6 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition"
                                                        >
                                                            Submit Answer
                                                        </button>
                                                    )}

                                                    {checked && (
                                                        <div className={`rounded-2xl p-4 text-xs leading-relaxed border ${
                                                            isCorrect
                                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                        }`}>
                                                            <strong>{isCorrect ? '✓ Correct! ' : '💡 Concept Review: '}</strong>
                                                            {q.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Diagnostics and Routines Row under content workspace */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Diagnostics Card */}
                            <div className={`rounded-[32px] p-5 shadow-sm backdrop-blur-lg space-y-4 ${getCardStyle()}`}>
                                <h3 className={`text-base font-bold ${getHeadingStyle()}`}>Cognitive Diagnostics</h3>
                                <div className="space-y-3">
                                    <div className={`rounded-2xl p-3 flex justify-between items-center ${getSubCardStyle()}`}>
                                        <div className="space-y-0.5">
                                            <span className={`text-[10px] font-semibold uppercase ${getSubtextStyle()}`}>Attention Flow</span>
                                            <span className={`block text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{data.focusScore}% Score</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-base">🔋</div>
                                    </div>

                                    <div className={`rounded-2xl p-3 flex justify-between items-center ${getSubCardStyle()}`}>
                                        <div className="space-y-0.5">
                                            <span className={`text-[10px] font-semibold uppercase ${getSubtextStyle()}`}>Comfort Meter</span>
                                            <span className={`block text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{data.comfortScore}% Score</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-base">💖</div>
                                    </div>

                                    <div className={`rounded-2xl p-3 flex justify-between items-center ${getSubCardStyle()}`}>
                                        <div className="space-y-0.5">
                                            <span className={`text-[10px] font-semibold uppercase ${getSubtextStyle()}`}>Burnout Predictor</span>
                                            <span className={`block text-xs font-bold uppercase ${data.burnoutRisk === 'High' ? 'text-rose-600' : data.burnoutRisk === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {data.burnoutRisk} Risk
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-base">📈</div>
                                    </div>
                                </div>
                            </div>

                            {/* Routines Schedule */}
                            <div className={`rounded-[32px] p-5 shadow-sm backdrop-blur-lg space-y-3 ${getCardStyle()}`}>
                                <h3 className={`text-base font-bold ${getHeadingStyle()}`}>Structured Study Routine</h3>
                                <div className="space-y-2.5">
                                    {data.dailyRoadmap.map((item, idx) => (
                                        <div key={idx} className="flex gap-2.5 items-start text-xs">
                                            <span className={`text-sm rounded-lg p-1.5 ${getSubCardStyle()}`}>{item.icon}</span>
                                            <div className="flex-1 space-y-0.5">
                                                <div className={`font-semibold flex items-center justify-between ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    <span>{item.title}</span>
                                                    <span className="text-[9px] text-slate-400 font-normal">{item.duration}</span>
                                                </div>
                                                <p className={`text-[10px] leading-relaxed ${getSubtextStyle()}`}>{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Parent / Teacher Insight Portal */}
                        <footer className={`mt-4 border rounded-[32px] p-6 shadow-sm backdrop-blur-lg space-y-4 ${getCardStyle()}`}>
                            <button
                                onClick={() => setShowTeacherPanel(!showTeacherPanel)}
                                className={`w-full flex items-center justify-between font-bold text-sm focus:outline-none ${getHeadingStyle()}`}
                            >
                                <span>📊 Parent / Educator Insight Diagnostics</span>
                                <span>{showTeacherPanel ? 'Collapse' : 'Expand Insights'}</span>
                            </button>

                            {showTeacherPanel && (
                                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200/30 text-xs`}>
                                    <div className={`space-y-2 p-4.5 rounded-2xl border ${getSubCardStyle()}`}>
                                        <h4 className={`font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>1. Real-Time Analytics</h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span>Average Attention Span:</span>
                                                <span className="font-semibold">{metrics.attentionSpanSec}s</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Estimated Reading Speed:</span>
                                                <span className="font-semibold">{metrics.readingWpm} WPM</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Target Session Duration:</span>
                                                <span className="font-semibold">{data.focusScore * 5}s</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`space-y-2 p-4.5 rounded-2xl border ${getSubCardStyle()}`}>
                                        <h4 className={`font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>2. Weekly Improvements</h4>
                                        <div className="flex items-end gap-1.5 h-16 pt-2 select-none justify-around">
                                            {data.weeklyImprovement.map((v, i) => (
                                                <div key={i} className="flex flex-col items-center flex-1">
                                                    <div className="w-full bg-violet-500 rounded-t" style={{ height: `${v}%`, minHeight: '4px' }} />
                                                    <span className="text-[8px] text-slate-400 mt-1 font-semibold">D{i + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`space-y-2 p-4.5 rounded-2xl border ${getSubCardStyle()}`}>
                                        <h4 className={`font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>3. Diagnostic Output</h4>
                                        <p className={`leading-relaxed text-[11px] ${getSubtextStyle()}`}>
                                            Learner demonstrates sensory sensitivity. The AI recommendation engine sets the theme to low contrast and spacing height to {data.focusScore > 60 ? '1.8x' : '2.1x'} with syllable chunking enabled.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </footer>
                    </section>
                </div>
            </div>

            {/* Overwhelm guided breathing trainer popup */}
            {isOverwhelmed && (
                <BreathingExercise onClose={() => setIsOverwhelmed(false)} />
            )}
        </main>
    )
}
