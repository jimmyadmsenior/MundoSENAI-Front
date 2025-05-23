
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { userRoutes } from './routes/user_routes'
import { productRoutes } from './routes/product_routes'
import { authenticate } from './middlewares/authenticate'
import { authRoutes } from './routes/auth_routes'
const app = Fastify({ logger: true })

app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
})

app.register(authRoutes)
app.register(userRoutes)
app.register(productRoutes)




const start = async() => {
    try {
        await app.listen({ port: 3000 })
        app.log.info(`Server listening on ${app.server.address()}`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()

