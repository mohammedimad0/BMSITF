import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        // Forward to backend
        const response = await fetch(`${BACKEND_URL}/process`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Backend processing failed' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Process API error:', error)
        return NextResponse.json(
            { error: 'Processing failed' },
            { status: 500 }
        )
    }
}
