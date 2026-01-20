'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './admin.module.css'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>جاري التحميل...</p>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Image
                        src="/logo.png"
                        alt="وزارة الصحة"
                        width={70}
                        height={70}
                        className={styles.logoImage}
                    />
                    <span className={styles.logoText}>نظام إدارة الدورات</span>
                </div>

                <nav className={styles.nav}>
                    <Link
                        href="/dashboard"
                        className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
                    >
                        <span className={styles.navIcon}>📊</span>
                        لوحة التحكم
                    </Link>
                    <Link
                        href="/courses"
                        className={`${styles.navLink} ${pathname.startsWith('/courses') ? styles.active : ''}`}
                    >
                        <span className={styles.navIcon}>📚</span>
                        الدورات
                    </Link>
                    <Link
                        href="/settings"
                        className={`${styles.navLink} ${pathname === '/settings' ? styles.active : ''}`}
                    >
                        <span className={styles.navIcon}>⚙️</span>
                        الإعدادات
                    </Link>
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <span className={styles.userIcon}>👤</span>
                        <span>{session.user?.name}</span>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.logoutBtn}>
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
