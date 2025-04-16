import { Product } from "@/types/entities"
import { mockProducts } from "@/lib/mocks/data"

class ProductService {
  private products: Product[] = mockProducts

  async getProducts(establishmentId: string): Promise<Product[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return this.products.filter(p => p.establishment.id === establishmentId)
  }

  async getProductById(id: string): Promise<Product> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    const product = this.products.find(p => p.id === id)
    if (!product) throw new Error("Product not found")
    return product
  }

  async createProduct(data: {
    name: string
    description: string
    price: number
    categoryId: string
    available: boolean
    establishmentId: string
  }): Promise<Product> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      available: data.available,
      establishmentId: data.establishmentId,
      establishment: { id: data.establishmentId } as any,
      orderItems: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.products.push(newProduct)
    return newProduct
  }

  async updateProduct(id: string, data: {
    name: string
    description: string
    price: number
    categoryId: string
    available: boolean
  }): Promise<Product> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) throw new Error("Product not found")

    const updatedProduct = {
      ...this.products[index],
      ...data,
      updatedAt: new Date(),
    }

    this.products[index] = updatedProduct
    return updatedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    this.products = this.products.filter(p => p.id !== id)
  }

  async toggleAvailability(id: string, available: boolean): Promise<Product> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) throw new Error("Product not found")

    const updatedProduct = {
      ...this.products[index],
      available,
      updatedAt: new Date(),
    }

    this.products[index] = updatedProduct
    return updatedProduct
  }
}

export const productService = new ProductService() 