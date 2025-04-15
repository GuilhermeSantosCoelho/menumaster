export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: "OWNER" | "MANAGER" | "STAFF"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          role?: "OWNER" | "MANAGER" | "STAFF"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: "OWNER" | "MANAGER" | "STAFF"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      establishments: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          logo: string | null
          primary_color: string | null
          secondary_color: string | null
          active: boolean
          created_at: string
          updated_at: string
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          logo?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          logo?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishments_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_staff: {
        Row: {
          establishment_id: string
          user_id: string
        }
        Insert: {
          establishment_id: string
          user_id: string
        }
        Update: {
          establishment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_staff_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_staff_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          active: boolean
          created_at: string
          updated_at: string
          establishment_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
          establishment_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
          establishment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image: string | null
          stock: number | null
          available: boolean
          created_at: string
          updated_at: string
          establishment_id: string
          category_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image?: string | null
          stock?: number | null
          available?: boolean
          created_at?: string
          updated_at?: string
          establishment_id: string
          category_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image?: string | null
          stock?: number | null
          available?: boolean
          created_at?: string
          updated_at?: string
          establishment_id?: string
          category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          id: string
          number: number
          capacity: number
          status: "FREE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE"
          qr_code_url: string | null
          session_uuid: string
          active: boolean
          created_at: string
          updated_at: string
          establishment_id: string
        }
        Insert: {
          id?: string
          number: number
          capacity: number
          status?: "FREE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE"
          qr_code_url?: string | null
          session_uuid?: string
          active?: boolean
          created_at?: string
          updated_at?: string
          establishment_id: string
        }
        Update: {
          id?: string
          number?: number
          capacity?: number
          status?: "FREE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE"
          qr_code_url?: string | null
          session_uuid?: string
          active?: boolean
          created_at?: string
          updated_at?: string
          establishment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"
          total_amount: number
          notes: string | null
          customer_name: string | null
          customer_phone: string | null
          payment_method: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER" | null
          payment_status: string
          created_at: string
          updated_at: string
          completed_at: string | null
          table_id: string
          establishment_id: string
        }
        Insert: {
          id?: string
          status?: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"
          total_amount: number
          notes?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          payment_method?: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER" | null
          payment_status?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          table_id: string
          establishment_id: string
        }
        Update: {
          id?: string
          status?: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"
          total_amount?: number
          notes?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          payment_method?: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER" | null
          payment_status?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          table_id?: string
          establishment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          quantity: number
          unit_price: number
          notes: string | null
          created_at: string
          updated_at: string
          order_id: string
          product_id: string
        }
        Insert: {
          id?: string
          quantity: number
          unit_price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          order_id: string
          product_id: string
        }
        Update: {
          id?: string
          quantity?: number
          unit_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          order_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          plan: "BASIC" | "PROFESSIONAL" | "PREMIUM"
          start_date: string
          end_date: string | null
          active: boolean
          auto_renew: boolean
          payment_method: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER"
          payment_details: string | null
          created_at: string
          updated_at: string
          establishment_id: string
        }
        Insert: {
          id?: string
          plan: "BASIC" | "PROFESSIONAL" | "PREMIUM"
          start_date: string
          end_date?: string | null
          active?: boolean
          auto_renew?: boolean
          payment_method: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER"
          payment_details?: string | null
          created_at?: string
          updated_at?: string
          establishment_id: string
        }
        Update: {
          id?: string
          plan?: "BASIC" | "PROFESSIONAL" | "PREMIUM"
          start_date?: string
          end_date?: string | null
          active?: boolean
          auto_renew?: boolean
          payment_method?: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER"
          payment_details?: string | null
          created_at?: string
          updated_at?: string
          establishment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          id: string
          amount: number
          status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
          due_date: string
          paid_at: string | null
          payment_method: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER" | null
          payment_id: string | null
          created_at: string
          updated_at: string
          subscription_id: string
        }
        Insert: {
          id?: string
          amount: number
          status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
          due_date: string
          paid_at?: string | null
          payment_method?: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER" | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
          subscription_id: string
        }
        Update: {
          id?: string
          amount?: number
          status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
          due_date?: string
          paid_at?: string | null
          payment_method?: "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "CASH" | "BANK_TRANSFER" | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_code_settings: {
        Row: {
          id: string
          primary_color: string | null
          background_color: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
          establishment_id: string
        }
        Insert: {
          id?: string
          primary_color?: string | null
          background_color?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          establishment_id: string
        }
        Update: {
          id?: string
          primary_color?: string | null
          background_color?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          establishment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_settings_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_reports: {
        Row: {
          id: string
          start_date: string
          end_date: string
          total_sales: number
          total_orders: number
          average_ticket: number
          top_products: Json
          sales_by_day: Json
          created_at: string
          establishment_id: string
        }
        Insert: {
          id?: string
          start_date: string
          end_date: string
          total_sales: number
          total_orders: number
          average_ticket: number
          top_products: Json
          sales_by_day: Json
          created_at?: string
          establishment_id: string
        }
        Update: {
          id?: string
          start_date?: string
          end_date?: string
          total_sales?: number
          total_orders?: number
          average_ticket?: number
          top_products?: Json
          sales_by_day?: Json
          created_at?: string
          establishment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_reports_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: string
          read?: boolean
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_splits: {
        Row: {
          id: string
          number_of_people: number
          amount_per_person: number
          status: string
          created_at: string
          updated_at: string
          order_id: string
        }
        Insert: {
          id?: string
          number_of_people: number
          amount_per_person: number
          status?: string
          created_at?: string
          updated_at?: string
          order_id: string
        }
        Update: {
          id?: string
          number_of_people?: number
          amount_per_person?: number
          status?: string
          created_at?: string
          updated_at?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_splits_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

