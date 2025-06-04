import { FastifyInstance } from "fastify";
import { productController } from "../controllers/product_controller";
import { authenticate } from "../middlewares/authenticate";

export async function productRoutes(fastify: FastifyInstance) {
    fastify.post('/product', {
        preHandler: authenticate,
        handler: productController.create
    })

    fastify.get('/product', {
        preHandler: authenticate,
        handler: productController.getAll
    })

    fastify.get('/product/count', {
        preHandler: authenticate,
        handler: productController.getQuantity
    })

    fastify.get('/product/lowStock', {
        preHandler: authenticate,
        handler: productController.getLowStock
    })

    fastify.get('/product/:id', {
        preHandler: authenticate,
        handler: productController.getById
    })

    fastify.get('/product/category/:category', {
        preHandler: authenticate,
        handler: productController.getByCategory
    })

    fastify.put('/product/:id', {
        preHandler: authenticate,
        handler: productController.update
    })

    fastify.delete('/product/:id', {
        preHandler: authenticate,
        handler: productController.delete
    })
}