import { signToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcryptjs'

export class AuthService {
    async login(data: { email: string, password: string }) {
        const user = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (!user) {
            throw new Error('Usuário não encontrado')
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password)

        if (!isPasswordValid) {
            throw new Error('Senha inválida')
        }

        const token = signToken({ id: user.id })
        return { user, token }
    }

    async logout(token: string) {
        await prisma.invalidToken.create({
            data: {
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        })
        return { message: 'Logout realizado com sucesso' }
    }
}