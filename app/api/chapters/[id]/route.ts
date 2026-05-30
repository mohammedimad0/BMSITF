import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(`${BACKEND_URL}/chapters/${params.id}`, {
            method: 'GET',
            cache: 'no-store',
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Chapter not found' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Get chapter error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch chapter' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()

        const response = await fetch(`${BACKEND_URL}/chapters/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to update chapter' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Update chapter error:', error)
        return NextResponse.json(
            { error: 'Failed to update chapter' },
            { status: 500 }
        )
    }
}
