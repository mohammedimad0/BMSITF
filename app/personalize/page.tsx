"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AccessibilityToolbar from '../../components/personalize/AccessibilityToolbar'
import LivePreview from '../../components/personalize/LivePreview'
import ProfileCard from '../../components/personalize/ProfileCard'

type ProfileKey =
    | 'dyslexia'
    | 'autism'
    | 'adhd'
    | 'visual'
    | 'anxiety'
    | 'slow'
    | 'sensory'
    | 'custom'

const PROFILES: Record<ProfileKey, { title: string; summary: string; presets: Record<string, string | number> }> = {
    dyslexia: {
        title: 'Dyslexia Mode',
        summary: 'Dyslexic-friendly font, adjustable letter spacing, line focus ruler, and text-to-speech support.',
        presets: { font: 'opendyslexic', fontSize: 20, lineHeight: 2.0, letterSpacing: 0.08, bg: '#FEF9F0' },
    },
    adhd: {
        title: 'ADHD Mode',
        summary: 'Gamified rewards, 5-minute study intervals, XP trackers, and visual dopamine indicators.',
        presets: { font: 'lexend', fontSize: 18, lineHeight: 1.7, letterSpacing: 0.04, bg: '#EFF9FF' },
    },
    autism: {
        title: 'Autism Mode',
        summary: 'Structured learning schedules, minimal animation distractions, and predictable layout guides.',
        presets: { font: 'lexend', fontSize: 18, lineHeight: 1.85, letterSpacing: 0.05, bg: '#F8FAFF' },
    },
    visual: {
        title: 'Low Vision Mode',
        summary: 'High contrast text overlays, keyboard-first focus indicators, and custom zoom scale multipliers.',
        presets: { font: 'system', fontSize: 22, lineHeight: 2.2, letterSpacing: 0.06, bg: '#FFFFFF' },
    },
    anxiety: {
        title: 'Anxiety-Friendly',
        summary: 'Calming soft palettes, no timed test pressure, encouraging prompts, and calm meditation breathing guides.',
        presets: { font: 'system', fontSize: 18, lineHeight: 1.8, letterSpacing: 0.03, bg: '#FAF0E6' },
    },
    slow: {
        title: 'Slow Learning',
        summary: 'Spaced review cycles, step-by-step repetition, vocabulary matches, and memory reinforcements.',
        presets: { font: 'system', fontSize: 18, lineHeight: 1.9, letterSpacing: 0.04, bg: '#FFFFFF' },
    },
    sensory: {
        title: 'Sensory Sensitive',
        summary: 'Muted grey/mint backgrounds, disabled animations, flat graphics, and silent study ambiance.',
        presets: { font: 'system', fontSize: 17, lineHeight: 1.8, letterSpacing: 0.02, bg: '#E6F0EC' },
    },
    custom: {
        title: 'Custom Profile',
        summary: 'Blend and configure settings according to your individual cognitive preference.',
        presets: { font: 'system', fontSize: 18, lineHeight: 1.8, letterSpacing: 0.04, bg: '#FFFFFF' },
    },
}

