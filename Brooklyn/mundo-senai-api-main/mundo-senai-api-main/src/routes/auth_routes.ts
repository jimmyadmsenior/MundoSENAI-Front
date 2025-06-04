import { FastifyInstance } from "fastify";
import { authController } from "../controllers/auth_controller";
import { authenticate } from "../middlewares/authenticate";

export async function authRoutes(fastify: FastifyInstance) {
    // Rota de login deve ser pública
    fastify.post('/login', authController.login)
    
    // Rota de logout precisa de autenticação
    fastify.post('/logout', {
        preHandler: authenticate,
        handler: authController.logout
    })
}