import { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ message: 'Token não encontrado' })
        }

        const token = authHeader.split(' ')[1]

        const invalidToken = await prisma.invalidToken.findUnique({
            where: {
                token
            }
        })

        if (invalidToken) {
            return reply.status(401).send({ message: 'Token inválido ou expirado' })
        }

        const decoded = verifyToken(token)

        if (typeof decoded === 'string') {
            return reply.status(401).send({ message: 'Token inválido' })
        }

        if (!decoded.id) {
            return reply.status(401).send({ message: 'Token inválido' })
        }

        request.user = { id: decoded.id }
    } catch (error) {
        return reply.status(401).send({ message: 'Erro de autenticação' })
    }
}