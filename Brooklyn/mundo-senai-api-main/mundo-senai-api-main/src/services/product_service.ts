import { ZodNumberFormat } from "zod/v4"
import { prisma } from "../lib/prisma"

export class ProductService {
    getAllProducts() {
        throw new Error("Method not implemented.")
    }
    async createProduct(data: {
        name: string,
        description: string,
        price: number,
        stock: number,
        category: string,
        imageUrl: string
    }) {
        const existingProduct = await prisma.product.findUnique({
            where: {
                name: data.name
            }
        })

        if (existingProduct) {
            throw new Error("Produto já existe")
        }

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                category: data.category,
                imageUrl: data.imageUrl
            },

            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true
            }
        })

        return product
    }

    async findAll() {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return products
    }

    async findById(id: number) {
        const product = await prisma.product.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true
            }
        })

        if (!product) {
            throw new Error("Produto não encontrado")
        }

        return product
    }

    async countProducts() {
        const count = await prisma.product.count()
        return count
    }

    async findLowStockProducts() {
        const products = await prisma.product.findMany({
            where: {
                stock: {
                    lte: 5
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true
            }
        })

        return products
    }

    async findByCategory(category: string) {
        const products = await prisma.product.findMany({
            where: {
                category: {
                    contains: category
                }
            },

            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true
            }

        })

        if (category.length === 0) {
            throw new Error('Nenhum produto foi encontrado nessa categoria')
        }

        return products
    }

    async updateProduct(id: number, data: {
        name?: string,
        description?: string,
        price?: number,
        stock?: number,
        category?: string,
        imageUrl?: string,
    }) {
        const productId = await prisma.product.findUnique({
            where: { id },

        })

        if (!productId) {
            throw new Error("Produto não encontrado")
        }

        

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                category: data.category,
                imageUrl: data.imageUrl
            },
             select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                category: true,
                imageUrl: true
            }
        })
        return product
    }

    async delete(id: number) {
        const productId = await prisma.product.findUnique({
            where: { id }
        })

        if (!productId) {
            throw new Error("Produto não encontrado")
        }

        await prisma.product.delete({
            where: { id }
        })
    }
}

