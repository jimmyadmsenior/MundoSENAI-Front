import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth_service";
import z from "zod/v4";
import { formatError } from "../utils/errors/formatZodErrors";

const authService = new AuthService()

const authBodySchema = z.object({
    email: z.email(),
    password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres")
})

type LoginBody = z.infer<typeof authBodySchema>

export const authController = {
    async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        try {

            const result = authBodySchema.safeParse(request.body)
            if (!result.success) {
                return reply.status(400).send({
                    message: "Dados inválidos",
                    errors: formatError(result)
                })
            }
            const email = result.data.email
            const password = result.data.password

            const { user, token } = await authService.login({ email, password })
            return reply.status(200).send({ user, token })

        } catch (error: any) {
            if (error.message === 'Usuário não encontrado') {
                return reply.status(404).send({ message: 'Usuário não encontrado' })
            }
            if (error.message === 'Senha inválida') {
                return reply.status(401).send({ message: 'Senha inválida' })
            }
            return reply.status(500).send({ message: 'Erro interno do servidor' })
        }
    },

    async logout(request: FastifyRequest, reply: FastifyReply) {
        try {
            const authHeader = request.headers.authorization
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({ message: 'Token não encontrado' })
            }
            const token = authHeader.split(' ')[1]
            const result = await authService.logout(token)

            return reply.status(200).send(result)

        } catch (error) {
            return reply.status(500).send({ message: 'Erro interno do servidor' })
        }
    }

}
