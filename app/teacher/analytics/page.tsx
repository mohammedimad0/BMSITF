"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Define Typings
interface Student {
    id: string
    name: string
    age: number
    profile: string
}

interface Parameter {
    id: string
    name: string
    min: number
    max: number
}

interface LogEntry {
    id: string
    studentId: string
    date: string
    scores: Record<string, number> // paramId -> score value
    notes?: string
}

// Initial seed data
const DEFAULT_PARAMETERS: Parameter[] = [
    { id: 'marks', name: 'Marks', min: 0, max: 100 },
    { id: 'participation', name: 'Class Participation', min: 1, max: 10 },
    { id: 'projects', name: 'Project Completion', min: 1, max: 10 },
    { id: 'activities', name: 'Extracurricular Activities', min: 1, max: 10 },
    { id: 'confidence', name: 'Confidence Level', min: 1, max: 10 }
]

const DEFAULT_STUDENTS: Student[] = [
    { id: 's1', name: 'Rohan Sharma', age: 9, profile: 'ADHD / High Energy' },
    { id: 's2', name: 'Aisha Patel', age: 8, profile: 'Dyslexia / Audio-Learner' },
    { id: 's3', name: 'Kabir Sen', age: 10, profile: 'Autism / Structured Flow' }
]

const DEFAULT_LOGS: LogEntry[] = [
    // Rohan (ADHD)
    {
        id: 'l1',
        studentId: 's1',
        date: '2026-05-25',
        scores: { marks: 75, participation: 6, projects: 5, activities: 8, confidence: 7 },
        notes: 'Good focus during the morning science burst. Energetic.'
    },
    {
        id: 'l2',
        studentId: 's1',
        date: '2026-05-27',
        scores: { marks: 80, participation: 8, projects: 7, activities: 9, confidence: 8 },
        notes: 'Excellent participation during interactive quizzes. Earned XP.'
    },
    {
        id: 'l3',
        studentId: 's1',
        date: '2026-05-29',
        scores: { marks: 85, participation: 7, projects: 8, activities: 7, confidence: 9 },
        notes: 'Very high confidence today. One-task-at-a-time helped him stay on track.'
    },
    // Aisha (Dyslexia)
    {
        id: 'l4',
        studentId: 's2',
        date: '2026-05-24',
        scores: { marks: 70, participation: 7, projects: 6, activities: 5, confidence: 6 },
        notes: 'Used text-to-speech to complete the NCERT reading unit.'
    },
    {
        id: 'l5',
        studentId: 's2',
        date: '2026-05-26',
        scores: { marks: 78, participation: 8, projects: 8, activities: 6, confidence: 7 },
        notes: 'Spaced review cycles helped reinforce vocabulary matches.'
    },
    {
        id: 'l6',
        studentId: 's2',
        date: '2026-05-28',
        scores: { marks: 82, participation: 9, projects: 9, activities: 7, confidence: 8 },
        notes: 'Read with OpenDyslexic font. Noticeable increase in reading velocity.'
    }
]

