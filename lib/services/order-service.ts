import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type NewOrder = Database["public"]["Tables"]["orders"]["Insert"]
export type UpdateOrder = Database["public"]["Tables"]["orders"]["Update"]

export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type NewOrderItem = Database["public"]["Tables"]["order_items"]["Insert"]

export const OrderService = {
  async getOrders(establishmentId: string): Promise<Order[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("establishment_id", establishmentId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      throw error
    }

    return data || []
  },

  async getOrdersByStatus(establishmentId: string, status: Order["status"]): Promise<Order[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("establishment_id", establishmentId)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders by status:", error)
      throw error
    }

    return data || []
  },

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("table_id", tableId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders by table:", error)
      throw error
    }

    return data || []
  },

  async getOrder(id: string): Promise<Order | null> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching order:", error)
      throw error
    }

    return data
  },

  async getOrderWithItems(id: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    const supabase = getSupabaseBrowserClient()

    // Fetch order
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      throw orderError
    }

    if (!order) return null

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*, product:products(*)")
      .eq("order_id", id)

    if (itemsError) {
      console.error("Error fetching order items:", itemsError)
      throw itemsError
    }

    return {
      order,
      items: items || [],
    }
  },

  async createOrder(order: NewOrder, items: Omit<NewOrderItem, "order_id">[]): Promise<Order> {
    const supabase = getSupabaseBrowserClient()

    // Start a transaction
    const { data: newOrder, error: orderError } = await supabase.from("orders").insert(order).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw orderError
    }

    // Insert order items
    if (items.length > 0) {
      const orderItems = items.map((item) => ({
        ...item,
        order_id: newOrder.id,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Error creating order items:", itemsError)
        throw itemsError
      }
    }

    return newOrder
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
    const supabase = getSupabaseBrowserClient()

    const updates: UpdateOrder = { status }

    // If status is DELIVERED or CANCELLED, set completed_at
    if (status === "DELIVERED" || status === "CANCELLED") {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating order status:", error)
      throw error
    }

    return data
  },

  async updateOrderPaymentStatus(
    id: string,
    paymentStatus: string,
    paymentMethod?: Order["payment_method"],
  ): Promise<Order> {
    const supabase = getSupabaseBrowserClient()

    const updates: UpdateOrder = {
      payment_status: paymentStatus,
    }

    if (paymentMethod) {
      updates.payment_method = paymentMethod
    }

    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating order payment status:", error)
      throw error
    }

    return data
  },
}

