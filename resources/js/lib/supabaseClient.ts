import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for your Supabase tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number
          email: string
          branch_id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: number
          email: string
          branch_id: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: number
          email?: string
          branch_id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          branch_id: number
          branch_name: string
        }
        Insert: {
          branch_id?: number
          branch_name: string
        }
        Update: {
          branch_id?: number
          branch_name?: string
        }
      }
      medicine_stock_in: {
        Row: {
          medicine_stock_in_id: number
          medicine_id: number
          branch_id: number
          user_id: number
          quantity: number
          date_received: string
          expiration_date?: string
        }
        Insert: {
          medicine_stock_in_id?: number
          medicine_id: number
          branch_id: number
          user_id: number
          quantity: number
          date_received?: string
          expiration_date?: string
        }
        Update: {
          medicine_stock_in_id?: number
          medicine_id?: number
          branch_id?: number
          user_id?: number
          quantity?: number
          date_received?: string
          expiration_date?: string
        }
      }
      medicine_stock_out: {
        Row: {
          medicine_stock_out_id: number
          medicine_stock_in_id: number
          quantity_dispensed: number
          user_id: number
          timestamp_dispensed: string
          branch_id: number
        }
        Insert: {
          medicine_stock_out_id?: number
          medicine_stock_in_id: number
          quantity_dispensed: number
          user_id: number
          timestamp_dispensed?: string
          branch_id: number
        }
        Update: {
          medicine_stock_out_id?: number
          medicine_stock_in_id?: number
          quantity_dispensed?: number
          user_id?: number
          timestamp_dispensed?: string
          branch_id?: number
        }
      }
      medicine_deleted: {
        Row: {
          medicine_deleted_id: number
          medicine_stock_in_id: number
          quantity: number
          description: string | null
          deleted_at: string
        }
        Insert: {
          medicine_deleted_id?: number
          medicine_stock_in_id: number
          quantity: number
          description?: string | null
          deleted_at?: string
        }
        Update: {
          medicine_deleted_id?: number
          medicine_stock_in_id?: number
          quantity?: number
          description?: string | null
          deleted_at?: string
        }
      }
    }
  }
}
