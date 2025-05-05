import { Product } from "@/types/entities"
import api from "@/lib/axios"

class ProductService {
  async getProducts(establishmentId: string): Promise<Product[]> {
    try {
      const response = await api.get<{ products: Product[] }>(`/products`, {
        params: { establishmentId }
      })
      return response.data.products
    } catch (error) {
      throw new Error("Erro ao buscar produtos")
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get<{ product: Product }>(`/products/${id}`)
      return response.data.product
    } catch (error) {
      throw new Error("Produto não encontrado")
    }
  }

  async createProduct(data: {
    name: string
    description: string
    price: number
    categoryId: string
    available: boolean
    establishmentId: string
    stock?: number
  }): Promise<Product> {
    try {
      const response = await api.post<{ product: Product }>('/products', data)
      return response.data.product
    } catch (error) {
      throw new Error("Erro ao criar produto")
    }
  }

  async updateProduct(id: string, data: {
    name: string
    description: string
    price: number
    categoryId: string
    available: boolean
    stock?: number
  }): Promise<Product> {
    try {
      const response = await api.put<{ product: Product }>(`/products/${id}`, data)
      return response.data.product
    } catch (error) {
      throw new Error("Erro ao atualizar produto")
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`)
    } catch (error) {
      throw new Error("Erro ao deletar produto")
    }
  }

  async toggleAvailability(id: string, available: boolean): Promise<Product> {
    try {
      const response = await api.patch<{ product: Product }>(`/products/${id}/availability`, { available })
      return response.data.product
    } catch (error) {
      throw new Error("Erro ao alternar disponibilidade do produto")
    }
  }
}

export const productService = new ProductService() 