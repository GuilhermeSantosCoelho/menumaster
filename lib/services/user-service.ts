import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type UpdateUser = Database["public"]["Tables"]["users"]["Update"]

export const UserService = {
  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseBrowserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching current user:", error)
      return null
    }

    return data
  },

  async updateUser(id: string, userData: UpdateUser): Promise<User> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("users").update(userData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating user:", error)
      throw error
    }

    return data
  },

  async updateEmail(email: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      console.error("Error updating email:", error)
      throw error
    }
  },

  async updatePassword(password: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error("Error updating password:", error)
      throw error
    }
  },

  async resetPassword(email: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  },
}

