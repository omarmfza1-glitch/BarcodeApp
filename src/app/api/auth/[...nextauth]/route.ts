import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'اسم المستخدم', type: 'text' },
                password: { label: 'كلمة المرور', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const admin = await prisma.admin.findUnique({
                    where: { username: credentials.username },
                })

                if (!admin) {
                    return null
                }

                const isValid = await bcrypt.compare(credentials.password, admin.password)

                if (!isValid) {
                    return null
                }

                return {
                    id: admin.id,
                    name: admin.username,
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