export default function AnalyticsPage() {
    // Core State
    const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS)
    const [parameters, setParameters] = useState<Parameter[]>(DEFAULT_PARAMETERS)
    const [logs, setLogs] = useState<LogEntry[]>(DEFAULT_LOGS)

    const [selectedStudentId, setSelectedStudentId] = useState<string>('s1')
    const [searchQuery, setSearchQuery] = useState('')

    // Toggle parameters shown on Trend Line chart
    const [visibleParams, setVisibleParams] = useState<Record<string, boolean>>({
        marks: true,
        participation: true,
        projects: false,
        activities: false,
        confidence: true
    })

    // Compare Logs checkboxes
    const [compareLogIds, setCompareLogIds] = useState<string[]>([])

    // Modals visibility
    const [showStudentModal, setShowStudentModal] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [newStudent, setNewStudent] = useState({ name: '', age: 9, profile: '' })

    const [showLogModal, setShowLogModal] = useState(false)
    const [editingLog, setEditingLog] = useState<LogEntry | null>(null)
    const [newLog, setNewLog] = useState<{ date: string; scores: Record<string, number>; notes: string }>({
        date: new Date().toISOString().split('T')[0],
        scores: {},
        notes: ''
    })

    const [showParamModal, setShowParamModal] = useState(false)
    const [editingParam, setEditingParam] = useState<Parameter | null>(null)
    const [newParam, setNewParam] = useState({ id: '', name: '', min: 0, max: 10 })

    // Hydration sync
    useEffect(() => {
        const localStudents = localStorage.getItem('neuro_analytics_students')
        const localParams = localStorage.getItem('neuro_analytics_params')
        const localLogs = localStorage.getItem('neuro_analytics_logs')

        if (localStudents) setStudents(JSON.parse(localStudents))
        if (localParams) setParameters(JSON.parse(localParams))
        if (localLogs) setLogs(JSON.parse(localLogs))
    }, [])

    const saveToLocalStorage = (key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data))
    }

    // --- Student CRUD ---
    const handleSaveStudent = () => {
        if (!newStudent.name) return
        let updated: Student[]
        if (editingStudent) {
            updated = students.map((s) => (s.id === editingStudent.id ? { ...s, ...newStudent } : s))
        } else {
            const id = 's_' + Date.now()
            updated = [...students, { id, ...newStudent }]
        }
        setStudents(updated)
        saveToLocalStorage('neuro_analytics_students', updated)
        setShowStudentModal(false)
        setEditingStudent(null)
        setNewStudent({ name: '', age: 9, profile: '' })
    }

    const handleDeleteStudent = (id: string) => {
        const updated = students.filter((s) => s.id !== id)
        setStudents(updated)
        saveToLocalStorage('neuro_analytics_students', updated)
        if (selectedStudentId === id && updated.length > 0) {
            setSelectedStudentId(updated[0].id)
        }
    }

    const startAddStudent = () => {
        setEditingStudent(null)
        setNewStudent({ name: '', age: 9, profile: '' })
        setShowStudentModal(true)
    }

    const startEditStudent = (student: Student) => {
        setEditingStudent(student)
        setNewStudent({ name: student.name, age: student.age, profile: student.profile })
        setShowStudentModal(true)
    }

    // --- Parameter CRUD ---
    const handleSaveParam = () => {
        if (!newParam.name) return
        let updated: Parameter[]
        if (editingParam) {
            updated = parameters.map((p) => (p.id === editingParam.id ? { ...p, name: newParam.name, min: newParam.min, max: newParam.max } : p))
        } else {
            const id = newParam.name.toLowerCase().replace(/\s+/g, '_')
            updated = [...parameters, { id, name: newParam.name, min: newParam.min, max: newParam.max }]
            setVisibleParams({ ...visibleParams, [id]: true })
        }
        setParameters(updated)
        saveToLocalStorage('neuro_analytics_params', updated)
        setShowParamModal(false)
        setEditingParam(null)
        setNewParam({ id: '', name: '', min: 0, max: 10 })
    }

    const handleDeleteParam = (id: string) => {
        const updated = parameters.filter((p) => p.id !== id)
        setParameters(updated)
        saveToLocalStorage('neuro_analytics_params', updated)
    }

    // --- Log Entry CRUD ---
    const handleSaveLog = () => {
        let updated: LogEntry[]
        const scoresToSave: Record<string, number> = {}
        parameters.forEach((p) => {
            scoresToSave[p.id] = newLog.scores[p.id] !== undefined ? newLog.scores[p.id] : Math.round((p.min + p.max) / 2)
        })

        if (editingLog) {
            updated = logs.map((l) => (l.id === editingLog.id ? { ...l, date: newLog.date, scores: scoresToSave, notes: newLog.notes } : l))
        } else {
            const id = 'l_' + Date.now()
            updated = [...logs, { id, studentId: selectedStudentId, date: newLog.date, scores: scoresToSave, notes: newLog.notes }]
        }
        setLogs(updated)
        saveToLocalStorage('neuro_analytics_logs', updated)
        setShowLogModal(false)
        setEditingLog(null)
    }

    const startAddLog = () => {
        setEditingLog(null)
        const initialScores: Record<string, number> = {}
        parameters.forEach((p) => {
            initialScores[p.id] = Math.round((p.min + p.max) / 2)
        })
        setNewLog({
            date: new Date().toISOString().split('T')[0],
            scores: initialScores,
            notes: ''
        })
        setShowLogModal(true)
    }

    const startEditLog = (entry: LogEntry) => {
        setEditingLog(entry)
        setNewLog({
            date: entry.date,
            scores: { ...entry.scores },
            notes: entry.notes || ''
        })
        setShowLogModal(true)
    }

    const handleDeleteLog = (id: string) => {
        const updated = logs.filter((l) => l.id !== id)
        setLogs(updated)
        saveToLocalStorage('neuro_analytics_logs', updated)
        setCompareLogIds(compareLogIds.filter((cid) => cid !== id))
    }

    // Filters and sorting
    const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0]
    const studentLogs = logs
        .filter((l) => l.studentId === selectedStudentId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const filteredStudents = students.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.profile.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Normalize value to a 0-100 scale for charts
    const normalize = (value: number, param: Parameter) => {
        const range = param.max - param.min
        if (range === 0) return 0
        return ((value - param.min) / range) * 100
    }

    // Color list (Okabe-Ito parameterization)
    const colorMap = [
        '#0072B2', // Safe Blue
        '#E69F00', // Safe Orange
        '#009E73', // Safe Teal
        '#CC79A7', // Safe Purple
        '#56B4E9', // Safe Sky Blue
        '#D55E00'  // Safe Vermillion
    ]

    return (
        <main className="min-h-screen bg-[#FFFFE5] py-8 px-4 sm:px-6 select-text text-left">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FEFAF0] border border-[#DCD7BA] p-6 rounded-[32px] shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📊</span>
                        <div>
                            <h1 className="text-2xl font-bold text-[#1A1A1A]">Student Development Insights</h1>
                            <p className="text-sm text-slate-500 mt-0.5">CRUD tracking dashboard for neurodivergent learner diagnostics.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={startAddStudent}
                            className="px-4 py-2 bg-[#0072B2] text-white font-bold text-xs rounded-xl transition hover:bg-[#0072B2]/90 focus:outline-none"
                        >
                            ➕ Add Student
                        </button>
                        <Link
                            href="/teacher"
                            className="px-4 py-2 border border-[#DCD7BA] bg-[#FEFAF0] hover:bg-[#ECF4E8] text-slate-700 font-bold text-xs rounded-xl transition"
                        >
                            ← Back to Portal
                        </Link>
                    </div>
                </header>

                {/* Dashboard Grid Container: Fixed 2-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Left Sidebar: Filters and Student List */}
                    <aside className="bg-[#FEFAF0] border border-[#DCD7BA] p-5 rounded-[32px] shadow-sm flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
                        <div>
                            <h3 className="text-base font-bold text-[#1A1A1A]">Students Registry</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Search or click student profile below</p>
                        </div>

                        {/* Search field */}
                        <input
                            type="text"
                            placeholder="Search name/profile..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] px-3 py-2 text-xs focus:ring-1 focus:ring-[#0072B2] focus:outline-none"
                        />

                        {/* Student Lists */}
                        <div className="flex flex-col gap-2.5">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    onClick={() => {
                                        setSelectedStudentId(student.id)
                                        setCompareLogIds([])
                                    }}
                                    className={`cursor-pointer rounded-2xl border p-3.5 text-left flex flex-col gap-1 transition ${
                                        selectedStudentId === student.id
                                            ? 'border-[#0072B2] bg-[#0072B2]/10 shadow-sm'
                                            : 'border-slate-200 bg-[#FFFFE5]/50 hover:border-slate-400'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-xs text-[#1A1A1A]">{student.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Age {student.age}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium truncate">{student.profile}</span>
                                    
                                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-slate-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                startEditStudent(student)
                                            }}
                                            className="text-[10px] text-[#0072B2] font-semibold hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteStudent(student.id)
                                            }}
                                            className="text-[10px] text-[#D55E00] font-semibold hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredStudents.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-4">No students found.</p>
                            )}
                        </div>
                    </aside>

                    {/* Main View: Profile Summary, Charts and Historical Timeline */}
                    {activeStudent ? (
                        <section className="space-y-6 flex flex-col">
                            {/* Section 1: Top Summary & Quick Actions */}
                            <div className="bg-[#FEFAF0] border border-[#DCD7BA] p-6 rounded-[32px] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Selected Profile</span>
                                    <h2 className="text-xl font-bold text-[#1A1A1A]">{activeStudent.name}</h2>
                                    <p className="text-xs text-slate-500">
                                        Age: <strong>{activeStudent.age}</strong> | Profile: <strong>{activeStudent.profile}</strong>
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={startAddLog}
                                        className="px-4.5 py-2 rounded-xl bg-[#009E73] hover:bg-[#009E73]/90 text-white font-bold text-xs transition focus:outline-none"
                                    >
                                        📝 Log New Entry
                                    </button>
                                    <button
                                        onClick={() => setShowParamModal(true)}
                                        className="px-4.5 py-2 rounded-xl border border-[#DCD7BA] bg-[#FEFAF0] hover:bg-[#ECF4E8] text-slate-700 font-bold text-xs transition"
                                    >
                                        ⚙️ Manage Parameters
                                    </button>
                                </div>
                            </div>

                            {/* Section 2: Data Visualizations (SVG Charts) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Trend Line Chart / Bar Graph */}
                                <div className="bg-[#FEFAF0] border border-[#DCD7BA] p-5 rounded-[32px] shadow-sm flex flex-col gap-4">
                                    <div>
                                        <h3 className="text-base font-bold text-[#1A1A1A]">Metric Development Trends</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Toggle checkboxes to display logged timelines:</p>
                                    </div>

                                    {/* Parameter Toggles */}
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {parameters.map((p, idx) => {
                                            const color = colorMap[idx % colorMap.length]
                                            return (
                                                <label
                                                    key={p.id}
                                                    style={{ borderLeftColor: color }}
                                                    className="flex items-center gap-1.5 border-l-4 pl-1.5 py-0.5 font-semibold text-slate-700 cursor-pointer select-none"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={!!visibleParams[p.id]}
                                                        onChange={() => setVisibleParams({ ...visibleParams, [p.id]: !visibleParams[p.id] })}
                                                    />
                                                    <span>{p.name}</span>
                                                </label>
                                            )
                                        })}
                                    </div>

                                    {/* SVG Line Graph */}
                                    <div className="w-full h-48 bg-[#FFFFE5] border border-slate-200 rounded-2xl relative p-3">
                                        {studentLogs.length >= 2 ? (
                                            <svg viewBox="0 0 400 200" className="w-full h-full">
                                                {/* Grid Lines */}
                                                <line x1="30" y1="20" x2="380" y2="20" stroke="#E2E2E2" strokeWidth="0.5" strokeDasharray="3" />
                                                <line x1="30" y1="100" x2="380" y2="100" stroke="#E2E2E2" strokeWidth="0.5" strokeDasharray="3" />
                                                <line x1="30" y1="180" x2="380" y2="180" stroke="#DCD7BA" strokeWidth="1" />
                                                <line x1="30" y1="20" x2="30" y2="180" stroke="#DCD7BA" strokeWidth="1" />

                                                {/* Left Labels */}
                                                <text x="5" y="25" className="text-[8px] fill-slate-400 font-bold">100%</text>
                                                <text x="5" y="105" className="text-[8px] fill-slate-400 font-bold">50%</text>
                                                <text x="8" y="183" className="text-[8px] fill-slate-400 font-bold">0%</text>

                                                {/* Draw Lines */}
                                                {parameters.map((p, pidx) => {
                                                    if (!visibleParams[p.id]) return null
                                                    const color = colorMap[pidx % colorMap.length]

                                                    // Calculate coordinates
                                                    const points = studentLogs.map((log, lidx) => {
                                                        const val = log.scores[p.id] !== undefined ? log.scores[p.id] : Math.round((p.min + p.max) / 2)
                                                        const normalized = normalize(val, p)
                                                        const x = 30 + (lidx / (studentLogs.length - 1)) * 350
                                                        const y = 180 - (normalized / 100) * 160
                                                        return `${x},${y}`
                                                    }).join(' ')

                                                    return (
                                                        <g key={p.id}>
                                                            <polyline
                                                                fill="none"
                                                                stroke={color}
                                                                strokeWidth="3.5"
                                                                points={points}
                                                            />
                                                            {/* Plot Dots */}
                                                            {studentLogs.map((log, lidx) => {
                                                                const val = log.scores[p.id] !== undefined ? log.scores[p.id] : Math.round((p.min + p.max) / 2)
                                                                const normalized = normalize(val, p)
                                                                const x = 30 + (lidx / (studentLogs.length - 1)) * 350
                                                                const y = 180 - (normalized / 100) * 160
                                                                return (
                                                                    <circle
                                                                        key={lidx}
                                                                        cx={x}
                                                                        cy={y}
                                                                        r="4.5"
                                                                        fill={color}
                                                                        stroke="#FEFAF0"
                                                                        strokeWidth="1.5"
                                                                    />
                                                                )
                                                            })}
                                                        </g>
                                                    )
                                                })}
                                            </svg>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                                                Please log at least 2 entries to populate the progress line graph.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Radar / Pie Chart: Holistic Recent Profile */}
                                <div className="bg-[#FEFAF0] border border-[#DCD7BA] p-5 rounded-[32px] shadow-sm flex flex-col gap-4">
                                    <div>
                                        <h3 className="text-base font-bold text-[#1A1A1A]">Most Recent Holistic Score</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Normalized values of latest log index:</p>
                                    </div>

                                    <div className="w-full h-48 bg-[#FFFFE5] border border-slate-200 rounded-2xl relative p-3 flex items-center justify-center">
                                        {studentLogs.length >= 1 ? (
                                            (() => {
                                                const latestLog = studentLogs[studentLogs.length - 1]
                                                // Create Radar SVG structure
                                                const center = 100
                                                const radius = 70
                                                const totalPoints = parameters.length
                                                
                                                // Calculate coordinates for parameter axes
                                                const axes = parameters.map((p, pidx) => {
                                                    const angle = (pidx / totalPoints) * 2 * Math.PI - Math.PI / 2
                                                    const val = latestLog.scores[p.id] !== undefined ? latestLog.scores[p.id] : Math.round((p.min + p.max) / 2)
                                                    const normalized = normalize(val, p)
                                                    const x = center + (radius * Math.cos(angle))
                                                    const y = center + (radius * Math.sin(angle))
                                                    
                                                    // Actual value position
                                                    const valX = center + ((radius * (normalized / 100)) * Math.cos(angle))
                                                    const valY = center + ((radius * (normalized / 100)) * Math.sin(angle))
                                                    
                                                    return { name: p.name, x, y, valX, valY }
                                                })

                                                const radarPoints = axes.map((a) => `${a.valX},${a.valY}`).join(' ')

                                                return (
                                                    <svg viewBox="0 0 200 200" className="w-full h-full max-w-[170px]">
                                                        {/* Outer Polygon Grid */}
                                                        <polygon
                                                            points={axes.map(a => `${a.x},${a.y}`).join(' ')}
                                                            fill="none"
                                                            stroke="#DCD7BA"
                                                            strokeWidth="1"
                                                        />
                                                        {/* Inner Grid 50% */}
                                                        <polygon
                                                            points={axes.map(a => `${center + (radius * 0.5 * (a.x - center) / radius)},${center + (radius * 0.5 * (a.y - center) / radius)}`).join(' ')}
                                                            fill="none"
                                                            stroke="#E2E2E2"
                                                            strokeWidth="0.5"
                                                            strokeDasharray="2"
                                                        />
                                                        {/* Draw Axes lines */}
                                                        {axes.map((a, i) => (
                                                            <line key={i} x1={center} y1={center} x2={a.x} y2={a.y} stroke="#E2E2E2" strokeWidth="0.8" />
                                                        ))}

                                                        {/* Radar Score Area */}
                                                        <polygon
                                                            points={radarPoints}
                                                            fill="#0072B2"
                                                            fillOpacity="0.25"
                                                            stroke="#0072B2"
                                                            strokeWidth="2"
                                                        />

                                                        {/* Mini Data Points */}
                                                        {axes.map((a, i) => (
                                                            <circle key={i} cx={a.valX} cy={a.valY} r="3" fill="#E69F00" />
                                                        ))}
                                                    </svg>
                                                )
                                            })()
                                        ) : (
                                            <div className="text-xs text-slate-400 text-center">No logs recorded.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Optional: Checkbox comparison charts */}
                            {compareLogIds.length >= 2 && (
                                <div className="bg-[#FEFAF0] border border-[#DCD7BA] p-5 rounded-[32px] shadow-sm space-y-4">
                                    <div>
                                        <h3 className="text-base font-bold text-[#1A1A1A]">Holistic Comparison Bar Chart</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Comparing side-by-side scores of checked dates:</p>
                                    </div>

                                    <div className="w-full min-h-[220px] bg-[#FFFFE5] border border-slate-200 rounded-2xl p-4 flex flex-col gap-4">
                                        {/* List of parameters, each with relative bars */}
                                        <div className="space-y-4 text-xs">
                                            {parameters.map((p) => {
                                                return (
                                                    <div key={p.id} className="space-y-1">
                                                        <span className="font-bold text-slate-800 text-[11px] block">{p.name}</span>
                                                        <div className="space-y-1">
                                                            {compareLogIds.map((cid, cidx) => {
                                                                const log = logs.find(l => l.id === cid)
                                                                if (!log) return null
                                                                const val = log.scores[p.id] !== undefined ? log.scores[p.id] : Math.round((p.min + p.max) / 2)
                                                                const percent = normalize(val, p)
                                                                const barColor = colorMap[cidx % colorMap.length]
                                                                return (
                                                                    <div key={cid} className="flex items-center gap-2">
                                                                        <span className="text-[9px] text-slate-400 font-bold w-16">{log.date}</span>
                                                                        <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
                                                                            <div
                                                                                className="h-full rounded"
                                                                                style={{ width: `${percent}%`, backgroundColor: barColor }}
                                                                            />
                                                                        </div>
                                                                        <span className="font-semibold w-8 text-right">{val}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Historical Comparison & Timeline */}
                            <div className="bg-[#FEFAF0] border border-[#DCD7BA] p-5 rounded-[32px] shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <div>
                                        <h3 className="text-base font-bold text-[#1A1A1A]">Historical Diagnostic Feed</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Chronological record of student logs. Check boxes to trigger comparison.</p>
                                    </div>
                                    {compareLogIds.length > 0 && (
                                        <button
                                            onClick={() => setCompareLogIds([])}
                                            className="text-xs text-[#D55E00] font-bold hover:underline"
                                        >
                                            Clear Selection
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3.5">
                                    {studentLogs.map((log) => {
                                        const isChecked = compareLogIds.includes(log.id)
                                        return (
                                            <div
                                                key={log.id}
                                                className={`rounded-2xl border p-4 text-xs transition flex flex-col sm:flex-row justify-between gap-4 ${
                                                    isChecked ? 'border-[#0072B2] bg-[#0072B2]/5' : 'border-slate-100 bg-[#FFFFE5]/50'
                                                }`}
                                            >
                                                {/* Left details */}
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setCompareLogIds([...compareLogIds, log.id])
                                                                } else {
                                                                    setCompareLogIds(compareLogIds.filter((id) => id !== log.id))
                                                                }
                                                            }}
                                                            className="w-4 h-4 rounded text-[#0072B2] border-slate-300 focus:ring-0 focus:outline-none"
                                                        />
                                                        <span className="font-bold text-[#1A1A1A] text-sm">🗓️ {log.date}</span>
                                                    </div>

                                                    {/* Scores Grid */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                                        {parameters.map((p) => {
                                                            const val = log.scores[p.id] !== undefined ? log.scores[p.id] : '-'
                                                            return (
                                                                <div key={p.id} className="bg-white/80 border border-slate-200/50 p-2 rounded-xl text-center">
                                                                    <span className="text-[9px] text-slate-400 block font-semibold">{p.name}</span>
                                                                    <span className="font-bold text-[#1A1A1A] mt-0.5 text-xs">{val}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    {/* Notes */}
                                                    {log.notes && (
                                                        <p className="text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-100 text-[11px] leading-relaxed italic">
                                                            “{log.notes}”
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex sm:flex-col justify-end items-end gap-2.5 flex-shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                                                    <button
                                                        onClick={() => startEditLog(log)}
                                                        className="px-3.5 py-1.5 rounded-lg border border-[#DCD7BA] bg-white hover:bg-slate-100 font-semibold text-[10px] text-slate-700 transition"
                                                    >
                                                        ⚙️ Edit Log
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLog(log.id)}
                                                        className="px-3.5 py-1.5 rounded-lg border border-[#DCD7BA] bg-[#FEFAF0] hover:bg-[#D55E00]/10 font-semibold text-[10px] text-[#D55E00] transition"
                                                    >
                                                        ❌ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {studentLogs.length === 0 && (
                                        <div className="text-center py-10 bg-slate-500/5 border border-dashed rounded-2xl text-xs text-slate-400">
                                            No developmental history recorded for this student. Click "Log New Entry" to begin tracking parameters!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    ) : (
                        <div className="bg-[#FEFAF0] border border-[#DCD7BA] p-10 rounded-[32px] text-center text-xs text-slate-400">
                            Please select a student from the sidebar registry or create a new student to begin tracking holistic insights.
                        </div>
                    )}
                </div>
            </div>

            {/* --- Modals Dialog --- */}

            {/* 1. Student Add/Edit Modal */}
            {showStudentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-[90vw] max-w-md rounded-3xl border border-[#DCD7BA] bg-[#FEFAF0] p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-[#1A1A1A]">
                            {editingStudent ? 'Edit Student Details' : 'Register New Student'}
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-600 uppercase">Student Name</label>
                                <input
                                    type="text"
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                    className="w-full rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2.5 text-xs text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-600 uppercase">Student Age</label>
                                <input
                                    type="number"
                                    value={newStudent.age}
                                    onChange={(e) => setNewStudent({ ...newStudent, age: parseInt(e.target.value) || 9 })}
                                    className="w-full rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2.5 text-xs text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-600 uppercase">Learning Profile Descriptor</label>
                                <textarea
                                    value={newStudent.profile}
                                    onChange={(e) => setNewStudent({ ...newStudent, profile: e.target.value })}
                                    placeholder="e.g. ADHD / High participation, Dyslexia / Audio helper needed"
                                    className="w-full rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2.5 text-xs text-slate-800 focus:outline-none resize-none h-20"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 justify-end text-xs font-bold pt-2">
                            <button
                                onClick={() => setShowStudentModal(false)}
                                className="px-4 py-2 border border-[#DCD7BA] bg-[#FEFAF0] hover:bg-slate-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveStudent}
                                className="px-5 py-2 bg-[#0072B2] text-white rounded-xl hover:bg-[#0072B2]/90 transition"
                            >
                                Save Student
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Parameters Modal Manager */}
            {showParamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-[90vw] max-w-lg rounded-3xl border border-[#DCD7BA] bg-[#FEFAF0] p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-[#1A1A1A]">Manage Development Metrics</h3>
                            <button
                                onClick={() => setShowParamModal(false)}
                                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                            >
                                Close
                            </button>
                        </div>

                        {/* List of current parameters */}
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1 text-xs">
                            {parameters.map((p) => (
                                <div key={p.id} className="flex items-center justify-between bg-white border border-slate-150 p-2.5 rounded-xl">
                                    <div>
                                        <span className="font-bold text-slate-800">{p.name}</span>
                                        <span className="text-[10px] text-slate-400 ml-2">Min {p.min} / Max {p.max}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteParam(p.id)}
                                        className="text-xs text-[#D55E00] font-semibold hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add new Parameter Inline block */}
                        <div className="border-t border-slate-100 pt-3 space-y-3 text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-wider block">Add Tracking Parameter</span>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    placeholder="Metric Name"
                                    value={newParam.name}
                                    onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
                                    className="rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2 focus:outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Min Value"
                                    value={newParam.min}
                                    onChange={(e) => setNewParam({ ...newParam, min: parseInt(e.target.value) || 0 })}
                                    className="rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2 focus:outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Max Value"
                                    value={newParam.max}
                                    onChange={(e) => setNewParam({ ...newParam, max: parseInt(e.target.value) || 10 })}
                                    className="rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={handleSaveParam}
                                className="w-full py-2 bg-[#009E73] text-white font-bold rounded-xl text-xs hover:bg-[#009E73]/90 transition"
                            >
                                Add Parameter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Log New/Edit Entry Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-[90vw] max-w-lg rounded-3xl border border-[#DCD7BA] bg-[#FEFAF0] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-[#1A1A1A]">
                            {editingLog ? 'Edit Diagnostic Entry' : 'Log New Student Entry'}
                        </h3>

                        <div className="space-y-4 text-xs">
                            {/* Date Field */}
                            <div className="space-y-1">
                                <label className="font-bold text-slate-600 uppercase">Log Date</label>
                                <input
                                    type="date"
                                    value={newLog.date}
                                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                    className="w-full rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2.5 text-xs focus:outline-none text-slate-800"
                                />
                            </div>

                            {/* Active parameters fields */}
                            <div className="space-y-2 border-t border-b border-slate-100 py-3">
                                <span className="font-bold text-slate-500 uppercase tracking-wider block">Logged Metrics Score</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {parameters.map((p) => {
                                        const curVal = newLog.scores[p.id] !== undefined ? newLog.scores[p.id] : Math.round((p.min + p.max) / 2)
                                        return (
                                            <div key={p.id} className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-150">
                                                <label className="font-bold text-slate-700 block truncate">{p.name}</label>
                                                <input
                                                    type="number"
                                                    min={p.min}
                                                    max={p.max}
                                                    value={curVal}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0
                                                        setNewLog({
                                                            ...newLog,
                                                            scores: { ...newLog.scores, [p.id]: val }
                                                        })
                                                    }}
                                                    className="w-full rounded-lg border border-[#DCD7BA] bg-[#FFFFE5] p-1.5 text-xs text-center focus:outline-none font-bold text-[#1A1A1A]"
                                                />
                                                <span className="text-[9px] text-slate-400 block text-right font-medium">Range {p.min}-{p.max}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Optional notes */}
                            <div className="space-y-1">
                                <label className="font-bold text-slate-600 uppercase">Observations & Comments</label>
                                <textarea
                                    value={newLog.notes}
                                    onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                                    placeholder="Write qualitative insights here..."
                                    className="w-full rounded-xl border border-[#DCD7BA] bg-[#FFFFE5] p-2.5 text-xs resize-none h-20 focus:outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 justify-end text-xs font-bold pt-2 border-t border-slate-100">
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="px-4 py-2 border border-[#DCD7BA] bg-[#FEFAF0] hover:bg-slate-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLog}
                                className="px-5 py-2 bg-[#009E73] text-white rounded-xl hover:bg-[#009E73]/90 transition"
                            >
                                Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
