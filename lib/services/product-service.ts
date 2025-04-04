import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Product = Database["public"]["Tables"]["products"]["Row"]
export type NewProduct = Database["public"]["Tables"]["products"]["Insert"]
export type UpdateProduct = Database["public"]["Tables"]["products"]["Update"]

export const ProductService = {
  async getProducts(establishmentId: string): Promise<Product[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("establishment_id", establishmentId)
      .order("name")

    if (error) {
      console.error("Error fetching products:", error)
      throw error
    }

    return data || []
  },

  async getProductsByCategory(establishmentId: string, categoryId: string): Promise<Product[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("establishment_id", establishmentId)
      .eq("category_id", categoryId)
      .order("name")

    if (error) {
      console.error("Error fetching products by category:", error)
      throw error
    }

    return data || []
  },

  async getProduct(id: string): Promise<Product | null> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching product:", error)
      throw error
    }

    return data
  },

  async createProduct(product: NewProduct): Promise<Product> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("products").insert(product).select().single()

    if (error) {
      console.error("Error creating product:", error)
      throw error
    }

    return data
  },

  async updateProduct(id: string, product: UpdateProduct): Promise<Product> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single()

    if (error) {
      console.error("Error updating product:", error)
      throw error
    }

    return data
  },

  async deleteProduct(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  },

  async toggleProductAvailability(id: string, available: boolean): Promise<Product> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("products").update({ available }).eq("id", id).select().single()

    if (error) {
      console.error("Error toggling product availability:", error)
      throw error
    }

    return data
  },
}

