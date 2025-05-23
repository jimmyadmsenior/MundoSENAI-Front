import z from "zod/v4";
import { ProductService } from "../services/product_service";
import { FastifyReply, FastifyRequest } from "fastify";
import { formatError } from "../utils/errors/formatZodErrors";

const productService = new ProductService()

const paramsWithIdSchema = z.object({
    id: z.string().transform((value) => {
        const parsedId = parseInt(value);
        if (isNaN(parsedId)) {
            throw new Error("ID inválido");
        }
        return parsedId;
    })
})

const categoryParamsSchema = z.object({
    category: z.string().min(1, "A categoria é obrigatória").toLowerCase()
})

const createProductBodySchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    description: z.string().min(1, "A descrição é obrigatória"),
    price: z.number().positive("O preço deve ser um número positivo"),
    stock: z.number().int().nonnegative("O estoque deve ser um número inteiro não negativo"),
    category: z.string().min(1, "A categoria é obrigatória"),
    imageUrl: z.string()
})

const updateProductBodySchema = z.object({
    name: z.string().min(1, "O nome é obrigatório").optional(),
    description: z.string().min(1, "A descrição é obrigatória").optional(),
    price: z.number().positive("O preço deve ser um número positivo").optional(),
    stock: z.number().int().nonnegative("O estoque deve ser um número inteiro não negativo").optional(),
    category: z.string().min(1, "A categoria é obrigatória").optional(),
    imageUrl: z.url("A URL da imagem deve ser válida").optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser fornecido para atualização"
})

type ParamsWithId = z.infer<typeof paramsWithIdSchema>
type CategoryParams = z.infer<typeof categoryParamsSchema>
type CreateProductBody = z.infer<typeof createProductBodySchema>
type UpdateProductBody = z.infer<typeof updateProductBodySchema>

export const productController = {
    async create(request: FastifyRequest<{ Body: CreateProductBody }>, reply: FastifyReply) {
        try {
            const result = createProductBodySchema.safeParse(request.body)

            if (!result.success) {
                return reply.status(400).send({
                    message: "Dados inválidos",
                    errors: formatError(result)
                })
            }

            const product = await productService.createProduct(result.data)
            return reply.status(201).send(product)

        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({
                    message: "Erro ao criar produto",
                    error: error.message
                })
            }
            return reply.status(500).send({
                message: "Erro interno do servidor"
            })
        }
    },

    async getAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const products = await productService.findAll()
            return reply.status(200).send(products)
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({
                    message: "Erro ao buscar produtos",
                    error: error.message
                })
            }
            return reply.status(500).send({
                message: "Erro interno do servidor"
            })
        }
    },

    async getById(request: FastifyRequest<{ Params: ParamsWithId }>, reply: FastifyReply) {
        try {
            const result = paramsWithIdSchema.safeParse(request.params)

            if (!result.success) {
                return reply.status(400).send({
                    message: "ID inválido",
                    errors: formatError(result)
                })
            }

            const productId = result.data.id
            const product = await productService.findById(productId)

            return reply.status(200).send(product)
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({
                    message: "Erro ao buscar produto",
                    error: error.message
                })
            }
            return reply.status(500).send({
                message: "Erro interno do servidor"
            })
        }
    },
    async getQuantity(request: FastifyRequest, reply: FastifyReply) {
        try {
            const products = await productService.countProducts()
            return reply.status(200).send(products)
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({
                    message: "Erro ao buscar produtos",
                    error: error.message
                })
            }
            return reply.status(500).send({
                message: "Erro interno do servidor"
            })
        }
    },

    async getLowStock(request: FastifyRequest, reply: FastifyReply) {
        try {
            const products = await productService.findLowStockProducts()
            return reply.status(200).send(products)
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({
                    message: "Erro ao buscar produtos",
                    error: error.message
                })
            }
            return reply.status(500).send({
                message: "Erro interno do servidor"
            })
        }
    },

    async getByCategory(request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) {
        const result = categoryParamsSchema.safeParse(request.params)
        if (!result.success) {
            return reply.status(400).send({
                message: 'Categoria Inválida',
                errors: formatError(result)
            })
        }

        const productCategory = result.data.category
        const products = await productService.findByCategory(productCategory)

        return reply.status(200).send(products)

    },

    async update(request: FastifyRequest<{ Params: ParamsWithId, Body: UpdateProductBody }>, reply: FastifyReply) {
        const paramsResult = paramsWithIdSchema.safeParse(request.params)

        if (!paramsResult.success) {
            return reply.status(400).send({
                message: 'ID inválido',
                errors: formatError(paramsResult)
            })
        }


        const bodyResult = updateProductBodySchema.safeParse(request.body)
        if (!bodyResult.success) {
            return reply.status(400).send({
                message: 'Dados inválidos',
                errors: formatError(bodyResult)
            })
        }

        const productId = paramsResult.data.id
        const data = bodyResult.data

        const product = await productService.updateProduct(productId, data)

        return reply.status(200).send(product)
    },

    async delete(request: FastifyRequest<{ Params: ParamsWithId }>, reply: FastifyReply) {
        const result = paramsWithIdSchema.safeParse(request.params)

        if (!result.success) {
            return reply.status(400).send({
                message: 'ID inválido',
                errors: formatError(result)
            })
        }

        const productId = result.data.id
        const user = await productService.delete(productId)

        return reply.send(user)
    }
}