export default function PersonalizePage() {
    const router = useRouter()
    const [step, setStep] = useState<'welcome' | 'questions' | 'profiles' | 'analyzing'>('welcome')
    const [selectedProfile, setSelectedProfile] = useState<ProfileKey>('dyslexia')
    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [analysisText, setAnalysisText] = useState('Initiating AI cognitive profiling...')

    // Questionnaire State
    const [answers, setAnswers] = useState({
        learningStyle: 'Interactive',
        attentionSpan: 'Short burst (5-10m)',
        sensorySensitivity: 'Low distraction / Soft colors',
        socialComfort: 'Solo space',
        focusTiming: 'Night focus',
        stressLevel: 'Mildly anxious',
        favoriteSubject: 'Science & Environment',
        goals: 'Improve memory',
        difficulty: 'Gentle starter',
        pace: 'Self-paced',
        motivation: 'Unlockable achievements',
        communication: 'Visual emoji cues'
    })

    // Simulated AI Synthesis Progression
    useEffect(() => {
        if (step === 'analyzing') {
            const interval = setInterval(() => {
                setAnalysisProgress((p) => {
                    if (p >= 100) {
                        clearInterval(interval)
                        setTimeout(() => {
                            setStep('profiles')
                        }, 800)
                        return 100
                    }
                    const next = p + 4
                    if (next === 24) setAnalysisText('Mapping attention profiles (ADHD preset matching)...')
                    if (next === 48) setAnalysisText('Analyzing sensory thresholds (Autism low-motion check)...')
                    if (next === 72) setAnalysisText('Customizing typography templates (Dyslexia OpenDyslexic match)...')
                    if (next === 92) setAnalysisText('Generating study schedules & routine planners...')
                    return next
                })
            }, 100)
            return () => clearInterval(interval)
        }
    }, [step])

    // Save profile and redirect to dashboard
    const handleSaveProfile = (profile: ProfileKey) => {
        localStorage.setItem('neuroadapt_profile', profile)
        // Store customized parameters in student preferences
        const profilePresets = PROFILES[profile].presets
        const savedPrefs = {
            font: profilePresets.font as any,
            fontSize: profilePresets.fontSize as number,
            lineHeight: profilePresets.lineHeight as number,
            letterSpacing: profilePresets.letterSpacing as number,
            background: (profile === 'visual' ? 'white' : profile === 'dyslexia' ? 'cream' : profile === 'autism' ? 'blue' : profile === 'sensory' ? 'sensory' : profile === 'anxiety' ? 'warm' : 'white') as any,
            showRuler: profile !== 'sensory',
            ttsSpeed: 1,
            ttsAutoPlay: profile === 'dyslexia' || profile === 'visual',
            contrast: profile === 'visual' ? 'high' : 'standard',
            motion: (profile === 'sensory' || profile === 'anxiety') ? 'reduced' : 'normal'
        }
        localStorage.setItem('neuroadapt_student_prefs', JSON.stringify(savedPrefs))

        // Save behavioral parameters
        const customMetrics = {
            attentionSpanSec: profile === 'adhd' ? 120 : profile === 'slow' ? 180 : 300,
            readingWpm: profile === 'dyslexia' ? 140 : profile === 'slow' ? 120 : 200,
            focusDurationSec: 240,
            mistakesPerQuiz: profile === 'slow' ? 3 : 1,
            recentStress: profile === 'anxiety' ? 0.6 : 0.2,
            completedLessons: 1,
            focusCoins: 10,
            xpPoints: 45
        }
        localStorage.setItem('neuroadapt_behavior_metrics', JSON.stringify(customMetrics))

        // Redirect
        router.push('/dashboard')
    }

    return (
        <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-50 via-sky-50 to-indigo-50 py-10 px-4 sm:px-6">
            {/* Calming Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-200/40 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-sky-200/40 blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />

            <AccessibilityToolbar />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* 1. Welcome Screen */}
                {step === 'welcome' && (
                    <div className="max-w-2xl mx-auto mt-12 text-center bg-white/70 backdrop-blur-xl border border-white p-8 sm:p-12 rounded-[40px] shadow-2xl flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-violet-200/50 animate-bounce">
                            🧠
                        </div>
                        <div className="space-y-2">
                            <span className="bg-violet-100/90 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200 uppercase tracking-widest">
                                NeuroAdapt AI Studio
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                                Let’s build a learning journey made for YOU.
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                Welcome! Every brain learns differently. We customize layouts, font weights, colors, tools, and visual pacing to keep you feeling calm, focused, and confident.
                            </p>
                        </div>

                        <div className="w-full rounded-2xl bg-violet-50 border border-violet-100 p-4 text-left flex gap-3 text-xs text-slate-700">
                            <span className="text-lg">👋</span>
                            <div>
                                <span className="font-bold text-slate-900 block">A message from Nova (your AI Companion):</span>
                                “Take your time responding. There are no correct answers. We are just seeking to understand how you feel comfortable studying!”
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('questions')}
                            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl transition-all"
                        >
                            Start My Free Assessment
                        </button>
                    </div>
                )}

                {/* 2. Questionnaire Steps */}
                {step === 'questions' && (
                    <div className="bg-white/80 backdrop-blur-xl border border-white p-6 sm:p-10 rounded-[40px] shadow-2xl space-y-6">
                        <div>
                            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Step 2 of 4</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Cognitive Style & Comfort Assessment</h2>
                            <p className="text-xs sm:text-sm text-slate-500">Pick the options that best match your comfort levels.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Learning Style */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Preferred Learning Style</label>
                                <select
                                    value={answers.learningStyle}
                                    onChange={(e) => setAnswers({ ...answers, learningStyle: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Visual (Maps & Infographics)</option>
                                    <option>Audio (TTS & Read-alouds)</option>
                                    <option>Reading/Writing (Text outlines)</option>
                                    <option>Interactive (Matching blocks)</option>
                                    <option>Gamified (XP & Challenges)</option>
                                </select>
                            </div>

                            {/* Attention span */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Attention Rhythm</label>
                                <select
                                    value={answers.attentionSpan}
                                    onChange={(e) => setAnswers({ ...answers, attentionSpan: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Short burst (5-10m)</option>
                                    <option>Standard focus (15-25m)</option>
                                    <option>Self-paced blocks (unlimited)</option>
                                </select>
                            </div>

                            {/* Sensory preferences */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Sensory Settings</label>
                                <select
                                    value={answers.sensorySensitivity}
                                    onChange={(e) => setAnswers({ ...answers, sensorySensitivity: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Low distraction / Soft colors</option>
                                    <option>High contrast / Large fonts</option>
                                    <option>Plain layouts / Muted design</option>
                                    <option>Vibrant / High animations</option>
                                </select>
                            </div>

                            {/* Focus Timing */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">4. Best Time to Study</label>
                                <select
                                    value={answers.focusTiming}
                                    onChange={(e) => setAnswers({ ...answers, focusTiming: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Morning energy (8 AM)</option>
                                    <option>Afternoon study (3 PM)</option>
                                    <option>Night focus (8 PM)</option>
                                </select>
                            </div>

                            {/* Stress level */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">5. Stress & Anxiety Sensitivity</label>
                                <select
                                    value={answers.stressLevel}
                                    onChange={(e) => setAnswers({ ...answers, stressLevel: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Relaxed / Calm focus</option>
                                    <option>Mildly anxious (No-timers preferred)</option>
                                    <option>Overwhelmed easily (Breathing breaks)</option>
                                </select>
                            </div>

                            {/* Favorite Subjects */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">6. Primary Subjects</label>
                                <select
                                    value={answers.favoriteSubject}
                                    onChange={(e) => setAnswers({ ...answers, favoriteSubject: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Science & Environment</option>
                                    <option>Mathematics & Fractions</option>
                                    <option>Languages & Reading</option>
                                    <option>History & Geography</option>
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">7. Difficulty Goal</label>
                                <select
                                    value={answers.difficulty}
                                    onChange={(e) => setAnswers({ ...answers, difficulty: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Gentle starter</option>
                                    <option>Moderate challenges</option>
                                    <option>Advanced/Deeper dives</option>
                                </select>
                            </div>

                            {/* Motivation */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">8. Motivation Trigger</label>
                                <select
                                    value={answers.motivation}
                                    onChange={(e) => setAnswers({ ...answers, motivation: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Unlockable achievements</option>
                                    <option>XP points & Levels</option>
                                    <option>Quiet progress gardens</option>
                                    <option>No-gamification (plain stats)</option>
                                </select>
                            </div>

                            {/* Communication style */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">9. UI Signals Preference</label>
                                <select
                                    value={answers.communication}
                                    onChange={(e) => setAnswers({ ...answers, communication: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-violet-500"
                                >
                                    <option>Visual emoji cues</option>
                                    <option>Plain textual directions</option>
                                    <option>Voice narrator guides</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 border-t border-slate-100 pt-6">
                            <button
                                onClick={() => setStep('welcome')}
                                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep('analyzing')}
                                className="flex-1 sm:flex-initial px-10 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-violet-100 transition"
                            >
                                Analyze & Generate Profile
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. AI Synthesizing Loader */}
                {step === 'analyzing' && (
                    <div className="max-w-md mx-auto mt-12 bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                            {/* Spinning circle */}
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-violet-600 animate-spin" />
                            <span className="text-3xl animate-pulse">⚡</span>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold text-slate-900">AI Profile Generation</h2>
                            <p className="text-xs font-medium text-violet-600 h-10 flex items-center justify-center px-4">
                                {analysisText}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full space-y-1">
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                    className="h-full bg-violet-600 transition-all duration-300"
                                    style={{ width: `${analysisProgress}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-slate-400 block text-right font-bold">{analysisProgress}% Complete</span>
                        </div>
                    </div>
                )}

                {/* 4. Profile Results Studio */}
                {step === 'profiles' && (
                    <div className="space-y-6">
                        <div className="bg-white/50 backdrop-blur-md p-6 rounded-[30px] border border-white/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="bg-violet-100/90 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-violet-200 uppercase tracking-widest">
                                    AI Profiler Recommendation
                                </span>
                                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Your Personalized Learning Space</h2>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Our engine suggests the profile below based on your answers. You can choose any profile to test it, then click "Apply Profile" to proceed to your dashboard.
                                </p>
                            </div>
                            <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 transition">
                                Exit Studio
                            </Link>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                            {/* Profiles Column */}
                            <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-[32px] shadow-lg flex flex-col gap-4">
                                <div className="border-b border-slate-100 pb-2">
                                    <span className="text-xs font-bold text-slate-800">Available Learning Formats</span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Click a card to load the real-time preview style.</p>
                                </div>

                                <div className="grid gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
                                    {(Object.keys(PROFILES) as ProfileKey[]).map((key) => (
                                        <ProfileCard
                                            key={key}
                                            title={PROFILES[key].title}
                                            summary={PROFILES[key].summary}
                                            active={selectedProfile === key}
                                            onHover={() => setSelectedProfile(key)}
                                            onClick={() => setSelectedProfile(key)}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSaveProfile(selectedProfile)}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-violet-100 transition-all mt-2"
                                >
                                    Apply Profile & Enter Dashboard
                                </button>
                            </div>

                            {/* Interactive Preview Column */}
                            <div className="space-y-4">
                                <LivePreview profileKey={selectedProfile} presets={PROFILES[selectedProfile].presets} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
