import { compare, hash } from "bcryptjs"
import { prisma } from "../lib/prisma"

export class UserService {
    async createUser(data: {
        name: string,
        email: string,
        password: string
    }) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (existingUser) {
            throw new Error("Usuário já existe")
        }

        const hashedPassword = await hash(data.password, 10)

        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword
            },

            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    async findAll() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                password: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return users
    }

    async findById(id: number) {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: false
            }
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        return user
    }

    async findByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: false
            }
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        return user
    }

    async update(id: number, data: {
        name?: string
        email?: string
    }) {
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                name: data.name,
                email: data.email,
            }
        })

        return user
    }

    async updatePassword(id: number, data: {
        currentPassword: string,
        newPassword: string,
    }) {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                password: true,
            }
        })

        if (!user) {
            throw new Error("Usuário não encontrado")
        }

        const isPasswordValid = await compare(data.currentPassword, user.password)

        if (!isPasswordValid) {
            throw new Error("Senha atual incorreta")
        }

        const hashedPassword = await hash(data.newPassword, 10)

        const updatedUser = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            },

            select: {
                id: true,
                name: true,
                email: true,
                updatedAt: true
            }
        })
        return updatedUser
    }

    async delete(id: number) {
        const user = await prisma.user.delete({
            where: {
                id: id,
            }
        })

        return user
    }

}

