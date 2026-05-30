'use client'

import Link from 'next/link'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Background Grid Pattern */}
            <svg
                className="fixed inset-0 w-full h-full pointer-events-none opacity-5"
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#534AB7" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">🧠</span>
                            <span className="text-2xl font-bold text-brand-purple">NeuroAdapt</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">Every brain served</p>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Teacher Portal */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">👨‍🏫</span>
                                    <h1 className="text-4xl font-bold text-dark-text">For Teachers</h1>
                                </div>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Upload NCERT chapters and transform them into dyslexia-friendly reading materials. Our AI pipeline handles extraction, cleaning, and simplification automatically.
                                </p>
                            </div>

                            <div className="space-y-3 bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <h3 className="font-bold text-dark-text">What you can do:</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex gap-3">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Upload PDF chapters or paste text</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Review AI-generated content</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Edit and refine simplified text</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-blue-600 font-bold">✓</span>
                                        <span>Share with students using unique codes</span>
                                    </li>
                                </ul>
                            </div>

                            <Link
                                href="/teacher"
                                className="inline-block px-8 py-4 bg-brand-purple text-white font-bold text-lg rounded-lg hover:bg-brand-purple/90 transition-colors shadow-lg hover:shadow-xl"
                            >
                                📤 Upload Chapter
                            </Link>
                        </div>

                        {/* Student Reader */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">👧</span>
                                    <h1 className="text-4xl font-bold text-dark-text">For Students</h1>
                                </div>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Access dyslexia-friendly versions of NCERT chapters with Text-to-Speech, reading ruler, glossary, and full accessibility controls.
                                </p>
                            </div>

                            <div className="space-y-3 bg-green-50 rounded-lg p-6 border border-green-200">
                                <h3 className="font-bold text-dark-text">Features include:</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <span>OpenDyslexic & Lexend font options</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <span>Text-to-Speech with word highlighting</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <span>Reading ruler & glossary panel</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-green-600 font-bold">✓</span>
                                        <span>Full customization of font, spacing & colors</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="shareCode" className="block text-sm font-bold text-dark-text">
                                    Have a share code?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="shareCode"
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    />
                                    <button
                                        onClick={(e) => {
                                            const code = (e.currentTarget.previousElementSibling as HTMLInputElement).value
                                            if (code.length === 6) {
                                                window.location.href = `/student/${code}`
                                            }
                                        }}
                                        className="px-8 py-3 bg-accent-teal text-white font-bold rounded-lg hover:bg-accent-teal/90 transition-colors"
                                    >
                                        Go
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-8 mt-12">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <p className="text-gray-600 text-sm">
                            NeuroAdapt • Making NCERT accessible to every learner
                        </p>
                    </div>
                </footer>
            </div>
        </main>
    )
}
