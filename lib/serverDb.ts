import fs from 'fs'
import path from 'path'
import { ChapterData, ProcessingStatus } from './types'

const DB_FILE = path.join(process.cwd(), 'chapters_db.json')

interface DbSchema {
    chapters: Record<string, ChapterData>
    jobs: Record<string, {
        status: ProcessingStatus
        metadata: {
            title: string
            subject: string
            class_level: number
            board: string
        }
        fallback?: boolean // set if processed by Gemini fallback
    }>
}

function initDb(): DbSchema {
    if (!fs.existsSync(DB_FILE)) {
        const initial: DbSchema = { chapters: {}, jobs: {} }
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8')
        return initial
    }
    try {
        const content = fs.readFileSync(DB_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (e) {
        console.error('Failed to parse database file, resetting', e)
        const initial: DbSchema = { chapters: {}, jobs: {} }
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8')
        return initial
    }
}

export function saveChapter(chapter: ChapterData) {
    const db = initDb()
    db.chapters[chapter.chapter_id] = chapter
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

export function getChapterFromDb(chapterId: string): ChapterData | null {
    const db = initDb()
    return db.chapters[chapterId] || null
}

export function getAllChapters(): ChapterData[] {
    const db = initDb()
    return Object.values(db.chapters).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}

export function deleteChapterFromDb(chapterId: string) {
    const db = initDb()
    delete db.chapters[chapterId]
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

export function saveJob(jobId: string, status: ProcessingStatus, metadata: any, fallback = false) {
    const db = initDb()
    db.jobs[jobId] = { status, metadata, fallback }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

export function getJob(jobId: string) {
    const db = initDb()
    return db.jobs[jobId] || null
}

export function getAllJobs() {
    const db = initDb()
    return db.jobs
}
