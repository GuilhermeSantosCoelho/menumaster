import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Establishment = Database["public"]["Tables"]["establishments"]["Row"]
export type NewEstablishment = Database["public"]["Tables"]["establishments"]["Insert"]
export type UpdateEstablishment = Database["public"]["Tables"]["establishments"]["Update"]

export const EstablishmentService = {
  async getUserEstablishments(userId: string): Promise<Establishment[]> {
    const supabase = getSupabaseBrowserClient()

    // Get establishments where user is owner
    const { data: ownedEstablishments, error: ownedError } = await supabase
      .from("establishments")
      .select("*")
      .eq("owner_id", userId)
      .order("name")

    if (ownedError) {
      console.error("Error fetching owned establishments:", ownedError)
      throw ownedError
    }

    // Get establishments where user is staff
    const { data: staffEstablishments, error: staffError } = await supabase
      .from("establishment_staff")
      .select("establishments(*)")
      .eq("user_id", userId)

    if (staffError) {
      console.error("Error fetching staff establishments:", staffError)
      throw staffError
    }

    // Combine and return unique establishments
    const staffEstablishmentsData = staffEstablishments.map((item) => item.establishments) as Establishment[]

    return [...(ownedEstablishments || []), ...staffEstablishmentsData]
  },

  async getEstablishment(id: string): Promise<Establishment | null> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("establishments").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching establishment:", error)
      throw error
    }

    return data
  },

  async createEstablishment(establishment: NewEstablishment): Promise<Establishment> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("establishments").insert(establishment).select().single()

    if (error) {
      console.error("Error creating establishment:", error)
      throw error
    }

    return data
  },

  async updateEstablishment(id: string, establishment: UpdateEstablishment): Promise<Establishment> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("establishments").update(establishment).eq("id", id).select().single()

    if (error) {
      console.error("Error updating establishment:", error)
      throw error
    }

    return data
  },

  async uploadLogo(establishmentId: string, file: File): Promise<string> {
    const supabase = getSupabaseBrowserClient()

    // Upload to storage
    const { data, error } = await supabase.storage.from("logos").upload(`${establishmentId}/${file.name}`, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Error uploading logo:", error)
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(data.path)

    // Update establishment with logo URL
    await this.updateEstablishment(establishmentId, { logo: publicUrl })

    return publicUrl
  },
}

