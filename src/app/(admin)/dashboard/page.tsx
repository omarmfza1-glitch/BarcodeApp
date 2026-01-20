'use client'

import { useEffect, useState } from 'react'
import styles from './dashboard.module.css'

interface Stats {
    coursesCount: number
    attendeesCount: number
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({ coursesCount: 0, attendeesCount: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/courses')
            const courses = await res.json()

            const coursesCount = courses.length
            const attendeesCount = courses.reduce(
                (acc: number, course: { _count: { attendees: number } }) => acc + course._count.attendees,
                0
            )

            setStats({ coursesCount, attendeesCount })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>لوحة التحكم</h1>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📚</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {loading ? '...' : stats.coursesCount}
                        </span>
                        <span className={styles.statLabel}>إجمالي الدورات</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {loading ? '...' : stats.attendeesCount}
                        </span>
                        <span className={styles.statLabel}>إجمالي الحضور</span>
                    </div>
                </div>
            </div>

            <div className={styles.welcomeCard}>
                <h2>مرحباً بك في نظام إدارة الدورات</h2>
                <p>يمكنك من هنا إدارة الدورات التدريبية ومتابعة التسجيلات عبر الباركود</p>
                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span>✅</span>
                        <span>إضافة وتعديل الدورات</span>
                    </div>
                    <div className={styles.feature}>
                        <span>✅</span>
                        <span>توليد باركود فريد لكل دورة</span>
                    </div>
                    <div className={styles.feature}>
                        <span>✅</span>
                        <span>عرض قائمة الحضور</span>
                    </div>
                    <div className={styles.feature}>
                        <span>✅</span>
                        <span>منع التسجيل المتكرر</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
