import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function forward(req: NextRequest, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') {
    const path = req.nextUrl.searchParams.get('path')
    if (!path) {
        return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    }

    const token = (await cookies()).get('auth_access_token')?.value
    const body = method === 'GET' ? undefined : await req.text()

    const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
    })

    const text = await res.text()
    return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    })
}

export async function GET(req: NextRequest) { return forward(req, 'GET') }
export async function POST(req: NextRequest) { return forward(req, 'POST') }
export async function PUT(req: NextRequest) { return forward(req, 'PUT') }
export async function PATCH(req: NextRequest) { return forward(req, 'PATCH') }
export async function DELETE(req: NextRequest) { return forward(req, 'DELETE') }


