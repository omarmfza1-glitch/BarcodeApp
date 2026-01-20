import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    const body = await request.json()
    const {
        courseId,
        nationalId,
        firstName,
        secondName,
        thirdName,
        lastName,
        phone,
        computerNumber,
        jobTitle,
        workplace,
        deviceId,
    } = body

    // Check if course exists
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    })

    if (!course) {
        return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
    }

    // Check device registration based on course settings
    if (!course.allowMultiplePerDevice) {
        const existingRegistrations = await prisma.attendee.count({
            where: {
                deviceId,
                courseId,
            },
        })

        if (existingRegistrations >= course.maxPerDevice) {
            return NextResponse.json(
                { error: `تم التسجيل مسبقاً من هذا الجهاز (الحد الأقصى: ${course.maxPerDevice})` },
                { status: 400 }
            )
        }
    }

    // Create attendee
    const attendee = await prisma.attendee.create({
        data: {
            nationalId,
            firstName,
            secondName,
            thirdName,
            lastName,
            phone,
            computerNumber: computerNumber || null,
            jobTitle,
            workplace,
            deviceId,
            courseId,
        },
    })

    return NextResponse.json(attendee, { status: 201 })
}
