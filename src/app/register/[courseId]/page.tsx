'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import styles from './register.module.css'

interface Course {
    id: string
    name: string
    startDate: string
    duration: string
    location: string
    instructors: string
}

export default function RegisterPage() {
    const params = useParams()
    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deviceId, setDeviceId] = useState('')
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        nationalId: '',
        firstName: '',
        secondName: '',
        thirdName: '',
        lastName: '',
        phone: '',
        computerNumber: '',
        jobTitle: '',
        workplace: '',
    })

    useEffect(() => {
        initFingerprint()
        fetchCourse()
    }, [])

    const initFingerprint = async () => {
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        setDeviceId(result.visitorId)
    }

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/courses/${params.courseId}`)
            if (!res.ok) {
                setError('الدورة غير موجودة')
                return
            }
            const data = await res.json()
            setCourse(data)
        } catch {
            setError('حدث خطأ في تحميل بيانات الدورة')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const res = await fetch('/api/attendees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    courseId: params.courseId,
                    deviceId,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'حدث خطأ في التسجيل')
                setSubmitting(false)
                return
            }

            setSuccess(true)
        } catch {
            setError('حدث خطأ في الاتصال بالخادم')
            setSubmitting(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>جاري التحميل...</p>
                </div>
            </div>
        )
    }

    if (error && !course) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <span>❌</span>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <span>✅</span>
                    <h2>تم التسجيل بنجاح!</h2>
                    <p>شكراً لتسجيلك في الدورة</p>
                    <p className={styles.courseName}>{course?.name}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <Image
                        src="/logo.png"
                        alt="وزارة الصحة"
                        width={100}
                        height={100}
                        className={styles.logo}
                        priority
                    />
                    <h1>تسجيل الحضور</h1>
                </div>

                {course && (
                    <div className={styles.courseInfo}>
                        <h2>{course.name}</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span>📅</span>
                                <span>{formatDate(course.startDate)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span>⏱️</span>
                                <span>{course.duration}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span>📍</span>
                                <span>{course.location}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span>👨‍🏫</span>
                                <span>{course.instructors}</span>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>رقم الهوية *</label>
                        <input
                            type="text"
                            value={formData.nationalId}
                            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                            required
                            maxLength={10}
                            pattern="[0-9]*"
                            inputMode="numeric"
                        />
                    </div>

                    <div className={styles.nameGrid}>
                        <div className={styles.inputGroup}>
                            <label>الاسم الأول *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>الاسم الثاني *</label>
                            <input
                                type="text"
                                value={formData.secondName}
                                onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>الاسم الثالث *</label>
                            <input
                                type="text"
                                value={formData.thirdName}
                                onChange={(e) => setFormData({ ...formData, thirdName: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>الاسم الأخير *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>رقم الجوال *</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            dir="ltr"
                            placeholder="05xxxxxxxx"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>رقم الحاسب (اختياري)</label>
                        <input
                            type="text"
                            value={formData.computerNumber}
                            onChange={(e) => setFormData({ ...formData, computerNumber: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>المسمى الوظيفي *</label>
                        <input
                            type="text"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>مكان العمل *</label>
                        <input
                            type="text"
                            value={formData.workplace}
                            onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={submitting || !deviceId}>
                        {submitting ? 'جاري التسجيل...' : 'تسجيل الحضور'}
                    </button>
                </form>
            </div>
        </div>
    )
}
