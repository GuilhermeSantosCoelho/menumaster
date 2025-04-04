import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Table = Database["public"]["Tables"]["tables"]["Row"]
export type NewTable = Database["public"]["Tables"]["tables"]["Insert"]
export type UpdateTable = Database["public"]["Tables"]["tables"]["Update"]

export const TableService = {
  async getTables(establishmentId: string): Promise<Table[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("tables")
      .select("*")
      .eq("establishment_id", establishmentId)
      .order("number")

    if (error) {
      console.error("Error fetching tables:", error)
      throw error
    }

    return data || []
  },

  async getTable(id: string): Promise<Table | null> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("tables").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching table:", error)
      throw error
    }

    return data
  },

  async createTable(table: NewTable): Promise<Table> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("tables").insert(table).select().single()

    if (error) {
      console.error("Error creating table:", error)
      throw error
    }

    return data
  },

  async updateTable(id: string, table: UpdateTable): Promise<Table> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("tables").update(table).eq("id", id).select().single()

    if (error) {
      console.error("Error updating table:", error)
      throw error
    }

    return data
  },

  async deleteTable(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("tables").delete().eq("id", id)

    if (error) {
      console.error("Error deleting table:", error)
      throw error
    }
  },

  async updateTableStatus(id: string, status: Table["status"]): Promise<Table> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("tables").update({ status }).eq("id", id).select().single()

    if (error) {
      console.error("Error updating table status:", error)
      throw error
    }

    return data
  },

  async toggleTableActive(id: string, active: boolean): Promise<Table> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("tables").update({ active }).eq("id", id).select().single()

    if (error) {
      console.error("Error toggling table active status:", error)
      throw error
    }

    return data
  },
}

