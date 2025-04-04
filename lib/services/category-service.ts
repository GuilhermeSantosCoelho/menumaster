import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type NewCategory = Database["public"]["Tables"]["categories"]["Insert"]
export type UpdateCategory = Database["public"]["Tables"]["categories"]["Update"]

export const CategoryService = {
  async getCategories(establishmentId: string): Promise<Category[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("establishment_id", establishmentId)
      .order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      throw error
    }

    return data || []
  },

  async getActiveCategories(establishmentId: string): Promise<Category[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("establishment_id", establishmentId)
      .eq("active", true)
      .order("name")

    if (error) {
      console.error("Error fetching active categories:", error)
      throw error
    }

    return data || []
  },

  async getCategory(id: string): Promise<Category | null> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("categories").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching category:", error)
      throw error
    }

    return data
  },

  async createCategory(category: NewCategory): Promise<Category> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("categories").insert(category).select().single()

    if (error) {
      console.error("Error creating category:", error)
      throw error
    }

    return data
  },

  async updateCategory(id: string, category: UpdateCategory): Promise<Category> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("categories").update(category).eq("id", id).select().single()

    if (error) {
      console.error("Error updating category:", error)
      throw error
    }

    return data
  },

  async deleteCategory(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  },

  async toggleCategoryActive(id: string, active: boolean): Promise<Category> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("categories").update({ active }).eq("id", id).select().single()

    if (error) {
      console.error("Error toggling category active status:", error)
      throw error
    }

    return data
  },
}

