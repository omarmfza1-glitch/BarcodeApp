import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
        include: {
            _count: {
                select: { attendees: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Add default values for new fields
    const coursesWithDefaults = courses.map(course => ({
        ...course,
        allowMultiplePerDevice: (course as Record<string, unknown>).allowMultiplePerDevice ?? false,
        maxPerDevice: (course as Record<string, unknown>).maxPerDevice ?? 1,
    }))

    return NextResponse.json(coursesWithDefaults)
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, startDate, duration, location, instructors, allowMultiplePerDevice, maxPerDevice } = body

    const course = await prisma.course.create({
        data: {
            name,
            startDate: new Date(startDate),
            duration,
            location,
            instructors,
            allowMultiplePerDevice: allowMultiplePerDevice === true,
            maxPerDevice: maxPerDevice || 1,
        },
    })

    return NextResponse.json(course, { status: 201 })
}
