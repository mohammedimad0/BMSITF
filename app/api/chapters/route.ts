import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/chapters`, {
            method: 'GET',
            cache: 'no-store',
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch chapters' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Chapters API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chapters' },
            { status: 500 }
        )
    }
}
